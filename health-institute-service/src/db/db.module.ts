import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './db.service';
import { HealthInstituteProfile } from './entities/health-institute-profile.entity';
import { DbExceptionLog } from './entities/db-exception-log.entity';
import { State } from './entities/states.entity';
import { District } from './entities/districts.entity';
import { HealthInstituteDoctorMapping } from './entities/health-institute-doctor-mapping.entity';
import { RegistrationCouncil } from './entities/registration-council.entity';

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
        entities: [HealthInstituteProfile, State, District, HealthInstituteDoctorMapping, RegistrationCouncil, DbExceptionLog],
        logging: true,
      }),
    }),
  ],
  providers: [DatabaseService],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}