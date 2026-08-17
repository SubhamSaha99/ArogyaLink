import { UserRole } from '../utils/constant';

export interface JwtPayload {
  sessionId: string;
  userBusinessId: string;
  role: UserRole;
}
