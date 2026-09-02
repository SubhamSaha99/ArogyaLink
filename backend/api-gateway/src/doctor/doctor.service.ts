import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  DOCTOR_SERVICE_NAME,
  DoctorServiceClient,
  GetDoctorDetailsReq,
  GetDoctorDetailsRes,
  GetDoctorListRes,
  GetDoctorMasterDataRes,
  UpdateDoctorProfessionalDetailsReq,
  UpdateDoctorProfessionalDetailsRes,
  UpdateDoctorProfileReq,
  UpdateDoctorProfileRes,
  UpdateDoctorQualificationsReq,
  UpdateDoctorQualificationsRes,
} from '../proto/generated/doctor';
import {
  DoctorBasicDetailsDto,
  DoctorProfessionalDetailsDto,
  DoctorQualificationsDto,
  GetDoctorListDto,
} from './doctor.dto';
import { firstValueFrom } from 'rxjs';
import { deleteFile } from '../common/utils/file-util';
import { moveFile } from '../common/utils/upload-file';
import { GrpcServiceName } from '../common/utils/constant';
import {
  GetAssociatedHealthInstitutesRes,
  HEALTH_INSTITUTE_SERVICE_NAME,
  HealthInstituteServiceClient,
} from '../proto/generated/health-institute';

@Injectable()
export class DoctorService implements OnModuleInit {
  private doctorGrpcService!: DoctorServiceClient;
  private healthInstituteGrpcService!: HealthInstituteServiceClient;
  constructor(
    @Inject(GrpcServiceName.DOCTOR) private readonly doctorClient: ClientGrpc,
    @Inject(GrpcServiceName.HEALTH_INSTITUTE)
    private readonly healInstituteClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.doctorGrpcService =
      this.doctorClient.getService<DoctorServiceClient>(DOCTOR_SERVICE_NAME);

    this.healthInstituteGrpcService =
      this.healInstituteClient.getService<HealthInstituteServiceClient>(
        HEALTH_INSTITUTE_SERVICE_NAME,
      );
  }

  /**
   * * Update Doctor Basic Profile
   * @param request
   * @param profileImage
   * @returns UpdateDoctorBasicDeatilsRes
   */
  async updateDoctorProfileDetails(
    request: DoctorBasicDetailsDto,
    doctorId: string,
    profileImage?: Express.Multer.File,
  ): Promise<UpdateDoctorProfileRes> {
    let uploadedImagePath: string | undefined;

    try {
      const doctorProfileDetails: UpdateDoctorProfileReq = {
        ...request,
        doctorId,
      };

      if (profileImage) {
        uploadedImagePath = await moveFile(profileImage.path, 'doctor-profile');

        doctorProfileDetails.profileImage = uploadedImagePath;
      }

      return await firstValueFrom(
        this.doctorGrpcService.updateDoctorProfileDetails(doctorProfileDetails),
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
    doctorPrimaryKey: number,
    doctorId: string,
  ): Promise<UpdateDoctorProfessionalDetailsRes> {
    const doctorProfesionalDetails: UpdateDoctorProfessionalDetailsReq = {
      ...request,
      doctorPrimaryKey,
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
    doctorPrimaryKey: number,
    doctorId: string,
  ): Promise<UpdateDoctorQualificationsRes> {
    const doctorQualifications: UpdateDoctorQualificationsReq = {
      ...request,
      doctorPrimaryKey,
      doctorId,
      qualifications:
        request.qualifications?.map((qualification) => ({
          ...qualification,
          doctorQualificationId:
            qualification.doctorQualificationId ?? undefined,
          qualificationId: qualification.qualificationId,
          specializationId: qualification.specializationId ?? undefined,
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
  async getDoctorDetails(
    request: GetDoctorDetailsReq,
  ): Promise<GetDoctorDetailsRes> {
    return await firstValueFrom(
      this.doctorGrpcService.getDoctorDetails(request),
    );
  }

  /**
   * * Get Doctor Master Data
   * @returns GetDoctorMasterDataRes
   */
  async getDoctorMasterData(): Promise<GetDoctorMasterDataRes> {
    return await firstValueFrom(this.doctorGrpcService.getDoctorMasterData({}));
  }

  /**
   * @description Get Doctor List
   * @param request
   * @returns GetDoctorListRes
   */
  async getDoctorList(request: GetDoctorListDto): Promise<GetDoctorListRes> {
    return await firstValueFrom(this.doctorGrpcService.getDoctorList(request));
  }

  /**
   * @description Get Associated Health Institutes.
   * @param doctorPrimaryKey
   * @returns GetAssociatedHealthInstitutesRes
   */
  async getAssociatedHealthInstitutes(
    doctorPrimaryKey: number,
    doctorId: string,
  ): Promise<GetAssociatedHealthInstitutesRes> {
    return await firstValueFrom(
      this.healthInstituteGrpcService.getAssociatedHealthInstitutes({
        doctorPrimaryKey,
        doctorId,
      }),
    );
  }
}
