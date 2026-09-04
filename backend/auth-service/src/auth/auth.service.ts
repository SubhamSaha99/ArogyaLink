import { Injectable } from '@nestjs/common';
import { status } from '@grpc/grpc-js';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import {
  CompensateDoctorRegistrationReq,
  CompensateDoctorRegistrationRes,
  DoctorRegistrationReq,
  DoctorLoginReq,
  DoctorLoginRes,
  DoctorRegistrationRes,
  HealthInstituteLoginReq,
  HealthInstituteLoginRes,
  HealthInstituteRegReq,
  HealthInstituteRegRes,
  RefreshTokenReq,
  RefreshTokenRes,
  LogoutReq,
  LogoutRes,
  ValidateAccessTokenReq,
  ValidateAccessTokenRes,
  CompensateHealthInstituteRegistrationReq,
  PatientRegistrationReq,
  PatientRegistrationRes,
  CompensatePatientRegistrationReq,
  CompensatePatientRegistrationRes,
  PatientLoginReq,
  PatientLoginRes,
} from '../proto/generated/auth';
import {
  AuditAction,
  AuditStatus,
  Errors,
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
  authQueryInterface,
  rateLimitOptionsInterface,
  doctorLoginQueryInterface,
  healthInstituteQueryInterface,
  doctorQueryInterface,
  patientQueryInterface,
  patientLoginQueryInterface,
} from '../common/interfaces/auth.interface';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { UserSession } from '../db/entities/user-session.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtUtil: JwtUtil,
    private readonly sessionService: SessionService,
    private readonly auditService: AuditService,
    private readonly hashUtil: HashUtil,
    private readonly rateLimiterService: RateLimiterService,
  ) {}

  /**
   * * Health Institute Registartion
   * @param request
   * @returns HealthInstituteRegRes
   */
  async healthInstituteRegistration(
    request: HealthInstituteRegReq,
  ): Promise<HealthInstituteRegRes> {
    const hashedPassword = await bcrypt.hash(request.password, 10);

    const result = await this.dataSource.query<healthInstituteQueryInterface[]>(
      `SELECT * FROM register_health_institute($1, $2, $3)`,
      [request.email, hashedPassword, request.healthInstituteType],
    );
    const procedureResult = result[0];

    if (!procedureResult) {
      throwRpcException(status.INTERNAL, 'Invalid response from procedure!');
    }

    switch (procedureResult.status) {
      case Errors.emailExistError:
        throwRpcException(status.ALREADY_EXISTS, 'Email already exists!');
        break;
      case Errors.dbError:
        throwRpcException(status.INTERNAL, 'Database error!');
        break;
    }
    return {
      healthInstitutePrimaryKey: procedureResult.healthInstitutePrimaryKey,
      healthInstituteId: procedureResult.healthInstituteId,
    };
  }

  /**
   * @description Compensate Health Institute Registration
   * @param request
   * @returns CompensateDoctorRegistrationRes
   */
  async compensateHealthInstituteRegistration(
    request: CompensateHealthInstituteRegistrationReq,
  ): Promise<CompensateDoctorRegistrationRes> {
    const result = await this.dataSource.query<authQueryInterface[]>(
      `SELECT compensate_health_institute_registration($1) AS f_result`,
      [request.healthInstitutePrimaryKey],
    );

    const procedureResult: string = result[0]?.f_result;

    switch (procedureResult) {
      case Errors.helathInstituteNotFoundError:
        throwRpcException(
          status.NOT_FOUND,
          'Health Institute auth record not found!',
        );
        break;
      case Errors.dbError:
        throwRpcException(
          status.INTERNAL,
          'Failed to compensate health institute registration!',
        );
        break;
    }
    return {
      success: true,
    };
  }

  /**
   * * Health Institute Login
   * @param request
   * @returns HealthInstituteLoginRes
   */
  async healthInstituteLogin(
    request: HealthInstituteLoginReq,
  ): Promise<HealthInstituteLoginRes> {
    const rateLimitOptions = {
      key: buildRateLimitKey(
        'login',
        UserRole.HEALTH_INSTITUTE,
        request.email,
        request.requestIp,
      ),
      maxAttempts: LOGIN_RATE_LIMIT.MAX_ATTEMPTS,
      blockDuration: LOGIN_RATE_LIMIT.BLOCK_TIME_SECONDS,
      message:
        'Too many failed login attempts. Please try again after 15 minutes.',
    };

    await this.rateLimiterService.throwIfBlocked(rateLimitOptions);

    const result = await this.dataSource.query<
      healthInstituteLoginQueryInterface[]
    >(`SELECT * FROM login_health_institute($1)`, [request.email]);

    const procedureResult = result?.[0];

    if (!procedureResult) {
      throwRpcException(status.INTERNAL, 'Invalid response from procedure');
    }

    switch (procedureResult.status) {
      case Errors.invalidCredentialError:
        await this.rateLimiterService.recordFailure(rateLimitOptions);
        throwRpcException(status.UNAUTHENTICATED, 'Invalid Login Credentials');
        break;
      case Errors.dbError:
        throwRpcException(status.INTERNAL, 'Database error');
        break;
    }

    const isPasswordValid: boolean = await this.hashUtil.verify(
      request.password,
      procedureResult.password,
    );

    if (!isPasswordValid) {
      await this.rateLimiterService.recordFailure(rateLimitOptions);

      throwRpcException(status.UNAUTHENTICATED, 'Invalid Login Credentials');
    }

    //   TODO: Generate Session & JWT

    const sessionId = randomUUID();

    const jwtPayload: JwtPayload = {
      sessionId,
      userPrimaryKey: procedureResult.healthInstitutePrimaryKey,
      userBusinessId: procedureResult.healthInstituteId,
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
        userPrimaryKey: procedureResult.healthInstitutePrimaryKey,
        userBusinessId: procedureResult.healthInstituteId,
        role: UserRole.HEALTH_INSTITUTE,
        refreshTokenHash,
        ipAddress: request.requestIp,
        userAgent: request.userAgent,
        deviceName: request.deviceName,
        expiresAt: refreshExpiry,
      }),

      this.auditService.log({
        userPrimaryKey: procedureResult.healthInstitutePrimaryKey,
        userBusinessId: procedureResult.healthInstituteId,
        role: UserRole.HEALTH_INSTITUTE,
        sessionId,
        action: AuditAction.LOGIN_SUCCESS,
        status: AuditStatus.SUCCESS,
        ipAddress: request.requestIp,
        userAgent: request.userAgent,
      }),

      this.rateLimiterService.clear(rateLimitOptions.key),
    ]);

    return {
      healthInstituteId: procedureResult.healthInstituteId,
      email: procedureResult.email,
      accessToken,
      refreshToken,
    };
  }

  /**
   * * Doctor Registration
   * @param request
   * @returns DoctorRegistrationRes
   */
  async doctorRegistration(
    request: DoctorRegistrationReq,
  ): Promise<DoctorRegistrationRes> {
    const hashedPassword = await this.hashUtil.hash(request.password);

    const result = await this.dataSource.query<doctorQueryInterface[]>(
      `SELECT * FROM create_doctor_auth($1, $2, $3)`,
      [request.email, request.mobile, hashedPassword],
    );

    const procedureResult = result[0];

    if (!procedureResult) {
      throwRpcException(status.INTERNAL, 'Invalid response from procedure!');
    }
    switch (procedureResult.status) {
      case Errors.emailExistError:
        throwRpcException(status.ALREADY_EXISTS, 'Email already exists!');
        break;
      case Errors.mobileExistError:
        throwRpcException(status.ALREADY_EXISTS, 'Mobile already exists!');
        break;
      case Errors.dbError:
        throwRpcException(status.INTERNAL, 'Database error!');
        break;
    }

    return {
      doctorPrimaryKey: procedureResult.doctorPrimaryKey,
      doctorId: procedureResult.doctorId,
    };
  }

  /**
   * * Compensate Doctor Registration
   * @param request
   * @returns boolean
   */
  async compensateDoctorRegistration(
    request: CompensateDoctorRegistrationReq,
  ): Promise<CompensateDoctorRegistrationRes> {
    const result = await this.dataSource.query<authQueryInterface[]>(
      `SELECT compensate_doctor_registration($1) AS f_result`,
      [request.doctorPrimaryKey],
    );

    const procedureResult: string = result[0]?.f_result;
    switch (procedureResult) {
      case Errors.doctorNotFoundError:
        throwRpcException(status.NOT_FOUND, 'Doctor auth record not found!');
        break;
      case Errors.dbError:
        throwRpcException(
          status.INTERNAL,
          'Failed to compensate doctor registration!',
        );
        break;
      default:
        throwRpcException(status.INTERNAL, 'Something went wrong!');
    }
    return {
      success: true,
    };
  }

  /**
   * * Doctor login
   * @param request
   * @returns DoctorLoginRes
   */
  async doctorLogin(request: DoctorLoginReq): Promise<DoctorLoginRes> {
    // TODO: Implement rate limiting for doctor login attempts
    const identifier = request.mobile ?? request.email ?? '';

    const rateLimitOptions: rateLimitOptionsInterface = {
      key: buildRateLimitKey(
        'login',
        UserRole.DOCTOR,
        identifier,
        request.requestIp,
      ),
      maxAttempts: LOGIN_RATE_LIMIT.MAX_ATTEMPTS,
      blockDuration: LOGIN_RATE_LIMIT.BLOCK_TIME_SECONDS,
      message:
        'Too many failed login attempts. Please try again after 15 minutes.',
    };

    await this.rateLimiterService.throwIfBlocked(rateLimitOptions);

    // TODO: Call the stored procedure to validate the doctor login credentials
    const result = await this.dataSource.query<doctorLoginQueryInterface[]>(
      `SELECT * FROM login_doctor($1, $2)`,
      [request.email, request.mobile],
    );

    const procedureResult = result?.[0];

    if (!procedureResult) {
      throwRpcException(status.INTERNAL, 'Invalid response from procedure');
    }

    switch (procedureResult.status) {
      case Errors.invalidCredentialError:
        await this.rateLimiterService.recordFailure(rateLimitOptions);
        throwRpcException(status.UNAUTHENTICATED, 'Invalid Login Credentials');
        break;
      case Errors.dbError:
        throwRpcException(status.INTERNAL, 'Database error');
        break;
    }

    const isPasswordValid = await bcrypt.compare(
      request.password,
      procedureResult.password,
    );

    if (!isPasswordValid) {
      await this.rateLimiterService.recordFailure(rateLimitOptions);

      throwRpcException(status.UNAUTHENTICATED, 'Invalid Login Credentials');
    }
    //   TODO: Generate Session & JWT

    const sessionId = randomUUID();

    const jwtPayload: JwtPayload = {
      sessionId,
      userPrimaryKey: procedureResult.doctorPrimaryKey,
      userBusinessId: procedureResult.doctorId,
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
        userPrimaryKey: procedureResult.doctorPrimaryKey,
        userBusinessId: procedureResult.doctorId,
        role: UserRole.DOCTOR,
        refreshTokenHash,
        ipAddress: request.requestIp,
        userAgent: request.userAgent,
        deviceName: request.deviceName,
        expiresAt: refreshExpiry,
      }),

      this.auditService.log({
        userPrimaryKey: procedureResult.doctorPrimaryKey,
        userBusinessId: procedureResult.doctorId,
        role: UserRole.DOCTOR,
        sessionId,
        action: AuditAction.LOGIN_SUCCESS,
        status: AuditStatus.SUCCESS,
        ipAddress: request.requestIp,
        userAgent: request.userAgent,
      }),

      this.rateLimiterService.clear(rateLimitOptions.key),
    ]);

    return {
      doctorId: procedureResult.doctorId,
      email: procedureResult.email,
      mobile: procedureResult.mobile,
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
    request: PatientRegistrationReq,
  ): Promise<PatientRegistrationRes> {
    const hashedPassword = await this.hashUtil.hash(request.password);

    const result = await this.dataSource.query<patientQueryInterface[]>(
      `SELECT * FROM register_patient($1, $2, $3)`,
      [request.email, request.mobile, hashedPassword],
    );

    const procedureResult = result[0];

    if (!procedureResult) {
      throwRpcException(status.INTERNAL, 'Invalid response from procedure!');
    }
    switch (procedureResult.status) {
      case Errors.emailExistError:
        throwRpcException(status.ALREADY_EXISTS, 'Email already exists!');
        break;
      case Errors.mobileExistError:
        throwRpcException(status.ALREADY_EXISTS, 'Mobile already exists!');
        break;
      case Errors.dbError:
        throwRpcException(status.INTERNAL, 'Database error!');
        break;
    }

    return {
      patientPrimaryKey: procedureResult.patientPrimaryKey,
      patientId: procedureResult.patientId,
    };
  }

  /**
   * @description Compensate Patient Registration
   * @param request
   * @returns CompensatePatientRegistrationRes
   */
  async compensatePatientRegistration(
    request: CompensatePatientRegistrationReq,
  ): Promise<CompensatePatientRegistrationRes> {
    const result = await this.dataSource.query<authQueryInterface[]>(
      `SELECT compensate_patient_registration($1) AS f_result`,
      [request.patientPrimaryKey],
    );

    const procedureResult: string = result[0]?.f_result;
    switch (procedureResult) {
      case Errors.doctorNotFoundError:
        throwRpcException(status.NOT_FOUND, 'Doctor auth record not found!');
        break;
      case Errors.dbError:
        throwRpcException(
          status.INTERNAL,
          'Failed to compensate doctor registration!',
        );
        break;
      default:
        throwRpcException(status.INTERNAL, 'Something went wrong!');
    }
    return {
      success: true,
    };
  }

  async patientLogin(request: PatientLoginReq): Promise<PatientLoginRes> {
    // TODO: Implement rate limiting for patient login attempts
    const identifier = request.mobile ?? request.email ?? '';

    const rateLimitOptions: rateLimitOptionsInterface = {
      key: buildRateLimitKey(
        'login',
        UserRole.PATIENT,
        identifier,
        request.requestIp,
      ),
      maxAttempts: LOGIN_RATE_LIMIT.MAX_ATTEMPTS,
      blockDuration: LOGIN_RATE_LIMIT.BLOCK_TIME_SECONDS,
      message:
        'Too many failed login attempts. Please try again after 15 minutes.',
    };

    await this.rateLimiterService.throwIfBlocked(rateLimitOptions);

    // TODO: Call the stored procedure to validate the doctor login credentials
    const result = await this.dataSource.query<patientLoginQueryInterface[]>(
      `SELECT * FROM login_patient($1, $2)`,
      [request.email, request.mobile],
    );

    console.log(result);
    const procedureResult = result?.[0];
    if (!procedureResult) {
      throwRpcException(status.INTERNAL, 'Invalid response from procedure');
    }

    switch (procedureResult.status) {
      case Errors.invalidCredentialError:
        await this.rateLimiterService.recordFailure(rateLimitOptions);
        throwRpcException(status.UNAUTHENTICATED, 'Invalid Login Credentials');
        break;
      case Errors.dbError:
        throwRpcException(status.INTERNAL, 'Database error');
        break;
    }

    const isPasswordValid = await bcrypt.compare(
      request.password,
      procedureResult.password,
    );

    if (!isPasswordValid) {
      await this.rateLimiterService.recordFailure(rateLimitOptions);

      throwRpcException(status.UNAUTHENTICATED, 'Invalid Login Credentials');
    }

    //   TODO: Generate Session & JWT

    const sessionId = randomUUID();

    const jwtPayload: JwtPayload = {
      sessionId,
      userPrimaryKey: procedureResult.patientPrimaryKey,
      userBusinessId: procedureResult.patientId,
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
        userPrimaryKey: procedureResult.patientPrimaryKey,
        userBusinessId: procedureResult.patientId,
        role: UserRole.PATIENT,
        refreshTokenHash,
        ipAddress: request.requestIp,
        userAgent: request.userAgent,
        deviceName: request.deviceName,
        expiresAt: refreshExpiry,
      }),

      this.auditService.log({
        userPrimaryKey: procedureResult.patientPrimaryKey,
        userBusinessId: procedureResult.patientId,
        role: UserRole.DOCTOR,
        sessionId,
        action: AuditAction.LOGIN_SUCCESS,
        status: AuditStatus.SUCCESS,
        ipAddress: request.requestIp,
        userAgent: request.userAgent,
      }),

      this.rateLimiterService.clear(rateLimitOptions.key),
    ]);

    return {
      patientId: procedureResult.patientId,
      email: procedureResult.email,
      mobile: procedureResult.mobile,
      accessToken,
      refreshToken,
    };
  }

  /**
   * * Refresh Auth Token
   * @param request
   * @returns RefreshTokenRes
   */
  async refreshToken(request: RefreshTokenReq): Promise<RefreshTokenRes> {
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
   * * Log Out
   * @param request
   * @returns LogoutRes
   */
  async logout(request: LogoutReq): Promise<LogoutRes> {
    const session: UserSession = await this.sessionService.validateSession(
      request.sessionId,
    );

    await this.sessionService.deactivateSession(request.sessionId);

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
   * * Validate Access Token
   * @param request
   * @returns ValidateAccessTokenRes
   */
  async validateAccessToken(
    request: ValidateAccessTokenReq,
  ): Promise<ValidateAccessTokenRes> {
    await this.sessionService.validateSession(request.sessionId);

    return { valid: true };
  }
}
