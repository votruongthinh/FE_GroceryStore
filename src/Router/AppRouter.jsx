import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import Dashboard from "../pages/admin/Dashboard";
import Analytics from "../pages/admin/Analytics";
import Categories from "../pages/admin/Categories";
import Employees from "../pages/admin/Employees";
import Products from "../pages/admin/Products";
import TransactionHistory from "../pages/admin/TransactionHistory";
import Login from "../pages/Login";
import Inventory from "../pages/staff/Inventory";
import POS from "../pages/staff/POS";
import StaffDashboard from "../pages/staff/StaffDashboard";
import StaffOrders from "../pages/staff/StaffOrders";
import VNPayReturn from "../pages/staff/VNPayReturn";
import useAuthStore from "../store/useAuthStore";
import NotFound from "./NotFound";
import ProtectedRoute from "./ProtectedRoute";
import { getDefaultRouteByRole, ROLE_IDS } from "./routePaths";

const HomeRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Navigate
      to={isAuthenticated ? getDefaultRouteByRole(user?.roleId) : "/login"}
      replace
    />
  );
};

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/vnpay-return" element={<VNPayReturn />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole={ROLE_IDS.admin}>
            <AppLayout role="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="employees" element={<Employees />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="history" element={<TransactionHistory />} />
      </Route>

      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRole={ROLE_IDS.staff}>
            <AppLayout role="staff" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="pos" element={<POS />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="orders" element={<StaffOrders />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
