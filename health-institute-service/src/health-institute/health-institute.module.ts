import { Module } from '@nestjs/common';
import { HealthInstituteController } from './health-institute.controller';
import { HealthInstituteService } from './health-institute.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthInstituteProfile } from '../db/entities/health-institute-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HealthInstituteProfile])],
  controllers: [HealthInstituteController],
  providers: [HealthInstituteService],
})
export class HealthInstituteModule {}
