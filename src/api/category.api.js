import axiosClient from "./axiosClient";

export const categoryApi = {
  findAll: () => axiosClient.get("/category"),
  findOne: (id) => axiosClient.get(`/category/${id}`),
  create: (data) => axiosClient.post("/category", data),
  update: (id, data) => axiosClient.patch(`/category/${id}`, data),
  hardDelete: (id) => axiosClient.delete(`/category/${id}/hard`),
};
