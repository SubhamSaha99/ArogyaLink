import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  GetPatientDetailsReq,
  GetPatientDetailsRes,
  GetPatientsListRes,
  PATIENT_SERVICE_NAME,
  PatientServiceClient,
  UpdatePatientProfileDetailsReq,
  UpdatePatientProfileDetailsRes,
  GetDistrictsRes,
  GetStatesRes,
} from '../proto/generated/patient';
import { GrpcServiceName } from '../common/utils/constants';
import type { ClientGrpc } from '@nestjs/microservices';
import { GetPatientsListDto, PatientProfileDetailsDto } from './patient.dto';
import { moveFile } from '../common/utils/upload-file';
import { firstValueFrom } from 'rxjs';
import { deleteFile } from '../common/utils/file-util';

@Injectable()
export class PatientService implements OnModuleInit {
  private patientGrpcService!: PatientServiceClient;

  constructor(
    @Inject(GrpcServiceName.PATIENT) private readonly patientClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.patientGrpcService =
      this.patientClient.getService<PatientServiceClient>(PATIENT_SERVICE_NAME);
  }

  /**
   * @description Update Patient Profile Details
   * @param request
   * @param patientId
   * @param profileImage
   */
  async updatePatientProfileDetails(
    request: PatientProfileDetailsDto,
    patientId: string,
    profileImage?: Express.Multer.File,
  ): Promise<UpdatePatientProfileDetailsRes> {
    let uploadedImagePath: string | undefined;
    try {
      const patientProfileDetails: UpdatePatientProfileDetailsReq = {
        ...request,
        patientId,
      };

      if (profileImage) {
        uploadedImagePath = await moveFile(
          profileImage.path,
          'patient-profile',
        );

        patientProfileDetails.profileImage = uploadedImagePath;
      }

      return await firstValueFrom(
        this.patientGrpcService.updatePatientProfile(patientProfileDetails),
      );
    } catch (error) {
      if (uploadedImagePath) {
        await deleteFile(uploadedImagePath);
      }
      throw error;
    }
  }

  /**
   * @description get Patient Profile Details
   * @param patientPrimaryKey
   * @param patientId
   * @returns GetPatientDetailsRes
   */
  async getPatientDetails(
    patientPrimaryKey: number | undefined,
    patientId: string | undefined,
  ): Promise<GetPatientDetailsRes> {
    const patientProfileReq: GetPatientDetailsReq = {
      patientPrimaryKey: patientPrimaryKey ?? 0,
      patientId: patientId ?? '',
    };

    return await firstValueFrom(
      this.patientGrpcService.getPatientDetails(patientProfileReq),
    );
  }

  /**
   * @description Get Patient List
   * @param request GetPatientsListRes
   * @returns
   */
  async getPatientsList(
    request: GetPatientsListDto,
    doctorPrimaryKey: number | undefined,
    healthInstitutePrimaryKey: number | undefined,
  ): Promise<GetPatientsListRes> {
    return firstValueFrom(
      this.patientGrpcService.getPatientsList({
        ...request,
        doctorPrimaryKey,
        healthInstitutePrimaryKey,
      }),
    );
  }

  /**
   * * Get States
   * @returns GetStatesRes
   */
  async getStates(): Promise<GetStatesRes> {
    return await firstValueFrom(this.patientGrpcService.getStates({}));
  }

  /**
   * * Get Districts
   * @param stateId
   * @returns GetDistrictsRes
   */
  async getDistricts(stateId: number): Promise<GetDistrictsRes> {
    return await firstValueFrom(
      this.patientGrpcService.getDistricts({
        stateId,
      }),
    );
  }
}
