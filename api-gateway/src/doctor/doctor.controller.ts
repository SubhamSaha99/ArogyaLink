import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import {
  DoctorBasicDetailsDto,
  DoctorProfessionalDetailsDto,
} from './doctor.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../common/multer.config';
import { status } from '@grpc/grpc-js';

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
    try {
      const result = await this.doctorService.updateDoctorBasicDetails(
        request,
        profileImage,
      );

      return {
        success: true,
        message: 'Deatils Updated Successfully.',
        data: result,
      };
    } catch (error: any) {
      switch (error.code) {
        case status.INVALID_ARGUMENT:
          throw new BadRequestException(error.details);

        case status.NOT_FOUND:
          throw new BadRequestException(error.details);

        default:
          throw new InternalServerErrorException(
            error.details || 'Internal server error',
          );
      }
    }
  }

  /**
   * * Update Doctor Professional Details.
   * @param request
   * @returns JSON
   */
  @Post('updateDcotorProfessionalDetails')
  async updateDoctorProfessinalDetails(
    @Body() request: DoctorProfessionalDetailsDto,
  ) {
    try {
      const result =
        await this.doctorService.updateDoctorProfessinalDetails(request);

      return {
        success: true,
        message: 'Deatils Updated Successfully.',
        data: result,
      };
    } catch (error: any) {
      switch (error.code) {
        case status.INVALID_ARGUMENT:
          throw new BadRequestException(error.details);

        case status.NOT_FOUND:
          throw new BadRequestException(error.details);

        default:
          throw new InternalServerErrorException(
            error.details || 'Internal server error',
          );
      }
    }
  }
}
