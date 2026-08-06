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
import { multerConfig } from '../common/util/multer.config';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { UserRole } from '../common/util/constant';
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
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    const result = await this.doctorService.updateDoctorBasicDetails(
      request,
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
  ) {
    const result =
      await this.doctorService.updateDoctorProfessinalDetails(request);

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
  async updateDoctorQualifications(@Body() request: DoctorQualificationsDto, @CurrentUser() user: JwtPayload) {
    const result = await this.doctorService.updateDoctorQualifications(request, user);

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
    const result = await this.doctorService.getDoctorDetails(user.userBusinessId);

    return {
      success: true,
      message: 'Doctor Details Fetched Successfully.',
      data: result,
    };
  }
}
