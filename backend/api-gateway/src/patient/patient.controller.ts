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
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../common/utils/multer.config';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import {
  GetPatientDetailsDto,
  GetPatientsListDto,
  PatientProfileDetailsDto,
} from './patient.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { UserRole } from '../common/utils/constants';

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
  @Post('getPatientDetails')
  @HttpCode(HttpStatus.OK)
  @Auth(UserRole.PATIENT, UserRole.DOCTOR, UserRole.HEALTH_INSTITUTE)
  async getPatientDetails(
    @CurrentUser() user: JwtPayload,
    @Body() request: GetPatientDetailsDto,
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

    const result = await this.patientService.getPatientDetails(
      patientPrimaryKey,
      patientId,
    );

    return {
      success: true,
      message: 'Patient Details Fetched Successfully.',
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
  async getPatientsList(
    @CurrentUser() user: JwtPayload,
    @Body() request: GetPatientsListDto,
  ) {
    let doctorPrimaryKey: number | undefined = undefined;
    let healthInstitutePrimaryKey: number | undefined = undefined;

    if (user.role === UserRole.DOCTOR)
      doctorPrimaryKey = request.doctorPrimaryKey;
    if (user.role === UserRole.HEALTH_INSTITUTE)
      healthInstitutePrimaryKey = request.healthInstitutePrimaryKey;

    const result = await this.patientService.getPatientsList(
      request,
      doctorPrimaryKey,
      healthInstitutePrimaryKey,
    );

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
