import { Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorProfile } from '../db/entities/doctor-profile.entity';
import { DoctorRepository } from './doctor.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GrpcServiceName } from '../common/utils/constants';
import { HEALTH_INSTITUTE_PACKAGE_NAME } from '../proto/generated/health-intitute';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule, 
    TypeOrmModule.forFeature([DoctorProfile]),
    ClientsModule.registerAsync([
      {
        name: GrpcServiceName.HEALTH_INSTITUTE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: HEALTH_INSTITUTE_PACKAGE_NAME,
            protoPath: join(__dirname, '../proto/health-intitute.proto'),
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
    ]),
],
  controllers: [DoctorController],
  providers: [DoctorService, DoctorRepository],
  exports: [DoctorRepository],
})
export class ProfileModule {}
