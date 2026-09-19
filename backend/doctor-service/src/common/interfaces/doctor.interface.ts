export interface UpdateDoctorQueryResponse {
  f_result: string;
}

export interface UpdateDoctorResponse {
    doctorId: string;
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
  doctorPrimaryKey: number;
  doctorId: string;
  profileDetails: GetDoctorProfileDetailsResponse;
  professionalDetails: GetDoctorProfessionalDetailsResponse;
  qualificationDetails: GetDoctorQualificationDetailsResponse[];
}

export interface GetDoctorDetailsQueryResponse {
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
  offset: number;
  limit: number;
}

export interface AppointedDoctorDetailsItem {
  doctorPrimaryKey: number;
  firstName: string;
  middleName?: string | undefined;
  lastName: string;
  medicalRegistration: string;
  licenseStatus: number;
}

export interface GetAppointedDoctorDetailsResponse {
  status: string;
  doctors: AppointedDoctorDetailsItem[];
}
