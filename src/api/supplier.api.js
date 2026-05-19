import axiosClient from "./axiosClient";

export const supplierApi = {
  findAll: (params) => axiosClient.get("/suppliers", { params }),
  findOne: (id) => axiosClient.get(`/suppliers/${id}`),
  create: (data) => axiosClient.post("/suppliers", data),
  update: (id, data) => axiosClient.patch(`/suppliers/${id}`, data),
  remove: (id) => axiosClient.delete(`/suppliers/${id}`),
};
