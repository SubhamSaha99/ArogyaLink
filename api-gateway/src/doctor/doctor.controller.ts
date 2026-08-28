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
  GetDoctorDetailsDto,
  GetDoctorListDto,
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
   * @param user
   * @param request
   * @param file
   * @returns json
   */
  @Post('updateDoctorBasicDetails')
  @HttpCode(HttpStatus.OK)
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
    @CurrentUser() user: JwtPayload,
    @Body() request: DoctorBasicDetailsDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.doctorService.updateDoctorBasicDetails(
      request,
      user.userBusinessId,
      file,
    );

    return {
      success: true,
      message: 'Doctor Basic Details Updated Successfully.',
      data: result,
    };
  }

  /**
   * * Update Doctor Professional Details
   * @param user
   * @param request
   * @returns json
   */
  @Post('updateDoctorProfessionalDetails')
  @HttpCode(HttpStatus.OK)
  @Auth(UserRole.DOCTOR)
  async updateDoctorProfessionalDetails(
    @CurrentUser() user: JwtPayload,
    @Body() request: DoctorProfessionalDetailsDto,
  ) {
    const result = await this.doctorService.updateDoctorProfessinalDetails(
      request,
      user.userPrimaryKey,
      user.userBusinessId,
    );

    return {
      success: true,
      message: 'Doctor Professional Details Updated Successfully.',
      data: result,
    };
  }

  /**
   * * Update Doctor Qualifications
   * @param user
   * @param request
   * @returns json
   */
  @Post('updateDoctorQualifications')
  @HttpCode(HttpStatus.OK)
  @Auth(UserRole.DOCTOR)
  async updateDoctorQualifications(
    @CurrentUser() user: JwtPayload,
    @Body() request: DoctorQualificationsDto,
  ) {
    const result = await this.doctorService.updateDoctorQualifications(
      request,
      user.userPrimaryKey,
      user.userBusinessId,
    );

    return {
      success: true,
      message: 'Doctor Qualifications Updated Successfully.',
      data: result,
    };
  }

  /**
   * @description Get Doctor Details
   * @param user
   * @param request
   * @returns json
   */
  @Post('getDoctorDetails')
  @HttpCode(HttpStatus.OK)
  @Auth(UserRole.DOCTOR, UserRole.HEALTH_INSTITUTE)
  async getDoctorDetails(
    @CurrentUser() user: JwtPayload,
    @Body() request: GetDoctorDetailsDto,
  ) {
    let doctorPrimaryKey: number = user.userPrimaryKey;
    let doctorId: string = user.userBusinessId;

    if (user.role === UserRole.HEALTH_INSTITUTE) {
      doctorPrimaryKey = request?.doctorPrimaryKey || user.userPrimaryKey;
      doctorId = request?.doctorId || user.userBusinessId;
    }
    const result = await this.doctorService.getDoctorDetails({
      doctorPrimaryKey,
      doctorId,
    });

    return {
      success: true,
      message: 'Doctor Details Fetched Successfully.',
      data: {
        doctorPrimaryKey: result.doctorPrimaryKey,
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
  @Auth(UserRole.DOCTOR, UserRole.HEALTH_INSTITUTE)
  async getDoctorMasterData() {
    const result = await this.doctorService.getDoctorMasterData();

    return {
      success: true,
      message: 'Doctor Master Data Fetched Successfully.',
      data: result,
    };
  }

  /**
   * @description Get Doctor List
   * @param request
   * @returns json
   */
  @Post('getDoctorList')
  @HttpCode(HttpStatus.OK)
  @Auth(UserRole.HEALTH_INSTITUTE)
  async getDoctorList(@Body() request: GetDoctorListDto) {
    const result = await this.doctorService.getDoctorList(request);
    return {
      success: true,
      message: 'Doctor List Fetched Successfully.',
      data: result,
    };
  }
}
