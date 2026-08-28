export const API_ROUTES = {
  // Auth Routes
  healthInstituteRegistration: "/api/auth/healthInstituteRegistration",
  healthInstituteLogin: "/api/auth/healthInstituteLogin",
  doctorRegistration: "/api/auth/doctorRegistration",
  doctorLogin: "/api/auth/doctorLogin",
  refreshToken: "/api/auth/refreshToken",
  logout: "/api/auth/logout",

  // Doctor Routes
  updateDoctorProfileDetails: "/api/doctor/updateDoctorProfileDetails",
  updateDoctorProfessionalDetails: "/api/doctor/updateDoctorProfessionalDetails",
  updateDoctorQualifications: "/api/doctor/updateDoctorQualifications",
  getDoctorDetails: "/api/doctor/getDoctorDetails",
  getDoctorMasterData: "/api/doctor/getDoctorMasterData",
  getDoctorList: "/api/doctor/getDoctorList",

  // Health Institute Routes
  updateHealthInstituteProfile: "/api/healthInstitute/updateHealthInstituteProfile",
  getHealthInstituteDetails: "/api/healthInstitute/getHealthInstituteDetails",
  getHealthInstituteStates: "/api/healthInstitute/states",
  getHealthInstituteDistricts: "/api/healthInstitute/districts",
  getHealthInstituteRegistrationCouncils: "/api/healthInstitute/registrationCouncils",
  getAppointDoctorMasterData: "/api/healthInstitute/appointDoctorMasterData",
  appointDoctor: "/api/healthInstitute/appointDoctor",
} as const;

export type ApiRoute = (typeof API_ROUTES)[keyof typeof API_ROUTES] | string;
