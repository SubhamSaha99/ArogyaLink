import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  authQueryInterface,
  doctorLoginQueryInterface,
  doctorQueryInterface,
  healthInstituteLoginQueryInterface,
  healthInstituteQueryInterface,
  patientLoginQueryInterface,
  patientQueryInterface,
} from '../common/interfaces/auth.interface';
import { Errors } from '../common/util/constant';
import { RateLimiterService } from '../common/rate-limiter/rate-limiter.service';
import { RateLimitOptions } from '../common/interfaces/rate-limiter.interface';

@Injectable()
export class AuthRepository {
  constructor(
    private readonly dataSource: DataSource,
    private readonly rateLimiterService: RateLimiterService,
  ) {}

  /**
   * @description health institute registration repository
   * @param email
   * @param password
   * @param healthInstituteType
   * @returns healthInstituteQueryInterface
   */
  async healthInstituteRegistration(
    email: string,
    password: string,
    healthInstituteType: number,
  ): Promise<healthInstituteQueryInterface> {
    const result = await this.dataSource.query<healthInstituteQueryInterface[]>(
      `SELECT * FROM register_health_institute($1, $2, $3)`,
      [email, password, healthInstituteType],
    );

    const procedureResult = result[0];

    if (!procedureResult) {
      throw new HttpException(
        'Invalid response!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    switch (procedureResult.status) {
      case Errors.emailExistError:
        throw new HttpException('Email already exists!', HttpStatus.CONFLICT);

      case Errors.dbError:
        throw new HttpException(
          'Database error!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
    return procedureResult;
  }

  /**
   * @description compensate health institute registration Repository
   * @param healthInstitutePrimaryKey
   * @returns boolean
   */
  async compensateHealthInstituteRegistration(
    healthInstitutePrimaryKey: number,
  ): Promise<boolean> {
    const result = await this.dataSource.query<authQueryInterface[]>(
      `SELECT compensate_health_institute_registration($1) AS f_result`,
      [healthInstitutePrimaryKey],
    );

    const procedureResult: string = result[0]?.f_result;

    switch (procedureResult) {
      case Errors.helathInstituteNotFoundError:
        throw new HttpException(
          'Health Institute auth record not found!',
          HttpStatus.NOT_FOUND,
        );

      case Errors.dbError:
        throw new HttpException(
          'Database error!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }

    return true;
  }

  /**
   * @description health institute login repository
   * @param email
   * @param rateLimitOptions
   * @returns healthInstituteLoginQueryInterface
   */
  async healthInstituteLogin(
    email: string,
    rateLimitOptions: RateLimitOptions,
  ): Promise<healthInstituteLoginQueryInterface> {
    const result = await this.dataSource.query<
      healthInstituteLoginQueryInterface[]
    >(`SELECT * FROM login_health_institute($1)`, [email]);

    const procedureResult = result?.[0];

    if (!procedureResult) {
      throw new HttpException(
        'Invalid response!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    switch (procedureResult.status) {
      case Errors.invalidCredentialError:
        await this.rateLimiterService.recordFailure(rateLimitOptions);
        throw new HttpException(
          'Invalid Login Credentials',
          HttpStatus.UNAUTHORIZED,
        );

      case Errors.dbError:
        throw new HttpException(
          'Database error!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }

    return procedureResult;
  }

  /**
   * @description doctor registration repository
   * @param email
   * @param mobile
   * @param password
   * @returns doctorQueryInterface
   */
  async doctorRegistration(
    email: string,
    mobile: string,
    password: string,
  ): Promise<doctorQueryInterface> {
    const result = await this.dataSource.query<doctorQueryInterface[]>(
      `SELECT * FROM create_doctor_auth($1, $2, $3)`,
      [email, mobile, password],
    );

    const procedureResult = result[0];

    if (!procedureResult) {
      throw new HttpException(
        'Invalid response!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    switch (procedureResult.status) {
      case Errors.emailExistError:
        throw new HttpException('Email already exists!', HttpStatus.CONFLICT);

      case Errors.mobileExistError:
        throw new HttpException('Mobile already exists!', HttpStatus.CONFLICT);

      case Errors.dbError:
        throw new HttpException(
          'Database error!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
    return procedureResult;
  }

  /**
   * @description compensate doctor registration repository
   * @param doctorPrimaryKey
   * @returns boolean
   */
  async compensateDoctorRegistration(
    doctorPrimaryKey: number,
  ): Promise<boolean> {
    const result = await this.dataSource.query<authQueryInterface[]>(
      `SELECT compensate_doctor_registration($1) AS f_result`,
      [doctorPrimaryKey],
    );

    const procedureResult: string = result[0]?.f_result;

    switch (procedureResult) {
      case Errors.doctorNotFoundError:
        throw new HttpException(
          'Doctor auth record not found!',
          HttpStatus.NOT_FOUND,
        );

      case Errors.dbError:
        throw new HttpException(
          'Database error!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
    return true;
  }

  /**
   * @description doctor login repository
   * @param email
   * @param mobile
   * @param rateLimitOptions
   * @returns doctorLoginQueryInterface
   */
  async doctorLogin(
    email: string | null = null,
    mobile: string | null = null,
    rateLimitOptions: RateLimitOptions,
  ): Promise<doctorLoginQueryInterface> {
    const result = await this.dataSource.query<doctorLoginQueryInterface[]>(
      `SELECT * FROM login_doctor($1, $2)`,
      [email, mobile],
    );

    const procedureResult = result?.[0];

    if (!procedureResult) {
      throw new HttpException(
        'Invalid response!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    switch (procedureResult.status) {
      case Errors.invalidCredentialError:
        await this.rateLimiterService.recordFailure(rateLimitOptions);
        throw new HttpException(
          'Invalid Login Credentials',
          HttpStatus.UNAUTHORIZED,
        );

      case Errors.dbError:
        throw new HttpException(
          'Database error!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }

    return procedureResult;
  }

  /**
   * @description patient registration repository
   * @param email
   * @param mobile
   * @param password
   * @returns patientQueryInterface
   */
  async patientRegistration(
    email: string,
    mobile: string,
    password: string,
  ): Promise<patientQueryInterface> {
    const result = await this.dataSource.query<patientQueryInterface[]>(
      `SELECT * FROM register_patient($1, $2, $3)`,
      [email, mobile, password],
    );

    const procedureResult = result[0];

    if (!procedureResult) {
      throw new HttpException(
        'Invalid response!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    switch (procedureResult.status) {
      case Errors.emailExistError:
        throw new HttpException('Email already exists!', HttpStatus.CONFLICT);

      case Errors.mobileExistError:
        throw new HttpException('Mobile already exists!', HttpStatus.CONFLICT);

      case Errors.dbError:
        throw new HttpException(
          'Database error!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }

    return procedureResult;
  }

  /**
   * @description compensate patietient registration repository
   * @param patientPrimaryKey
   * @returns boolean
   */
  async compensatePatientRegistration(
    patientPrimaryKey: number,
  ): Promise<boolean> {
    const result = await this.dataSource.query<authQueryInterface[]>(
      `SELECT compensate_patient_registration($1) AS f_result`,
      [patientPrimaryKey],
    );

    const procedureResult: string = result[0]?.f_result;

    switch (procedureResult) {
      case Errors.patientNotFoundError:
        throw new HttpException(
          'Patient auth record not found!',
          HttpStatus.NOT_FOUND,
        );

      case Errors.dbError:
        throw new HttpException(
          'Database error!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
    return true;
  }

  /**
   * @description patient login repository
   * @param email 
   * @param mobile 
   * @param rateLimitOptions 
   * @returns patientLoginQueryInterface
   */
  async patientLogin(
    email: string | null = null,
    mobile: string | null = null,
    rateLimitOptions: RateLimitOptions,
  ): Promise<patientLoginQueryInterface> {
    const result = await this.dataSource.query<patientLoginQueryInterface[]>(
      `SELECT * FROM login_patient($1, $2)`,
      [email, mobile],
    );

    const procedureResult = result?.[0];

    if (!procedureResult) {
      throw new HttpException(
        'Invalid response!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    switch (procedureResult.status) {
      case Errors.invalidCredentialError:
        await this.rateLimiterService.recordFailure(rateLimitOptions);
        throw new HttpException(
          'Invalid Login Credentials',
          HttpStatus.UNAUTHORIZED,
        );

      case Errors.dbError:
        throw new HttpException(
          'Database error!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }

    return procedureResult;
  }
}
