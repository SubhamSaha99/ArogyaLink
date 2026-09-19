import { Injectable, Logger } from '@nestjs/common';
import { DoctorProfileReq, DoctorProfileRes } from '../proto/generated/doctor';
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

@Injectable()
export class DoctorService {
  private readonly logger = new Logger(DoctorService.name);
  constructor(
    private readonly doctorRepository: DoctorRepository,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

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
   * @description Get unappointed doctors list
   * @param request
   * @returns GetDoctorListRes
   */
  //   async getUnAppointedDoctorsList(
  //     request: GetUnAppointedDoctorsListReq,
  //   ): Promise<GetDoctorListRes> {
  //     const doctorPrimaryKeys = Array.isArray(request.doctorPrimaryKeys)
  //       ? request.doctorPrimaryKeys
  //       : [];

  //     const result = await this.dataSource.query<GetDoctorListResponse[]>(
  //       `SELECT * FROM get_unappointed_doctors_list($1, $2, $3, $4, $5, $6::INTEGER[])`,
  //       [
  //         request.offset,
  //         request.limit,
  //         request.search,
  //         request.stateId,
  //         request.councilId,
  //         doctorPrimaryKeys,
  //       ],
  //     );

  //     const procedureResult = result?.[0];

  //     if (!procedureResult) {
  //       throwRpcException(status.INTERNAL, 'Database Error!');
  //     }

  //     return {
  //       doctors: Array.isArray(procedureResult.doctors)
  //         ? procedureResult.doctors
  //         : [],
  //       total: Number(procedureResult.total ?? 0),
  //       offset: Number(procedureResult.resultOffset ?? request.offset ?? 0),
  //       limit: Number(procedureResult.resultLimit ?? request.limit ?? 0),
  //     };
  //   }

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

  /**
   * @description Get Appointed Doctor Details.
   * @param request
   * @returns GetAppointedDoctorDetailsRes
   */
  //   async getAppointedDoctorDetails(
  //     request: GetAppointedDoctorDetailsReq,
  //   ): Promise<GetAppointedDoctorDetailsRes> {
  //     const result = await this.dataSource.query<
  //       GetAppointedDoctorDetailsResponse[]
  //     >(`SELECT * FROM get_appointed_doctors_by_primary_key($1:: INTEGER[])`, [
  //       request.doctorPrimaryKeys,
  //     ]);

  //     const procedureResult = result?.[0];

  //     if (!procedureResult) {
  //       throwRpcException(status.INTERNAL, 'Database Error!');
  //     }

  //     return {
  //       doctors: Array.isArray(procedureResult.doctors)
  //         ? procedureResult.doctors
  //         : [],
  //     };
  //   }
}
