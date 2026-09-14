import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { setInMemoryToken, callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";
import { setCookie, getCookie, deleteCookie } from "@/utils/cookies";

export interface User {
  userPrimaryKey?: number;
  doctorPrimaryKey?: number;
  doctorId?: string;
  patientPrimaryKey?: number;
  patientId?: string;
  healthInstitutePrimaryKey?: number;
  healthInstituteId?: string;
  healthInstituteName?: string;
  healthInstituteType?: number;
  role?: "DOCTOR" | "HEALTH_INSTITUTE" | "PATIENT" | string;
  userBusinessId?: string;
  email: string;
  mobile?: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken?: string;
  userPrimaryKey?: number;
  doctorPrimaryKey?: number;
  doctorId?: string;
  patientPrimaryKey?: number;
  patientId?: string;
  healthInstitutePrimaryKey?: number;
  healthInstituteId?: string;
  healthInstituteName?: string;
  healthInstituteType?: number;
  role?: string;
  userBusinessId?: string;
  email?: string;
  mobile?: string;
}

interface DecodedJwtPayload {
  sessionId?: string;
  userPrimaryKey?: number;
  userBusinessId?: string;
  role?: string;
  exp?: number;
  iat?: number;
}

export function decodeJwt(token: string): DecodedJwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

interface AuthContextType {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginResponseData) => void;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Access Token: In-memory React State (Short-lived, not saved to disk/localStorage)
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hasInitAuthRef = useRef(false);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  // Keep React state and Axios in-memory token synchronized
  const updateAccessToken = (token: string | null) => {
    setAccessTokenState(token);
    setInMemoryToken(token);
  };

  const login = (data: LoginResponseData) => {
    // 1. Store Access Token in React Context state (in-memory)
    updateAccessToken(data.accessToken);

    // 2. Store Refresh Token in Browser Cookie
    if (data.refreshToken) {
      setCookie("refreshToken", data.refreshToken, 7);
    }

    // 3. Decode JWT payload to guarantee role & business ID presence
    const decoded = decodeJwt(data.accessToken);
    const role = decoded?.role || data.role;
    const userBusinessId = decoded?.userBusinessId || data.userBusinessId || data.doctorId || data.patientId || data.healthInstituteId;
    const userPrimaryKey = decoded?.userPrimaryKey || data.userPrimaryKey;

    const isDoc = role === "DOCTOR" || userBusinessId?.startsWith("AGL-DOC") || !!data.doctorId || !!data.doctorPrimaryKey;
    const isIns = role === "HEALTH_INSTITUTE" || userBusinessId?.startsWith("AGL-INS") || !!data.healthInstituteId || !!data.healthInstitutePrimaryKey;
    const isPat = role === "PATIENT" || userBusinessId?.startsWith("AGL-PAT") || !!data.patientId || !!data.patientPrimaryKey;

    // 4. User details in React state
    setUser({
      userPrimaryKey,
      doctorPrimaryKey: isDoc ? (data.doctorPrimaryKey || userPrimaryKey) : undefined,
      doctorId: isDoc ? (data.doctorId || userBusinessId) : undefined,
      patientPrimaryKey: isPat ? (data.patientPrimaryKey || userPrimaryKey) : undefined,
      patientId: isPat ? (data.patientId || userBusinessId) : undefined,
      healthInstitutePrimaryKey: isIns ? (data.healthInstitutePrimaryKey || userPrimaryKey) : undefined,
      healthInstituteId: isIns ? (data.healthInstituteId || userBusinessId) : undefined,
      healthInstituteName: data.healthInstituteName,
      healthInstituteType: data.healthInstituteType,
      role: role || (isDoc ? "DOCTOR" : isIns ? "HEALTH_INSTITUTE" : isPat ? "PATIENT" : undefined),
      userBusinessId: userBusinessId,
      email: data.email || "",
      mobile: data.mobile,
    });
  };

  const logout = async () => {
    try {
      await callApi(API_ROUTES.logout, null, "GET");
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      updateAccessToken(null);
      deleteCookie("refreshToken");
      setUser(null);
      // Clean up any remaining legacy localStorage keys
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("arogya_token");
        localStorage.removeItem("arogya_doctor_authenticated");
        localStorage.removeItem("arogya_doctor_name");
        localStorage.removeItem("arogya_doctor_id");
        localStorage.removeItem("arogya_doctor_email");
        localStorage.removeItem("arogya_doctor_mobile");
        localStorage.removeItem("arogya_institute_name");
        localStorage.removeItem("arogya_institute_email");
      } catch {
        // ignore localStorage access errors
      }
    }
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    // Deduplicate concurrent refresh calls by returning existing in-flight promise
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    refreshPromiseRef.current = (async () => {
      try {
        const storedRefreshToken = getCookie("refreshToken");
        if (!storedRefreshToken) {
          updateAccessToken(null);
          setUser(null);
          return null;
        }

        // Send POST request to /api/auth/refreshToken with body { refreshToken }
        const res = await callApi(
          API_ROUTES.refreshToken,
          { refreshToken: storedRefreshToken },
          "POST"
        );

        const data = res?.data || res;
        if (data?.accessToken) {
          // Update in-memory Access Token
          updateAccessToken(data.accessToken);

          // Update Refresh Token cookie if a new rotated refresh token is returned
          if (data?.refreshToken) {
            setCookie("refreshToken", data.refreshToken, 7);
          }

          const decoded = decodeJwt(data.accessToken);
          const role = decoded?.role;
          const userBusinessId = decoded?.userBusinessId;
          const userPrimaryKey = decoded?.userPrimaryKey;

          const isDoc = role === "DOCTOR" || userBusinessId?.startsWith("AGL-DOC") || !!data.doctorId;
          const isIns = role === "HEALTH_INSTITUTE" || userBusinessId?.startsWith("AGL-INS") || !!data.healthInstituteId;
          const isPat = role === "PATIENT" || userBusinessId?.startsWith("AGL-PAT") || !!data.patientId;

          setUser((prev) => ({
            ...prev,
            userPrimaryKey: userPrimaryKey || prev?.userPrimaryKey,
            role: role || prev?.role || (isDoc ? "DOCTOR" : isIns ? "HEALTH_INSTITUTE" : isPat ? "PATIENT" : undefined),
            userBusinessId: userBusinessId || prev?.userBusinessId,
            doctorId: isDoc ? (userBusinessId || data.doctorId || prev?.doctorId) : prev?.doctorId,
            doctorPrimaryKey: isDoc ? (userPrimaryKey || prev?.doctorPrimaryKey) : prev?.doctorPrimaryKey,
            healthInstituteId: isIns ? (userBusinessId || data.healthInstituteId || prev?.healthInstituteId) : prev?.healthInstituteId,
            healthInstitutePrimaryKey: isIns ? (userPrimaryKey || prev?.healthInstitutePrimaryKey) : prev?.healthInstitutePrimaryKey,
            healthInstituteName: data.healthInstituteName || prev?.healthInstituteName,
            healthInstituteType: data.healthInstituteType || prev?.healthInstituteType,
            patientId: isPat ? (userBusinessId || data.patientId || prev?.patientId) : prev?.patientId,
            patientPrimaryKey: isPat ? (userPrimaryKey || prev?.patientPrimaryKey) : prev?.patientPrimaryKey,
            email: data.email || prev?.email || "",
            mobile: data.mobile || prev?.mobile || "",
          }));

          return data.accessToken;
        }
      } catch (e) {
        deleteCookie("refreshToken");
        updateAccessToken(null);
        setUser(null);
      } finally {
        refreshPromiseRef.current = null;
      }
      return null;
    })();

    return refreshPromiseRef.current;
  };

  // 1. Initial auth check on app load / page reload
  useEffect(() => {
    if (hasInitAuthRef.current) return;
    hasInitAuthRef.current = true;

    const initAuth = async () => {
      await refreshAccessToken();
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // 2. Automatic silent token refresh every 180 seconds (3 minutes) when authenticated
  useEffect(() => {
    if (!accessToken) return;

    const REFRESH_INTERVAL_MS = 180 * 1000; // 180s interval

    const intervalId = setInterval(async () => {
      const storedRefreshToken = getCookie("refreshToken");
      if (storedRefreshToken) {
        await refreshAccessToken();
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        isAuthenticated: !!accessToken,
        isLoading,
        login,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
