import { UserRole } from '../utils/constant';

export interface JwtPayload {
  sessionId: string;
  userPrimaryKey: number;
  userBusinessId: string;
  role: UserRole;
}
