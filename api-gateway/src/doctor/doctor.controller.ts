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
import { DoctorBasicDetailsDto } from './doctor.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../common/multer.config';
import { status } from '@grpc/grpc-js';
import { deleteFile } from '../common/util/file.util';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post('updateDoctorBasicDetails')
  @UseInterceptors(
    FileInterceptor(
      'profileImage',
      multerConfig({
        maxSize: 1 * 1024 * 1024
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
}
