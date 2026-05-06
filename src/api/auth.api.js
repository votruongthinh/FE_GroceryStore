import axiosClient from "./axiosClient";

export const authApi = {
  login: (data) => axiosClient.post("/auth/login", data),
  register: (data) => axiosClient.post("/auth/register", data),
  logout: () => axiosClient.post("/auth/logout"), // optional if backend supports, otherwise just clear frontend state
  getInfo: () => axiosClient.get("/auth/get-info"),
};
