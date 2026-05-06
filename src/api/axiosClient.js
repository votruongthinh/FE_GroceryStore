import axios from "axios";
import useAuthStore from "../store/useAuthStore";

export const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3069/api";
export const IMAGE_URL =
  import.meta.env.VITE_IMAGE_URL || "http://localhost:3069/images";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const redirectToLogin = () => {
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

const extractTokens = (responseData) => {
  const payload = responseData?.data || responseData;

  return {
    accessToken: payload?.accessToken,
    refreshToken: payload?.refreshToken,
  };
};

axiosClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401) {
      useAuthStore.getState().logout();
      redirectToLogin();
      return Promise.reject(error);
    }

    if (status === 403 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { accessToken, refreshToken } = useAuthStore.getState();
        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          { accessToken, refreshToken },
          {
            withCredentials: true,
            headers: {
              Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
              "x-refresh-token": refreshToken || undefined,
            },
          },
        );

        const tokens = extractTokens(refreshResponse.data);
        if (!tokens.accessToken || !tokens.refreshToken) {
          throw new Error("Refresh token response is missing tokens");
        }

        useAuthStore.getState().setTokens(tokens);
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
