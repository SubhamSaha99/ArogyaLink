import { lazy, type ComponentType } from "react";
import { Navigate, type RouteObject } from "react-router-dom";
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "@/components/common/RouteGuards";

/**
 * Helper function to lazily load components
 */
export const lazyLoad = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
) => lazy(importFunc);

// ============================================================================
// Lazy-loaded page components for route-level code splitting
// ============================================================================

// Public & Landing
export const LandingPage = lazyLoad(() => import("@/pages/LandingPage"));

// Doctor Module
export const DoctorLoginPage = lazyLoad(
  () => import("@/pages/doctor/DoctorLoginPage"),
);
export const DoctorRegisterPage = lazyLoad(
  () => import("@/pages/doctor/DoctorRegisterPage"),
);
export const DoctorDashboardPreview = lazyLoad(
  () => import("@/pages/doctor/DoctorDashboardPreview"),
);
export const DoctorProfilePage = lazyLoad(
  () => import("@/pages/doctor/DoctorProfilePage"),
);
export const DoctorPatientsPage = lazyLoad(
  () => import("@/pages/doctor/DoctorPatientsPage"),
);
export const DoctorAssociatedInstitutesPage = lazyLoad(
  () => import("@/pages/doctor/DoctorAssociatedInstitutesPage"),
);
export const DoctorPatientClinicalHistoryPage = lazyLoad(
  () => import("@/pages/doctor/DoctorPatientClinicalHistoryPage"),
);
export const DoctorLayout = lazyLoad(
  () => import("@/components/layout/DoctorLayout"),
);

// Health Institute Module
export const HealthInstituteLoginPage = lazyLoad(
  () => import("@/pages/health-institute/HealthInstituteLoginPage"),
);
export const HealthInstituteRegisterPage = lazyLoad(
  () => import("@/pages/health-institute/HealthInstituteRegisterPage"),
);
export const HealthInstituteLayout = lazyLoad(
  () => import("@/components/layout/HealthInstituteLayout"),
);
export const HealthInstituteProfilePage = lazyLoad(
  () => import("@/pages/health-institute/HealthInstituteProfilePage"),
);
export const HealthInstituteDashboardPage = lazyLoad(
  () => import("@/pages/health-institute/HealthInstituteDashboardPage"),
);
export const HealthInstituteAppointDoctorPage = lazyLoad(
  () => import("@/pages/health-institute/HealthInstituteAppointDoctorPage"),
);
export const HealthInstituteAppointedDoctorsPage = lazyLoad(
  () => import("@/pages/health-institute/HealthInstituteAppointedDoctorsPage"),
);
export const HealthInstituteDoctorDetailsPage = lazyLoad(
  () => import("@/pages/health-institute/HealthInstituteDoctorDetailsPage"),
);

// Patient Module
export const PatientLoginPage = lazyLoad(
  () => import("@/pages/patient/PatientLoginPage"),
);
export const PatientRegisterPage = lazyLoad(
  () => import("@/pages/patient/PatientRegisterPage"),
);
export const PatientLayout = lazyLoad(
  () => import("@/components/layout/PatientLayout"),
);
export const PatientProfilePage = lazyLoad(
  () => import("@/pages/patient/PatientProfilePage"),
);
export const PatientMedicalRecordsPage = lazyLoad(
  () => import("@/pages/patient/PatientMedicalRecordsPage"),
);

// ============================================================================
// Modular Route Objects
// ============================================================================

export const publicRoutes: RouteObject[] = [
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/login", element: <DoctorLoginPage /> },
      { path: "/register", element: <DoctorRegisterPage /> },
      {
        path: "/health-institute/login",
        element: <HealthInstituteLoginPage />,
      },
      {
        path: "/health-institute/register",
        element: <HealthInstituteRegisterPage />,
      },
      { path: "/patient/login", element: <PatientLoginPage /> },
      { path: "/patient/register", element: <PatientRegisterPage /> },
    ],
  },
];

export const doctorRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute allowedRole="DOCTOR" />,
    children: [
      {
        path: "/doctor",
        element: <DoctorLayout />,
        children: [
          { path: "profile", element: <DoctorProfilePage /> },
          { path: "patients", element: <DoctorPatientsPage /> },
          {
            path: "clinical-history",
            element: <DoctorPatientClinicalHistoryPage />,
          },
          {
            path: "patient-history",
            element: <DoctorPatientClinicalHistoryPage />,
          },
          {
            path: "associated-institutes",
            element: <DoctorAssociatedInstitutesPage />,
          },
          { path: "institutes", element: <DoctorAssociatedInstitutesPage /> },
          { path: "dashboard", element: <DoctorDashboardPreview /> },
        ],
      },
    ],
  },
];

export const healthInstituteRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute allowedRole="HEALTH_INSTITUTE" />,
    children: [
      {
        path: "/health-institute",
        element: <HealthInstituteLayout />,
        children: [
          { path: "profile", element: <HealthInstituteProfilePage /> },
          { path: "dashboard", element: <HealthInstituteDashboardPage /> },
          {
            path: "appointed-doctors",
            element: <HealthInstituteAppointedDoctorsPage />,
          },
          {
            path: "appoint-doctor",
            element: <HealthInstituteAppointDoctorPage />,
          },
          {
            path: "appoint-doctor/:doctorId",
            element: <HealthInstituteDoctorDetailsPage />,
          },
          { path: "doctors", element: <HealthInstituteAppointedDoctorsPage /> },
          {
            path: "doctors/:doctorId",
            element: <HealthInstituteDoctorDetailsPage />,
          },
        ],
      },
    ],
  },
];

export const patientRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute allowedRole="PATIENT" />,
    children: [
      {
        path: "/patient",
        element: <PatientLayout />,
        children: [
          { path: "profile", element: <PatientProfilePage /> },
          { path: "medical-records", element: <PatientMedicalRecordsPage /> },
        ],
      },
    ],
  },
];

export const appRoutes: RouteObject[] = [
  ...publicRoutes,
  {
    path: "/dashboard",
    element: <Navigate to="/doctor/profile" replace />,
  },
  ...doctorRoutes,
  ...healthInstituteRoutes,
  ...patientRoutes,
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];
