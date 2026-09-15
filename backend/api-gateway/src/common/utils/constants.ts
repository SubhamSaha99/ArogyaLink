export enum UserRole {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
  HEALTH_INSTITUTE = 'HEALTH_INSTITUTE',
  ADMIN = 'ADMIN',
}

export const GrpcServiceName = {
  AUTH: 'AUTH_PACKAGE',
  DOCTOR: 'DOCTOR_PACKAGE',
  HEALTH_INSTITUTE: 'HEALTH_INSTITUTE_PACKAGE',
  PATIENT: 'PATIENT_PACKAGE',
} as const;

export enum MedicationStatus {
  ACTIVE = 1,
  COMPLETED = 2,
  DISCONTINUED = 3,
  ON_HOLD = 4,
}
