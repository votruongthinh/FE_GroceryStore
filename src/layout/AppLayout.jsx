import { createElement, useEffect, useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart2,
  Boxes,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  Store,
  Users,
  X,
} from "lucide-react";
import { authApi } from "../api/auth.api";
import NotificationCenter from "../components/NotificationCenter";
import useAuthStore from "../store/useAuthStore";

const SidebarItem = ({ icon, label, to, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `mb-1 flex items-center rounded-xl px-4 py-3 transition-all duration-200 ${
        isActive
          ? "bg-primary text-white shadow-md shadow-primary/20"
          : "text-slate-500 hover:bg-primary/10 hover:text-primary"
      }`
    }
  >
    {createElement(icon, { className: "mr-3 h-5 w-5" })}
    <span className="font-semibold">{label}</span>
  </NavLink>
);

const AppLayout = ({ role }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error(err);
    } finally {
      logout();
      navigate("/login", { replace: true });
    }
  };

  const adminLinks = [
    { icon: LayoutDashboard, label: "Bảng điều khiển", to: "/admin/dashboard" },
    { icon: BarChart2, label: "Phân tích", to: "/admin/analytics" },
    { icon: Users, label: "Nhân viên", to: "/admin/employees" },
    { icon: Package, label: "Sản phẩm", to: "/admin/products" },
    { icon: Store, label: "Danh mục", to: "/admin/categories" },
    { icon: History, label: "Lịch sử giao dịch", to: "/admin/history" },
  ];

  const staffLinks = [
    { icon: LayoutDashboard, label: "Bảng điều khiển", to: "/staff/dashboard" },
    { icon: ShoppingCart, label: "Bán hàng (POS)", to: "/staff/pos" },
    { icon: Boxes, label: "Kho hàng", to: "/staff/inventory" },
    { icon: History, label: "Lịch sử đơn hàng", to: "/staff/orders" },
  ];

  const links = role === "admin" ? adminLinks : staffLinks;
  const roleLabel = role === "admin" ? "Quản trị viên" : "Nhân viên";

  useEffect(() => {
    if (!isSidebarOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans">
      <div
        onClick={() => setIsSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out md:hidden ${
          isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white shadow-2xl shadow-slate-900/20 transition-transform duration-300 ease-in-out md:static md:z-20 md:translate-x-0 md:shadow-sm ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 md:p-6">
          <div className="flex min-w-0 items-center space-x-3">
            <div className="rounded-xl bg-primary/10 p-2">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <span className="truncate bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-xl font-black text-transparent">
              GroceryPOS
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 md:hidden"
            aria-label="Đóng menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
          <p className="mb-4 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Danh mục
          </p>
          <nav className="flex-1">
            {links.map((link) => (
              <SidebarItem
                key={link.to}
                icon={link.icon}
                label={link.label}
                to={link.to}
                onClick={() => setIsSidebarOpen(false)}
              />
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-100 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center rounded-xl px-4 py-3 text-red-500 transition-colors duration-200 hover:bg-red-50"
          >
            <LogOut className="mr-3 h-5 w-5" />
            <span className="font-semibold">Đăng xuất</span>
          </button>
        </div>
      </aside>

      <div className="relative z-10 flex w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 shadow-sm backdrop-blur md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary md:hidden"
              aria-label="Mở menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="min-w-0">
            <h1 className="truncate text-base font-black text-slate-900 md:text-lg">
              {role === "admin" ? "Bảng quản trị" : "Bảng nhân viên"}
            </h1>
            <p className="hidden truncate text-xs font-medium text-slate-400 sm:block">
              {role === "admin" ? "Theo dõi và vận hành cửa hàng" : "Bán hàng và kiểm tra kho"}
            </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 sm:gap-6">
            <NotificationCenter />
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex max-w-[96px] flex-col text-right sm:max-w-none">
                <span className="truncate text-xs font-semibold text-slate-800 sm:text-sm">
                  {user?.fullName || "Xin chào"}
                </span>
                <span className="truncate text-[11px] font-semibold text-primary sm:text-xs">{roleLabel}</span>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-black text-primary shadow-sm sm:h-10 sm:w-10">
                {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-4 md:p-6">
          <div key={location.pathname} className="mx-auto max-w-7xl animate-page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
