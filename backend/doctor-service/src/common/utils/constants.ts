export const Errors = {
  emailExistError: 'emailExist',
  mobileExistError: 'mobileExist',
  emailNotExistError: 'emailNotExist',
  invalidIdError: 'invalidIdError',
  dbError: 'dbError',
} as const;

export enum UserRole {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
  HEALTH_INSTITUTE = 'HEALTH_INSTITUTE',
  ADMIN = 'ADMIN',
}

export const REDIS_CLIENT = 'REDIS_CLIENT';
