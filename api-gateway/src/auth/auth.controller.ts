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
import { HealthInstituteRegDto, HealthInstituteLoginDto } from './auth.dto';
import { extractRequestIp } from '../common/extreactRequestIp';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('healthInstituteRegistration')
  async hospitalRegistration(@Body() request: HealthInstituteRegDto) {
    try {
      const result = await this.authService.hospitalRegistration(request);

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
}
