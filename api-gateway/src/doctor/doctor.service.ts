import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  DOCTOR_SERVICE_NAME,
  DoctorServiceClient,
  UpdateDoctorBasicDeatilsReq,
  UpdateDoctorBasicDeatilsRes,
  UpdateDoctorProfessionalDetailsReq,
  UpdateDoctorProfessionalDetailsRes,
} from '../proto/generated/doctor';
import {
  DoctorBasicDetailsDto,
  DoctorProfessionalDetailsDto,
} from './doctor.dto';
import { firstValueFrom } from 'rxjs';
import { deleteFile } from '../common/util/file.util';
import { moveFile } from '../common/util/uploadFile';

@Injectable()
export class DoctorService implements OnModuleInit {
  private doctorGrpcService!: DoctorServiceClient;
  constructor(
    @Inject('DOCTOR_PACKAGE') private readonly doctorClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.doctorGrpcService =
      this.doctorClient.getService<DoctorServiceClient>(DOCTOR_SERVICE_NAME);
  }

  /**
   * * Update Doctor Basic Profile
   * @param request
   * @param profileImage
   * @returns UpdateDoctorBasicDeatilsRes
   */
  async updateDoctorBasicDetails(
    request: DoctorBasicDetailsDto,
    profileImage?: Express.Multer.File,
  ): Promise<UpdateDoctorBasicDeatilsRes> {
    let uploadedImagePath: string | undefined;

    try {
      const doctorBasicDetails: UpdateDoctorBasicDeatilsReq = {
        ...request,
      };

      if (profileImage) {
        uploadedImagePath = await moveFile(profileImage.path, 'doctor-profile');

        doctorBasicDetails.profileImage = uploadedImagePath;
      }

      return await firstValueFrom(
        this.doctorGrpcService.updateDoctorBasicDetails(doctorBasicDetails),
      );
    } catch (error) {
      if (uploadedImagePath) {
        await deleteFile(uploadedImagePath);
      }
      throw error;
    }
  }

  /**
   * * Update Doctor Professional Details.
   * @param request
   * @returns UpdateDoctorProfessionalDetailsRes
   */
  async updateDoctorProfessinalDetails(
    request: DoctorProfessionalDetailsDto,
  ): Promise<UpdateDoctorProfessionalDetailsRes> {
    const doctorProfesionalDetails: UpdateDoctorProfessionalDetailsReq = {
      ...request,
    };
    return await firstValueFrom(
      this.doctorGrpcService.updateDoctorProfessionalDetails(
        doctorProfesionalDetails,
      ),
    );
  }
}
