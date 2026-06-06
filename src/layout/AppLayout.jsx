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
  PackagePlus,
  ShoppingCart,
  Store,
  Truck,
  Users,
  X,
  Settings,
  Bell,
  ChevronRight,
} from "lucide-react";
import { authApi } from "../api/auth.api";
import NotificationCenter from "../components/NotificationCenter";
import useAuthStore from "../store/useAuthStore";

const SidebarItem = ({ icon, label, to, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `group mb-1 flex items-center rounded-2xl px-4 py-3.5 transition-all duration-300 ${
        isActive
          ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/25"
          : "text-slate-500 hover:bg-primary/5 hover:text-primary"
      }`
    }
  >
    {({ isActive }) => (
      <>
        {createElement(icon, { className: `mr-3 h-5 w-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}` })}
        <span className="font-semibold text-sm">{label}</span>
        {isActive && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
      </>
    )}
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
    { icon: LayoutDashboard, label: "Tổng quan", to: "/admin/dashboard" },
    { icon: BarChart2, label: "Phân tích doanh thu", to: "/admin/analytics" },
    { icon: Store, label: "Danh mục", to: "/admin/categories" },
    { icon: Package, label: "Sản phẩm", to: "/admin/products" },
    { icon: Truck, label: "Nhà cung cấp", to: "/admin/suppliers" },
    { icon: PackagePlus, label: "Nhập hàng", to: "/admin/imports" },
    { icon: Users, label: "Nhân viên", to: "/admin/employees" },
    { icon: History, label: "Lịch sử giao dịch", to: "/admin/history" },
    { icon: Settings, label: "Cài đặt tài khoản", to: "/admin/profile" },
  ];

  const staffLinks = [
    { icon: LayoutDashboard, label: "Bảng điều khiển", to: "/staff/dashboard" },
    { icon: ShoppingCart, label: "Bán hàng (POS)", to: "/staff/pos" },
    { icon: Boxes, label: "Kho hàng", to: "/staff/inventory" },
    { icon: History, label: "Lịch sử đơn hàng", to: "/staff/orders" },
    { icon: Settings, label: "Cài đặt tài khoản", to: "/staff/profile" },
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
    <div className="flex h-screen overflow-hidden bg-[#f5f7fb] font-sans">
      <div
        onClick={() => setIsSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[240px] shrink-0 flex-col border-r border-slate-100 bg-white transition-transform duration-300 md:static md:z-20 md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/25 transition-transform hover:rotate-6">
              <Store className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              RiceTiNi
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
          <p className="mb-4 px-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Menu chính
          </p>
          <nav className="space-y-1">
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

        <div className="p-4 mt-auto">
          <div className="bg-slate-50 rounded-[2rem] p-2 border border-slate-100">
            <div className="flex items-center space-x-3 p-2">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary shadow-sm ring-2 ring-white">
                  {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white"></div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{user?.fullName || "Admin"}</p>
                <p className="truncate text-[11px] font-semibold text-primary uppercase tracking-wider opacity-70">{roleLabel}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center space-x-2 rounded-2xl bg-white px-4 py-3 text-xs font-bold text-red-500 shadow-sm transition-all hover:bg-red-50 hover:text-red-600 active:scale-95 border border-red-100/50 mt-1"
            >
              <LogOut className="h-4 w-4" />
              <span>ĐĂNG XUẤT</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="relative z-10 flex w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-20 items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-2xl bg-slate-50 p-2.5 text-slate-500 transition hover:bg-primary/10 hover:text-primary md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-slate-900 md:text-xl">
                {role === "admin" ? "Bảng quản trị" : "Bảng nhân viên"}
              </h1>
              <p className="hidden truncate text-xs font-medium text-slate-400 uppercase tracking-wider sm:block opacity-60">
                {role === "admin" ? "Theo dõi và vận hành cửa hàng" : "Bán hàng và kiểm tra kho"}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 sm:gap-6">
            <NotificationCenter />
            <div className="h-8 w-[1px] bg-slate-100 hidden sm:block"></div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="hidden flex-col text-right sm:flex">
                <span className="truncate text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors">
                  {user?.fullName || "Xin chào"}
                </span>
                <span className="truncate text-[11px] font-semibold text-primary uppercase tracking-widest opacity-70">{roleLabel}</span>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-bold text-primary shadow-sm transition-transform group-hover:scale-105">
                {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
            <div key={location.pathname} className="min-h-full animate-page-enter">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
