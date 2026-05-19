import axiosClient from "./axiosClient";

export const importApi = {
  findAll: (params) => axiosClient.get("/imports", { params }),
  findOne: (id) => axiosClient.get(`/imports/${id}`),
  create: (data) => axiosClient.post("/imports", data),
  remove: (id) => axiosClient.delete(`/imports/${id}`),
};
