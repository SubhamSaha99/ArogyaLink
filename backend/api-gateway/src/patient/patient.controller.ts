import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { FileInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../common/utils/multer.config';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import {
  CreateMedicalRecordDto,
  GetPatientsListDto,
  PatientProfileDetailsDto,
} from './patient.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { UserRole } from '../common/utils/constant';
import { MultipartNestedInterceptor } from '../auth/interceptor/multipart-nested.interceptor';

@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  /**
   * @description Update Patient Profile Details
   * @param user
   * @param request
   * @param file
   * @returns json
   */
  @Post('updatePatientProfileDetails')
  @HttpCode(HttpStatus.OK)
  @Auth(UserRole.PATIENT)
  @UseInterceptors(
    FileInterceptor(
      'profileImage',
      multerConfig({
        maxSize: 1 * 1024 * 1024,
      }),
    ),
  )
  async updatePatientProfileDetails(
    @Body() request: PatientProfileDetailsDto,
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.patientService.updatePatientProfileDetails(
      request,
      user.userBusinessId,
      file,
    );

    return {
      success: true,
      message: 'Patient Profile Details Updated Successfully.',
      data: result,
    };
  }

  /**
   * @description get Patient Profile Details
   * @param user
   * @returns json
   */
  @Get('getPatientDetails')
  @HttpCode(HttpStatus.OK)
  @Auth(UserRole.PATIENT)
  async getPatientDetails(@CurrentUser() user: JwtPayload) {
    const result = await this.patientService.getPatientDetails(
      user.userPrimaryKey,
      user.userBusinessId,
    );

    return {
      success: true,
      message: 'Details Fetched Successfully.',
      data: result,
    };
  }

  /**
   * @description Create Patient Medical Record
   * @param user
   * @param request
   * @param documents
   * @returns json
   */
  @Post('createPatientMedicalRecord')
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

    const result = await this.patientService.createPatientMedicalRecord(
      doctorPrimaryKey!,
      doctorId!,
      healthInstitutePrimaryKey!,
      healthInstituteId!,
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
   * @description Get Patient List
   * @param request
   * @returns json
   */
  @Post('getPatientsList')
  @HttpCode(HttpStatus.OK)
  @Auth(UserRole.DOCTOR, UserRole.HEALTH_INSTITUTE)
  async getPatientsList(@Body() request: GetPatientsListDto) {
    const result = await this.patientService.getPatientsList(request);

    return {
      success: true,
      message: 'Patients List Fetched Successfully.',
      data: result,
    };
  }

  /**
   * * Get States
   * @returns json
   */
  @Get('states')
  @HttpCode(HttpStatus.OK)
  @Auth(UserRole.PATIENT, UserRole.DOCTOR, UserRole.HEALTH_INSTITUTE)
  async getStates() {
    const result = await this.patientService.getStates();

    return {
      success: true,
      message: 'Details Fetched Successfully.',
      data: result,
    };
  }

  /**
   * @description get districts
   * @param id
   * @returns json
   */
  @Get('districts/:id')
  @HttpCode(HttpStatus.OK)
  @Auth(UserRole.PATIENT, UserRole.DOCTOR, UserRole.HEALTH_INSTITUTE)
  async getDistricts(@Param('id') id: string) {
    const result = await this.patientService.getDistricts(Number(id));

    return {
      success: true,
      message: 'Details Fetched Successfully.',
      data: result,
    };
  }
}
