import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  DoctorProfileReq,
  DoctorProfileRes,
  GetAppointedDoctorDetailsReq,
  GetAppointedDoctorDetailsRes,
  GetDoctorListRes,
  GetUnAppointedDoctorsListReq,
} from '../proto/generated/doctor';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import {
  DoctorQualifications,
  UpdateDoctorResponse,
  GetDoctorDetailsResponse,
  GetDoctorMasterDataResponse,
  GetDoctorListResponse,
} from '../common/interfaces/doctor.interface';
import { RedisCacheService } from '../redis/redis-cache.service';
import { DoctorRepository } from './doctor.repository';
import {
  DoctorBasicDetailsDto,
  DoctorProfessionalDetailsDto,
  DoctorQualificationsDto,
  GetDoctorListDto,
} from './doctor.dto';
import { deleteFile, moveFile } from '../common/utils/file-util';
import {
  GetAssociatedHealthInstitutesReq,
  GetAssociatedHealthInstitutesRes,
  HEALTH_INSTITUTE_SERVICE_NAME,
  HealthInstituteServiceClient,
} from '../proto/generated/health-intitute';
import type { ClientGrpc } from '@nestjs/microservices';
import { GrpcServiceName } from '../common/utils/constants';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DoctorService implements OnModuleInit {
  private readonly logger = new Logger(DoctorService.name);
  private healthInstituteGrpcService!: HealthInstituteServiceClient;

  constructor(
    private readonly doctorRepository: DoctorRepository,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly redisCacheService: RedisCacheService,
    @Inject(GrpcServiceName.HEALTH_INSTITUTE)
    private readonly healthInstituteClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.healthInstituteGrpcService =
      this.healthInstituteClient.getService<HealthInstituteServiceClient>(
        HEALTH_INSTITUTE_SERVICE_NAME,
      );
  }

  /**
   * @description create doctor profile service
   * @param request
   * @returns DoctorProfileRes
   */
  async createDoctorProfile(
    request: DoctorProfileReq,
  ): Promise<DoctorProfileRes> {
    const result = await this.doctorRepository.createDoctorProfile(request);

    return {
      doctorId: result,
    };
  }

  /**
   * @description get appointed doctor details service
   * @param request
   * @returns GetAppointedDoctorDetailsRes
   */
  async getAppointedDoctorDetails(
    request: GetAppointedDoctorDetailsReq,
  ): Promise<GetAppointedDoctorDetailsRes> {
    try {
      const result =
        await this.doctorRepository.getAppointedDoctorDetails(request);

      return {
        doctors: Array.isArray(result.doctors) ? result.doctors : [],
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description update doctor basic details service
   * @param request
   * @param doctorId
   * @param profileImage
   * @returns UpdateDoctorResponse
   */
  async updateDoctorProfileDetails(
    request: DoctorBasicDetailsDto,
    doctorId: string,
    profileImage?: Express.Multer.File,
  ): Promise<UpdateDoctorResponse> {
    let uploadedImagePath: string | null = null;

    try {
      // TODO: Upload File
      if (profileImage) {
        uploadedImagePath = await moveFile(
          profileImage.path,
          `${doctorId}/doctor-profile`,
        );
      }
      // TODO: Update details
      const result = await this.doctorRepository.updateDoctorProfileDetails(
        request,
        uploadedImagePath,
      );
      //   TODO: Delete previous redis key-value.
      await this.redisService.delete(`doctor:profile:${doctorId}`);

      return {
        doctorId: result,
      };
    } catch (error) {
      if (uploadedImagePath) {
        await deleteFile(uploadedImagePath);
      }
      throw error;
    }
  }

  /**
   * @description update doctor professional details service
   * @param request
   * @param doctorPrimaryKey
   * @param doctorId
   * @returns UpdateDoctorResponse
   */
  async updateDoctorProfessionalDetails(
    request: DoctorProfessionalDetailsDto,
    doctorPrimaryKey: number,
    doctorId: string,
  ): Promise<UpdateDoctorResponse> {
    try {
      const result =
        await this.doctorRepository.updateDoctorProfessionalDetails(
          request,
          doctorPrimaryKey,
          doctorId,
        );
      await this.redisService.delete(`doctor:profile:${doctorId}`);

      return {
        doctorId: result,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description update doctor qualifications
   * @param request
   * @param doctorPrimaryKey
   * @param doctorId
   * @returns UpdateDoctorResponse
   */
  async updateDoctorQualifications(
    request: DoctorQualificationsDto,
    doctorPrimaryKey: number,
    doctorId: string,
  ): Promise<UpdateDoctorResponse> {
    try {
      const qualifications: DoctorQualifications[] = request.qualifications.map(
        (qualification) => ({
          doctorQualificationId: qualification.doctorQualificationId ?? null,
          qualificationId: qualification.qualificationId,
          specializationId: qualification.specializationId ?? null,
          institutionName: qualification.institutionName ?? null,
          universityName: qualification.universityName,
          yearOfCompletion: qualification.yearOfCompletion,
        }),
      );

      const result = await this.doctorRepository.updateDoctorQualifications(
        qualifications,
        doctorPrimaryKey,
        doctorId,
      );

      await this.redisService.delete(`doctor:profile:${doctorId}`);

      return {
        doctorId: result,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * * Get Doctor Details
   * @param user
   * @returns GetDoctorDetailsRes
   */
  async getDoctorDetails(
    doctorPrimaryKey: number,
    doctorId: string,
  ): Promise<GetDoctorDetailsResponse> {
    const cacheKey = `doctor:profile:${doctorId}`;

    try {
      return await this.redisCacheService.getOrSet(
        cacheKey,

        async () => {
          const result =
            await this.doctorRepository.getDoctorDetails(doctorPrimaryKey);

          const {
            doctorPrimaryKey: resultDoctorPrimaryKey,
            doctorId: resultDoctorId,
            profileDetails,
            professionalDetails,
            qualificationDetails = [],
          } = result;

          const profileImage = profileDetails.profileImage
            ? `${this.configService.get<string>('API_BASE_URL') ?? 'http://localhost:8080'}/uploads/${profileDetails.profileImage}`
            : '';

          const response: GetDoctorDetailsResponse = {
            doctorPrimaryKey: resultDoctorPrimaryKey,
            doctorId: resultDoctorId,
            profileDetails: {
              ...profileDetails,
              profileImage,
            },
            professionalDetails,
            qualificationDetails,
          };

          return response;
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
          `Redis operation failed for doctor ${doctorId}`,
          error.message,
        );
      }

      throw error;
    }
  }

  /**
   * @description get doctor master data
   * @returns GetDoctorMasterDataResponse
   */
  async getDoctorMasterData(): Promise<GetDoctorMasterDataResponse> {
    const cacheKey = 'doctor:master-data';
    try {
      return await this.redisCacheService.getOrSet(
        cacheKey,

        async () => {
          return await this.doctorRepository.getDoctorMasterData();
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
          'Redis operation failed for doctor master data',
          error.message,
        );
      }

      throw error;
    }
  }

  /**
   * @description get associated health institutes service
   * @param doctorPrimaryKey
   * @param doctorId
   * @returns GetAssociatedHealthInstitutesRes
   */
  async getAssociatedHealthInstitutes(
    doctorPrimaryKey: number,
    doctorId: string,
  ): Promise<GetAssociatedHealthInstitutesRes> {
    const associatedHealthInstitutesRequest: GetAssociatedHealthInstitutesReq =
      {
        doctorPrimaryKey,
        doctorId,
      };
    return await firstValueFrom(
      this.healthInstituteGrpcService.getAssociatedHealthInstitutes(
        associatedHealthInstitutesRequest,
      ),
    );
  }

  /**
   * @description get un appointed doctors list grpc service
   * @param request
   * @returns GetDoctorListRes
   */
  async getUnAppointedDoctorsList(
    request: GetUnAppointedDoctorsListReq,
  ): Promise<GetDoctorListRes> {
    const doctorPrimaryKeys = Array.isArray(request.doctorPrimaryKeys)
      ? request.doctorPrimaryKeys
      : [];

    const result = await this.doctorRepository.getUnAppointedDoctorsList(
      request,
      doctorPrimaryKeys,
    );

    return {
      doctors: Array.isArray(result.doctors)
        ? result.doctors
        : [],
      total: Number(result.total ?? 0),
      offset: Number(result.offset ?? request.offset ?? 0),
      limit: Number(result.limit ?? request.limit ?? 0),
    };
  }

  /**
   * @description get doctor list service
   * @param request
   * @returns GetDoctorListResponse
   */
  async getDoctorList(
    request: GetDoctorListDto,
  ): Promise<GetDoctorListResponse> {
    try {
      const result = await this.doctorRepository.getDoctorList(request);

      return {
        doctors: Array.isArray(result.doctors) ? result.doctors : [],
        total: Number(result.total ?? 0),
        offset: Number(result.offset ?? request.offset ?? 0),
        limit: Number(result.limit ?? request.limit ?? 0),
      };
    } catch (error) {
      throw error;
    }
  }
}
