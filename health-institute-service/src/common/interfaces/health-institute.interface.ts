export interface UpdateHealthInstituteResponse {
  f_result: string;
}

export interface HealthInstituteProfileDetails {
  id: number;
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
  healthInstituteId: string;
  profileDetails: HealthInstituteProfileDetails;
}
