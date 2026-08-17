import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  DOCTOR_SERVICE_NAME,
  DoctorServiceClient,
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
import {
  DoctorBasicDetailsDto,
  DoctorProfessionalDetailsDto,
  DoctorQualificationsDto,
} from './doctor.dto';
import { firstValueFrom } from 'rxjs';
import { deleteFile } from '../common/utils/file.util';
import { moveFile } from '../common/utils/uploadFile';

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
    doctorId: string,
    profileImage?: Express.Multer.File,
  ): Promise<UpdateDoctorBasicDeatilsRes> {
    let uploadedImagePath: string | undefined;

    try {
      const doctorBasicDetails: UpdateDoctorBasicDeatilsReq = {
        ...request,
        doctorId,
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
    doctorId: string,
  ): Promise<UpdateDoctorProfessionalDetailsRes> {
    const doctorProfesionalDetails: UpdateDoctorProfessionalDetailsReq = {
      ...request,
      doctorId,
    };
    return await firstValueFrom(
      this.doctorGrpcService.updateDoctorProfessionalDetails(
        doctorProfesionalDetails,
      ),
    );
  }

  /**
   * * Update Doctor Qualifications
   * @param request
   * @returns UpdateDoctorQualificationsRes
   */
  async updateDoctorQualifications(
    request: DoctorQualificationsDto,
    doctorId: string,
  ): Promise<UpdateDoctorQualificationsRes> {
    const doctorQualifications: UpdateDoctorQualificationsReq = {
      ...request,
      doctorId,
      qualifications:
        request.qualifications?.map((qualification) => ({
          ...qualification,
          specializationId: qualification.specializationId ?? 0,
          institutionName: qualification.institutionName ?? '',
          universityName: qualification.universityName ?? '',
          yearOfCompletion: qualification.yearOfCompletion ?? 0,
        })) ?? [],
    };

    return await firstValueFrom(
      this.doctorGrpcService.updateDoctorQualifications(doctorQualifications),
    );
  }

  /**
   * * Get Doctor Details
   * @param user
   * @returns GetDoctorDetailsRes
   */
  async getDoctorDetails(doctorId: string): Promise<GetDoctorDetailsRes> {
    const id: GetDoctorDetailsReq = {
      doctorId,
    };
    return await firstValueFrom(this.doctorGrpcService.getDoctorDetails(id));
  }

  /**
   * * Get Doctor Master Data
   * @returns GetDoctorMasterDataRes
   */
  async getDoctorMasterData(): Promise<GetDoctorMasterDataRes> {
    return await firstValueFrom(this.doctorGrpcService.getDoctorMasterData({}));
  }
}
