import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthServiceController,
  AuthServiceControllerMethods,
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
} from '../proto/generated/auth';
import { Observable } from 'rxjs';

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
    request: DoctorRegistrationReq,
  ): Promise<DoctorRegistrationRes> {
    return this.authService.doctorRegistration(request);
  }

  async compensateDoctorRegistration(
    request: CompensateDoctorRegistrationReq,
  ): Promise<CompensateDoctorRegistrationRes> {
    return this.authService.compensateDoctorRegistration(request);
  }

  async doctorLogin(request: DoctorLoginReq): Promise<DoctorLoginRes> {
    return this.authService.doctorLogin(request);
  }

  async refreshToken(request: RefreshTokenReq): Promise<RefreshTokenRes> {
      return this.authService.refreshToken(request);
  }
}
