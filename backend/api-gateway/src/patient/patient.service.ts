import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  PATIENT_SERVICE_NAME,
  PatientServiceClient,
  UpdatePatientProfileDetailsReq,
  UpdatePatientProfileDetailsRes,
} from '../proto/generated/patient';
import { GrpcServiceName } from '../common/utils/constant';
import type { ClientGrpc } from '@nestjs/microservices';
import { PatientProfileDetailsDto } from './patient.dto';
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
        patientId
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

  async getPatientDetails(patientPrimaryKey: number, patientId: string) {
    
  }
}
