import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthInstitute } from '../db/entities/healthInstitute.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([HealthInstitute])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
