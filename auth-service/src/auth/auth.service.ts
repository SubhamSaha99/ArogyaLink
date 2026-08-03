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
} from '../proto/generated/auth';
import { AuditAction, AuditStatus, Errors, UserRole } from '../util/constant';
import { throwRpcException } from '../util/rpcException';
import { JwtUtil } from '../util/jwt.util';
import { SessionService } from '../session/session.service';
import { AuditService } from '../session/audit.service';
import { HashUtil } from '../util/hash.util';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtUtil: JwtUtil,
    private readonly sessionService: SessionService,
    private readonly auditService: AuditService,
    private readonly hashUtil: HashUtil,
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

    const result = await this.dataSource.query(
      `CALL register_health_institute($1, $2, $3, $4, $5)`,
      [
        request.healthInstituteType,
        request.email,
        request.healthInstituteName,
        hashedPassword,
        null,
      ],
    );

    const procedureResult = result?.[0]?.p_result;

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

  /**
   * * Health Institute Login
   * @param request
   * @returns HealthInstituteLoginRes
   */
  async healthInstituteLogin(
    request: HealthInstituteLoginReq,
  ): Promise<HealthInstituteLoginRes> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(
        `CALL login_health_institute($1, $2, 'login_cursor')`,
        [request.healthInstituteId, request.email],
      );

      const result = await queryRunner.query(`FETCH ALL FROM login_cursor`);
      const procedureResult = result?.[0];

      await queryRunner.query(`CLOSE login_cursor`);
      await queryRunner.commitTransaction();

      if (!procedureResult) {
        throwRpcException(status.INTERNAL, 'Invalid response from procedure');
      }

      if (procedureResult.status === Errors.invalidCredentialError) {
        throwRpcException(status.UNAUTHENTICATED, 'Invalid Login Credentials');
      }

      if (procedureResult.status === Errors.dbError) {
        throwRpcException(status.INTERNAL, 'Database error');
      }

      const isPasswordValid = await this.hashUtil.verify(
        request.password,
        procedureResult.password,
      );

      if (!isPasswordValid) {
        throwRpcException(status.UNAUTHENTICATED, 'Invalid Login Credentials');
      }

      //   TODO: Generate Session & JWT

      const sessionId = randomUUID();

      const jwtPayload = {
        sessionId,
        userBusinessId: procedureResult.health_institute_id,
        role: UserRole.HEALTH_INSTITUTE,
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
          userBusinessId: procedureResult.health_institute_id,
          role: UserRole.HEALTH_INSTITUTE,
          refreshTokenHash,
          ipAddress: request.requestIp,
          userAgent: request.userAgent,
          deviceName: request.deviceName,
          expiresAt: refreshExpiry,
        }),

        this.auditService.log({
          userBusinessId: procedureResult.health_institute_id,
          role: UserRole.HEALTH_INSTITUTE,
          sessionId,
          action: AuditAction.LOGIN_SUCCESS,
          status: AuditStatus.SUCCESS,
          ipAddress: request.requestIp,
          userAgent: request.userAgent,
        }),
      ]);

      return {
        healthInstituteId: procedureResult.health_institute_id,
        healthInstituteName: procedureResult.health_institute_name,
        healthInstituteType: String(procedureResult.health_institute_type),
        email: procedureResult.email,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
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

    const result = await this.dataSource.query(
      `CALL create_doctor_auth($1, $2, $3, $4)`,
      [request.email, request.mobile, hashedPassword, null],
    );

    const procedureResult = result?.[0]?.p_result;

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

    const result = await this.dataSource.query(
      `CALL compensate_doctor_registration($1, $2)`,
      [doctorPk, null],
    );

    const procedureResult = result?.[0]?.p_result;

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
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.query(`CALL login_doctor($1, $2, 'login_cursor')`, [
        request.email,
        request.mobile,
      ]);

      const result = await queryRunner.query(`FETCH ALL FROM login_cursor`);
      const procedureResult = result?.[0];

      await queryRunner.query(`CLOSE login_cursor`);
      await queryRunner.commitTransaction();

      if (!procedureResult) {
        throwRpcException(status.INTERNAL, 'Invalid response from procedure');
      }
      if (procedureResult.status === Errors.invalidCredentialError) {
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
        throwRpcException(status.UNAUTHENTICATED, 'Invalid Login Credentials');
      }

      //   TODO: Generate Session & JWT

      const sessionId = randomUUID();

      const jwtPayload = {
        sessionId,
        userBusinessId: procedureResult.health_institute_id,
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
          userBusinessId: procedureResult.doctor_id,
          role: UserRole.DOCTOR,
          refreshTokenHash,
          ipAddress: request.requestIp,
          userAgent: request.userAgent,
          deviceName: request.deviceName,
          expiresAt: refreshExpiry,
        }),

        this.auditService.log({
          userBusinessId: procedureResult.doctor_id,
          role: UserRole.DOCTOR,
          sessionId,
          action: AuditAction.LOGIN_SUCCESS,
          status: AuditStatus.SUCCESS,
          ipAddress: request.requestIp,
          userAgent: request.userAgent,
        }),
      ]);

      return {
        doctorId: procedureResult.doctor_id,
        email: procedureResult.email,
        mobile: procedureResult.mobile,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * * Refresh Auth Token
   * @param request
   * @returns RefreshTokenRes
   */
  async refreshToken(request: RefreshTokenReq): Promise<RefreshTokenRes> {
    try {
      const payload = await this.jwtUtil.verifyRefreshToken(
        request.refreshToken,
      );

      const session = await this.sessionService.findSessionBySessionId(
        payload.sessionId,
      );

      if (!session) {
        throwRpcException(status.UNAUTHENTICATED, 'Invalid session');
      } else if (!session.isActive) {
        throwRpcException(
          status.UNAUTHENTICATED,
          'Session has been logged out',
        );
      } else if (session.expiresAt.getTime() < Date.now()) {
        throwRpcException(status.UNAUTHENTICATED, 'Session expired');
      }

      const isValidRefreshToken = await this.hashUtil.verify(
        request.refreshToken,
        session!.refreshTokenHash,
      );

      if (!isValidRefreshToken) {
        throwRpcException(status.UNAUTHENTICATED, 'Invalid refresh token');
      }

      const jwtPayload = {
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
    } catch (error) {
      throw error;
    }
  }

  /**
   * * Log Out
   * @param request
   * @returns LogoutRes
   */
  async logout(request: LogoutReq): Promise<LogoutRes> {
    try {
      const session = await this.sessionService.validateSession(
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
    } catch (error) {
      throw error;
    }
  }


  async validateAccessToken(
    request: ValidateAccessTokenReq,
  ): Promise<ValidateAccessTokenRes> {
    await this.sessionService.validateSession(request.sessionId);

    return { valid: true };
  }
}
