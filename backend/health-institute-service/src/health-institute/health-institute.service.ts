import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  GetAssociatedHealthInstitutesReq,
  GetAssociatedHealthInstitutesRes,
  HealthInstituteProfileReq,
  HealthInstituteProfileRes,
} from '../proto/generated/health-institute';
import {
  AppointDoctorResponse,
  GetAppointedDoctorsData,
  GetAppointedDoctorsList,
  GetAssociatedDoctorsIdDatabaseResponse,
  GetDoctorMasterDataResponse,
  GetHealthInstituteDetailsResponse,
  MasterDataItemResposne,
  UpdateHealthInstituteResponse,
} from '../common/interfaces/health-institute.interface';
import { RedisService } from '../redis/redis.service';
import { RedisCacheService } from '../redis/redis-cache.service';
import { HealthInstituteRepository } from './health-institute.repository';
import {
  AppointDoctorDto,
  GetAppointedDoctorsListDto,
  GetUnAppointedDoctorsListDto,
  UpdateHealthInstituteProfileDto,
} from './health-institute.dto';
import {
  DOCTOR_SERVICE_NAME,
  DoctorServiceClient,
  GetAppointedDoctorDetailsReq,
  GetAppointedDoctorDetailsRes,
  GetDoctorListRes,
  GetUnAppointedDoctorsListReq,
} from '../proto/generated/doctor';
import { GrpcServiceName } from '../common/utils/constants';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HealthInstituteService implements OnModuleInit {
  private readonly logger = new Logger(HealthInstituteService.name);
  private doctorGrpcService!: DoctorServiceClient;

  constructor(
    private readonly healthInstituteRepository: HealthInstituteRepository,
    private readonly redisService: RedisService,
    private readonly redisCacheService: RedisCacheService,
    @Inject(GrpcServiceName.DOCTOR)
    private readonly doctorClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.doctorGrpcService =
      this.doctorClient.getService<DoctorServiceClient>(DOCTOR_SERVICE_NAME);
  }

  /**
   * @description Create health institute profile grpc service
   * @param request
   * @returns HealthInstituteProfileRes
   */
  async createHealthInstituteProfile(
    request: HealthInstituteProfileReq,
  ): Promise<HealthInstituteProfileRes> {
    try {
      const result =
        await this.healthInstituteRepository.createHealthInstituteProfile(
          request,
        );

      return {
        healthInstituteId: result,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description get associated health institutes grpc service.
   * @param request
   * @returns GetAssociatedHealthInstitutesRes
   */
  async getAssociatedHealthInstitutes(
    request: GetAssociatedHealthInstitutesReq,
  ): Promise<GetAssociatedHealthInstitutesRes> {
    const cacheKey = `associated-health-institute:${request.doctorId}`;
    try {
      return await this.redisCacheService.getOrSet(
        cacheKey,
        async () => {
          const result =
            await this.healthInstituteRepository.getAssociatedHealthInstitutes(
              request,
            );

          return {
            healthInstitutes: Array.isArray(result.healthInstitutes)
              ? result.healthInstitutes
              : [],
          };
        },
        {
          ttl: 300,
          lockTtl: 10,
          retries: 5,
          retryDelay: 50,
          jitter: Math.floor(Math.random() * 300),
        },
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes('redis')
      ) {
        this.logger.warn(
          `Redis operation failed for doctor ${request.doctorId}`,
          error.message,
        );
      }

      throw error;
    }
  }

  /**
   * @description update health institute profile service
   * @param request
   * @returns UpdateHealthInstituteResponse
   */
  async updateHealthInstituteProfile(
    request: UpdateHealthInstituteProfileDto,
    healthInstituteId: string,
  ): Promise<UpdateHealthInstituteResponse> {
    try {
      const result =
        await this.healthInstituteRepository.updateHealthInstituteProfile(
          request,
        );

      await this.redisService.delete(
        `healthInstitute:profile:${healthInstituteId}`,
      );

      return {
        healthInstituteId: result,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description get health institute details service
   * @param request
   * @returns GetHealthInstituteDetailsResponse
   */
  async getHealthInstituteDetails(
    healthInstitutePrimaryKey: number,
    healthInstituteId: string,
  ): Promise<GetHealthInstituteDetailsResponse> {
    const cacheKey = `healthInstitute:profile:${healthInstituteId}`;

    try {
      return await this.redisCacheService.getOrSet(
        cacheKey,

        async () => {
          const result =
            await this.healthInstituteRepository.getHealthInstituteDetails(
              healthInstitutePrimaryKey,
            );

          return {
            healthInstitutePrimaryKey: result.healthInstitutePrimaryKey,
            healthInstituteId: result.healthInstituteId,
            profileDetails: result.profileDetails,
          };
        },

        {
          ttl: 300,
          lockTtl: 10,
          retries: 5,
          retryDelay: 50,
          jitter: Math.floor(Math.random() * 300),
        },
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes('redis')
      ) {
        this.logger.warn(
          `Redis operation failed for health institute ${healthInstituteId}`,
          error.message,
        );
      }

      throw error;
    }
  }

  /**
   * @description get states service
   * @returns MasterDataItemResposne[]
   */
  async getStates(): Promise<MasterDataItemResposne[]> {
    const cacheKey = `states-health-institute-service`;

    try {
      return await this.redisCacheService.getOrSet(
        cacheKey,

        async () => {
          return await this.healthInstituteRepository.getStates();
        },

        {
          ttl: 300,
          lockTtl: 10,
          retries: 5,
          retryDelay: 50,
          jitter: Math.floor(Math.random() * 300),
        },
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes('redis')
      ) {
        this.logger.warn(`Redis operation failed for states`, error.message);
      }

      throw error;
    }
  }

  /**
   * @description get districts service
   * @param id
   * @returns MasterDataItemResposne[]
   */
  async getDistricts(id: number): Promise<MasterDataItemResposne[]> {
    const cacheKey = `districts-health-institute-service:${id}`;

    try {
      return await this.redisCacheService.getOrSet(
        cacheKey,

        async () => {
          return await this.healthInstituteRepository.getDistricts(id);
        },

        {
          ttl: 300,
          lockTtl: 10,
          retries: 5,
          retryDelay: 50,
          jitter: Math.floor(Math.random() * 300),
        },
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes('redis')
      ) {
        this.logger.warn(`Redis operation failed for districts`, error.message);
      }

      throw error;
    }
  }

  /**
   * @description get registration councils service
   * @returns MasterDataItemResposne[]
   */
  async getRegistrationCouncils(): Promise<MasterDataItemResposne[]> {
    const cacheKey = `registrationCouncils`;

    try {
      return await this.redisCacheService.getOrSet(
        cacheKey,

        async () => {
          return this.healthInstituteRepository.getRegistrationCouncils();
        },

        {
          ttl: 300,
          lockTtl: 10,
          retries: 5,
          retryDelay: 50,
          jitter: Math.floor(Math.random() * 300),
        },
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes('redis')
      ) {
        this.logger.warn(
          `Redis operation failed for registration councils`,
          error.message,
        );
      }

      throw error;
    }
  }

  /**
   * @description get appoint doctor master data service
   * @returns GetDoctorMasterDataResponse
   */
  async getAppointDoctorMasterData(): Promise<GetDoctorMasterDataResponse> {
    const cacheKey = 'apoint-doctor:master-data';
    try {
      return await this.redisCacheService.getOrSet(
        cacheKey,

        async () => {
          const result =
            await this.healthInstituteRepository.getAppointDoctorMasterData();

          return {
            departments: result.departments,
            designations: result.designations,
            consultationScopes: result.consultationScopes,
          };
        },

        {
          ttl: 300,
          lockTtl: 10,
          retries: 5,
          retryDelay: 50,
          jitter: Math.floor(Math.random() * 300),
        },
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes('redis')
      ) {
        this.logger.warn(
          'Redis operation failed for appoint doctor master data',
          error.message,
        );
      }

      throw error;
    }
  }

  /**
   * @description appoint doctor service
   * @param request
   * @param healthInstitutePrimaryKey
   * @param healthInstituteId
   * @returns AppointDoctorResponse
   */
  async appointDoctor(
    request: AppointDoctorDto,
    healthInstitutePrimaryKey: number,
    healthInstituteId: string,
  ): Promise<AppointDoctorResponse> {
    try {
      const result = await this.healthInstituteRepository.appointDoctor(
        request,
        healthInstitutePrimaryKey,
        healthInstituteId,
      );
      return {
        mappingId: Number(result),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description get appointed doctors list service
   * @param request
   * @param healthInstitutePrimaryKey
   * @returns GetAppointedDoctorsList
   */
  async getAppointedDoctorsList(
    request: GetAppointedDoctorsListDto,
    healthInstitutePrimaryKey: number,
  ): Promise<GetAppointedDoctorsList> {
    try {
      const healthInstituteResponse =
        await this.healthInstituteRepository.getAppointedDoctorsList(
          request,
          healthInstitutePrimaryKey,
        );

      // TODO: Extract doctor primary keys
      const doctorPrimaryKeys: GetAppointedDoctorDetailsReq = {
        doctorPrimaryKeys: healthInstituteResponse.doctors.map(
          (doctor) => doctor.doctorPrimaryKey,
        ),
      };

      // TODO: Fetch doctor details from Doctor DB
      const doctorResponse: GetAppointedDoctorDetailsRes = await firstValueFrom(
        this.doctorGrpcService.getAppointedDoctorDetails(doctorPrimaryKeys),
      );

      const doctorMap = new Map(
        doctorResponse.doctors.map((doctor) => [
          doctor.doctorPrimaryKey,
          doctor,
        ]),
      );

      const doctors: GetAppointedDoctorsData[] = [];

      if (healthInstituteResponse.doctors.length > 0) {
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
      }

      return {
        doctors: Array.isArray(doctors) ? doctors : [],
        total: Number(healthInstituteResponse.total ?? 0),
        offset: Number(healthInstituteResponse.offset ?? request.offset),
        limit: Number(healthInstituteResponse.limit ?? request.limit),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description get unappointed doctor list service
   * @param request
   * @param healthInstitutePrimaryKey
   * @returns
   */
  async getUnAppointedDoctorsList(
    request: GetUnAppointedDoctorsListDto,
    healthInstitutePrimaryKey: number,
  ): Promise<GetDoctorListRes> {
    try {
      const appointedDoctorsPrimaryKey: GetAssociatedDoctorsIdDatabaseResponse =
        await this.healthInstituteRepository.getAssociatedDoctorsId(
          healthInstitutePrimaryKey,
        );
      const doctorPrimaryKeys =
        appointedDoctorsPrimaryKey?.doctorPrimaryKeys ?? [];

      const filterParameter: GetUnAppointedDoctorsListReq = {
        ...request,
        doctorPrimaryKeys,
      };

      return firstValueFrom(
        this.doctorGrpcService.getUnAppointedDoctorsList(filterParameter),
      );
    } catch (error) {
      throw error;
    }
  }
}
