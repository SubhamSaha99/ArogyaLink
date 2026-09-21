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
import { GrpcMethod } from '@nestjs/microservices';
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
import { UserRole } from '../common/utils/constants';
import { Auth } from '../common/decorators/auth.decorator';
import { DOCTOR_SERVICE_NAME } from '../proto/generated/doctor';
import type {
  DoctorProfileReq,
  DoctorProfileRes,
  GetAppointedDoctorDetailsReq,
  GetAppointedDoctorDetailsRes,
  GetDoctorListRes,
  GetUnAppointedDoctorsListReq,
} from '../proto/generated/doctor';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  /**
   * @description create doctor profile grpc method
   * @param request
   * @returns DoctorProfileRes
   */
  @GrpcMethod(DOCTOR_SERVICE_NAME, 'CreateDoctorProfile')
  async createDoctorProfile(
    request: DoctorProfileReq,
  ): Promise<DoctorProfileRes> {
    return await this.doctorService.createDoctorProfile(request);
  }

  /**
   * @description get appointed doctor details grpc method
   * @param request
   * @returns
   */
  @GrpcMethod(DOCTOR_SERVICE_NAME, 'GetAppointedDoctorDetails')
  async getAppointedDoctorDetails(
    request: GetAppointedDoctorDetailsReq,
  ): Promise<GetAppointedDoctorDetailsRes> {
    return await this.doctorService.getAppointedDoctorDetails(request);
  }

  /**
   * @description get un appointed doctors list grpc controller
   * @param request 
   * @returns GetDoctorListRes
   */
  @GrpcMethod(DOCTOR_SERVICE_NAME, 'GetUnAppointedDoctorsList')
  async getUnAppointedDoctorsList(request: GetUnAppointedDoctorsListReq): Promise<GetDoctorListRes> {
    return await this.doctorService.getUnAppointedDoctorsList(request);
  }

  /**
   * * Update Doctor Basic Details
   * @param user
   * @param request
   * @param file
   * @returns json
   */
  @Post('doctor-profile-details')
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
  async updateDoctorProfileDetails(
    @CurrentUser() user: JwtPayload,
    @Body() request: DoctorBasicDetailsDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.doctorService.updateDoctorProfileDetails(
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
  @Post('doctor-professional-details')
  @HttpCode(HttpStatus.OK)
  @Auth(UserRole.DOCTOR)
  async updateDoctorProfessionalDetails(
    @CurrentUser() user: JwtPayload,
    @Body() request: DoctorProfessionalDetailsDto,
  ) {
    const result = await this.doctorService.updateDoctorProfessionalDetails(
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
  @Post('doctor-qualifications')
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
  @Post('doctor-details')
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
    const result = await this.doctorService.getDoctorDetails(
      doctorPrimaryKey,
      doctorId,
    );

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
   * @description Get Doctor Master Data
   * @returns json
   */
  @Get('doctor-master-data')
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
  @Post('doctors-list')
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

  /**
   * @description get associated health institutes controller
   * @param user
   * @returns json
   */
    @Get('associated-health-institutes')
    @HttpCode(HttpStatus.OK)
    @Auth(UserRole.DOCTOR)
    async getAssociatedHealthInstitutes(@CurrentUser() user: JwtPayload) {
      const result = await this.doctorService.getAssociatedHealthInstitutes(
        user.userPrimaryKey,
        user.userBusinessId,
      );
      return {
        success: true,
        message: 'Associated Health Institutes Fetched Successfully.',
        data: result,
      };
    }

  //   @Get('associated-health-institutes-master-data')
  //   @HttpCode(HttpStatus.OK)
  //   @Auth(UserRole.DOCTOR)
  //   async getAssociatedHealthInstitutesMasterData(
  //     @CurrentUser() user: JwtPayload,
  //   ) {
  //     const result =
  //       await this.doctorService.getAssociatedHealthInstitutesMasterData(
  //         user.userPrimaryKey,
  //         user.userBusinessId,
  //       );
  //     return {
  //       success: true,
  //       message: 'Associated Health Institutes Fetched Successfully.',
  //       data: result,
  //     };
  //   }
}
