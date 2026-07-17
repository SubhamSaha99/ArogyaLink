import { Injectable } from '@nestjs/common';
import { status } from '@grpc/grpc-js';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import {
  CompensateDoctorRegistrationReq,
  CompensateDoctorRegistrationRes,
  DoctorAuthReq,
  DoctorLoginReq,
  DoctorLoginRes,
  DoctorRegistrationRes,
  HealthInstituteLoginReq,
  HealthInstituteLoginRes,
  HealthInstituteRegReq,
  HealthInstituteRegRes,
} from '../proto/generated/auth';
import { Errors } from '../helpers/constant';
import { throwRpcException } from '../helpers/rpcException';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * * Health Institute Registartion
   * @param request
   * @returns HealthInstituteRegRes
   */
  async healthInstituteRegistration(
    request: HealthInstituteRegReq,
  ): Promise<HealthInstituteRegRes> {
    const hashedPassword = await bcrypt.hash(request.password, 10);

    const result = await this.dataSource.query(
      `CALL register_health_institute($1, $2, $3, $4, $5)`,
      [
        request.healthInstituteType,
        request.email,
        request.healthInstituteName,
        hashedPassword,
        null,
      ],
    );

    const procedureResult = result?.[0]?.p_result;

    if (procedureResult === Errors.emailExistError) {
      throwRpcException(status.ALREADY_EXISTS, 'Email already exists');
    }
    if (procedureResult === Errors.dbError) {
      throwRpcException(status.INTERNAL, 'Database error');
    }
    if (!/^[HND]\d{6}$/.test(procedureResult)) {
      throwRpcException(status.INTERNAL, 'Invalid response from procedure');
    }
    return {
      healthInstituteId: procedureResult,
    };
  }

  /**
   * * Health Institute Login
   * @param request
   * @returns HealthInstituteLoginRes
   */
  async healthInstituteLogin(
    request: HealthInstituteLoginReq,
  ): Promise<HealthInstituteLoginRes> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(
        `CALL login_health_institute($1, $2, 'login_cursor')`,
        [request.healthInstituteId, request.email],
      );

      const result = await queryRunner.query(`FETCH ALL FROM login_cursor`);
      const procedureResult = result?.[0];

      await queryRunner.query(`CLOSE login_cursor`);
      await queryRunner.commitTransaction();

      if (!procedureResult) {
        throwRpcException(status.INTERNAL, 'Invalid response from procedure');
      }
      if (procedureResult.status === Errors.invalidCredentialError) {
        throwRpcException(status.UNAUTHENTICATED, 'Invalid Login Credentials');
      }
      if (procedureResult.status === Errors.dbError) {
        throwRpcException(status.INTERNAL, 'Database error');
      }

      const isPasswordValid = await bcrypt.compare(
        request.password,
        procedureResult.password,
      );

      if (!isPasswordValid) {
        throwRpcException(status.UNAUTHENTICATED, 'Invalid Login Credentials');
      }

      const token = await this.jwtService.signAsync({
        healthInstituteId: procedureResult.health_institute_id,
        requestIp: request.requestIp,
      });

      return {
        healthInstituteId: procedureResult.health_institute_id,
        healthInstituteName: procedureResult.health_institute_name,
        healthInstituteType: String(procedureResult.health_institute_type),
        email: procedureResult.email,
        token,
      };
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
   * * Doctor Registration
   * @param request
   * @returns DoctorRegistrationRes
   */
  async doctorRegistration(
    request: DoctorAuthReq,
  ): Promise<DoctorRegistrationRes> {
    const hashedPassword = await bcrypt.hash(request.password, 10);

    const result = await this.dataSource.query(
      `CALL create_doctor_auth($1, $2, $3, $4)`,
      [request.email, request.mobile, hashedPassword, null],
    );

    const procedureResult = result?.[0]?.p_result;

    if (procedureResult === Errors.emailExistError) {
      throwRpcException(status.ALREADY_EXISTS, 'Email already exists');
    }
    if (procedureResult === Errors.mobileExistError) {
      throwRpcException(status.ALREADY_EXISTS, 'Mobile already exists');
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

  async compensateDoctorRegistration(
    request: CompensateDoctorRegistrationReq,
  ): Promise<CompensateDoctorRegistrationRes> {
    const match = request.doctorId.match(/^DOC(\d{6})$/);

    if (!match) {
      return throwRpcException(
        status.INVALID_ARGUMENT,
        'Invalid doctor ID format',
      );
    }

    const doctorPk = Number(match[1]);

    const result = await this.dataSource.query(
      `CALL compensate_doctor_registration($1, $2)`,
      [doctorPk, null],
    );

    const procedureResult = result?.[0]?.p_result;

    if (procedureResult === Errors.doctorNotFoundError)
      throwRpcException(status.NOT_FOUND, 'Doctor auth record not found');
    if (procedureResult === Errors.dbError)
      throwRpcException(
        status.INTERNAL,
        'Failed to compensate doctor registration',
      );
    if (procedureResult === Errors.doctorNotFoundError)
      throwRpcException(status.NOT_FOUND, 'Doctor auth record not found');
    return {
      success: true,
    };
  }

  /**
   * * Doctor login
   * @param request 
   * @returns DoctorLoginRes
   */
  async doctorLogin(request: DoctorLoginReq): Promise<DoctorLoginRes> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.query(`CALL login_doctor($1, $2, 'login_cursor')`, [
        request.email,
        request.mobile,
      ]);

      const result = await queryRunner.query(`FETCH ALL FROM login_cursor`);
      const procedureResult = result?.[0];

      await queryRunner.query(`CLOSE login_cursor`);
      await queryRunner.commitTransaction();

      if (!procedureResult) {
        throwRpcException(status.INTERNAL, 'Invalid response from procedure');
      }
      if (procedureResult.status === Errors.invalidCredentialError) {
        throwRpcException(status.UNAUTHENTICATED, 'Invalid Login Credentials');
      }
      if (procedureResult.status === Errors.dbError) {
        throwRpcException(status.INTERNAL, 'Database error');
      }

      const isPasswordValid = await bcrypt.compare(
        request.password,
        procedureResult.password,
      );

      if (!isPasswordValid) {
        throwRpcException(status.UNAUTHENTICATED, 'Invalid Login Credentials');
      }

      const token = await this.jwtService.signAsync({
        doctorId: procedureResult.doctor_id,
        requestIp: request.requestIp,
      });

      return {
        doctorId: procedureResult.doctor_id,
        email: procedureResult.email,
        mobile: procedureResult.mobile,
        token,
      };
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
