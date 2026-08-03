import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { HealthInstitute } from '../db/entities/health-institute.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtUtil } from '../common/util/jwt.util';
import { SessionService } from '../session/session.service';
import { UserSession } from '../db/entities/user-session.entity';
import { AuditService } from '../session/audit.service';
import { HashUtil } from '../common/util/hash.util';
import { SecurityAuditLog } from '../db/entities/security-audit-log.entity';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([HealthInstitute, UserSession, SecurityAuditLog]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtUtil, SessionService, AuditService, HashUtil],
  exports: [JwtUtil, SessionService, AuditService, HashUtil],
})
export class AuthModule {}
