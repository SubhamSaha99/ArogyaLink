import { UserRole } from '../common/util/constant';

export interface CreateSessionDto {
  sessionId: string;
  userPrimaryKey: number;
  userBusinessId: string;
  role: UserRole;
  refreshTokenHash: string;
  ipAddress: string;
  userAgent: string;
  deviceName?: string;
  loginLocation?: string;
  expiresAt: Date;
}

export interface CreateAuditLogDto {
  userPrimaryKey: number;
  userBusinessId?: string;
  role?: string;
  sessionId?: string;
  action: string;
  status: string;
  ipAddress?: string;
  userAgent?: string;
  remarks?: string;
}
