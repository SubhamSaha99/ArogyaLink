import { Controller } from '@nestjs/common';
import {
  DoctorProfileReq,
  DoctorProfileRes,
  DoctorServiceController,
  DoctorServiceControllerMethods,
  GetDoctorDetailsReq,
  GetDoctorDetailsRes,
  GetDoctorMasterDataRes,
  UpdateDoctorBasicDeatilsReq,
  UpdateDoctorBasicDeatilsRes,
  UpdateDoctorProfessionalDetailsReq,
  UpdateDoctorProfessionalDetailsRes,
  UpdateDoctorQualificationsReq,
  UpdateDoctorQualificationsRes,
} from '../proto/generated/doctor';
import { DoctorService } from './doctor.service';
@Controller()
@DoctorServiceControllerMethods()
export class DoctorController implements DoctorServiceController {
  constructor(private readonly doctorService: DoctorService) {}

  async createDoctorProfile(
    request: DoctorProfileReq,
  ): Promise<DoctorProfileRes> {
    return this.doctorService.createDoctorProfile(request);
  }

  async updateDoctorBasicDetails(
    request: UpdateDoctorBasicDeatilsReq,
  ): Promise<UpdateDoctorBasicDeatilsRes> {
    return this.doctorService.updateDoctorBasicDetails(request);
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
}
