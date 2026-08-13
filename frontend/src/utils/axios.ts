import axios, {
  type AxiosRequestConfig,
  type Method,
  type AxiosResponse,
} from "axios";

// In-memory access token storage (short-lived, in React state memory)
let inMemoryAccessToken: string | null = null;

export const setInMemoryToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

export const getInMemoryToken = () => {
  return inMemoryAccessToken;
};

// Create base Axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to attach bearer token if present (prioritizes in-memory token)
api.interceptors.request.use(
  (config) => {
    const token =
      getInMemoryToken() ||
      localStorage.getItem("token") ||
      localStorage.getItem("arogya_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export type ApiMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | Method;

/**
 * Common API caller function where you pass the API route and data.
 *
 * @param route - API endpoint path (e.g., "/api/auth/login")
 * @param data - Data object for POST/PUT/PATCH or query parameters for GET/DELETE
 * @param method - HTTP Method (defaults to "POST")
 * @param config - Optional extra Axios request options
 */
export const callApi = async <T = any>(
  route: string,
  data: any = null,
  method: ApiMethod = "POST",
  config: AxiosRequestConfig = {},
): Promise<T> => {
  const normalizedMethod = (method || "POST").toUpperCase() as Method;
  const isQueryParamMethod =
    normalizedMethod === "GET" || normalizedMethod === "DELETE";

  let cleanRoute = route;
  const baseURL = api.defaults.baseURL || "";
  if (baseURL.endsWith("/api") && cleanRoute.startsWith("/api/")) {
    cleanRoute = cleanRoute.substring(4);
  }

  const response: AxiosResponse<T> = await api.request<T>({
    url: cleanRoute,
    method: normalizedMethod,
    ...(isQueryParamMethod ? { params: data } : { data }),
    ...config,
  });

  return response.data;
};

// Aliases and default export for flexibility
export const apiRequest = callApi;
export default callApi;
