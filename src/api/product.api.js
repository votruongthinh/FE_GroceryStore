import axiosClient from "./axiosClient";

export const productApi = {
  findAll: (params) => axiosClient.get("/product", { params }),
  inventory: (params) => axiosClient.get("/product/inventory", { params }),
  lowStock: (params) => axiosClient.get("/product/low-stock", { params }),
  findOne: (id) => axiosClient.get(`/product/${id}`),
  create: (formData) => axiosClient.post("/product", formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => axiosClient.put(`/product/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  hardDelete: (id) => axiosClient.delete(`/product/${id}`),
};
