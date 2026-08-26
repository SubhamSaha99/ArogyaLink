import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  DoctorLoginDto,
  DoctorRegDto,
  HealthInstituteLoginDto,
  HealthInstituteRegDto,
  RefreshTokenDto,
} from './auth.dto';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
  DoctorLoginReq,
  DoctorLoginRes,
  DoctorRegistrationRes,
  HealthInstituteLoginReq,
  HealthInstituteLoginRes,
  HealthInstituteRegRes,
  LogoutRes,
  RefreshTokenReq,
  RefreshTokenRes,
  ValidateAccessTokenRes,
} from '../proto/generated/auth';
import {
  DOCTOR_SERVICE_NAME,
  DoctorServiceClient,
} from '../proto/generated/doctor';
import { GrpcServiceName } from '../common/utils/constant';
import {
  HEALTH_INSTITUTE_SERVICE_NAME,
  HealthInstituteServiceClient,
} from '../proto/generated/health-institute';

@Injectable()
export class AuthService implements OnModuleInit {
  private logger = new Logger(AuthService.name);
  private authGrpcService!: AuthServiceClient;
  private doctorGrpcService!: DoctorServiceClient;
  private healthInstituteGrpcService!: HealthInstituteServiceClient;

  constructor(
    @Inject(GrpcServiceName.AUTH) private readonly authClient: ClientGrpc,
    @Inject(GrpcServiceName.DOCTOR) private readonly doctorClient: ClientGrpc,
    @Inject(GrpcServiceName.HEALTH_INSTITUTE)
    private readonly healthInstituteClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authGrpcService =
      this.authClient.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
    this.doctorGrpcService =
      this.doctorClient.getService<DoctorServiceClient>(DOCTOR_SERVICE_NAME);
    this.healthInstituteGrpcService =
      this.healthInstituteClient.getService<HealthInstituteServiceClient>(
        HEALTH_INSTITUTE_SERVICE_NAME,
      );
  }

  /**
   * * Health Institute Registration
   * @param request
   * @returns {healthInstituteId}
   */
  async healthInstituteRegistration(
    request: HealthInstituteRegDto,
  ): Promise<{ healthInstituteId: string }> {
    let healthInstitutePrimaryKey: number | null = null;
    let healthInstituteId: string | null = null;
    try {
      const authResponse = await firstValueFrom(
        this.authGrpcService.healthInstituteRegistration({
          email: request.email,
          password: request.password,
          healthInstituteType: request.healthInstituteType,
        }),
      );
      healthInstitutePrimaryKey = authResponse.healthInstitutePrimaryKey;
      healthInstituteId = authResponse.healthInstituteId;

      await firstValueFrom(
        this.healthInstituteGrpcService.createHealthInstituteProfile({
          healthInstitutePrimaryKey,
          healthInstituteId,
          healthInstituteName: request.healthInstituteName,
          healthInstituteType: request.healthInstituteType,
          email: request.email,
        }),
      );
      return { healthInstituteId };
    } catch (error) {
      if (healthInstitutePrimaryKey) {
        try {
          await firstValueFrom(
            this.authGrpcService.compensateHealthInstituteRegistration({
              healthInstitutePrimaryKey,
            }),
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
   * * Health Institute Login
   * @param request
   * @param requestIp
   * @returns HealthInstituteLoginRes
   */
  healthInstituteLogin(
    request: HealthInstituteLoginDto,
    requestIp: string,
    userAgent: string,
    deviceName?: string,
  ): Promise<HealthInstituteLoginRes> {
    const loginRequest: HealthInstituteLoginReq = {
      email: request.email,
      password: request.password,
      requestIp,
      userAgent,
      deviceName: deviceName || '',
    };

    return firstValueFrom(
      this.authGrpcService.healthInstituteLogin(loginRequest),
    );
  }
  /**
   * * Doctor Registration
   * @param request
   * @returns DoctorRegistrationRes
   */
  async doctorRegistration(
    request: DoctorRegDto,
  ): Promise<DoctorRegistrationRes> {
    let doctorId: string | null = null;

    try {
      const authResponse = await firstValueFrom(
        this.authGrpcService.createDoctorAuth({
          email: request.email,
          mobile: request.mobile,
          password: request.password,
        }),
      );

      doctorId = authResponse.doctorId;

      await firstValueFrom(
        this.doctorGrpcService.createDoctorProfile({
          doctorId,
          email: request.email,
          mobile: request.mobile,
          firstName: request.firstName,
          middleName: request.middleName,
          lastName: request.lastName,
        }),
      );

      return authResponse;
    } catch (error) {
      if (doctorId) {
        try {
          await firstValueFrom(
            this.authGrpcService.compensateDoctorRegistration({
              doctorId,
            }),
          );
        } catch (rollbackError) {
          this.logger.error(
            `Rollback failed for Doctor ID: ${doctorId}`,
            rollbackError,
          );
        }
      }

      throw error;
    }
  }

  /**
   * * Docotor login
   * @param request
   * @param requestIp
   * @returns DoctorLoginRes
   */
  async doctorLogin(
    request: DoctorLoginDto,
    requestIp: string,
    userAgent: string,
    deviceName?: string,
  ): Promise<DoctorLoginRes> {
    const loginRequest: DoctorLoginReq = {
      email: request.email || '',
      mobile: request.mobile || '',
      password: request.password,
      requestIp,
      userAgent,
      deviceName: deviceName || '',
    };

    return firstValueFrom(this.authGrpcService.doctorLogin(loginRequest));
  }

  /**
   * * Refresh Auth Token
   * @param request
   * @returns RefreshTokenRes
   */
  async refreshToken(request: RefreshTokenDto): Promise<RefreshTokenRes> {
    const refreshTokenRequest: RefreshTokenReq = {
      refreshToken: request.refreshToken,
    };

    return firstValueFrom(
      this.authGrpcService.refreshToken(refreshTokenRequest),
    );
  }

  /**
   * * Validate Access Token
   * @param sessionId
   * @returns ValidateAccessTokenRes
   */
  validateAccessToken(sessionId: string): Promise<ValidateAccessTokenRes> {
    return firstValueFrom(
      this.authGrpcService.validateAccessToken({
        sessionId,
      }),
    );
  }

  /**
   * * Logout
   * @param sessionId
   * @returns
   */
  logout(sessionId: string): Promise<LogoutRes> {
    return firstValueFrom(
      this.authGrpcService.logout({
        sessionId,
      }),
    );
  }
}
