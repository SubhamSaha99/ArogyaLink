import { UserRole } from '../utils/constants';

export interface JwtPayload {
  sessionId: string;
  userPrimaryKey: number;
  userBusinessId: string;
  role: UserRole;
}
