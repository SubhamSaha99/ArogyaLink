export interface authQueryInterface {
  f_result: string;
}

export interface healthInstituteQueryInterface {
    status: string;
    healthInstitutePrimaryKey: number;
    healthInstituteId: string;
}

export interface healthInstituteLoginQueryInterface {
  status: string;
  healthInstitutePrimaryKey: number;
  healthInstituteId: string;
  email: string;
  password: string;
}

export interface rateLimitOptionsInterface {
  key: string;
  maxAttempts: number;
  blockDuration: number;
  message: string;
}

export interface doctorQueryInterface {
    status: string;
    doctorPrimaryKey: number;
    doctorId: string;
}

export interface doctorLoginQueryInterface {
  status: string;
  doctorPrimaryKey: number;
  doctorId: string;
  email: string;
  mobile: string;
  password: string;
}

export interface patientQueryInterface {
    status: string;
    patientPrimaryKey: number;
    patientId: string;
}
