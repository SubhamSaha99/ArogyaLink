import {
  Body,
  Controller,
  Post,
  Req,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { status } from '@grpc/grpc-js';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import {
  HealthInstituteRegDto,
  HealthInstituteLoginDto,
  DoctorRegDto,
  DoctorLoginDto,
} from './auth.dto';
import { extractRequestIp } from '../common/extreactRequestIp';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * * Health Institute Registration
   * @param request
   * @returns json
   */
  @Post('healthInstituteRegistration')
  async healthInstituteRegistration(@Body() request: HealthInstituteRegDto) {
    try {
      const result =
        await this.authService.healthInstituteRegistration(request);

      return {
        success: true,
        message: 'Health institute registered successfully',
        data: result,
      };
    } catch (error: any) {
      switch (error.code) {
        case status.ALREADY_EXISTS:
          throw new ConflictException(error.details);

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
   * * Health Institute Login
   * @param request
   * @param httpRequest
   * @returns json
   */
  @Post('healthInstituteLogin')
  async healthInstituteLogin(
    @Body() request: HealthInstituteLoginDto,
    @Req() httpRequest: Request,
  ) {
    try {
      const result = await this.authService.healthInstituteLogin(
        request,
        extractRequestIp(httpRequest),
      );

      return {
        success: true,
        message: 'Health institute logged in successfully',
        data: result,
      };
    } catch (error: any) {
      switch (error.code) {
        case status.UNAUTHENTICATED:
          throw new UnauthorizedException(error.details);

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
   * * Doctor Registration
   * @param request
   * @returns json
   */
  @Post('doctorRegistration')
  async doctorRegistration(@Body() request: DoctorRegDto) {
    try {
      const result = await this.authService.doctorRegistration(request);

      return {
        success: true,
        message: 'Doctor registered successfully',
        data: result,
      };
    } catch (error: any) {
      switch (error.code) {
        case status.ALREADY_EXISTS:
          throw new ConflictException(error.details);

        case status.INVALID_ARGUMENT:
          throw new BadRequestException(error.details);

        case status.NOT_FOUND:
          throw new BadRequestException(error.details);

        case status.UNAUTHENTICATED:
          throw new UnauthorizedException(error.details);

        default:
          console.log(error.details);
          throw new InternalServerErrorException(
            error.details || 'Internal server error',
          );
      }
    }
  }

  /**
   * * Doctor login
   * @param request 
   * @param httpRequest 
   * @returns json
   */
  @Post('doctorLogin')
  async doctorLogin(
    @Body() request: DoctorLoginDto,
    @Req() httpRequest: Request,
  ) {
    try {
      const result = await this.authService.doctorLogin(
        request,
        extractRequestIp(httpRequest),
      );

      return {
        success: true,
        message: 'Doctor logged in successfully',
        data: result,
      };
    } catch (error: any) {
      switch (error.code) {
        case status.UNAUTHENTICATED:
          throw new UnauthorizedException(error.details);

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
