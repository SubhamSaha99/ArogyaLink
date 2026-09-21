import {
  GetAssociatedHealthInstitutesRes,
} from '../../proto/generated/health-institute';

export interface UpdateHealthInstituteQueryResponse {
  f_result: string;
}

export interface UpdateHealthInstituteResponse {
  healthInstituteId: string;
}

export interface HealthInstituteProfileDetails {
  healthInstituteProfileId: number;
  healthInstituteName: string;
  healthInstituteType: number;
  registrationNumber?: string;
  email: string;
  phone?: string;
  address?: string;
  stateId?: number;
  stateName?: string;
  districtId?: number;
  districtName?: string;
  pincode?: string;
}

export interface GetHealthInstituteDetailsQueryResponse {
  status: string;
  healthInstitutePrimaryKey: number;
  healthInstituteId: string;
  profileDetails: HealthInstituteProfileDetails;
}
export interface GetHealthInstituteDetailsResponse {
  healthInstitutePrimaryKey: number;
  healthInstituteId: string;
  profileDetails: HealthInstituteProfileDetails;
}

export interface MasterDataItemResposne {
  id: number;
  name: string;
  code: string;
}

export interface GetDoctorMasterDataQueryResponse {
  status: string;
  departments: MasterDataItemResposne[];
  designations: MasterDataItemResposne[];
  consultationScopes: MasterDataItemResposne[];
}

export interface GetDoctorMasterDataResponse {
  departments: MasterDataItemResposne[];
  designations: MasterDataItemResposne[];
  consultationScopes: MasterDataItemResposne[];
}

export interface AppointDoctorResponse {
    mappingId: number
}

export interface AppointedDoctorMappingDetails {
  mappingId: number;
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
}

export interface GetAppointedDoctorsDatabaseResponse {
  doctors: AppointedDoctorMappingDetails[];
  total: number;
  offset: number;
  limit: number;
}

export interface GetAssociatedHealthInstituteDatabaseResponse {
  status: string;
  healthInstitutes: GetAssociatedHealthInstitutesRes;
}

export interface GetAssociatedDoctorsIdDatabaseResponse {
  status: string;
  doctorPrimaryKeys: number[];
}

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
  doctors: GetAppointedDoctorsData[] | [];
  total: number;
  offset: number;
  limit: number;
}