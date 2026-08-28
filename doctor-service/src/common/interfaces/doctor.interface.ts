export interface UpdateDoctorResponse {
  f_result: string;
}

export interface DoctorQualifications {
  doctorQualificationId?: number | null;
  qualificationId: number;
  specializationId: number | null;
  institutionName: string | null;
  universityName: string | null;
  yearOfCompletion: number | null;
}

export interface GetDoctorProfileDetailsResponse {
  doctorProfileId: number;
  email: string;
  mobile: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender?: number;
  profileImage?: string;
}

export interface GetDoctorProfessionalDetailsResponse {
  doctorProfessionalDetailsId: number;
  medicalRegistration: string;
  registrationCouncilId: number;
  registrationCouncilName: string;
  registrationStateId: number;
  registrationStateName: string;
  registrationYear: number;
  licenseStatus: number;
}

export interface GetDoctorQualificationDetailsResponse {
  doctorQualificationId: number;
  qualificationId: number;
  qualificationName: string;
  specializationId?: number;
  specializationName?: string;
  institutionName: string;
  universityName: string;
  yearOfCompletion: number;
}

export interface GetDoctorDetailsResponse {
  status: string;
  doctorPrimaryKey: number;
  doctorId: string;
  profileDetails: GetDoctorProfileDetailsResponse;
  professionalDetails: GetDoctorProfessionalDetailsResponse;
  qualificationDetails: GetDoctorQualificationDetailsResponse[];
}

export interface MasterDataItemResposne {
  id: number;
  name: string;
  code: string;
}

export interface GetDoctorMasterDataResponse {
  status: string;
  registrationCouncils: MasterDataItemResposne[];
  states: MasterDataItemResposne[];
  qualifications: MasterDataItemResposne[];
  specializations: MasterDataItemResposne[];
}

export interface DoctorListItem {
  doctorId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  medicalRegistration: string;
  licenseStatus: number;
  registrationStateId?: number;
  registrationCouncilId?: number;
  registrationStateName?: string;
  registrationCouncilName?: string;
}
export interface GetDoctorListResponse {
  doctors: DoctorListItem[];
  total: number;
  resultOffset: number;
  resultLimit: number;
}
