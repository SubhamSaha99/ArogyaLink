export interface authQueryInterface {
  f_result: string;
}

export interface healthInstituteLoginQueryInterface {
  status: string;
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

export interface doctorLoginQueryInterface {
  status: string;
  doctorId: string;
  email: string;
  mobile: string;
  password: string;
}
