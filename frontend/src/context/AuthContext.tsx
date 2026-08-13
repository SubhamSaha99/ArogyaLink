import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { setInMemoryToken, callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";
import { setCookie, getCookie, deleteCookie } from "@/utils/cookies";

export interface DoctorUser {
  doctorId: string;
  email: string;
  mobile: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken?: string;
  doctorId?: string;
  email?: string;
  mobile?: string;
}

interface AuthContextType {
  accessToken: string | null;
  user: DoctorUser | null;
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
  const [user, setUser] = useState<DoctorUser | null>(null);
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

    // 3. User details in React state
    setUser({
      doctorId: data.doctorId || "",
      email: data.email || "",
      mobile: data.mobile || "",
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

          if (data?.doctorId || data?.email || data?.mobile) {
            setUser((prev) => ({
              doctorId: data.doctorId || prev?.doctorId || "",
              email: data.email || prev?.email || "",
              mobile: data.mobile || prev?.mobile || "",
            }));
          }

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
