import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import {
  HealthInstituteProfileReq,
  HealthInstituteProfileRes,
} from '../proto/generated/health-institute';
import { UpdateHealthInstituteResponse } from '../common/interfaces/health-institute.interface';
import { status } from '@grpc/grpc-js';
import { throwRpcException } from '../common/utils/rpc-exception';
import { Errors } from '../common/utils/constant';

@Injectable()
export class HealthInstituteService {
  private readonly logger = new Logger(HealthInstituteService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async createHealthInstituteProfile(
    request: HealthInstituteProfileReq,
  ): Promise<HealthInstituteProfileRes> {
    const result = await this.dataSource.query<UpdateHealthInstituteResponse[]>(
      `SELECT create_health_institute_profile($1, $2, $3, $4) AS f_result`,
      [
        request.healthInstituteId,
        request.healthInstituteName,
        request.healthInstituteType,
        request.email,
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
      !/^[HND](\d{6})$/.test(procedureResult)
    ) {
      throwRpcException(status.INTERNAL, 'Invalid response from procedure');
    }

    return {
      healthInstituteId: procedureResult,
    };
  }
}
