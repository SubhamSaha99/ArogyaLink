import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  DoctorProfileReq,
  DoctorProfileRes,
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

@Injectable()
export class DoctorService {
  constructor(private readonly dataSource: DataSource) {}

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

      return {
        doctorId: procedureResult,
      };
    } catch (error) {
      throw error;
    }
  }
}
