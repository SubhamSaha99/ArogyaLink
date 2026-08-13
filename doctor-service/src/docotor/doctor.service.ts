import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  DoctorProfileReq,
  DoctorProfileRes,
  GetDoctorDetailsReq,
  GetDoctorDetailsRes,
  GetDoctorMasterDataRes,
  UpdateDoctorBasicDeatilsReq,
  UpdateDoctorBasicDeatilsRes,
  UpdateDoctorProfessionalDetailsReq,
  UpdateDoctorProfessionalDetailsRes,
  UpdateDoctorQualificationsReq,
  UpdateDoctorQualificationsRes,
} from '../proto/generated/doctor';
import { throwRpcException } from '../util/rpcException';
import { status } from '@grpc/grpc-js';
import { Errors } from '../util/constants';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

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
    const result = await this.dataSource.query(
      `CALL create_doctor_profile($1, $2, $3, $4, $5, $6, $7)`,
      [
        request.doctorId,
        request.email,
        request.mobile,
        request.firstName,
        request.middleName,
        request.lastName,
        null,
      ],
    );

    const procedureResult = result?.[0]?.p_result;
    if (procedureResult === Errors.dbError) {
      throwRpcException(status.INTERNAL, 'Database error');
    }
    if (!/^DOC\d{6}$/.test(procedureResult)) {
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
    const result = await this.dataSource.query(
      `CALL update_doctor_basic_details($1, $2, $3, $4, $5, $6, $7)`,
      [
        request.doctorId,
        request.firstName,
        request.middleName,
        request.lastName,
        request.gender,
        request.profileImage,
        null,
      ],
    );

    const procedureResult = result?.[0]?.p_result;
    if (procedureResult === Errors.invalidIdError) {
      throwRpcException(status.INVALID_ARGUMENT, 'Invalid Doctor ID');
    }
    if (procedureResult === Errors.dbError) {
      throwRpcException(status.INTERNAL, 'Database error');
    }
    if (!/^DOC\d{6}$/.test(procedureResult)) {
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
    const result = await this.dataSource.query(
      `CALL update_doctor_professional_details($1, $2, $3, $4, $5, $6, $7)`,
      [
        request.doctorId,
        request.medicalRegistration,
        request.registrationCouncil,
        request.registrationState,
        request.registrationYear,
        request.licenseStatus,
        null,
      ],
    );

    const procedureResult = result?.[0]?.p_result;
    if (procedureResult === Errors.invalidIdError) {
      throwRpcException(status.INVALID_ARGUMENT, 'Invalid Doctor ID');
    }
    if (procedureResult === Errors.dbError) {
      throwRpcException(status.INTERNAL, 'Database error');
    }
    if (!/^DOC\d{6}$/.test(procedureResult)) {
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
    try {
      const qualifications = request.qualifications.map((qualification) => ({
        qualification_id: qualification.qualificationId,
        specialization_id: qualification.specializationId || null,
        institution_name: qualification.institutionName || null,
        university_name: qualification.universityName || null,
        year_of_completion: qualification.yearOfCompletion || null,
      }));

      const result = await this.dataSource.query(
        `CALL update_doctor_qualifications($1, $2, $3)`,
        [request.doctorId, JSON.stringify(qualifications), null],
      );

      const procedureResult = result?.[0]?.p_result;

      if (procedureResult === Errors.invalidIdError) {
        throwRpcException(status.NOT_FOUND, 'Doctor not found');
      }

      if (procedureResult === Errors.dbError) {
        throwRpcException(status.INTERNAL, 'Database error');
      }

      if (!/^DOC\d{6}$/.test(procedureResult)) {
        throwRpcException(status.INTERNAL, 'Invalid response from procedure');
      }

      await this.redisService.delete(`doctor:profile:${request.doctorId}`);

      return {
        doctorId: procedureResult,
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
    request: GetDoctorDetailsReq,
  ): Promise<GetDoctorDetailsRes> {
    // TODO: Checking Cache
    const cacheKey = `doctor:profile:${request.doctorId}`;

    try {
      const cachedDoctor = await this.redisService.get(cacheKey);

      if (cachedDoctor) {
        return JSON.parse(cachedDoctor) as GetDoctorDetailsRes;
      }
    } catch (error) {
      this.logger.warn(
        `Redis cache read failed for doctor ${request.doctorId}`,
        error instanceof Error ? error.message : String(error),
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(`CALL get_doctor_details($1, 'doctor_cursor')`, [
        request.doctorId,
      ]);

      const [procedureResult] = await queryRunner.query(
        `FETCH ALL FROM doctor_cursor`,
      );

      await queryRunner.query(`CLOSE doctor_cursor`);

      if (!procedureResult) {
        throwRpcException(status.INTERNAL, 'Invalid response from procedure');
      }

      switch (procedureResult.status) {
        case Errors.invalidIdError:
          throwRpcException(status.NOT_FOUND, 'Doctor not found');

        case Errors.dbError:
          throwRpcException(status.INTERNAL, 'Database error');
      }

      const {
        doctor_id,
        profile_details,
        professional_details,
        qualification_details = [],
      } = procedureResult;

      const profileImage = profile_details.profileImage
        ? `${this.configService.get<string>(
            'API_BASE_URL',
          )}/uploads/${profile_details.profileImage}`
        : undefined;

      const response: GetDoctorDetailsRes = {
        doctorId: doctor_id,

        profileDetails: {
          ...profile_details,
          profileImage,
        },

        professionalDetails: professional_details,

        qualificationDetails: qualification_details,
      };

      await queryRunner.commitTransaction();

      try {
        await this.redisService.set(cacheKey, JSON.stringify(response), 300);
      } catch (error) {
        this.logger.warn(
          `Redis cache write failed for doctor ${request.doctorId}`,
          error instanceof Error ? error.message : String(error),
        );
      }

      return response;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * * Get Doctor Master Data
   * @returns GetDoctorMasterDataRes
   */
  async getDoctorMasterData(): Promise<GetDoctorMasterDataRes> {
    const cacheKey = 'doctor:master-data';

    // 1. Check Redis
    try {
      const cachedData = await this.redisService.get(cacheKey);

      if (cachedData) {
        return JSON.parse(cachedData) as GetDoctorMasterDataRes;
      }
    } catch (error) {
      this.logger.warn(
        'Redis cache read failed for doctor master data',
        error instanceof Error ? error.message : String(error),
      );
    }

    // 2. Cache miss -> Fetch from database
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 3. Execute procedure
      await queryRunner.query(
        `CALL get_doctor_master_data('master_data_cursor')`,
      );

      // 4. Fetch cursor
      const [procedureResult] = await queryRunner.query(
        `FETCH ALL FROM master_data_cursor`,
      );

      // 5. Close cursor
      await queryRunner.query(`CLOSE master_data_cursor`);

      if (!procedureResult) {
        throwRpcException(status.INTERNAL, 'Invalid response from procedure');
      }

      // 6. Handle procedure status
      switch (procedureResult.status) {
        case Errors.dbError:
          throwRpcException(status.INTERNAL, 'Database error');
      }

      const response: GetDoctorMasterDataRes = {
        registrationCouncils: procedureResult.registration_councils ?? [],

        states: procedureResult.states ?? [],

        qualifications: procedureResult.qualifications ?? [],

        specializations: procedureResult.specializations ?? [],
      };

      // 7. Commit transaction
      await queryRunner.commitTransaction();

      // 8. Cache the result
      try {
        await this.redisService.set(
          cacheKey,
          JSON.stringify(response),
          3600, // 1 hour
        );
      } catch (error) {
        this.logger.warn(
          'Redis cache write failed for doctor master data',
          error instanceof Error ? error.message : String(error),
        );
      }

      return response;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
