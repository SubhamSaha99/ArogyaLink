import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { HospitalRegDto } from './auth.dto';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
  HospitalRegReq,
  HospitalRegRes,
} from '../proto/generated/auth';

@Injectable()
export class AuthService implements OnModuleInit {
  private authGrpcService!: AuthServiceClient;

  constructor(@Inject('AUTH_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authGrpcService =
      this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  hospitalRegistration(request: HospitalRegDto): Promise<HospitalRegRes> {
    const hospitalRegistrationRequest: HospitalRegReq = {
      email: request.email,
      hospitalName: request.hospitalName,
      password: request.password,
    };

    return firstValueFrom(
      this.authGrpcService.hospitalRegistration(hospitalRegistrationRequest),
    );
  }
}
