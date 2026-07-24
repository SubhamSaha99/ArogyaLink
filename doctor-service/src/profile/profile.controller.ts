import { Controller } from '@nestjs/common';
import {
  DoctorProfileReq,
  DoctorProfileRes,
  DoctorServiceController,
  DoctorServiceControllerMethods,
  UpdateDoctorBasicDeatilsReq,
  UpdateDoctorBasicDeatilsRes,
} from '../proto/generated/doctor';
import { ProfileService } from './profile.service';

@Controller()
@DoctorServiceControllerMethods()
export class ProfileController implements DoctorServiceController {
  constructor(private readonly profileServvice: ProfileService) {}

  async createDoctorProfile(
    request: DoctorProfileReq,
  ): Promise<DoctorProfileRes> {
    return this.profileServvice.createDoctorProfile(request);
  }

  async updateDoctorBasicDetails(
    request: UpdateDoctorBasicDeatilsReq,
  ): Promise<UpdateDoctorBasicDeatilsRes> {
    return this.profileServvice.updateDoctorBasicDetails(request);
  }
}
