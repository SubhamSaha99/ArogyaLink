import { Controller } from '@nestjs/common';
import {
  DoctorProfileReq,
  DoctorProfileRes,
  DoctorServiceController,
  DoctorServiceControllerMethods,
  GetAppointedDoctorDetailsReq,
  GetAppointedDoctorDetailsRes,
  GetDoctorDetailsReq,
  GetDoctorDetailsRes,
  GetDoctorListReq,
  GetDoctorListRes,
  GetDoctorMasterDataRes,
  GetUnAppointedDoctorsListReq,
  UpdateDoctorProfessionalDetailsReq,
  UpdateDoctorProfessionalDetailsRes,
  UpdateDoctorProfileReq,
  UpdateDoctorProfileRes,
  UpdateDoctorQualificationsReq,
  UpdateDoctorQualificationsRes,
} from '../proto/generated/doctor';
import { DoctorService } from './doctor.service';
import { Observable } from 'rxjs';
@Controller()
@DoctorServiceControllerMethods()
export class DoctorController implements DoctorServiceController {
  constructor(private readonly doctorService: DoctorService) {}

  async createDoctorProfile(
    request: DoctorProfileReq,
  ): Promise<DoctorProfileRes> {
    return this.doctorService.createDoctorProfile(request);
  }

  async updateDoctorProfileDetails(
    request: UpdateDoctorProfileReq,
  ): Promise<UpdateDoctorProfileRes> {
    return this.doctorService.updateDoctorProfileDetails(request);
  }

  async updateDoctorProfessionalDetails(
    request: UpdateDoctorProfessionalDetailsReq,
  ): Promise<UpdateDoctorProfessionalDetailsRes> {
    return this.doctorService.updateDoctorProfessionalDetails(request);
  }

  async updateDoctorQualifications(
    request: UpdateDoctorQualificationsReq,
  ): Promise<UpdateDoctorQualificationsRes> {
    return this.doctorService.updateDoctorQualifications(request);
  }

  async getDoctorDetails(
    request: GetDoctorDetailsReq,
  ): Promise<GetDoctorDetailsRes> {
    return this.doctorService.getDoctorDetails(request);
  }

  async getDoctorMasterData(): Promise<GetDoctorMasterDataRes> {
    return this.doctorService.getDoctorMasterData();
  }

  async getUnAppointedDoctorsList(
    request: GetUnAppointedDoctorsListReq,
  ): Promise<GetDoctorListRes> {
    return this.doctorService.getUnAppointedDoctorsList(request);
  }

  async getDoctorList(request: GetDoctorListReq): Promise<GetDoctorListRes> {
    return this.doctorService.getDoctorList(request);
  }

  async getAppointedDoctorDetails(
    request: GetAppointedDoctorDetailsReq,
  ): Promise<GetAppointedDoctorDetailsRes> {
    return this.doctorService.getAppointedDoctorDetails(request);
  }
}
