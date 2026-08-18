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

    const result = await this.dataSource.query<authQueryInterface[]>(
      `SELECT register_health_institute($1, $2, $3) AS f_result`,
      [request.email, hashedPassword, request.healthInstituteType],
    );
    const procedureResult: string = result[0]?.f_result;

    if (!procedureResult) {
      throwRpcException(status.INTERNAL, 'Invalid response from procedure');
    }
    if (procedureResult === Errors.emailExistError) {
      throwRpcException(status.ALREADY_EXISTS, 'Email already exists');
    }
    if (procedureResult === Errors.dbError) {
      throwRpcException(status.INTERNAL, 'Database error');
    }
    if (!/^[HND]\d{6}$/.test(procedureResult)) {
      throwRpcException(status.INTERNAL, 'Invalid response from procedure');
    }
    return {
      healthInstituteId: procedureResult,
    };
  }

  async compensateHealthInstituteRegistration(
    request: CompensateHealthInstituteRegistrationReq,
  ): Promise<CompensateDoctorRegistrationRes> {
    const match = request.healthInstituteId.match(/^[HND](\d{6})$/);

    if (!match) {
      return throwRpcException(
        status.INVALID_ARGUMENT,
        'Invalid health institute ID format',
      );
    }
    const healthInstitutePk = Number(match[1]);

    const result = await this.dataSource.query<authQueryInterface[]>(
      `SELECT compensate_health_institute_registration($1) AS f_result`,
      [healthInstitutePk],
    );

    const procedureResult: string = result[0]?.f_result;

    if (procedureResult === Errors.helathInstituteNotFoundError)
      throwRpcException(
        status.NOT_FOUND,
        'Health Institute auth record not found',
      );
    if (procedureResult === Errors.dbError)
      throwRpcException(
        status.INTERNAL,
        'Failed to compensate doctor registration',
      );
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

    if (procedureResult.status === Errors.invalidCredentialError) {
      await this.rateLimiterService.recordFailure(rateLimitOptions);

      throwRpcException(status.UNAUTHENTICATED, 'Invalid Login Credentials');
    }

    if (procedureResult.status === Errors.dbError) {
      throwRpcException(status.INTERNAL, 'Database error');
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
        userBusinessId: procedureResult.healthInstituteId,
        role: UserRole.HEALTH_INSTITUTE,
        refreshTokenHash,
        ipAddress: request.requestIp,
        userAgent: request.userAgent,
        deviceName: request.deviceName,
        expiresAt: refreshExpiry,
      }),

      this.auditService.log({
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

    const result = await this.dataSource.query<authQueryInterface[]>(
      `SELECT create_doctor_auth($1, $2, $3) AS f_result`,
      [request.email, request.mobile, hashedPassword],
    );

    const procedureResult = result?.[0]?.f_result;

    if (procedureResult === Errors.emailExistError) {
      throwRpcException(status.ALREADY_EXISTS, 'Email already exists');
    }
    if (procedureResult === Errors.mobileExistError) {
      throwRpcException(status.ALREADY_EXISTS, 'Mobile already exists');
    }
    if (procedureResult === Errors.dbError) {
      throwRpcException(status.INTERNAL, 'Database error');
    }
    if (!/^DOC\d{6}$/.test(procedureResult)) {
      throwRpcException(status.INTERNAL, 'Invalid response from procedure');
    }
    return {
      doctorId: procedureResult,
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
    const match = request.doctorId.match(/^DOC(\d{6})$/);

    if (!match) {
      return throwRpcException(
        status.INVALID_ARGUMENT,
        'Invalid doctor ID format',
      );
    }

    const doctorPk = Number(match[1]);

    const result = await this.dataSource.query<authQueryInterface[]>(
      `SELECT compensate_doctor_registration($1) AS f_result`,
      [doctorPk],
    );

    const procedureResult: string = result[0]?.f_result;

    if (procedureResult === Errors.doctorNotFoundError)
      throwRpcException(status.NOT_FOUND, 'Doctor auth record not found');
    if (procedureResult === Errors.dbError)
      throwRpcException(
        status.INTERNAL,
        'Failed to compensate doctor registration',
      );
    if (procedureResult === Errors.doctorNotFoundError)
      throwRpcException(status.NOT_FOUND, 'Doctor auth record not found');
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
    if (procedureResult.status === Errors.invalidCredentialError) {
      await this.rateLimiterService.recordFailure(rateLimitOptions);

      throwRpcException(status.UNAUTHENTICATED, 'Invalid Login Credentials');
    }
    if (procedureResult.status === Errors.dbError) {
      throwRpcException(status.INTERNAL, 'Database error');
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
        userBusinessId: procedureResult.doctorId,
        role: UserRole.DOCTOR,
        refreshTokenHash,
        ipAddress: request.requestIp,
        userAgent: request.userAgent,
        deviceName: request.deviceName,
        expiresAt: refreshExpiry,
      }),

      this.auditService.log({
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
