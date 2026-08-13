import { lazy, type ComponentType } from "react";

/**
 * Helper function to lazily load components
 */
export const lazyLoad = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => lazy(importFunc);

// Lazy-loaded page components for route-level code splitting
export const LandingPage = lazyLoad(() => import("@/pages/LandingPage"));
export const DoctorLoginPage = lazyLoad(() => import("@/pages/DoctorLoginPage"));
export const DoctorRegisterPage = lazyLoad(() => import("@/pages/DoctorRegisterPage"));
export const DoctorDashboardPreview = lazyLoad(() => import("@/pages/DoctorDashboardPreview"));
export const DoctorProfilePage = lazyLoad(() => import("@/pages/DoctorProfilePage"));
export const DoctorLayout = lazyLoad(() => import("@/components/layout/DoctorLayout"));
