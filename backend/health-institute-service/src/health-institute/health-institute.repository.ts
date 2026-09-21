import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  GetAssociatedHealthInstitutesReq,
  HealthInstituteProfileReq,
} from '../proto/generated/health-institute';
import {
  GetAppointedDoctorsDatabaseResponse,
  GetAssociatedDoctorsIdDatabaseResponse,
  GetAssociatedHealthInstituteDatabaseResponse,
  GetDoctorMasterDataQueryResponse,
  GetHealthInstituteDetailsQueryResponse,
  MasterDataItemResposne,
  UpdateHealthInstituteQueryResponse,
} from '../common/interfaces/health-institute.interface';
import { Errors } from '../common/utils/constants';
import {
  AppointDoctorDto,
  GetAppointedDoctorsListDto,
  UpdateHealthInstituteProfileDto,
} from './health-institute.dto';

@Injectable()
export class HealthInstituteRepository {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * @description create health institute profile grpc repository
   * @param request
   * @returns string
   */
  async createHealthInstituteProfile(
    request: HealthInstituteProfileReq,
  ): Promise<string> {
    const result = await this.dataSource.query<
      UpdateHealthInstituteQueryResponse[]
    >(
      `SELECT create_health_institute_profile($1, $2, $3, $4, $5) AS f_result`,
      [
        request.healthInstitutePrimaryKey,
        request.healthInstituteId,
        request.healthInstituteName,
        request.healthInstituteType,
        request.email,
      ],
    );
    const queryResult = result[0]?.f_result;

    if (
      typeof queryResult === 'string' &&
      !/^AGL-[HND]\d{6}$/.test(queryResult)
    ) {
      throw new HttpException(
        'Invalid response from query',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!queryResult) {
      throw new HttpException(
        'Invalid response!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (queryResult === Errors.dbError) {
      throw new HttpException(
        'Database error!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return queryResult;
  }

  /**
   * @description get associated health institutes grpc repository.
   * @param request
   * @returns GetAssociatedHealthInstituteDatabaseResponse
   */
  async getAssociatedHealthInstitutes(
    request: GetAssociatedHealthInstitutesReq,
  ): Promise<GetAssociatedHealthInstituteDatabaseResponse> {
    const result = await this.dataSource.query<
      GetAssociatedHealthInstituteDatabaseResponse[]
    >(`SELECT * FROM get_associated_health_institutes($1)`, [
      request.doctorPrimaryKey,
    ]);
    const queryResult = result?.[0];

    if (!queryResult) {
      throw new HttpException(
        'Invalid response!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (queryResult.status === Errors.dbError) {
      throw new HttpException(
        'Database error!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return queryResult;
  }

  /**
   * @description update health institute profile repository
   * @param request
   * @returns string
   */
  async updateHealthInstituteProfile(
    request: UpdateHealthInstituteProfileDto,
  ): Promise<string> {
    const result = await this.dataSource.query<
      UpdateHealthInstituteQueryResponse[]
    >(
      `SELECT update_health_institute_profile_details($1, $2, $3, $4, $5, $6, $7) AS f_result`,
      [
        request.healthInstituteProfileId,
        request.registrationNumber,
        request.phone,
        request.address,
        request.stateId,
        request.districtId,
        request.pincode,
      ],
    );

    const queryResult: string = result[0]?.f_result;

    if (
      typeof queryResult === 'string' &&
      !/^AGL-[HND]\d{6}$/.test(queryResult)
    ) {
      throw new HttpException(
        'Invalid response from query',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!queryResult) {
      throw new HttpException(
        'Invalid response!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (queryResult === Errors.dbError) {
      throw new HttpException(
        'Database error!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return queryResult;
  }

  /**
   * @description get health institute details respository
   * @param healthInstitutePrimaryKey
   * @returns GetHealthInstituteDetailsQueryResponse
   */
  async getHealthInstituteDetails(
    healthInstitutePrimaryKey: number,
  ): Promise<GetHealthInstituteDetailsQueryResponse> {
    const result = await this.dataSource.query<
      GetHealthInstituteDetailsQueryResponse[]
    >(`SELECT * FROM get_health_institute_details($1)`, [
      healthInstitutePrimaryKey,
    ]);

    const queryResult = result[0];

    if (!queryResult) {
      throw new HttpException(
        'Invalid response!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    switch (queryResult.status) {
      case Errors.invalidIdError:
        throw new HttpException(
          'Health Institute data not found!',
          HttpStatus.NOT_FOUND,
        );

      case Errors.dbError:
        throw new HttpException(
          'Database error!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
    return queryResult;
  }

  /**
   * @description get states repository
   * @returns MasterDataItemResposne[]
   */
  async getStates(): Promise<MasterDataItemResposne[]> {
    const result = await this.dataSource.query<MasterDataItemResposne[]>(
      `SELECT * FROM get_states()`,
    );

    if (result.length === 0) {
      throw new HttpException(
        'Invalid response from query',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return result;
  }

  /**
   * @description get districts repository
   * @param id
   * @returns MasterDataItemResposne[]
   */
  async getDistricts(id: number): Promise<MasterDataItemResposne[]> {
    const result = await this.dataSource.query<MasterDataItemResposne[]>(
      `SELECT * FROM get_districts($1)`,
      [id],
    );

    if (result.length === 0) {
      throw new HttpException(
        'Invalid response from query',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return result;
  }

  /**
   * @description get registration councils repository
   * @returns MasterDataItemResposne[]
   */
  async getRegistrationCouncils(): Promise<MasterDataItemResposne[]> {
    const result = await this.dataSource.query<MasterDataItemResposne[]>(
      `SELECT * FROM get_registration_councils()`,
    );

    if (result.length === 0) {
      throw new HttpException(
        'Invalid response from query',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return result;
  }

  /**
   * @description get appoint doctor master data repository
   * @returns GetDoctorMasterDataQueryResponse
   */
  async getAppointDoctorMasterData(): Promise<GetDoctorMasterDataQueryResponse> {
    const result = await this.dataSource.query<
      GetDoctorMasterDataQueryResponse[]
    >(`SELECT * FROM get_appoint_doctor_master_data()`);

    const queryResult = result?.[0];

    if (!queryResult) {
      throw new HttpException(
        'Invalid response from query',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (queryResult.status === Errors.dbError) {
      throw new HttpException(
        'Database error!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return queryResult;
  }

  /**
   * @description appoint doctor repository
   * @param request
   * @param healthInstitutePrimaryKey
   * @param healthInstituteId
   * @returns string
   */
  async appointDoctor(
    request: AppointDoctorDto,
    healthInstitutePrimaryKey: number,
    healthInstituteId: string,
  ): Promise<string> {
    const result = await this.dataSource.query<
      UpdateHealthInstituteQueryResponse[]
    >(`SELECT appoint_doctor($1, $2, $3, $4, $5, $6, $7, $8, $9) AS f_result`, [
      healthInstitutePrimaryKey,
      healthInstituteId,
      request.doctorPrimaryKey,
      request.doctorId,
      request.departmentId,
      request.designation,
      request.joiningDate,
      request.consultationScope,
      request.affiliationNotes,
    ]);
    const queryResult = result[0]?.f_result;

    switch (queryResult) {
      case Errors.doctorAlreadyMapped:
        throw new HttpException(
          'Doctor Alreday Appointed!',
          HttpStatus.CONFLICT,
        );

      case Errors.dbError:
        throw new HttpException(
          'Database error!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
    return queryResult;
  }

  /**
   * @description get appointed doctors list repository
   * @param request
   * @param healthInstitutePrimaryKey
   * @returns GetAppointedDoctorsDatabaseResponse
   */
  async getAppointedDoctorsList(
    request: GetAppointedDoctorsListDto,
    healthInstitutePrimaryKey: number,
  ): Promise<GetAppointedDoctorsDatabaseResponse> {
    const result = await this.dataSource.query<
      GetAppointedDoctorsDatabaseResponse[]
    >(`SELECT * FROM get_appointed_doctors($1, $2, $3, $4, $5, $6, $7)`, [
      healthInstitutePrimaryKey,
      request.offset,
      request.limit,
      request.search ?? null,
      request.departmentId ?? null,
      request.designationId ?? null,
      request.consultationScopeId ?? null,
    ]);

    const queryResult = result[0];

    if (!queryResult) {
      throw new HttpException(
        'Invalid response from query',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return queryResult;
  }

  /**
   * @description get associated doctors id repository
   * @param healthInstitutePrimaryKey 
   * @returns GetAssociatedDoctorsIdDatabaseResponse
   */
  async getAssociatedDoctorsId(
    healthInstitutePrimaryKey: number,
  ): Promise<GetAssociatedDoctorsIdDatabaseResponse> {
    const result = await this.dataSource.query<
      GetAssociatedDoctorsIdDatabaseResponse[]
    >(`SELECT * FROM get_appointed_doctors_primary_keys($1)`, [
      healthInstitutePrimaryKey,
    ]);
    const queryResult = result?.[0];

    if (!queryResult) {
      throw new HttpException(
        'Invalid response!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (queryResult.status === Errors.dbError) {
      throw new HttpException(
        'Database error!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return queryResult;
  }
}
