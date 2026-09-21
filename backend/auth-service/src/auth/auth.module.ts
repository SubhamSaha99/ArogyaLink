import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtUtil } from '../common/util/jwt.util';
import { SessionService } from '../session/session.service';
import { UserSession } from '../db/entities/user-session.entity';
import { AuditService } from '../session/audit.service';
import { HashUtil } from '../common/util/hash.util';
import { SecurityAuditLog } from '../db/entities/security-audit-log.entity';
import { PassportModule } from '@nestjs/passport';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GrpcServiceName } from '../common/util/constant';
import { DOCTOR_PACKAGE_NAME } from '../proto/generated/doctor';
import { join } from 'path';
import { HEALTH_INSTITUTE_PACKAGE_NAME } from '../proto/generated/health-institute';
import { PATIENT_PACKAGE_NAME } from '../proto/generated/patient';
import { AuthRepository } from './auth.repository';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([UserSession, SecurityAuditLog]),
    ClientsModule.registerAsync([
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
    ]),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    SessionService,
    AuditService,
    HashUtil,
    JwtUtil,
    JwtStrategy,
  ],
  exports: [
    JwtUtil,
    SessionService,
    AuditService,
    AuthRepository,
    HashUtil,
    JwtModule,
    PassportModule,
  ],
})
export class AuthModule {}
