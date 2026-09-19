import { Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorProfile } from '../db/entities/doctor-profile.entity';
import { DoctorRepository } from './doctor.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorProfile])],
  controllers: [DoctorController],
  providers: [DoctorService, DoctorRepository],
  exports: [DoctorRepository],
})
export class ProfileModule {}
