import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './db.service';
import { DoctorProfile } from './entities/doctor-profile.entity';
import { DbExceptionLog } from './entities/db-exception-log.entity';
import { DoctorProfessionalDetails } from './entities/doctor-professional-details.entity';
import { DoctorQualification } from './entities/doctor-qualifications.entity';
import { RegistrationCouncil } from './entities/registration-council.entity';
import { State } from './entities/state.entity';
import { Qualification } from './entities/qualification.entity';
import { Specialization } from './entities/specialization.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
        migrationsRun: false,
        migrations: ['dist/db/migrations/*.js'],
        entities: [
          DoctorProfile,
          DoctorProfessionalDetails,
          DoctorQualification,
          RegistrationCouncil,
          State,
          Qualification,
          Specialization,
          DbExceptionLog,
        ],
        logging: true,
      }),
    }),
  ],
  providers: [DatabaseService],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
