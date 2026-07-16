import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DoctorProfileReq, DoctorProfileRes } from '../proto/generated/doctor';
import { throwRpcException } from '../helpers/rpcException';
import { status } from '@grpc/grpc-js';
import { Errors } from '../helpers/constants';

@Injectable()
export class ProfileService {
  constructor(private readonly dataSource: DataSource) {}

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
}
