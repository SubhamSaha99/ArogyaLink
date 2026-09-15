export const API_ROUTES = {
  // Auth Routes
  healthInstituteRegistration: "/api/auth/health-institute-registration",
  healthInstituteLogin: "/api/auth/health-institute-login",
  doctorRegistration: "/api/auth/doctor-registration",
  doctorLogin: "/api/auth/doctor-login",
  patientRegistration: "/api/auth/patient-registration",
  patientLogin: "/api/auth/patient-login",
  refreshToken: "/api/auth/refresh-token",
  logout: "/api/auth/logout",

  // Doctor Routes
  updateDoctorProfileDetails: "/api/doctor/doctor-profile-details",
  updateDoctorProfessionalDetails: "/api/doctor/doctor-professional-details",
  updateDoctorQualifications: "/api/doctor/doctor-qualifications",
  getDoctorDetails: "/api/doctor/doctor-details",
  getDoctorMasterData: "/api/doctor/doctor-master-data",
  getDoctorList: "/api/doctor/doctors-list",
  getAssociatedHealthInstitutes: "/api/doctor/associated-health-institutes",
  getAssociatedHealthInstitutesMasterData:
    "/api/doctor/associated-health-institutes-master-data",

  // Health Institute Routes
  updateHealthInstituteProfile:
    "/api/health-institute/health-institute-profile",
  getHealthInstituteDetails: "/api/health-institute/health-institute-details",
  getHealthInstituteStates: "/api/health-institute/states-master-data",
  getHealthInstituteDistricts: "/api/health-institute/districts-master-data",
  getHealthInstituteRegistrationCouncils:
    "/api/health-institute/registration-councils-master-data",
  getAppointDoctorMasterData:
    "/api/health-institute/appoint-doctor-master-data",
  appointDoctor: "/api/health-institute/appoint-doctor",
  getAppointedDoctorsList: "/api/health-institute/appointed-doctors-list",
  getUnAppointedDoctorsList: "/api/health-institute/unappointed-doctors-list",

  // Patient Routes
  getPatientDetails: "/api/patient/patient-details",
  getPatientsList: "/api/patient/patients-list",
  updatePatientProfileDetails: "/api/patient/patient-profile-details",
  getPatientStates: "/api/patient/states-master-data",
  getPatientDistricts: "/api/patient/districts-master-data",

  // Medical Record Routes
  createPatientMedicalRecord: "/api/medical-record/patient-medical-record",
  getPatientMedicalRecords: "/api/medical-record/patient-medical-records",
  getPatientMedicalRecordDetails:
    "/api/medical-record/patient-medical-record-details",
  uploadMedicalDocuments: "/api/medical-record/medical-documents",
  updateMedications: "/api/medical-record/medications",
} as const;

export type ApiRoute = (typeof API_ROUTES)[keyof typeof API_ROUTES] | string;
