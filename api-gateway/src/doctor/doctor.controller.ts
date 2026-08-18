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
import { DoctorService } from './doctor.service';
import {
  DoctorBasicDetailsDto,
  DoctorProfessionalDetailsDto,
  DoctorQualificationsDto,
} from './doctor.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../common/utils/multer.config';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { UserRole } from '../common/utils/constant';
import { Auth } from '../common/decorators/auth.decorator';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  /**
   * * Update Doctor Basic Details
   * @param request
   * @param profileImage
   * @returns JSON
   */
  @Post('updateDoctorBasicDetails')
  @Auth(UserRole.DOCTOR)
  @UseInterceptors(
    FileInterceptor(
      'profileImage',
      multerConfig({
        maxSize: 1 * 1024 * 1024,
      }),
    ),
  )
  async updateDoctorBasicDetails(
    @Body() request: DoctorBasicDetailsDto,
    @CurrentUser() user: JwtPayload,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    const result = await this.doctorService.updateDoctorBasicDetails(
      request,
      user.userBusinessId,
      profileImage,
    );

    return {
      success: true,
      message: 'Deatils Updated Successfully.',
      data: result,
    };
  }

  /**
   * * Update Doctor Professional Details.
   * @param request
   * @returns JSON
   */
  @Post('updateDoctorProfessionalDetails')
  @Auth(UserRole.DOCTOR)
  async updateDoctorProfessinalDetails(
    @Body() request: DoctorProfessionalDetailsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.doctorService.updateDoctorProfessinalDetails(
      request,
      user.userBusinessId,
    );

    return {
      success: true,
      message: 'Deatils Updated Successfully.',
      data: result,
    };
  }

  /**
   * * Update Doctor Qualifications
   * @param request
   * @returns json
   */
  @Post('updateDoctorQualifications')
  @Auth(UserRole.DOCTOR)
  async updateDoctorQualifications(
    @Body() request: DoctorQualificationsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.doctorService.updateDoctorQualifications(
      request,
      user.userBusinessId,
    );

    return {
      success: true,
      message: 'Deatils Updated Successfully.',
      data: result,
    };
  }

  /**
   * * Get Doctor Details
   * @param user
   * @returns json
   */
  @Get('getDoctorDetails')
  @HttpCode(HttpStatus.OK)
  @Auth(UserRole.DOCTOR)
  async getDoctorDetails(@CurrentUser() user: JwtPayload) {
    const result = await this.doctorService.getDoctorDetails(
      user.userBusinessId,
    );

    return {
      success: true,
      message: 'Doctor Details Fetched Successfully.',
      data: {
        doctorId: result.doctorId,
        profileDetails: result.profileDetails,
        professionalDetails: result.professionalDetails,
        qualificationDetails: result.qualificationDetails,
      },
    };
  }

  /**
   * Get Doctor Master Data
   * @returns json
   */
  @Get('getDoctorMasterData')
  @HttpCode(HttpStatus.OK)
  @Auth(UserRole.DOCTOR)
  async getDoctorMasterData() {
    const result = await this.doctorService.getDoctorMasterData();

    return {
      success: true,
      message: 'Doctor Master Data Fetched Successfully.',
      data: result,
    };
  }
}
