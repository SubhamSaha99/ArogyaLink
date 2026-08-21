export const API_ROUTES = {
  // Auth Routes
  healthInstituteRegistration: "/api/auth/healthInstituteRegistration",
  healthInstituteLogin: "/api/auth/healthInstituteLogin",
  doctorRegistration: "/api/auth/doctorRegistration",
  doctorLogin: "/api/auth/doctorLogin",
  refreshToken: "/api/auth/refreshToken",
  logout: "/api/auth/logout",

  // Doctor Routes
  updateDoctorBasicDetails: "/api/doctor/updateDoctorBasicDetails",
  updateDoctorProfessionalDetails: "/api/doctor/updateDoctorProfessionalDetails",
  updateDoctorQualifications: "/api/doctor/updateDoctorQualifications",
  getDoctorDetails: "/api/doctor/getDoctorDetails",
  getDoctorMasterData: "/api/doctor/getDoctorMasterData",

  // Health Institute Routes
  updateHealthInstituteProfile: "/api/healthInstitute/updateHealthInstituteProfile",
  getHealthInstituteDetails: "/api/healthInstitute/getHealthInstituteDetails",
  getHealthInstituteStates: "/api/healthInstitute/states",
  getHealthInstituteDistricts: "/api/healthInstitute/districts",
} as const;

export type ApiRoute = (typeof API_ROUTES)[keyof typeof API_ROUTES] | string;
