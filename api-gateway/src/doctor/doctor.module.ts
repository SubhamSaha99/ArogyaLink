import { Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { RolesGuard } from '../common/guards/roles.guard';
import { GrpcServiceName } from '../common/utils/constant';
import { DOCTOR_PACKAGE_NAME } from '../proto/generated/doctor';
import { HEALTH_INSTITUTE_PACKAGE_NAME } from '../proto/generated/health-institute';

@Module({
  imports: [
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
    ]),
  ],
  controllers: [DoctorController],
  providers: [DoctorService, RolesGuard],
})
export class DoctorModule {}
