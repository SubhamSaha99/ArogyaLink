export interface UpdateHealthInstituteResponse {
  f_result: string;
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

export interface GetHealthInstituteDetailsResponse {
  status: string;
  healthInstitutePrimaryKey: number;
  healthInstituteId: string;
  profileDetails: HealthInstituteProfileDetails;
}

export interface MasterDataItemResposne {
  id: number;
  name: string;
  code: string;
}

export interface GetDoctorMasterDataResponse {
  status: string;
  departments: MasterDataItemResposne[];
  designations: MasterDataItemResposne[];
  consultationScopes: MasterDataItemResposne[];
}

export interface AppointedDoctorResult {
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
  doctors: AppointedDoctorResult[];
  total: number;
  offset: number;
  limit: number;
}
