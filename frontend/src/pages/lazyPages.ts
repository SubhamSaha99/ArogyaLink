import { lazy, type ComponentType } from "react";

/**
 * Helper function to lazily load components
 */
export const lazyLoad = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => lazy(importFunc);

// Lazy-loaded page components for route-level code splitting
export const LandingPage = lazyLoad(() => import("@/pages/LandingPage"));
export const DoctorLoginPage = lazyLoad(() => import("@/pages/doctor/DoctorLoginPage"));
export const DoctorRegisterPage = lazyLoad(() => import("@/pages/doctor/DoctorRegisterPage"));
export const DoctorDashboardPreview = lazyLoad(() => import("@/pages/doctor/DoctorDashboardPreview"));
export const DoctorProfilePage = lazyLoad(() => import("@/pages/doctor/DoctorProfilePage"));
export const DoctorLayout = lazyLoad(() => import("@/components/layout/DoctorLayout"));
export const HealthInstituteLoginPage = lazyLoad(() => import("@/pages/health-institute/HealthInstituteLoginPage"));
export const HealthInstituteRegisterPage = lazyLoad(() => import("@/pages/health-institute/HealthInstituteRegisterPage"));
export const HealthInstituteLayout = lazyLoad(() => import("@/components/layout/HealthInstituteLayout"));
export const HealthInstituteProfilePage = lazyLoad(() => import("@/pages/health-institute/HealthInstituteProfilePage"));
export const HealthInstituteDashboardPage = lazyLoad(() => import("@/pages/health-institute/HealthInstituteDashboardPage"));
export const HealthInstituteAppointDoctorPage = lazyLoad(() => import("@/pages/health-institute/HealthInstituteAppointDoctorPage"));
export const HealthInstituteDoctorDetailsPage = lazyLoad(() => import("@/pages/health-institute/HealthInstituteDoctorDetailsPage"));
