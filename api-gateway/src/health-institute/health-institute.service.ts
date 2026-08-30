import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  AppointDoctorReq,
  AppointDoctorRes,
  GetAppointDoctorMasterDataRes,
  GetAppointedDoctorsReq,
  GetAppointedDoctorsRes,
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
  GetAppointedDoctorsListDto,
  UpdateHealthInstituteProfileDto,
} from './health-institute.dto';
import { firstValueFrom } from 'rxjs';
import {
  DOCTOR_SERVICE_NAME,
  DoctorServiceClient,
  GetAppointedDoctorDetailsRes,
} from '../proto/generated/doctor';
import { GetAppointedDoctorsData, GetAppointedDoctorsList } from '../common/interfaces/health-institute.interface';

@Injectable()
export class HealthInstituteService implements OnModuleInit {
  private healthInstituteGrpcService!: HealthInstituteServiceClient;
  private doctorGrpcService!: DoctorServiceClient;

  constructor(
    @Inject(GrpcServiceName.HEALTH_INSTITUTE)
    private readonly healInstituteClient: ClientGrpc,
    @Inject(GrpcServiceName.DOCTOR) private readonly doctorClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.healthInstituteGrpcService =
      this.healInstituteClient.getService<HealthInstituteServiceClient>(
        HEALTH_INSTITUTE_SERVICE_NAME,
      );
    this.doctorGrpcService =
      this.doctorClient.getService<DoctorServiceClient>(DOCTOR_SERVICE_NAME);
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
    healthInstitutePrimaryId: number,
    healthInstituteId: string,
  ): Promise<GetHealthInstituteDetailsRes> {
    const healInstituteProfileData: GetHealthInstituteDetailsReq = {
      healthInstitutePrimaryId,
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

  async appointDoctor(
    request: AppointDoctorDto,
    healthInstitutePrimaryKey: number,
    healthInstituteId: string,
  ): Promise<AppointDoctorRes> {
    const appointDoctorData: AppointDoctorReq = {
      ...request,
      departmentId: String(request.departmentId),
      healthInstitutePrimaryKey,
      healthInstituteId,
    };
    return await firstValueFrom(
      this.healthInstituteGrpcService.appointDoctor(appointDoctorData),
    );
  }

  /**
   * @description Get Appointed Doctors List
   * @param request
   * @returns GetAppointedDoctorsRes
   */
  async getAppointedDoctorsList(
    request: GetAppointedDoctorsListDto,
    healthInstitutePrimaryKey: number,
  ): Promise<GetAppointedDoctorsList> {
    const reqData: GetAppointedDoctorsReq = {
      ...request,
      healthInstitutePrimaryKey,
    };

    // Get appointment/mapping details from Health Institute Service
    const healthInstituteResponse: GetAppointedDoctorsRes =
      await firstValueFrom(
        this.healthInstituteGrpcService.getAppointedDoctors(reqData),
      );

    // Extract doctor primary keys
    const doctorPrimaryKeys = healthInstituteResponse.doctors.map(
      (doctor) => doctor.doctorPrimaryKey,
    );

    // Fetch doctor details from Doctor DB
    const doctorResponse: GetAppointedDoctorDetailsRes = await firstValueFrom(
      this.doctorGrpcService.getAppointedDoctorDetails({
        doctorPrimaryKeys,
      }),
    );

    const doctorMap = new Map(
      doctorResponse.doctors.map((doctor) => [doctor.doctorPrimaryKey, doctor]),
    );

    const doctors: GetAppointedDoctorsData[] = [];

    for (const mapping of healthInstituteResponse.doctors) {
      const doctor = doctorMap.get(mapping.doctorPrimaryKey);

      if (!doctor) {
        continue;
      }

      doctors.push({
        ...mapping,
        firstName: doctor.firstName,
        middleName: doctor.middleName,
        lastName: doctor.lastName,
        medicalRegistration: doctor.medicalRegistration,
        licenseStatus: doctor.licenseStatus,
      } satisfies GetAppointedDoctorsData);
    }

    return {
      doctors,
      total: healthInstituteResponse.total,
      offset: healthInstituteResponse.offset,
      limit: healthInstituteResponse.limit,
    };
  }
}
