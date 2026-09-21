import { Module } from '@nestjs/common';
import { HealthInstituteController } from './health-institute.controller';
import { HealthInstituteService } from './health-institute.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthInstituteProfile } from '../db/entities/health-institute-profile.entity';
import { HealthInstituteRepository } from './health-institute.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DOCTOR_PACKAGE_NAME } from '../proto/generated/doctor';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GrpcServiceName } from '../common/utils/constants';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([HealthInstituteProfile]),
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
    ]),
  ],
  controllers: [HealthInstituteController],
  providers: [HealthInstituteService, HealthInstituteRepository],
  exports: [HealthInstituteRepository],
})
export class HealthInstituteModule {}
