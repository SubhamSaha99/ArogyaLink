import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth, type User } from "@/context/AuthContext";
import { PageLoader } from "@/components/common/PageLoader";

export type RoleType = "DOCTOR" | "HEALTH_INSTITUTE" | "PATIENT";

/**
 * Returns normalized user role string if present.
 */
export const getUserRole = (user: User | null): RoleType | null => {
  if (!user) return null;
  if (
    user.role === "DOCTOR" ||
    user.doctorId ||
    user.doctorPrimaryKey ||
    user.userBusinessId?.startsWith("AGL-DOC")
  ) {
    return "DOCTOR";
  }
  if (
    user.role === "HEALTH_INSTITUTE" ||
    user.healthInstituteId ||
    user.healthInstitutePrimaryKey ||
    user.userBusinessId?.startsWith("AGL-INS")
  ) {
    return "HEALTH_INSTITUTE";
  }
  if (
    user.role === "PATIENT" ||
    user.patientId ||
    user.patientPrimaryKey ||
    user.userBusinessId?.startsWith("AGL-PAT")
  ) {
    return "PATIENT";
  }
  return null;
};

/**
 * Returns role-specific default profile / landing page for authenticated users.
 */
export const getUserProfileRoute = (user: User | null): string => {
  const role = getUserRole(user);
  switch (role) {
    case "DOCTOR":
      return "/doctor/profile";
    case "HEALTH_INSTITUTE":
      return "/health-institute/profile";
    case "PATIENT":
      return "/patient/profile";
    default:
      return "/";
  }
};

/**
 * Validates whether user possesses a specific role.
 */
export const isUserRole = (user: User | null, role: RoleType): boolean => {
  return getUserRole(user) === role;
};

/**
 * Guard for protected module routes.
 * - Redirects unauthenticated users to the home page ("/").
 * - Redirects authenticated users attempting to access a different role module to their own profile route.
 */
export const ProtectedRoute: React.FC<{ allowedRole?: RoleType }> = ({
  allowedRole,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && !isUserRole(user, allowedRole)) {
    return <Navigate to={getUserProfileRoute(user)} replace />;
  }

  return <Outlet />;
};

/**
 * Guard for public/auth routes (landing page, login, register).
 * - If an authenticated user tries to access these routes without logging out,
 *   redirects them to their active profile page.
 */
export const PublicOnlyRoute: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated && user) {
    return <Navigate to={getUserProfileRoute(user)} replace />;
  }

  return <Outlet />;
};
