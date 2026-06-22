import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

import {
  HealthInstituteRegReq,
  HealthInstituteRegRes,
} from '../proto/generated/auth';

import { Errors } from '../helpers/constant';

@Injectable()
export class AuthService {
  constructor(private readonly dataSource: DataSource) {}

  async hospitalRegistration(
    request: HealthInstituteRegReq,
  ): Promise<HealthInstituteRegRes> {
    try {
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
        throw new RpcException({
          code: status.ALREADY_EXISTS,
          message: 'Email already exists',
        });
      }

      if (procedureResult === Errors.dbError) {
        throw new RpcException({
          code: status.INTERNAL,
          message: 'Database error',
        });
      }

      if (!/^[HND]\d{6}$/.test(procedureResult)) {
        throw new RpcException({
          code: status.INTERNAL,
          message: 'Invalid response from procedure',
        });
      }

      return {
        userId: procedureResult,
      };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException({
        code: status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }
}
