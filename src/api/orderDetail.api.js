import axiosClient from "./axiosClient";

export const orderDetailApi = {
  create: (data) => axiosClient.post("/order-detail", data),
  findAllByOrderId: (orderId) => axiosClient.get(`/order-detail/${orderId}`),
  findOne: (orderId, productId) => axiosClient.get(`/order-detail/${orderId}/${productId}`),
  update: (orderId, productId, data) => axiosClient.patch(`/order-detail/${orderId}/${productId}`, data),
};
