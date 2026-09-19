import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  DoctorQualifications,
  GetDoctorDetailsQueryResponse,
  GetDoctorListResponse,
  GetDoctorMasterDataResponse,
  UpdateDoctorQueryResponse,
} from '../common/interfaces/doctor.interface';
import { DoctorProfileReq } from '../proto/generated/doctor';
import { Errors } from '../common/utils/constants';
import {
  DoctorBasicDetailsDto,
  DoctorProfessionalDetailsDto,
  GetDoctorListDto,
} from './doctor.dto';

@Injectable()
export class DoctorRepository {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * @description create doctor profile repository
   * @param request
   * @returns string
   */
  async createDoctorProfile(request: DoctorProfileReq): Promise<string> {
    const result = await this.dataSource.query<UpdateDoctorQueryResponse[]>(
      `SELECT create_doctor_profile($1, $2, $3, $4, $5, $6, $7) AS f_result`,
      [
        request.doctorPrimaryKey,
        request.doctorId,
        request.email,
        request.mobile,
        request.firstName,
        request.middleName,
        request.lastName,
      ],
    );

    const procedureResult: string = result[0]?.f_result;

    if (
      typeof procedureResult === 'string' &&
      !/^AGL-DOC\d{6}$/.test(procedureResult)
    ) {
      throw new HttpException(
        'Invalid response from query',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!procedureResult) {
      throw new HttpException(
        'Invalid response!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (procedureResult === Errors.dbError) {
      throw new HttpException(
        'Database error!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return procedureResult;
  }

  /**
   * @description update doctor profile details repository
   * @param request
   * @param profileImage
   * @returns string
   */
  async updateDoctorProfileDetails(
    request: DoctorBasicDetailsDto,
    profileImage: string | null,
  ): Promise<string> {
    const result = await this.dataSource.query<UpdateDoctorQueryResponse[]>(
      `SELECT update_doctor_basic_details($1, $2, $3, $4, $5, $6) AS f_result`,
      [
        request.doctorProfileId,
        request.firstName,
        request.middleName,
        request.lastName,
        request.gender,
        profileImage,
      ],
    );

    const procedureResult: string = result?.[0]?.f_result;

    if (
      typeof procedureResult === 'string' &&
      !/^AGL-DOC\d{6}$/.test(procedureResult)
    ) {
      throw new HttpException(
        'Invalid response from query',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    switch (procedureResult) {
      case Errors.invalidIdError:
        throw new HttpException('Doctor Not found!', HttpStatus.NOT_FOUND);
      case Errors.dbError:
        throw new HttpException(
          'Database error!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }

    return procedureResult;
  }

  async updateDoctorProfessionalDetails(
    request: DoctorProfessionalDetailsDto,
    doctorPrimaryKey: number,
    doctorId: string,
  ): Promise<string> {
    const result = await this.dataSource.query<UpdateDoctorQueryResponse[]>(
      `SELECT update_doctor_professional_details($1, $2, $3, $4, $5, $6, $7, $8) AS f_result`,
      [
        request.doctorProfessionalDetailsId ?? null,
        doctorPrimaryKey,
        doctorId,
        request.medicalRegistration,
        request.registrationCouncil,
        request.registrationState,
        request.registrationYear,
        request.licenseStatus,
      ],
    );

    const procedureResult: string = result?.[0]?.f_result;

    if (
      typeof procedureResult === 'string' &&
      !/^AGL-DOC\d{6}$/.test(procedureResult)
    ) {
      throw new HttpException(
        'Invalid response from query',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    switch (procedureResult) {
      case Errors.invalidIdError:
        throw new HttpException('Doctor Not found!', HttpStatus.NOT_FOUND);
      case Errors.dbError:
        throw new HttpException(
          'Database error!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }

    return procedureResult;
  }

  /**
   * @description update doctor qualifications repository
   * @param qualifications
   * @param doctorPrimaryKey
   * @param doctorId
   * @returns string
   */
  async updateDoctorQualifications(
    qualifications: DoctorQualifications[],
    doctorPrimaryKey: number,
    doctorId: string,
  ): Promise<string> {
    const result = await this.dataSource.query<UpdateDoctorQueryResponse[]>(
      `SELECT update_doctor_qualifications($1, $2, $3) AS f_result`,
      [doctorPrimaryKey, doctorId, JSON.stringify(qualifications)],
    );

    const procedureResult: string = result?.[0]?.f_result;

    if (
      typeof procedureResult === 'string' &&
      !/^AGL-DOC\d{6}$/.test(procedureResult)
    ) {
      throw new HttpException(
        'Invalid response from query',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    switch (procedureResult) {
      case Errors.invalidIdError:
        throw new HttpException('Doctor Not found!', HttpStatus.NOT_FOUND);
      case Errors.dbError:
        throw new HttpException(
          'Database error!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
    return procedureResult;
  }

  /**
   * @description get doctor details repository
   * @param doctorPrimaryKey
   * @returns GetDoctorDetailsResponse
   */
  async getDoctorDetails(
    doctorPrimaryKey: number,
  ): Promise<GetDoctorDetailsQueryResponse> {
    const result = await this.dataSource.query<GetDoctorDetailsQueryResponse[]>(
      `SELECT * FROM get_doctor_details($1)`,
      [doctorPrimaryKey],
    );

    const procedureResult = result?.[0];

    if (!procedureResult) {
      throw new HttpException(
        'Invalid response!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    switch (procedureResult.status) {
      case Errors.invalidIdError:
        throw new HttpException('Doctor Not found!', HttpStatus.NOT_FOUND);
      case Errors.dbError:
        throw new HttpException(
          'Database error!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }

    return procedureResult;
  }

  /**
   * @description get doctor master data respository.
   * @returns GetDoctorMasterDataResponse
   */
  async getDoctorMasterData(): Promise<GetDoctorMasterDataResponse> {
    const result = await this.dataSource.query<GetDoctorMasterDataResponse[]>(
      `SELECT * FROM get_doctor_master_data()`,
    );

    const masterDataResult = result?.[0];

    if (!masterDataResult) {
      throw new HttpException(
        'Invalid response!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (masterDataResult.status === Errors.dbError) {
      throw new HttpException(
        'Database error!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return masterDataResult;
  }

  /**
   * @description get doctor list response repository.
   * @param request
   * @returns GetDoctorListResponse
   */
  async getDoctorList(
    request: GetDoctorListDto,
  ): Promise<GetDoctorListResponse> {
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
      throw new HttpException(
        'Database error!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return procedureResult;
  }
}
