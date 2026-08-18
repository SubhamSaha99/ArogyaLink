import { Controller } from '@nestjs/common';
import {
  HealthInstituteProfileReq,
  HealthInstituteProfileRes,
  HealthInstituteServiceController,
  HealthInstituteServiceControllerMethods,
  UpdateHealthInstituteProfileReq,
  UpdateHealthInstituteProfileRes,
} from '../proto/generated/health-institute';
import { HealthInstituteService } from './health-institute.service';

@Controller()
@HealthInstituteServiceControllerMethods()
export class HealthInstituteController implements HealthInstituteServiceController {
  constructor(
    private readonly healthInstituteService: HealthInstituteService,
  ) {}

  async createHealthInstituteProfile(
    request: HealthInstituteProfileReq,
  ): Promise<HealthInstituteProfileRes> {
    return this.healthInstituteService.createHealthInstituteProfile(request);
  }

  async updateHealthInstituteProfile(
    request: UpdateHealthInstituteProfileReq,
  ): Promise<UpdateHealthInstituteProfileRes> {
    return this.healthInstituteService.updateHealthInstituteProfile(request);
  }
}
