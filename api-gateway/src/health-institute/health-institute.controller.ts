import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UpdateHealthInstituteProfileDto } from './health-institute.dto';
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
}
