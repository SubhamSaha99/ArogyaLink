export interface JwtPayload {
  sessionId: string;
  userPrimaryKey: number;
  userBusinessId: string;
  role: string;
}
