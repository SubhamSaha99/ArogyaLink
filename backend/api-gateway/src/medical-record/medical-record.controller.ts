import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../common/utils/multer.config';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import {
  CreateMedicalRecordDto,
  GetPatientMedicalRecordsDto,
  UpdateMedicationsDto,
  UploadMedicalDocumentsDto,
} from './medical-record.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { UserRole } from '../common/utils/constants';
import { MultipartNestedInterceptor } from '../common/interceptor/multipart-nested.interceptor';
import { MedicalRecordService } from './medical-record.service';

@Controller('medical-record')
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  /**
   * @description Create Patient Medical Record
   * @param user
   * @param request
   * @param documents
   * @returns json
   */
  @Post('patient-medical-record')
  @Auth(UserRole.DOCTOR, UserRole.HEALTH_INSTITUTE)
  @UseInterceptors(
    AnyFilesInterceptor(
      multerConfig({
        maxSize: 5 * 1024 * 1024,
      }),
    ),
    MultipartNestedInterceptor,
  )
  async createPatientMedicalRecord(
    @CurrentUser() user: JwtPayload,
    @Body() request: CreateMedicalRecordDto,
    @UploadedFiles() documents?: Express.Multer.File[],
  ) {
    let doctorPrimaryKey: number | undefined,
      healthInstitutePrimaryKey: number | undefined,
      doctorId: string | undefined,
      healthInstituteId: string | undefined;

    switch (user.role) {
      case UserRole.DOCTOR:
        doctorPrimaryKey = user.userPrimaryKey;
        doctorId = user.userBusinessId;
        healthInstitutePrimaryKey = request.healthInstitutePrimaryKey;
        healthInstituteId = request.healthInstituteId;
        break;
      case UserRole.HEALTH_INSTITUTE:
        healthInstitutePrimaryKey = user.userPrimaryKey;
        healthInstituteId = user.userBusinessId;
        doctorPrimaryKey = request.doctorPrimaryKey;
        doctorId = request.doctorId;
        break;
    }

    const result = await this.medicalRecordService.createPatientMedicalRecord(
      doctorPrimaryKey,
      doctorId,
      healthInstitutePrimaryKey,
      healthInstituteId,
      request,
      documents,
    );

    return {
      success: true,
      message: 'Medical Record Created Successfully.',
      data: result,
    };
  }

  /**
   * @description Upload Medical Documents
   * @param request
   * @param documents
   * @returns json
   */
  @Post('medical-documents')
  @Auth(UserRole.DOCTOR, UserRole.HEALTH_INSTITUTE)
  @UseInterceptors(
    AnyFilesInterceptor(
      multerConfig({
        maxSize: 5 * 1024 * 1024,
      }),
    ),
    MultipartNestedInterceptor,
  )
  async uploadMedicalDocuments(
    @Body() request: UploadMedicalDocumentsDto,
    @UploadedFiles() documents?: Express.Multer.File[],
  ) {
    const result = await this.medicalRecordService.uploadMedicalDocuments(
      request,
      documents,
    );

    return {
      success: true,
      message: 'Medical Documents Uploaded Successfully.',
      data: result,
    };
  }

  /**
   * @description Update Medications (Update existing medication status/endDate/details or enter new medications)
   * @param request UpdateMedicationsDto
   * @returns json
   */
  @Post('medications')
  @Auth(UserRole.DOCTOR, UserRole.HEALTH_INSTITUTE)
  @HttpCode(HttpStatus.OK)
  async updateMedications(@Body() request: UpdateMedicationsDto) {
    const result = await this.medicalRecordService.updateMedications(request);

    return {
      success: true,
      message: 'Medications updated successfully.',
      data: result,
    };
  }

  /**
   * @description Get Patient Medical Records
   * @param user
   * @param request
   * @returns json
   */
  @Post('patient-medical-records')
  @Auth(UserRole.DOCTOR, UserRole.HEALTH_INSTITUTE, UserRole.PATIENT)
  @HttpCode(HttpStatus.OK)
  async getPatientMedicalRecords(
    @CurrentUser() user: JwtPayload,
    @Body() request: GetPatientMedicalRecordsDto,
  ) {
    let patientPrimaryKey: number | undefined = undefined;
    let patientId: string | undefined = undefined;

    if (user.role === UserRole.PATIENT) {
      patientPrimaryKey = user.userPrimaryKey;
      patientId = user.userBusinessId;
    } else {
      patientPrimaryKey = request.patientPrimaryKey;
      patientId = request.patientId;
    }

    const result = await this.medicalRecordService.getPatientMedicalRecords(
      patientPrimaryKey,
      patientId,
      request.offset,
      request.limit,
    );

    return {
      success: true,
      message: 'Patient Medical Records Fetched Successfully.',
      data: result,
    };
  }

  /**
   * @description Get Patient Medical Record Details
   * @param medicalRecordId
   * @returns json
   */
  @Get('patient-medical-record-details/:id')
  @Auth(UserRole.DOCTOR, UserRole.HEALTH_INSTITUTE, UserRole.PATIENT)
  @HttpCode(HttpStatus.OK)
  async getPatientMedicalRecordDetails(@Param('id') medicalRecordId: string) {
    const result =
      await this.medicalRecordService.getPatientMedicalRecordDetails(medicalRecordId);

    return {
      success: true,
      message: 'Patient Medical Record Details Fetched Successfully.',
      data: result,
    };
  }
}
