import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GrpcServiceName } from '../common/utils/constants';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PATIENT_PACKAGE_NAME } from '../proto/generated/patient';
import { join } from 'path';
import { RolesGuard } from '../common/guards/roles.guard';
import { MedicalRecordController } from './medical-record.controller';
import { MedicalRecordService } from './medical-record.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
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
  ],
  controllers: [MedicalRecordController],
  providers: [MedicalRecordService, RolesGuard],
})
export class MedicalRecordModule {}
