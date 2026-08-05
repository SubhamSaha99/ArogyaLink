export enum Errors {
  emailExistError = 'emailExist',
  mobileExistError = 'mobileExist',
  invalidCredentialError = 'invalidCredential',
  doctorNotFoundError = 'doctorNotFound',
  dbError = 'dbError',
}
export enum UserRole {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
  HEALTH_INSTITUTE = 'HEALTH_INSTITUTE',
  ADMIN = 'ADMIN',
}

export enum SecurityAction {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  LOGOUT = 'LOGOUT',
  LOGOUT_ALL = 'LOGOUT_ALL',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  IP_CHANGED = 'IP_CHANGED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
}

export enum AuditStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  WARNING = 'WARNING',
}

export enum AuditAction {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  LOGOUT = 'LOGOUT',
  LOGOUT_ALL = 'LOGOUT_ALL',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  IP_CHANGED = 'IP_CHANGED',
}

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const LOGIN_RATE_LIMIT = {
  MAX_ATTEMPTS: 5,
  BLOCK_TIME_SECONDS: 15 * 60,
};
