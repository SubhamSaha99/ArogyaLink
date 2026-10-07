import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { HealthService } from './health.service';
import type { HealthCheckResponse, LivenessResponse } from './health.interface';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  getLiveness(): LivenessResponse {
    return this.healthService.getLiveness();
  }

  @Get('ready')
  async getReadiness(
    @Res({ passthrough: true }) res: Response,
  ): Promise<HealthCheckResponse> {
    const health = await this.healthService.check();
    if (health.status !== 'ok') {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    }

    return health;
  }

//   @Get('auth/health')
//   async getAuthHealth(
//     @Res({ passthrough: true }) res: Response,
//   ): Promise<HealthCheckResponse> {
//     return this.getHealth(res);
//   }
}
