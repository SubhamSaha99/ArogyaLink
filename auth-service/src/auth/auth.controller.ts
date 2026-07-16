import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthServiceController,
  AuthServiceControllerMethods,
  CompensateDoctorRegistrationReq,
  CompensateDoctorRegistrationRes,
  DoctorAuthReq,
  DoctorRegistrationRes,
  HealthInstituteLoginReq,
  HealthInstituteLoginRes,
  HealthInstituteRegReq,
  HealthInstituteRegRes,
} from '../proto/generated/auth';

@Controller()
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  async healthInstituteRegistration(
    request: HealthInstituteRegReq,
  ): Promise<HealthInstituteRegRes> {
    return this.authService.healthInstituteRegistration(request);
  }

  async healthInstituteLogin(
    request: HealthInstituteLoginReq,
  ): Promise<HealthInstituteLoginRes> {
    return this.authService.healthInstituteLogin(request);
  }

  async createDoctorAuth(
    request: DoctorAuthReq,
  ): Promise<DoctorRegistrationRes> {
    return this.authService.doctorRegistration(request);
  }

  async compensateDoctorRegistration(
    request: CompensateDoctorRegistrationReq,
  ): Promise<CompensateDoctorRegistrationRes> {
    return this.authService.compensateDoctorRegistration(request);
  }
}
