import { UserRole } from '../util/constant';

export interface CreateSessionDto {
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
  userBusinessId?: string;
  role?: string;
  sessionId?: string;
  action: string;
  status: string;
  ipAddress?: string;
  userAgent?: string;
  remarks?: string;
}
