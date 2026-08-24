import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  DoctorProfileReq,
  DoctorProfileRes,
  GetDoctorDetailsReq,
  GetDoctorDetailsRes,
  GetDoctorListReq,
  GetDoctorListRes,
  GetDoctorMasterDataRes,
  UpdateDoctorBasicDeatilsReq,
  UpdateDoctorBasicDeatilsRes,
  UpdateDoctorProfessionalDetailsReq,
  UpdateDoctorProfessionalDetailsRes,
  UpdateDoctorQualificationsReq,
  UpdateDoctorQualificationsRes,
} from '../proto/generated/doctor';
import { throwRpcException } from '../common/utils/rpc-exception';
import { status } from '@grpc/grpc-js';
import { Errors } from '../common/utils/constants';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import {
  DoctorQualifications,
  UpdateDoctorResponse,
  GetDoctorDetailsResponse,
  GetDoctorMasterDataResponse,
  GetDoctorListResponse,
} from '../common/interfaces/doctor.interface';

@Injectable()
export class DoctorService {
  private readonly logger = new Logger(DoctorService.name);
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * * Create Doctor Profile
   * @param request
   * @returns DoctorProfileRes
   */
  async createDoctorProfile(
    request: DoctorProfileReq,
  ): Promise<DoctorProfileRes> {
    const result = await this.dataSource.query<UpdateDoctorResponse[]>(
      `SELECT create_doctor_profile($1, $2, $3, $4, $5, $6) AS f_result`,
      [
        request.doctorId,
        request.email,
        request.mobile,
        request.firstName,
        request.middleName,
        request.lastName,
      ],
    );

    const procedureResult: string = result[0]?.f_result;

    if (!procedureResult) {
      throwRpcException(status.INTERNAL, 'Invalid response from procedure');
    }

    if (procedureResult === Errors.dbError) {
      throwRpcException(status.INTERNAL, 'Database error');
    }

    if (
      typeof procedureResult === 'string' &&
      !/^DOC\d{6}$/.test(procedureResult)
    ) {
      throwRpcException(status.INTERNAL, 'Invalid response from procedure');
    }

    return {
      doctorId: procedureResult,
    };
  }

  /**
   * * Update Doctor Basic Details.
   * @param request
   * @returns UpdateDoctorBasicDeatilsRes
   */
  async updateDoctorBasicDetails(
    request: UpdateDoctorBasicDeatilsReq,
  ): Promise<UpdateDoctorBasicDeatilsRes> {
    const result = await this.dataSource.query<UpdateDoctorResponse[]>(
      `SELECT update_doctor_basic_details($1, $2, $3, $4, $5, $6) AS f_result`,
      [
        request.doctorId,
        request.firstName,
        request.middleName,
        request.lastName,
        request.gender,
        request.profileImage,
      ],
    );

    const procedureResult: string = result?.[0]?.f_result;
    if (procedureResult === Errors.invalidIdError) {
      throwRpcException(status.INVALID_ARGUMENT, 'Invalid Doctor ID');
    }
    if (procedureResult === Errors.dbError) {
      throwRpcException(status.INTERNAL, 'Database error');
    }
    if (
      typeof procedureResult === 'string' &&
      !/^DOC\d{6}$/.test(procedureResult)
    ) {
      throwRpcException(status.INTERNAL, 'Invalid response from procedure');
    }

    await this.redisService.delete(`doctor:profile:${request.doctorId}`);

    return {
      doctorId: procedureResult,
    };
  }

  /**
   * * Update Doctor Professional Details.
   * @param request
   * @returns UpdateDoctorProfessionalDetailsRes
   */
  async updateDoctorProfessionalDetails(
    request: UpdateDoctorProfessionalDetailsReq,
  ): Promise<UpdateDoctorProfessionalDetailsRes> {
    const result = await this.dataSource.query<UpdateDoctorResponse[]>(
      `SELECT update_doctor_professional_details($1, $2, $3, $4, $5, $6) AS f_result`,
      [
        request.doctorId,
        request.medicalRegistration,
        request.registrationCouncil,
        request.registrationState,
        request.registrationYear,
        request.licenseStatus,
      ],
    );

    const procedureResult: string = result?.[0]?.f_result;
    if (procedureResult === Errors.invalidIdError) {
      throwRpcException(status.INVALID_ARGUMENT, 'Invalid Doctor ID');
    }
    if (procedureResult === Errors.dbError) {
      throwRpcException(status.INTERNAL, 'Database error');
    }
    if (
      typeof procedureResult === 'string' &&
      !/^DOC\d{6}$/.test(procedureResult)
    ) {
      throwRpcException(status.INTERNAL, 'Invalid response from procedure');
    }

    await this.redisService.delete(`doctor:profile:${request.doctorId}`);

    return {
      doctorId: procedureResult,
    };
  }

  /**
   * * Update Doctor Qualifications
   * @param request
   * @returns UpdateDoctorQualificationsRes
   */
  async updateDoctorQualifications(
    request: UpdateDoctorQualificationsReq,
  ): Promise<UpdateDoctorQualificationsRes> {
    const qualifications: DoctorQualifications[] = request.qualifications.map(
      (qualification) => ({
        qualification_id: qualification.qualificationId,
        specialization_id: qualification.specializationId ?? null,
        institution_name: qualification.institutionName ?? null,
        university_name: qualification.universityName,
        year_of_completion: qualification.yearOfCompletion,
      }),
    );

    const result = await this.dataSource.query<UpdateDoctorResponse[]>(
      `SELECT update_doctor_qualifications($1, $2) AS f_result`,
      [request.doctorId, JSON.stringify(qualifications)],
    );

    const procedureResult: string = result?.[0]?.f_result;

    if (procedureResult === Errors.invalidIdError) {
      throwRpcException(status.NOT_FOUND, 'Doctor not found');
    }

    if (procedureResult === Errors.dbError) {
      throwRpcException(status.INTERNAL, 'Database error');
    }

    if (
      typeof procedureResult === 'string' &&
      !/^DOC\d{6}$/.test(procedureResult)
    ) {
      throwRpcException(status.INTERNAL, 'Invalid response from procedure');
    }

    await this.redisService.delete(`doctor:profile:${request.doctorId}`);

    return {
      doctorId: procedureResult,
    };
  }

  /**
   * * Get Doctor Details
   * @param user
   * @returns GetDoctorDetailsRes
   */
  async getDoctorDetails(
    request: GetDoctorDetailsReq,
  ): Promise<GetDoctorDetailsRes> {
    const cacheKey = `doctor:profile:${request.doctorId}`;

    try {
      const cachedDoctor = await this.redisService.get(cacheKey);

      if (cachedDoctor) {
        return JSON.parse(cachedDoctor) as GetDoctorDetailsRes;
      }

      const result = await this.dataSource.query<GetDoctorDetailsResponse[]>(
        `SELECT * FROM get_doctor_details($1)`,
        [request.doctorId],
      );

      const procedureResult = result?.[0];
      if (!procedureResult) {
        throwRpcException(status.INTERNAL, 'Invalid response from database');
      }

      switch (procedureResult.status) {
        case Errors.invalidIdError:
          throwRpcException(status.NOT_FOUND, 'Doctor not found');
          break;

        case Errors.dbError:
          throwRpcException(status.INTERNAL, 'Database error');
          break;
      }

      const {
        doctorId,
        profileDetails,
        professionalDetails,
        qualificationDetails = [],
      } = procedureResult;

      const profileImage = profileDetails.profileImage
        ? `${this.configService.get<string>(
            'API_BASE_URL',
          )}/uploads/${profileDetails.profileImage}`
        : '';

      const response: GetDoctorDetailsRes = {
        doctorId,
        profileDetails: {
          ...profileDetails,
          profileImage,
        },
        professionalDetails,
        qualificationDetails,
        // qualificationDetails: qualificationDetails.map((qualification) => ({
        //   ...qualification,
        //   specializationId: qualification.specializationId ?? undefined,
        //   specializationName: qualification.specializationName ?? undefined,
        // })),
      };

      await this.redisService.set(cacheKey, JSON.stringify(response), 300);

      return response;
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
   * * Get Doctor Master Data
   * @returns GetDoctorMasterDataRes
   */
  async getDoctorMasterData(): Promise<GetDoctorMasterDataRes> {
    try {
      const cacheKey = 'doctor:master-data';
      const cachedData = await this.redisService.get(cacheKey);

      if (cachedData) {
        return JSON.parse(cachedData) as GetDoctorMasterDataRes;
      }

      const result = await this.dataSource.query<GetDoctorMasterDataResponse[]>(
        `SELECT * FROM get_doctor_master_data()`,
      );

      const masterDataResult = result?.[0];

      if (!masterDataResult) {
        throwRpcException(status.INTERNAL, 'Invalid response from database');
      }

      if (masterDataResult.status === Errors.dbError) {
        throwRpcException(status.INTERNAL, 'Database error');
      }

      const response: GetDoctorMasterDataRes = {
        registrationCouncils: masterDataResult.registrationCouncils ?? [],
        states: masterDataResult.states ?? [],
        qualifications: masterDataResult.qualifications ?? [],
        specializations: masterDataResult.specializations ?? [],
      };
      await this.redisService.set(cacheKey, JSON.stringify(response), 3600);
      return response;
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

  async getDoctorList(request: GetDoctorListReq): Promise<GetDoctorListRes> {
    const result = await this.dataSource.query<GetDoctorListResponse[]>(
      `SELECT * FROM get_doctor_list($1, $2, $3, $4, $5)`,
      [
        request.offset,
        request.limit,
        request.search,
        request.stateId,
        request.councilId,
      ],
    );

    const procedureResult = result?.[0];

    if (!procedureResult) {
      throwRpcException(status.INTERNAL, 'Database Error!');
    }
    
    return {
      doctors: procedureResult.doctors,
      total: procedureResult.total,
      offset: procedureResult.resultOffset,
      limit: procedureResult.resultLimit,
    };
  }
}
