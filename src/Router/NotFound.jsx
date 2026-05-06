import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import { getDefaultRouteByRole } from "./routePaths";

const NotFound = () => {
  const { isAuthenticated, user } = useAuthStore();
  const target = isAuthenticated ? getDefaultRouteByRole(user?.roleId) : "/login";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm animate-page-enter">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">404</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">Không tìm thấy trang</h1>
        <p className="mt-2 text-sm text-slate-500">
          Đường dẫn này không tồn tại hoặc bạn không có quyền truy cập.
        </p>
        <Link
          to={target}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark"
        >
          <Home className="h-4 w-4" />
          Về trang chính
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
