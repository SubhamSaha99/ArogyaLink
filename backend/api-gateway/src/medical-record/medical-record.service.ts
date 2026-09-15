import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  CreatePatientMedicalRecordReq,
  CreatePatientMedicalRecordRes,
  GetPatientMedicalRecordDetailsRes,
  GetPatientMedicalRecordsRes,
  PATIENT_SERVICE_NAME,
  PatientMedicalDocuments,
  PatientMedication,
  PatientServiceClient,
  UploadMedicalDocumentsReq,
  UploadMedicalDocumentsRes,
  UpdateMedicationsReq,
  UpdateMedicationsRes,
} from '../proto/generated/patient';
import { GrpcServiceName } from '../common/utils/constants';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  CreateMedicalRecordDto,
  UpdateMedicationsDto,
  UploadMedicalDocumentsDto,
} from './medical-record.dto';
import { moveFile } from '../common/utils/upload-file';
import { firstValueFrom } from 'rxjs';
import { deleteFile } from '../common/utils/file-util';

@Injectable()
export class MedicalRecordService implements OnModuleInit {
  private patientGrpcService!: PatientServiceClient;

  constructor(
    @Inject(GrpcServiceName.PATIENT) private readonly patientClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.patientGrpcService =
      this.patientClient.getService<PatientServiceClient>(PATIENT_SERVICE_NAME);
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
    doctorPrimaryKey: number | undefined,
    doctorId: string | undefined,
    healthInstitutePrimaryKey: number | undefined,
    healthInstituteId: string | undefined,
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
              `patient-medical-documents/${request.patientId}`,
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
              description: meta?.description ?? '',
              documentUrl: uploadedPath,
              documentDate:
                meta?.documentDate ?? new Date().toISOString().split('T')[0],
            };
          }),
        );
      }

      const medications: PatientMedication[] = request.medications ?? [];

      const medicalRecordReq: CreatePatientMedicalRecordReq = {
        medicalRecord: {
          patientPrimaryKey: request.patientPrimaryKey ?? 0,
          patientId: request.patientId ?? '',
          doctorPrimaryKey: doctorPrimaryKey ?? 0,
          doctorId: doctorId ?? '',
          healthInstitutePrimaryKey: healthInstitutePrimaryKey ?? 0,
          healthInstituteId: healthInstituteId ?? '',
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
   * @description Upload Medical Documents
   * @param request
   * @param documents
   * @returns UploadMedicalDocumentsRes
   */
  async uploadMedicalDocuments(
    request: UploadMedicalDocumentsDto,
    documents?: Express.Multer.File[],
  ): Promise<UploadMedicalDocumentsRes> {
    const uploadedFilePaths: string[] = [];
    try {
      let medicalDocuments: PatientMedicalDocuments[] = [];

      if (documents && documents.length > 0) {
        medicalDocuments = await Promise.all(
          documents.map(async (file, loopIndex) => {
            const uploadedPath = await moveFile(
              file.path,
              `patient-medical-documents/${request.patientId}`,
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
              description: meta?.description ?? '',
              documentUrl: uploadedPath,
              documentDate:
                meta?.documentDate ?? new Date().toISOString().split('T')[0],
            };
          }),
        );
      }

      const documentRequest: UploadMedicalDocumentsReq = {
        patientId: request.patientId,
        medicalRecordId: request.medicalRecordId,
        medicalDocuments,
      };

      return await firstValueFrom(
        this.patientGrpcService.uploadMedicalDocuments(documentRequest),
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
   * @description Update Medications (Update existing status/endDate/details or insert new medications)
   * @param request UpdateMedicationsDto
   * @returns UpdateMedicationsRes
   */
  async updateMedications(
    request: UpdateMedicationsDto,
  ): Promise<UpdateMedicationsRes> {
    const updateReq: UpdateMedicationsReq = {
      patientId: request.patientId,
      medicalRecordId: request.medicalRecordId,
      medications: (request.medications ?? []).map((m) => ({
        patientMedicationId: m.patientMedicationId || m.medicationId,
        medicationName: m.medicationName,
        dosage: m.dosage,
        startDate: m.startDate,
        endDate: m.endDate,
        status: m.status,
        description: m.description,
      })),
    };

    return await firstValueFrom(
      this.patientGrpcService.updateMedications(updateReq),
    );
  }

  /**
   * @description Get Patient Medical Records
   * @param patientPrimaryKey
   * @param patientId
   * @param offset
   * @param limit
   * @returns GetPatientMedicalRecordsRes
   */
  async getPatientMedicalRecords(
    patientPrimaryKey: number | undefined,
    patientId: string | undefined,
    offset: number,
    limit: number,
  ): Promise<GetPatientMedicalRecordsRes> {
    return firstValueFrom(
      this.patientGrpcService.getPatientMedicalRecords({
        patientPrimaryKey: patientPrimaryKey ?? 0,
        patientId: patientId ?? '',
        offset,
        limit,
      }),
    );
  }

  /**
   * @description Get Patient Medical Record Details
   * @param medicalRecordId
   * @returns GetPatientMedicalRecordDetailsRes
   */
  async getPatientMedicalRecordDetails(
    medicalRecordId: string,
  ): Promise<GetPatientMedicalRecordDetailsRes> {
    return firstValueFrom(
      this.patientGrpcService.getPatientMedicalRecordDetails({
        medicalRecordId,
      }),
    );
  }
}
