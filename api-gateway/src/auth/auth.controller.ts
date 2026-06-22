import {
  Body,
  Controller,
  Post,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { status } from '@grpc/grpc-js';
import { AuthService } from './auth.service';
import { HealthInstituteRegDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('healthInstituteRegistration')
  async hospitalRegistration(
    @Body()
    request: HealthInstituteRegDto,
  ) {
    try {
      const response = await this.authService.hospitalRegistration(request);

      return {
        success: true,
        message: 'Health institute registered successfully',
        data: response,
      };
    } catch (error) {
      const err = error as { code: number; message: string };
      switch (err.code) {
        case status.ALREADY_EXISTS:
          throw new ConflictException(err.message);

        case status.INVALID_ARGUMENT:
          throw new BadRequestException(err.message);

        case status.NOT_FOUND:
          throw new BadRequestException(err.message);

        default:
          throw new InternalServerErrorException(
            err.message || 'Internal server error',
          );
      }
    }
  }
}
