import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  DoctorLoginDto,
  DoctorRegDto,
  HealthInstituteLoginDto,
  HealthInstituteRegDto,
  PatientRegDto,
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
  PatientRegistrationRes,
  RefreshTokenReq,
  RefreshTokenRes,
  ValidateAccessTokenRes,
} from '../proto/generated/auth';
import {
  DOCTOR_SERVICE_NAME,
  DoctorProfileRes,
  DoctorServiceClient,
} from '../proto/generated/doctor';
import { GrpcServiceName } from '../common/utils/constant';
import {
  HEALTH_INSTITUTE_SERVICE_NAME,
  HealthInstituteProfileRes,
  HealthInstituteServiceClient,
} from '../proto/generated/health-institute';
import {
  PATIENT_SERVICE_NAME,
  PatientProfileRes,
  PatientServiceClient,
} from '../proto/generated/patient';

@Injectable()
export class AuthService implements OnModuleInit {
  private logger = new Logger(AuthService.name);
  private authGrpcService!: AuthServiceClient;
  private doctorGrpcService!: DoctorServiceClient;
  private healthInstituteGrpcService!: HealthInstituteServiceClient;
  private patientGrpcService!: PatientServiceClient;

  constructor(
    @Inject(GrpcServiceName.AUTH) private readonly authClient: ClientGrpc,
    @Inject(GrpcServiceName.DOCTOR) private readonly doctorClient: ClientGrpc,
    @Inject(GrpcServiceName.HEALTH_INSTITUTE)
    private readonly healthInstituteClient: ClientGrpc,
    @Inject(GrpcServiceName.PATIENT) private readonly patientClient: ClientGrpc,
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
    this.patientGrpcService =
      this.patientClient.getService<PatientServiceClient>(PATIENT_SERVICE_NAME);
  }

  /**
   * * Health Institute Registration
   * @param request
   * @returns {healthInstituteId}
   */
  async healthInstituteRegistration(
    request: HealthInstituteRegDto,
  ): Promise<HealthInstituteProfileRes> {
    let healthInstitutePrimaryKey: number | null = null;
    let healthInstituteId: string | null = null;
    try {
      const authResponse: HealthInstituteRegRes = await firstValueFrom(
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
  async doctorRegistration(request: DoctorRegDto): Promise<DoctorProfileRes> {
    let doctorPrimaryKey: number | null = null;
    let doctorId: string | null = null;
    try {
      const authResponse: DoctorRegistrationRes = await firstValueFrom(
        this.authGrpcService.createDoctorAuth({
          email: request.email,
          mobile: request.mobile,
          password: request.password,
        }),
      );

      doctorPrimaryKey = authResponse.doctorPrimaryKey;
      doctorId = authResponse.doctorId;

      await firstValueFrom(
        this.doctorGrpcService.createDoctorProfile({
          doctorPrimaryKey,
          doctorId,
          email: request.email,
          mobile: request.mobile,
          firstName: request.firstName,
          middleName: request.middleName,
          lastName: request.lastName,
        }),
      );

      return { doctorId };
    } catch (error) {
      if (doctorPrimaryKey) {
        try {
          await firstValueFrom(
            this.authGrpcService.compensateDoctorRegistration({
              doctorPrimaryKey,
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
   * @description Patient Registration
   * @param request 
   * @returns PatientProfileRes
   */
  async patientRegistration(
    request: PatientRegDto,
  ): Promise<PatientProfileRes> {
    let patientPrimaryKey: number | null = null;
    let patientId: string | null = null;
    try {
      const authResponse: PatientRegistrationRes = await firstValueFrom(
        this.authGrpcService.patientRegistration({
          email: request.email,
          mobile: request.mobile,
          password: request.password,
        }),
      );
      patientPrimaryKey = authResponse.patientPrimaryKey;
      patientId = authResponse.patientId;

      await firstValueFrom(
        this.patientGrpcService.createPatient({
          patientPrimaryKey,
          patientId,
          email: request.email,
          mobile: request.mobile,
          firstName: request.firstName,
          middleName: request.middleName,
          lastName: request.lastName,
        }),
      );

      return { patientId };
    } catch (error) {
      if (patientPrimaryKey) {
        try {
          await firstValueFrom(
            this.authGrpcService.compensatePatientRegistration({
              patientPrimaryKey,
            }),
          );
        } catch (rollbackError) {
          this.logger.error(
            `Rollback failed for Doctor ID: ${patientId}`,
            rollbackError,
          );
        }
      }
      throw error;
    }
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
