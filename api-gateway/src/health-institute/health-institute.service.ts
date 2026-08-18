import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  HEALTH_INSTITUTE_SERVICE_NAME,
  HealthInstituteServiceClient,
  UpdateHealthInstituteProfileReq,
  UpdateHealthInstituteProfileRes,
} from '../proto/generated/health-institute';
import { GrpcServiceName } from '../common/utils/constant';
import type { ClientGrpc } from '@nestjs/microservices';
import { UpdateHealthInstituteProfileDto } from './health-institute.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HealthInstituteService implements OnModuleInit {
  private healthInstituteGrpcService!: HealthInstituteServiceClient;

  constructor(
    @Inject(GrpcServiceName.HEALTH_INSTITUTE)
    private readonly healInstituteClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.healthInstituteGrpcService =
      this.healInstituteClient.getService<HealthInstituteServiceClient>(
        HEALTH_INSTITUTE_SERVICE_NAME,
      );
  }

  /**
   * * Update health institute profile
   * @param request 
   * @param healthInstituteId 
   * @returns UpdateHealthInstituteProfileRes
   */
  async updateHealthInstituteProfile(
    request: UpdateHealthInstituteProfileDto,
    healthInstituteId: string,
  ): Promise<UpdateHealthInstituteProfileRes> {
    const healInstituteProfileData: UpdateHealthInstituteProfileReq = {
      ...request,
      healthInstituteId,
    };

    return await firstValueFrom(
      this.healthInstituteGrpcService.updateHealthInstituteProfile(
        healInstituteProfileData,
      ),
    );
  }
}
