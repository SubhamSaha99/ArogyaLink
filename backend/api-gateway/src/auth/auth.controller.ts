import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Ip,
  Get,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import {
  HealthInstituteRegDto,
  HealthInstituteLoginDto,
  DoctorRegDto,
  DoctorLoginDto,
  RefreshTokenDto,
  PatientRegDto,
} from './auth.dto';
import { UAParser } from 'ua-parser-js';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

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
    const result = await this.authService.healthInstituteRegistration(request);

    return {
      success: true,
      message: 'Health institute registered successfully',
      data: result,
    };
  }

  /**
   * * Health Institute Login
   * @param request
   * @param httpRequest
   * @returns json
   */
  @Post('healthInstituteLogin')
  @HttpCode(HttpStatus.OK)
  async healthInstituteLogin(
    @Body() request: HealthInstituteLoginDto,
    @Req() httpRequest: Request,
    @Ip() requestIp: string,
  ) {
    const userAgent = httpRequest.headers['user-agent'] ?? '';

    const parser = new UAParser(userAgent);
    const deviceDetails = parser.getResult();

    const deviceName = [deviceDetails.browser.name, deviceDetails.os.name]
      .filter(Boolean)
      .join(' on ');

    const result = await this.authService.healthInstituteLogin(
      request,
      requestIp,
      userAgent,
      deviceName,
    );

    return {
      success: true,
      message: 'Health institute logged in successfully',
      data: result,
    };
  }

  /**
   * * Doctor Registration
   * @param request
   * @returns json
   */
  @Post('doctorRegistration')
  async doctorRegistration(@Body() request: DoctorRegDto) {
    const result = await this.authService.doctorRegistration(request);

    return {
      success: true,
      message: 'Doctor registered successfully',
      data: result,
    };
  }

  /**
   * * Doctor login
   * @param request
   * @param httpRequest
   * @returns json
   */
  @Post('doctorLogin')
  @HttpCode(HttpStatus.OK)
  async doctorLogin(
    @Body() request: DoctorLoginDto,
    @Req() httpRequest: Request,
    @Ip() requestIp: string,
  ) {
    const userAgent = httpRequest.headers['user-agent'] ?? '';

    const parser = new UAParser(userAgent);
    const deviceDetails = parser.getResult();

    const deviceName = [deviceDetails.browser.name, deviceDetails.os.name]
      .filter(Boolean)
      .join(' on ');

    const result = await this.authService.doctorLogin(
      request,
      requestIp,
      userAgent,
      deviceName,
    );

    return {
      success: true,
      message: 'Doctor logged in successfully',
      data: result,
    };
  }

  @Post('patientRegistration')
  async patientRegistration(@Body() request: PatientRegDto) {
    
  }

  /**
   * * Refresh Auth Token
   * @param request
   * @returns json
   */
  @Post('refreshToken')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() request: RefreshTokenDto) {
    const result = await this.authService.refreshToken(request);

    return {
      success: true,
      message: 'Token refreshed successfully.',
      data: result,
    };
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: JwtPayload) {
    await this.authService.logout(user.sessionId);

    return {
      success: true,
      message: 'Logged out successfully.',
    };
  }
}
