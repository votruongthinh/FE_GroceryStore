import axiosClient from "./axiosClient";

export const statisticApi = {
  getDashboard: (params) => axiosClient.get("/statistic/dashboard", { params }),
  getAnalytics: (params) => axiosClient.get("/statistic/analytics", { params }),
  getStaffDashboard: () => axiosClient.get("/statistic/staff/dashboard"),
  getAdminRevenue: (params) =>
    axiosClient.get("/statistic/admin/revenue", { params }),
};
