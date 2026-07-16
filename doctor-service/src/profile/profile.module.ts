import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorProfile } from '../db/entities/doctorProfile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorProfile])],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
