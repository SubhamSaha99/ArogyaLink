import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import {
    GetDistrictsReq,
  GetDistrictsRes,
  GetHealthInstituteDetailsReq,
  GetHealthInstituteDetailsRes,
  GetStatesRes,
  HealthInstituteProfileReq,
  HealthInstituteProfileRes,
  MasterDataItem,
  UpdateHealthInstituteProfileReq,
  UpdateHealthInstituteProfileRes,
} from '../proto/generated/health-institute';
import {
  GetHealthInstituteDetailsResponse,
  UpdateHealthInstituteResponse,
} from '../common/interfaces/health-institute.interface';
import { status } from '@grpc/grpc-js';
import { throwRpcException } from '../common/utils/rpc-exception';
import { Errors } from '../common/utils/constant';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class HealthInstituteService {
  private readonly logger = new Logger(HealthInstituteService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  /**
   * * Create health institute profile
   * @param request
   * @returns HealthInstituteProfileRes
   */
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

  /**
   * * Update health institute profile
   * @param request
   * @returns UpdateHealthInstituteProfileRes
   */
  async updateHealthInstituteProfile(
    request: UpdateHealthInstituteProfileReq,
  ): Promise<UpdateHealthInstituteProfileRes> {
    const result = await this.dataSource.query<UpdateHealthInstituteResponse[]>(
      `SELECT update_health_institute_profile_details($1, $2, $3, $4, $5, $6, $7) AS f_result`,
      [
        request.healthInstituteId,
        request.registrationNumber,
        request.phone,
        request.address,
        request.stateId,
        request.districtId,
        request.pincode,
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

    await this.redisService.delete(`healthInstitute:profile:${request.healthInstituteId}`);
    
    return {
      healthInstituteId: procedureResult,
    };
  }

  /**
   * @description Get health institute details
   * @param request 
   * @returns GetHealthInstituteDetailsRes
   */
  async getHealthInstituteDetails(
    request: GetHealthInstituteDetailsReq,
  ): Promise<GetHealthInstituteDetailsRes> {
    const cacheKey = `healthInstitute:profile:${request.healthInstituteId}`;

    try {
      const cachedDoctor = await this.redisService.get(cacheKey);

      if (cachedDoctor) {
        return JSON.parse(cachedDoctor) as GetHealthInstituteDetailsRes;
      }

      const result = await this.dataSource.query<
        GetHealthInstituteDetailsResponse[]
      >(`SELECT * FROM get_health_institute_details($1)`, [
        request.healthInstituteId,
      ]);

      const procedureResult = result[0];

      if (!procedureResult) {
        throwRpcException(status.INTERNAL, 'Invalid response from procedure');
      }

      switch (procedureResult.status) {
        case Errors.invalidIdError:
          throwRpcException(status.NOT_FOUND, 'Health institute not found');
          break;

        case Errors.dbError:
          throwRpcException(status.INTERNAL, 'Database error');
          break;
      }

      const response: GetHealthInstituteDetailsRes = {
        healthInstituteId: procedureResult.healthInstituteId,
        profileDetails: procedureResult.profileDetails,
      };

      await this.redisService.set(cacheKey, JSON.stringify(response), 300);

      return response;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes('redis')
      ) {
        this.logger.warn(
          `Redis operation failed for health institute ${request.healthInstituteId}`,
          error.message,
        );
      }

      throw error;
    }
  }

  /**
   * @description Get states
   * @returns GetStatesRes
   */
  async getStates(): Promise<GetStatesRes> {
    const cacheKey = `states`;

    try {
      const cachedStates = await this.redisService.get(cacheKey);

      if (cachedStates) {
        return JSON.parse(cachedStates) as GetStatesRes;
      }

      const result = await this.dataSource.query<MasterDataItem[]>(
        `SELECT * FROM get_states()`,
      );

      if (result.length === 0) {
        throwRpcException(status.INTERNAL, 'Invalid response from procedure');
      }

      const response: GetStatesRes = {
        states: result,
      };

      await this.redisService.set(cacheKey, JSON.stringify(response), 3600);

      return response;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes('redis')
      ) {
        this.logger.warn(
          `Redis operation failed for states`,
          error.message,
        );
      }

      throw error;
    }
  }

  async getDistricts(
    request: GetDistrictsReq,
  ): Promise<GetDistrictsRes> {
    const cacheKey = `districts:${request.stateId}`;

    try {
    //   const cachedDistricts = await this.redisService.get(cacheKey);

    //   if (cachedDistricts) {
    //     return JSON.parse(cachedDistricts) as GetDistrictsRes;
    //   }

      const result = await this.dataSource.query<MasterDataItem[]>(
        `SELECT * FROM get_districts($1)`,
        [request.stateId],
      );
      console.log(result);
      if (result.length === 0) {
        throwRpcException(status.INTERNAL, 'Invalid response from procedure');
      }

      const response: GetDistrictsRes = {
        districts: result,
      };

    //   await this.redisService.set(cacheKey, JSON.stringify(response), 3600);

      return response;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes('redis')
      ) {
        this.logger.warn(
          `Redis operation failed for districts ${request.stateId}`,
          error.message,
        );
      }

      throw error;
    }
  }
}
