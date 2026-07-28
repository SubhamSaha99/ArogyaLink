import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { HealthInstitute } from '../db/entities/health-institute.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtUtil } from '../util/jwt.util';
import { SessionService } from '../session/session.service';
import { UserSession } from '../db/entities/user-session.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([HealthInstitute, UserSession]),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtUtil, SessionService],
  exports: [JwtUtil, SessionService, JwtModule],
})
export class AuthModule {}
