import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../common/utils/multer.config';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { PatientProfileDetailsDto } from './patient.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { UserRole } from '../common/utils/constant';

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
}
