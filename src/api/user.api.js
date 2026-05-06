import axiosClient from "./axiosClient";

export const userApi = {
  findAll: (params) => axiosClient.get("/users", { params }),
  findOne: (id) => axiosClient.get(`/users/${id}`),
  create: (data) => axiosClient.post("/users", data),
  update: (id, data) => axiosClient.put(`/users/${id}`, data),
  updateStatus: (id, status) => axiosClient.patch(`/users/${id}/status`, { status }),
  softDelete: (id) => axiosClient.delete(`/users/${id}/soft`),
};
