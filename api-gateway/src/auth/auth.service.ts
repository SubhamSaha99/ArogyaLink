import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { HealthInstituteRegDto } from './auth.dto';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
  HealthInstituteRegReq,
  HealthInstituteRegRes,
} from '../proto/generated/auth';

@Injectable()
export class AuthService implements OnModuleInit {
  private authGrpcService!: AuthServiceClient;

  constructor(@Inject('AUTH_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authGrpcService =
      this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  hospitalRegistration(request: HealthInstituteRegDto): Promise<HealthInstituteRegRes> {
    const hospitalRegistrationRequest: HealthInstituteRegReq = {
      healthInstituteType: request.healthInstituteType,
      email: request.email,
      healthInstituteName: request.healthInstituteName,
      password: request.password,
    };

    return firstValueFrom(
      this.authGrpcService.healthInstituteRegistration(hospitalRegistrationRequest),
    );
  }
}
