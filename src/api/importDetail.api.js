import axiosClient from "./axiosClient";

export const importDetailApi = {
  create: (data) => axiosClient.post("/import-details", data),
  update: (importId, productId, data) =>
    axiosClient.patch(`/import-details/${importId}/${productId}`, data),
  remove: (importId, productId) =>
    axiosClient.delete(`/import-details/${importId}/${productId}`),
};
