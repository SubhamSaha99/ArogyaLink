import { Module } from '@nestjs/common';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GrpcServiceName } from '../common/utils/constant';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PATIENT_PACKAGE_NAME } from '../proto/generated/patient';
import { join } from 'path';
import { RolesGuard } from '../common/guards/roles.guard';

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
  controllers: [PatientController],
  providers: [PatientService, RolesGuard],
})
export class PatientModule {}
