import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { join } from 'node:path';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { GrpcServiceName } from '../common/utils/constant';
import { HEALTH_INSTITUTE_PACKAGE_NAME } from '../proto/generated/health-institute';
import { DOCTOR_PACKAGE_NAME } from '../proto/generated/doctor';
import { AUTH_PACKAGE_NAME } from '../proto/generated/auth';
import { PATIENT_PACKAGE_NAME } from '../proto/generated/patient';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: GrpcServiceName.AUTH,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: AUTH_PACKAGE_NAME,
            protoPath: join(__dirname, '../proto/auth.proto'),
            url:
              configService.get<string>('AUTH_SERVICE_GRPC_URL') ??
              '0.0.0.0:50051',
            loader: {
              keepCase: false,
              longs: String,
              enums: String,
              defaults: true,
              oneofs: false,
              arrays: true,
            },
          },
        }),
      },
      {
        name: GrpcServiceName.DOCTOR,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: DOCTOR_PACKAGE_NAME,
            protoPath: join(__dirname, '../proto/doctor.proto'),
            url:
              configService.get<string>('DOCTOR_SERVICE_GRPC_URL') ??
              '0.0.0.0:50052',
            loader: {
              keepCase: false,
              longs: String,
              enums: String,
              defaults: true,
              oneofs: false,
              arrays: true,
            },
          },
        }),
      },
      {
        name: GrpcServiceName.HEALTH_INSTITUTE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: HEALTH_INSTITUTE_PACKAGE_NAME,
            protoPath: join(__dirname, '../proto/health-institute.proto'),
            url:
              configService.get<string>('HEALTH_INSTITUTE_SERVICE_GRPC_URL') ??
              '0.0.0.0:50053',
            loader: {
              keepCase: false,
              longs: String,
              enums: String,
              defaults: true,
              oneofs: false,
              arrays: true,
            },
          },
        }),
      },
      {
        name: GrpcServiceName.PATIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: PATIENT_PACKAGE_NAME,
            protoPath: join(__dirname, '../proto/patient.proto'),
            url:
              configService.get<string>('PATIENT_SERVICE_GRPC_URL') ??
              '0.0.0.0:50054',
            loader: {
              keepCase: false,
              longs: String,
              enums: String,
              defaults: true,
              oneofs: false,
              arrays: true,
            },
          },
        }),
      },
    ]),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, PassportModule, JwtModule],
})
export class AuthModule {}
