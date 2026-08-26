import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  AppointDoctorReq,
  AppointDoctorRes,
  GetAppointDoctorMasterDataRes,
  GetDistrictsRes,
  GetHealthInstituteDetailsReq,
  GetHealthInstituteDetailsRes,
  GetRegistrationCouncilRes,
  GetStatesRes,
  HEALTH_INSTITUTE_SERVICE_NAME,
  HealthInstituteServiceClient,
  UpdateHealthInstituteProfileReq,
  UpdateHealthInstituteProfileRes,
} from '../proto/generated/health-institute';
import { GrpcServiceName } from '../common/utils/constant';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  AppointDoctorDto,
  UpdateHealthInstituteProfileDto,
} from './health-institute.dto';
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

  /**
   * * Get health institute details
   * @param healthInstituteId
   * @returns GetHealthInstituteDetailsRes
   */
  async getHealthInstituteDetails(
    healthInstituteId: string,
  ): Promise<GetHealthInstituteDetailsRes> {
    const healInstituteProfileData: GetHealthInstituteDetailsReq = {
      healthInstituteId,
    };

    return await firstValueFrom(
      this.healthInstituteGrpcService.getHealthInstituteDetails(
        healInstituteProfileData,
      ),
    );
  }

  /**
   * * Get States
   * @returns GetStatesRes
   */
  async getStates(): Promise<GetStatesRes> {
    return await firstValueFrom(this.healthInstituteGrpcService.getStates({}));
  }

  /**
   * * Get Districts
   * @param stateId
   * @returns GetDistrictsRes
   */
  async getDistricts(stateId: number): Promise<GetDistrictsRes> {
    return await firstValueFrom(
      this.healthInstituteGrpcService.getDistricts({
        stateId,
      }),
    );
  }

  /**
   * @description Get Health Institutes
   * @returns GetRegistrationCouncilRes
   */
  async getRegistrationCouncils(): Promise<GetRegistrationCouncilRes> {
    return await firstValueFrom(
      this.healthInstituteGrpcService.getRegistrationCouncils({}),
    );
  }

  /**
   * @description Get appoint doctor master data
   * @returns GetAppointDoctorMasterDataRes
   */
  async getAppointDoctorMasterData(): Promise<GetAppointDoctorMasterDataRes> {
    return await firstValueFrom(
      this.healthInstituteGrpcService.getAppointDoctorMasterData({}),
    );
  }

  async appointDoctor(request: AppointDoctorDto, healthInstituteId: string): Promise<AppointDoctorRes> {
    const appointDoctorData: AppointDoctorReq = {
      ...request,
      healthInstituteId
    };
    return await firstValueFrom(
      this.healthInstituteGrpcService.appointDoctor(appointDoctorData),
    );
  }
}
