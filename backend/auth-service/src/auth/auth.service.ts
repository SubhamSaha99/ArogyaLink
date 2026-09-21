import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { status } from '@grpc/grpc-js';
import * as bcrypt from 'bcrypt';
import {
  AuditAction,
  AuditStatus,
  GrpcServiceName,
  LOGIN_RATE_LIMIT,
  UserRole,
} from '../common/util/constant';
import { throwRpcException } from '../common/util/rpc-exception';
import { JwtUtil } from '../common/util/jwt.util';
import { SessionService } from '../session/session.service';
import { AuditService } from '../session/audit.service';
import { HashUtil } from '../common/util/hash.util';
import { randomUUID } from 'node:crypto';
import { RateLimiterService } from '../common/rate-limiter/rate-limiter.service';
import { buildRateLimitKey } from '../common/util/rate-limiter.util';
import {
  healthInstituteLoginQueryInterface,
  rateLimitOptionsInterface,
  healthInstituteQueryInterface,
  HealthInstituteLoginResponse,
  DoctorLoginResponse,
  PatientLoginResponse,
  RefreshTokenResponse,
  LogoutResponse,
  ValidateAccessTokenResponse,
} from '../common/interfaces/auth.interface';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { UserSession } from '../db/entities/user-session.entity';
import {
  DoctorLoginDto,
  DoctorRegDto,
  HealthInstituteLoginDto,
  HealthInstituteRegDto,
  PatientLoginDto,
  PatientRegDto,
  RefreshTokenDto,
} from './auth.dto';
import { AuthRepository } from './auth.repository';
import {
  HealthInstituteProfileReq,
  HealthInstituteProfileRes,
  HEALTH_INSTITUTE_SERVICE_NAME,
  HealthInstituteServiceClient,
} from '../proto/generated/health-institute';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  DOCTOR_SERVICE_NAME,
  DoctorProfileReq,
  DoctorProfileRes,
  DoctorServiceClient,
} from '../proto/generated/doctor';
import {
  PATIENT_SERVICE_NAME,
  PatientProfileReq,
  PatientProfileRes,
  PatientServiceClient,
} from '../proto/generated/patient';

@Injectable()
export class AuthService implements OnModuleInit {
  private logger = new Logger(AuthService.name);
  private healthInstituteGrpcService!: HealthInstituteServiceClient;
  private doctorGrpcService!: DoctorServiceClient;
  private patientGrpcService!: PatientServiceClient;

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtUtil: JwtUtil,
    private readonly sessionService: SessionService,
    private readonly auditService: AuditService,
    private readonly hashUtil: HashUtil,
    private readonly rateLimiterService: RateLimiterService,
    @Inject(GrpcServiceName.HEALTH_INSTITUTE)
    private readonly healthInstituteClient: ClientGrpc,
    @Inject(GrpcServiceName.DOCTOR)
    private readonly doctorClient: ClientGrpc,
    @Inject(GrpcServiceName.PATIENT)
    private readonly patientClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.healthInstituteGrpcService =
      this.healthInstituteClient.getService<HealthInstituteServiceClient>(
        HEALTH_INSTITUTE_SERVICE_NAME,
      );
    this.doctorGrpcService =
      this.doctorClient.getService<DoctorServiceClient>(DOCTOR_SERVICE_NAME);
    this.patientGrpcService =
      this.patientClient.getService<PatientServiceClient>(PATIENT_SERVICE_NAME);
  }

  /**
   * @description Health Institute Registartion Service
   * @param request
   * @returns CreateHealthInstituteProfileRes
   */
  async healthInstituteRegistration(
    request: HealthInstituteRegDto,
  ): Promise<HealthInstituteProfileRes> {
    let healthInstitutePrimaryKey: number | null = null;
    let healthInstituteId: string | null = null;
    try {
      const hashedPassword = await bcrypt.hash(request.password, 10);

      const result: healthInstituteQueryInterface =
        await this.authRepository.healthInstituteRegistration(
          request.email,
          hashedPassword,
          request.healthInstituteType,
        );

      healthInstitutePrimaryKey = result.healthInstitutePrimaryKey;
      healthInstituteId = result.healthInstituteId;

      const healthInstituteProfileRequest: HealthInstituteProfileReq = {
        healthInstitutePrimaryKey,
        healthInstituteId,
        healthInstituteName: request.healthInstituteName,
        healthInstituteType: request.healthInstituteType,
        email: request.email,
      };
      await firstValueFrom(
        this.healthInstituteGrpcService.createHealthInstituteProfile(
          healthInstituteProfileRequest,
        ),
      );

      return { healthInstituteId: result.healthInstituteId };
    } catch (error) {
      if (healthInstitutePrimaryKey) {
        try {
          await this.authRepository.compensateHealthInstituteRegistration(
            healthInstitutePrimaryKey,
          );
        } catch (rollbackError) {
          this.logger.error(
            `Rollback failed for Health Institute ID: ${healthInstituteId}`,
            rollbackError,
          );
        }
      }

      throw error;
    }
  }

  /**
   * @description Health Institute Login Service
   * @param request
   * @param requestIp
   * @param userAgent
   * @param deviceName
   * @returns HealthInstituteLoginResponse
   */
  async healthInstituteLogin(
    request: HealthInstituteLoginDto,
    requestIp: string,
    userAgent: string,
    deviceName?: string,
  ): Promise<HealthInstituteLoginResponse> {
    try {
      // TODO: Implement rate limiting for health-institute login attempts
      const rateLimitOptions = {
        key: buildRateLimitKey(
          'login',
          UserRole.HEALTH_INSTITUTE,
          request.email,
          requestIp,
        ),
        maxAttempts: LOGIN_RATE_LIMIT.MAX_ATTEMPTS,
        blockDuration: LOGIN_RATE_LIMIT.BLOCK_TIME_SECONDS,
        message:
          'Too many failed login attempts. Please try again after 15 minutes.',
      };

      await this.rateLimiterService.throwIfBlocked(rateLimitOptions);

      // TODO: verifying user credentials.
      const result: healthInstituteLoginQueryInterface =
        await this.authRepository.healthInstituteLogin(
          request.email,
          rateLimitOptions,
        );

      const isPasswordValid: boolean = await this.hashUtil.verify(
        request.password,
        result.password,
      );

      if (!isPasswordValid) {
        await this.rateLimiterService.recordFailure(rateLimitOptions);

        throw new HttpException(
          'Invalid Login Credentials',
          HttpStatus.UNAUTHORIZED,
        );
      }

      //   TODO: Generate Session & JWT
      const sessionId = randomUUID();

      const jwtPayload: JwtPayload = {
        sessionId,
        userPrimaryKey: result.healthInstitutePrimaryKey,
        userBusinessId: result.healthInstituteId,
        role: UserRole.HEALTH_INSTITUTE,
      };

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtUtil.generateAccessToken(jwtPayload),
        this.jwtUtil.generateRefreshToken(jwtPayload),
      ]);

      const refreshTokenHash: string = await this.hashUtil.hash(refreshToken);

      //   TODO: Store Session & Audit
      const refreshExpiry: Date = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await Promise.all([
        this.sessionService.createSession({
          sessionId,
          userPrimaryKey: result.healthInstitutePrimaryKey,
          userBusinessId: result.healthInstituteId,
          role: UserRole.HEALTH_INSTITUTE,
          refreshTokenHash,
          ipAddress: requestIp,
          userAgent: userAgent,
          deviceName: deviceName,
          expiresAt: refreshExpiry,
        }),

        this.auditService.log({
          userPrimaryKey: result.healthInstitutePrimaryKey,
          userBusinessId: result.healthInstituteId,
          role: UserRole.HEALTH_INSTITUTE,
          sessionId,
          action: AuditAction.LOGIN_SUCCESS,
          status: AuditStatus.SUCCESS,
          ipAddress: requestIp,
          userAgent: userAgent,
        }),

        this.rateLimiterService.clear(rateLimitOptions.key),
      ]);

      return {
        healthInstituteId: result.healthInstituteId,
        email: result.email,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description Doctor Registration service
   * @param request
   * @returns DoctorProfileRes
   */
  async doctorRegistration(request: DoctorRegDto): Promise<DoctorProfileRes> {
    let doctorPrimaryKey: number | null = null;
    let doctorId: string | null = null;

    try {
      const hashedPassword = await this.hashUtil.hash(request.password);

      const result = await this.authRepository.doctorRegistration(
        request.email,
        request.mobile,
        hashedPassword,
      );
      doctorPrimaryKey = result.doctorPrimaryKey;
      doctorId = result.doctorId;

      const doctorProfileRequest: DoctorProfileReq = {
        doctorPrimaryKey,
        doctorId,
        email: request.email,
        mobile: request.mobile,
        firstName: request.firstName,
        middleName: request.middleName,
        lastName: request.lastName,
      };

      await firstValueFrom(
        this.doctorGrpcService.createDoctorProfile(doctorProfileRequest),
      );

      return {
        doctorId: result.doctorId,
      };
    } catch (error) {
      if (doctorPrimaryKey) {
        try {
          await this.authRepository.compensateDoctorRegistration(
            doctorPrimaryKey,
          );
        } catch (rollbackError) {
          this.logger.error(
            `Rollback failed for Health Institute ID: ${doctorId}`,
            rollbackError,
          );
        }
      }

      throw error;
    }
  }

  /**
   * * Doctor login
   * @param request
   * @returns DoctorLoginRes
   */
  async doctorLogin(
    request: DoctorLoginDto,
    requestIp: string,
    userAgent: string,
    deviceName?: string,
  ): Promise<DoctorLoginResponse> {
    // TODO: Implement rate limiting for doctor login attempts
    const identifier = request.mobile ?? request.email ?? '';

    const rateLimitOptions: rateLimitOptionsInterface = {
      key: buildRateLimitKey('login', UserRole.DOCTOR, identifier, requestIp),
      maxAttempts: LOGIN_RATE_LIMIT.MAX_ATTEMPTS,
      blockDuration: LOGIN_RATE_LIMIT.BLOCK_TIME_SECONDS,
      message:
        'Too many failed login attempts. Please try again after 15 minutes.',
    };

    // TODO: verifying user credentials.
    await this.rateLimiterService.throwIfBlocked(rateLimitOptions);

    const result = await this.authRepository.doctorLogin(
      request.email,
      request.mobile,
      rateLimitOptions,
    );

    const isPasswordValid = await bcrypt.compare(
      request.password,
      result.password,
    );

    if (!isPasswordValid) {
      await this.rateLimiterService.recordFailure(rateLimitOptions);

      throwRpcException(status.UNAUTHENTICATED, 'Invalid Login Credentials');
    }
    //   TODO: Generate Session & JWT

    const sessionId = randomUUID();

    const jwtPayload: JwtPayload = {
      sessionId,
      userPrimaryKey: result.doctorPrimaryKey,
      userBusinessId: result.doctorId,
      role: UserRole.DOCTOR,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtUtil.generateAccessToken(jwtPayload),
      this.jwtUtil.generateRefreshToken(jwtPayload),
    ]);

    const refreshTokenHash = await this.hashUtil.hash(refreshToken);

    //   TODO: Store Session & Audit
    const refreshExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await Promise.all([
      this.sessionService.createSession({
        sessionId,
        userPrimaryKey: result.doctorPrimaryKey,
        userBusinessId: result.doctorId,
        role: UserRole.DOCTOR,
        refreshTokenHash,
        ipAddress: requestIp,
        userAgent: userAgent,
        deviceName: deviceName,
        expiresAt: refreshExpiry,
      }),

      this.auditService.log({
        userPrimaryKey: result.doctorPrimaryKey,
        userBusinessId: result.doctorId,
        role: UserRole.DOCTOR,
        sessionId,
        action: AuditAction.LOGIN_SUCCESS,
        status: AuditStatus.SUCCESS,
        ipAddress: requestIp,
        userAgent: userAgent,
      }),

      this.rateLimiterService.clear(rateLimitOptions.key),
    ]);

    return {
      doctorId: result.doctorId,
      email: result.email,
      mobile: result.mobile,
      accessToken,
      refreshToken,
    };
  }

  /**
   * @description Patient registration
   * @param request
   * @returns PatientRegistrationRes
   */
  async patientRegistration(
    request: PatientRegDto,
  ): Promise<PatientProfileRes> {
    let patientPrimaryKey: number | null = null;
    let patientId: string | null = null;
    try {
      const hashedPassword = await this.hashUtil.hash(request.password);

      const result = await this.authRepository.patientRegistration(
        request.email,
        request.mobile,
        hashedPassword,
      );

      patientPrimaryKey = result.patientPrimaryKey;
      patientId = result.patientId;

      const patientProfileRequest: PatientProfileReq = {
        patientPrimaryKey,
        patientId,
        email: request.email,
        mobile: request.mobile,
        firstName: request.firstName,
        middleName: request.middleName,
        lastName: request.lastName,
      };

      await firstValueFrom(
        this.patientGrpcService.createPatient(patientProfileRequest),
      );

      return {
        patientId: result.patientId,
      };
    } catch (error) {
      if (patientPrimaryKey) {
        try {
          await this.authRepository.compensateDoctorRegistration(
            patientPrimaryKey,
          );
        } catch (rollbackError) {
          this.logger.error(
            `Rollback failed for Health Institute ID: ${patientId}`,
            rollbackError,
          );
        }
      }

      throw error;
    }
  }

  /**
   *
   * @param request
   * @param requestIp
   * @param userAgent
   * @param deviceName
   * @returns
   */
  async patientLogin(
    request: PatientLoginDto,
    requestIp: string,
    userAgent: string,
    deviceName?: string,
  ): Promise<PatientLoginResponse> {
    try {
      // TODO: Implement rate limiting for patient login attempts
      const identifier = request.mobile ?? request.email ?? '';

      const rateLimitOptions: rateLimitOptionsInterface = {
        key: buildRateLimitKey(
          'login',
          UserRole.PATIENT,
          identifier,
          requestIp,
        ),
        maxAttempts: LOGIN_RATE_LIMIT.MAX_ATTEMPTS,
        blockDuration: LOGIN_RATE_LIMIT.BLOCK_TIME_SECONDS,
        message:
          'Too many failed login attempts. Please try again after 15 minutes.',
      };

      await this.rateLimiterService.throwIfBlocked(rateLimitOptions);

      // TODO: verifying user credentials.
      const result = await this.authRepository.patientLogin(
        request.email,
        request.mobile,
        rateLimitOptions,
      );

      const isPasswordValid = await bcrypt.compare(
        request.password,
        result.password,
      );

      if (!isPasswordValid) {
        await this.rateLimiterService.recordFailure(rateLimitOptions);

        throwRpcException(status.UNAUTHENTICATED, 'Invalid Login Credentials');
      }

      //   TODO: Generate Session & JWT

      const sessionId = randomUUID();

      const jwtPayload: JwtPayload = {
        sessionId,
        userPrimaryKey: result.patientPrimaryKey,
        userBusinessId: result.patientId,
        role: UserRole.PATIENT,
      };

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtUtil.generateAccessToken(jwtPayload),
        this.jwtUtil.generateRefreshToken(jwtPayload),
      ]);

      const refreshTokenHash = await this.hashUtil.hash(refreshToken);

      //   TODO: Store Session & Audit
      const refreshExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await Promise.all([
        this.sessionService.createSession({
          sessionId,
          userPrimaryKey: result.patientPrimaryKey,
          userBusinessId: result.patientId,
          role: UserRole.PATIENT,
          refreshTokenHash,
          ipAddress: requestIp,
          userAgent: userAgent,
          deviceName: deviceName,
          expiresAt: refreshExpiry,
        }),

        this.auditService.log({
          userPrimaryKey: result.patientPrimaryKey,
          userBusinessId: result.patientId,
          role: UserRole.DOCTOR,
          sessionId,
          action: AuditAction.LOGIN_SUCCESS,
          status: AuditStatus.SUCCESS,
          ipAddress: requestIp,
          userAgent: userAgent,
        }),

        this.rateLimiterService.clear(rateLimitOptions.key),
      ]);

      return {
        patientId: result.patientId,
        email: result.email,
        mobile: result.mobile,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description Refresh Auth Token
   * @param request
   * @returns RefreshTokenResponse
   */
  async refreshToken(request: RefreshTokenDto): Promise<RefreshTokenResponse> {
    const payload: JwtPayload = await this.jwtUtil.verifyRefreshToken(
      request.refreshToken,
    );

    const session: UserSession | null =
      await this.sessionService.findSessionBySessionId(payload.sessionId);

    if (!session) {
      throwRpcException(status.UNAUTHENTICATED, 'Invalid session');
    } else if (!session.isActive) {
      throwRpcException(status.UNAUTHENTICATED, 'Session has been logged out');
    } else if (session.expiresAt.getTime() < Date.now()) {
      throwRpcException(status.UNAUTHENTICATED, 'Session expired');
    }

    const isValidRefreshToken: boolean = await this.hashUtil.verify(
      request.refreshToken,
      session!.refreshTokenHash,
    );

    if (!isValidRefreshToken) {
      throwRpcException(status.UNAUTHENTICATED, 'Invalid refresh token');
    }

    const jwtPayload: JwtPayload = {
      sessionId: session!.sessionId,
      userPrimaryKey: session!.userPrimaryKey,
      userBusinessId: session!.userBusinessId,
      role: session!.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtUtil.generateAccessToken(jwtPayload),
      this.jwtUtil.generateRefreshToken(jwtPayload),
    ]);

    const refreshTokenHash = await this.hashUtil.hash(refreshToken);

    await Promise.all([
      this.sessionService.updateRefreshToken(
        session!.sessionId,
        refreshTokenHash,
        session!.expiresAt,
      ),

      this.sessionService.updateLastActivity(session!.sessionId),

      this.auditService.log({
        userPrimaryKey: session!.userPrimaryKey,
        userBusinessId: session!.userBusinessId,
        role: session!.role,
        sessionId: session!.sessionId,
        action: AuditAction.TOKEN_REFRESH,
        status: AuditStatus.SUCCESS,
        ipAddress: session!.ipAddress,
        userAgent: session!.userAgent,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * @description Log Out
   * @param request
   * @returns LogoutResponse
   */
  async logout(sessionId: string): Promise<LogoutResponse> {
    const session: UserSession = await this.sessionService.validateSession(
      sessionId,
    );

    await this.sessionService.deactivateSession(sessionId);

    await this.auditService.log({
      userPrimaryKey: session.userPrimaryKey,
      userBusinessId: session.userBusinessId,
      role: session.role,
      sessionId: session.sessionId,
      action: AuditAction.LOGOUT,
      status: AuditStatus.SUCCESS,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
    });

    return {
      success: true,
    };
  }

  /**
   * @description Validate Access Token
   * @param request
   * @returns ValidateAccessTokenRes
   */
  async validateAccessToken(
    sessionId: string,
  ): Promise<ValidateAccessTokenResponse> {
    await this.sessionService.validateSession(sessionId);

    return { valid: true };
  }
}
