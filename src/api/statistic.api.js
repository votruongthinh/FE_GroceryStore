import axiosClient from "./axiosClient";

export const statisticApi = {
  getDashboard: () => axiosClient.get("/statistic/dashboard"),
  getAnalytics: () => axiosClient.get("/statistic/analytics"),
  getStaffDashboard: () => axiosClient.get("/statistic/staff/dashboard"),
  getAdminRevenue: (params) =>
    axiosClient.get("/statistic/admin/revenue", { params }),
};
