import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { getDefaultRouteByRole } from "./routePaths";

const ProtectedRoute = ({ children, allowedRole }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const userRole = Number(user?.roleId);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to={getDefaultRouteByRole(userRole)} replace />;
  }

  return children;
};

export default ProtectedRoute;
