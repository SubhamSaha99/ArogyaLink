import { Controller } from '@nestjs/common';
import {
  AppointDoctorReq,
  AppointDoctorRes,
  GetAppointDoctorMasterDataRes,
  GetAppointedDoctorsReq,
  GetAppointedDoctorsRes,
  GetAssociatedDoctorsIdReq,
  GetAssociatedDoctorsIdRes,
  GetAssociatedHealthInstitutesReq,
  GetAssociatedHealthInstitutesRes,
  GetDistrictsReq,
  GetDistrictsRes,
  GetHealthInstituteDetailsReq,
  GetHealthInstituteDetailsRes,
  GetRegistrationCouncilRes,
  GetStatesRes,
  HealthInstituteProfileReq,
  HealthInstituteProfileRes,
  HealthInstituteServiceController,
  HealthInstituteServiceControllerMethods,
  UpdateHealthInstituteProfileReq,
  UpdateHealthInstituteProfileRes,
} from '../proto/generated/health-institute';
import { HealthInstituteService } from './health-institute.service';
import { Observable } from 'rxjs';

@Controller()
@HealthInstituteServiceControllerMethods()
export class HealthInstituteController implements HealthInstituteServiceController {
  constructor(
    private readonly healthInstituteService: HealthInstituteService,
  ) {}

  async createHealthInstituteProfile(
    request: HealthInstituteProfileReq,
  ): Promise<HealthInstituteProfileRes> {
    return this.healthInstituteService.createHealthInstituteProfile(request);
  }

  async updateHealthInstituteProfile(
    request: UpdateHealthInstituteProfileReq,
  ): Promise<UpdateHealthInstituteProfileRes> {
    return this.healthInstituteService.updateHealthInstituteProfile(request);
  }

  async getHealthInstituteDetails(
    request: GetHealthInstituteDetailsReq,
  ): Promise<GetHealthInstituteDetailsRes> {
    return this.healthInstituteService.getHealthInstituteDetails(request);
  }

  async getStates(): Promise<GetStatesRes> {
    return this.healthInstituteService.getStates();
  }

  async getDistricts(request: GetDistrictsReq): Promise<GetDistrictsRes> {
    return this.healthInstituteService.getDistricts(request);
  }

  async getRegistrationCouncils(): Promise<GetRegistrationCouncilRes> {
    return this.healthInstituteService.getRegistrationCouncils();
  }

  async getAppointDoctorMasterData(): Promise<GetAppointDoctorMasterDataRes> {
    return this.healthInstituteService.getAppointDoctorMasterData();
  }

  async appointDoctor(request: AppointDoctorReq): Promise<AppointDoctorRes> {
    return this.healthInstituteService.appointDoctor(request);
  }

  async getAppointedDoctors(
    request: GetAppointedDoctorsReq,
  ): Promise<GetAppointedDoctorsRes> {
    return this.healthInstituteService.getAppointedDoctors(request);
  }

  async getAssociatedHealthInstitutes(
    request: GetAssociatedHealthInstitutesReq,
  ): Promise<GetAssociatedHealthInstitutesRes> {
    return this.healthInstituteService.getAssociatedHealthInstitutes(request);
  }

  async getAssociatedDoctorsId(
    request: GetAssociatedDoctorsIdReq,
  ): Promise<GetAssociatedDoctorsIdRes> {
    return this.healthInstituteService.getAssociatedDoctorsId(request);
  }
}
