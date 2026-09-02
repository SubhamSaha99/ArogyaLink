export interface GetAppointedDoctorsData {
  doctorPrimaryKey: number;
  doctorId: string;
  departmentId: number;
  departmentName: string;
  designationId: number;
  designationName: string;
  joiningDate: string;
  consultationScopeId: number;
  consultationScopeName: string;
  status: boolean;
  firstName: string;
  middleName?: string;
  lastName: string;
  medicalRegistration: string;
  licenseStatus: number;
}

export interface GetAppointedDoctorsList {
  doctors: GetAppointedDoctorsData[];
  total: number;
  offset: number;
  limit: number;
}