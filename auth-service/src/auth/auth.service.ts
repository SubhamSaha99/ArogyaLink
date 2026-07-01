import { Injectable } from '@nestjs/common';
import { status } from '@grpc/grpc-js';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import {
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
      if (procedureResult.status === Errors.emailNotExistError) {
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
        email: procedureResult.email,
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
}
