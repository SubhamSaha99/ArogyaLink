import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { AppointDoctorDto, UpdateHealthInstituteProfileDto } from './health-institute.dto';
import { HealthInstituteService } from './health-institute.service';
import { Auth } from '../common/decorators/auth.decorator';
import { UserRole } from '../common/utils/constant';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@Controller('healthInstitute')
export class HealthInstituteController {
  constructor(
    private readonly healthInstituteService: HealthInstituteService,
  ) {}

  /**
   * * Update health institute profile
   * @param request
   * @param user
   * @returns json
   */
  @Post('updateHealthInstituteProfile')
  @Auth(UserRole.HEALTH_INSTITUTE)
  async updateHealthInstituteProfile(
    @Body() request: UpdateHealthInstituteProfileDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result =
      await this.healthInstituteService.updateHealthInstituteProfile(
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
   * * Get health institute details
   * @param user
   * @returns json
   */
  @Get('getHealthInstituteDetails')
  @HttpCode(HttpStatus.OK)
  @Auth(UserRole.HEALTH_INSTITUTE)
  async getHealthInstituteDetails(@CurrentUser() user: JwtPayload) {
    const result = await this.healthInstituteService.getHealthInstituteDetails(
      user.userBusinessId,
    );

    return {
      success: true,
      message: 'Details Fetched Successfully.',
      data: result,
    };
  }

  /**
   * * Get States
   * @returns json
   */
  @Get('states')
  @HttpCode(HttpStatus.OK)
  @Auth(UserRole.HEALTH_INSTITUTE)
  async getStates() {
    const result = await this.healthInstituteService.getStates();

    return {
      success: true,
      message: 'Details Fetched Successfully.',
      data: result,
    };
  }

  /**
   * @description get districts
   * @param id 
   * @returns json
   */
  @Get('districts/:id')
  @HttpCode(HttpStatus.OK)
  @Auth(UserRole.HEALTH_INSTITUTE)
  async getDistricts(@Param('id') id: string) {
    const result = await this.healthInstituteService.getDistricts(Number(id));

    return {
      success: true,
      message: 'Details Fetched Successfully.',
      data: result,
    };
  }

  /**
   * @description Get Health Institutes
   * @returns json
   */
  @Get('registrationCouncils')
  @HttpCode(HttpStatus.OK)
  @Auth(UserRole.HEALTH_INSTITUTE)
  async getRegistrationCouncils() {
    const result = await this.healthInstituteService.getRegistrationCouncils();

    return {
      success: true,
      message: 'Details Fetched Successfully.',
      data: result,
    };
  }

  /**
   * @description Get appoint doctor master data
   * @returns json
   */
  @Get('appointDoctorMasterData')
  @HttpCode(HttpStatus.OK)
  @Auth(UserRole.HEALTH_INSTITUTE)
  async getAppointDoctorMasterData() {
    const result = await this.healthInstituteService.getAppointDoctorMasterData();

    return {
      success: true,
      message: 'Details Fetched Successfully.',
      data: result,
    };
  }

  @Post('appointDoctor')
  @Auth(UserRole.HEALTH_INSTITUTE)
  async appointDoctor(@Body() request: AppointDoctorDto, @CurrentUser() user: JwtPayload) {
    const result = await this.healthInstituteService.appointDoctor(request, user.userBusinessId);
    return {
      success: true,
      message: 'Details Fetched Successfully.',
      data: result,
    }; 
  }
}
