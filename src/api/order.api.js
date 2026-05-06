import axiosClient from "./axiosClient";

export const orderApi = {
  findAll: (params) => axiosClient.get("/order", { params }),
  findOne: (id) => axiosClient.get(`/order/${id}`),
  create: (data) => axiosClient.post("/order", data),
  update: (id, data) => axiosClient.patch(`/order/${id}`, data),
};
