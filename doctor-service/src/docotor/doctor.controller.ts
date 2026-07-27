import { Controller } from '@nestjs/common';
import {
  DoctorProfileReq,
  DoctorProfileRes,
  DoctorServiceController,
  DoctorServiceControllerMethods,
  UpdateDoctorBasicDeatilsReq,
  UpdateDoctorBasicDeatilsRes,
  UpdateDoctorProfessionalDetailsReq,
  UpdateDoctorProfessionalDetailsRes,
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
}
