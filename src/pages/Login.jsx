import { createElement, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Store,
  User,
} from "lucide-react";
import heroImage from "../assets/hero.png";
import { authApi } from "../api/auth.api";
import { getDefaultRouteByRole } from "../Router/routePaths";
import useAuthStore from "../store/useAuthStore";

const initialFormData = {
  email: "",
  password: "",
  fullName: "",
  confirmPassword: "",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const extractTokens = (payload) => {
  const data = payload?.data || payload;
  return {
    accessToken: data?.accessToken,
    refreshToken: data?.refreshToken,
  };
};

const validateForm = (formData, isLoginMode) => {
  const errors = {};
  const email = formData.email.trim();
  const password = formData.password;

  if (!email) {
    errors.email = "Vui lòng nhập email.";
  } else if (!emailRegex.test(email)) {
    errors.email = "Email không đúng định dạng.";
  }

  if (!password) {
    errors.password = "Vui lòng nhập mật khẩu.";
  } else if (password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
  }

  if (!isLoginMode) {
    if (!formData.fullName.trim()) {
      errors.fullName = "Vui lòng nhập họ và tên.";
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = "Họ tên phải có ít nhất 2 ký tự.";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    } else if (formData.confirmPassword !== password) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }
  }

  return errors;
};

const TextField = ({
  error,
  icon,
  label,
  name,
  onChange,
  placeholder,
  type = "text",
  value,
  trailing,
}) => (
  <div className="space-y-2">
    <label htmlFor={name} className="text-xs font-black uppercase tracking-widest text-slate-500">
      {label}
    </label>
    <div className="relative">
      {createElement(icon, {
        className: "absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400",
      })}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-xl border bg-white py-3.5 pl-12 pr-12 text-sm font-semibold text-slate-800 outline-none transition focus:ring-4 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-slate-200 focus:border-primary focus:ring-primary/10"
        }`}
        placeholder={placeholder}
      />
      {trailing}
    </div>
    {error ? (
      <p className="flex items-center gap-1.5 text-xs font-semibold text-red-500">
        <AlertCircle className="h-3.5 w-3.5" />
        {error}
      </p>
    ) : null}
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, setTokens, user } = useAuthStore();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.roleId) {
      navigate(getDefaultRouteByRole(user.roleId), { replace: true });
    }
  }, [isAuthenticated, navigate, user?.roleId]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (loginRes) => {
      try {
        const tokens = extractTokens(loginRes);
        if (!tokens.accessToken || !tokens.refreshToken) {
          throw new Error("Login response is missing tokens");
        }

        setTokens(tokens);
        const infoRes = await authApi.getInfo();
        const loggedInUser = infoRes.data || infoRes;

        login(loggedInUser, tokens);

        const redirectPath = location.state?.from?.pathname;
        const fallbackPath = getDefaultRouteByRole(loggedInUser.roleId);
        navigate(redirectPath && redirectPath !== "/login" ? redirectPath : fallbackPath, {
          replace: true,
        });
      } catch (err) {
        console.error(err);
        setServerError("Không thể tải thông tin người dùng.");
      }
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Thông tin đăng nhập không hợp lệ.";
      setServerError(msg);
      toast.error(msg);
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      const message = "Đăng ký thành công. Bạn có thể đăng nhập ngay.";
      toast.success(message);
      setSuccessMsg(message);
      setIsLoginMode(true);
      setFormData(initialFormData);
      setFieldErrors({});
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Đăng ký thất bại.";
      setServerError(msg);
      toast.error(msg);
    },
  });

  const pending = loginMutation.isPending || registerMutation.isPending;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
    setSuccessMsg("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMsg("");

    const errors = validateForm(formData, isLoginMode);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    if (isLoginMode) {
      loginMutation.mutate({
        email: formData.email.trim(),
        password: formData.password,
      });
      return;
    }

    registerMutation.mutate({
      email: formData.email.trim(),
      fullName: formData.fullName.trim(),
      password: formData.password,
    });
  };

  const toggleMode = () => {
    setIsLoginMode((prev) => !prev);
    setFieldErrors({});
    setServerError("");
    setSuccessMsg("");
    setFormData(initialFormData);
  };

  const passwordTrailing = (
    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-primary"
      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
    >
      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
    </button>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-900">
      <img
        src={heroImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-slate-950/60" />

      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_480px]">
        <section className="hidden items-end p-10 text-white lg:flex">
          <div className="max-w-2xl animate-page-enter">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest backdrop-blur">
              <Store className="h-4 w-4" />
              GroceryPOS
            </div>
            <h1 className="text-5xl font-black leading-tight">
              Quản lý cửa hàng rõ ràng, nhanh và đúng phiên đăng nhập.
            </h1>
          </div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white/95 p-7 shadow-2xl backdrop-blur animate-card-in">
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm animate-soft-float">
                <Store className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black text-slate-950">
                {isLoginMode ? "Đăng nhập hệ thống" : "Tạo tài khoản mới"}
              </h2>
            </div>

            {serverError ? (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {serverError}
              </div>
            ) : null}

            {successMsg ? (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                {successMsg}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLoginMode ? (
                <TextField
                  icon={User}
                  label="Họ và tên"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  error={fieldErrors.fullName}
                />
              ) : null}

              <TextField
                icon={Mail}
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                error={fieldErrors.email}
              />

              <TextField
                icon={Lock}
                label="Mật khẩu"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                error={fieldErrors.password}
                trailing={passwordTrailing}
              />

              {!isLoginMode ? (
                <TextField
                  icon={Lock}
                  label="Xác nhận mật khẩu"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                  error={fieldErrors.confirmPassword}
                />
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-primary py-3.5 font-black text-white shadow-lg shadow-primary/25 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="absolute inset-0 -translate-x-full bg-white/20 group-hover:animate-shine" />
                {pending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isLoginMode ? (
                  "Đăng nhập"
                ) : (
                  "Đăng ký"
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between gap-3 text-sm">
              <button
                type="button"
                onClick={toggleMode}
                className="font-bold text-primary transition hover:text-primary-dark"
              >
                {isLoginMode ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
