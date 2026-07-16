import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  DoctorRegDto,
  HealthInstituteLoginDto,
  HealthInstituteRegDto,
} from './auth.dto';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
  DoctorAuthReq,
  DoctorRegistrationRes,
  HealthInstituteLoginReq,
  HealthInstituteLoginRes,
  HealthInstituteRegReq,
  HealthInstituteRegRes,
} from '../proto/generated/auth';
import {
  DOCTOR_SERVICE_NAME,
  DoctorProfileReq,
  DoctorServiceClient,
} from '../proto/generated/doctor';

@Injectable()
export class AuthService implements OnModuleInit {
  private logger = new Logger(AuthService.name);
  private authGrpcService!: AuthServiceClient;
  private doctorGrpcService!: DoctorServiceClient;

  constructor(
    @Inject('AUTH_PACKAGE') private readonly authClient: ClientGrpc,
    @Inject('DOCTOR_PACKAGE') private readonly doctorClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authGrpcService =
      this.authClient.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
    this.doctorGrpcService =
      this.doctorClient.getService<DoctorServiceClient>(DOCTOR_SERVICE_NAME);
  }

  /**
   * * Health Institute Registration
   * @param request
   * @returns HealthInstituteRegRes
   */
  healthInstituteRegistration(
    request: HealthInstituteRegDto,
  ): Promise<HealthInstituteRegRes> {
    const registrationRequest: HealthInstituteRegReq = {
      healthInstituteType: request.healthInstituteType,
      email: request.email,
      healthInstituteName: request.healthInstituteName,
      password: request.password,
    };

    return firstValueFrom(
      this.authGrpcService.healthInstituteRegistration(registrationRequest),
    );
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
  ): Promise<HealthInstituteLoginRes> {
    const loginRequest: HealthInstituteLoginReq = {
      healthInstituteId: request.healthInstituteId || '',
      email: request.email || '',
      password: request.password,
      requestIp,
    };

    return firstValueFrom(
      this.authGrpcService.healthInstituteLogin(loginRequest),
    );
  }

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
}
