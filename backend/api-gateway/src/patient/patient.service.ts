import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  CreatePatientMedicalRecordReq,
  CreatePatientMedicalRecordRes,
  GetPatientDetailsReq,
  GetPatientDetailsRes,
  GetPatientsListRes,
  PATIENT_SERVICE_NAME,
  PatientMedicalDocuments,
  PatientMedication,
  PatientServiceClient,
  UpdatePatientProfileDetailsReq,
  UpdatePatientProfileDetailsRes,
} from '../proto/generated/patient';
import { GrpcServiceName } from '../common/utils/constants';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  CreateMedicalRecordDto,
  GetPatientsListDto,
  PatientProfileDetailsDto,
} from './patient.dto';
import { moveFile } from '../common/utils/upload-file';
import { firstValueFrom } from 'rxjs';
import { deleteFile } from '../common/utils/file-util';
import {
  GetDistrictsRes,
  GetStatesRes,
} from '../proto/generated/health-institute';

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
    patientPrimaryKey: number,
    patientId: string,
  ): Promise<GetPatientDetailsRes> {
    const patientProfileReq: GetPatientDetailsReq = {
      patientPrimaryKey,
      patientId,
    };

    return await firstValueFrom(
      this.patientGrpcService.getPatientDetails(patientProfileReq),
    );
  }

  /**
   * @description Create Patient Medical Record
   * @param doctorPrimaryKey
   * @param doctorId
   * @param healthInstitutePrimaryKey
   * @param healthInstituteId
   * @param request
   * @param documents
   * @returns CreatePatientMedicalRecordRes
   */
  async createPatientMedicalRecord(
    doctorPrimaryKey: number,
    doctorId: string,
    healthInstitutePrimaryKey: number,
    healthInstituteId: string,
    request: CreateMedicalRecordDto,
    documents?: Express.Multer.File[],
  ): Promise<CreatePatientMedicalRecordRes> {
    const uploadedFilePaths: string[] = [];

    try {
      let medicalDocuments: PatientMedicalDocuments[] = [];

      if (documents && documents.length > 0) {
        medicalDocuments = await Promise.all(
          documents.map(async (file, loopIndex) => {
            const uploadedPath = await moveFile(
              file.path,
              'patient-medical-documents',
            );
            uploadedFilePaths.push(uploadedPath);

            const indexMatch = file.fieldname?.match(
              /medicalDocuments\[(\d+)\]/,
            );
            const metaIndex = indexMatch
              ? parseInt(indexMatch[1], 10)
              : loopIndex;
            const meta = request.medicalDocuments?.[metaIndex];

            return {
              documentType: meta?.documentType ?? 1,
              title: meta?.title ?? file.originalname,
              documentUrl: uploadedPath,
              documentDate:
                meta?.documentDate ?? new Date().toISOString().split('T')[0],
            };
          }),
        );
      }

      const medications: PatientMedication[] =
        request.medications?.map((med) => ({
          medicationName: med.medicationName,
          dosage: med.dosage,
          startDate: med.startDate,
        })) ?? [];

      const medicalRecordReq: CreatePatientMedicalRecordReq = {
        medicalRecord: {
          patientPrimaryKey: request.patientPrimaryKey,
          patientId: request.patientId,
          doctorPrimaryKey,
          doctorId,
          healthInstitutePrimaryKey,
          healthInstituteId,
          title: request.title,
          diagnosis: request.diagnosis,
          description: request.description ?? '',
          startedDate: request.startedDate,
        },
        medicalDocuments,
        medications,
      };

      return await firstValueFrom(
        this.patientGrpcService.createPatientMedicalRecord(medicalRecordReq),
      );
    } catch (error) {
      if (uploadedFilePaths.length > 0) {
        await Promise.allSettled(
          uploadedFilePaths.map((filePath) => deleteFile(filePath)),
        );
      }
      throw error;
    }
  }

  /**
   * @description Get Patient List
   * @param request GetPatientsListRes
   * @returns
   */
  async getPatientsList(
    request: GetPatientsListDto,
  ): Promise<GetPatientsListRes> {
    return firstValueFrom(this.patientGrpcService.getPatientsList(request));
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
