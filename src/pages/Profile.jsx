import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import useAuthStore from "../store/useAuthStore";
import {
  User,
  Lock,
  Bell,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Briefcase,
  Fingerprint,
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "../components/Breadcrumb";

const Profile = () => {
  const queryClient = useQueryClient();
  const { user, login } = useAuthStore();
  const [activeTab, setActiveTab] = useState("general");

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.fullName || "",
    phoneNumber: user?.EmployeeProfile?.phoneNumber || "",
    address: user?.EmployeeProfile?.address || "",
    gender: user?.EmployeeProfile?.gender || "male",
    dateOfBirth: user?.EmployeeProfile?.dateOfBirth ? new Date(user.EmployeeProfile.dateOfBirth).toISOString().split("T")[0] : "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: (res) => {
      const updatedUser = res.data;
      // Merge with existing profile data which might not be in the update response
      login({ ...user, ...updatedUser });
      queryClient.invalidateQueries(["auth-info"]);
      toast.success("Cập nhật thông tin thành công");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Cập nhật thất bại");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data) => authApi.changePassword(data),
    onSuccess: () => {
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Đổi mật khẩu thành công");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Đổi mật khẩu thất bại");
    },
  });

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(personalInfo);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("Mật khẩu xác nhận không khớp");
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
    }
    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const tabs = [
    { id: "general", label: "Thông tin cá nhân", icon: User },
    { id: "security", label: "Bảo mật", icon: Shield },
    // { id: "notifications", label: "Thông báo", icon: Bell },
  ];

  return (
    <div className="space-y-6 animate-page-enter max-w-6xl mx-auto pb-10">
      <div className="flex flex-col space-y-2">
        <Breadcrumb items={[{ label: "Trang chủ" }, { label: "Cài đặt tài khoản", active: true }]} />
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Cài đặt tài khoản</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Quản lý thông tin hồ sơ và bảo mật của bạn</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-72 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl border border-primary/10">
            <h4 className="text-sm font-black text-primary uppercase tracking-wider mb-2">Trạng thái tài khoản</h4>
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Đang hoạt động</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 font-medium">Thành viên từ: {new Date(user?.createdAt).toLocaleDateString("vi-VN")}</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {activeTab === "general" && (
            <div className="space-y-6 animate-card-in">
              {/* Profile Card */}
              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 ring-4 ring-primary/10 ring-offset-4 ring-offset-white dark:ring-offset-gray-900 transition-all group-hover:ring-primary/30">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                          <User className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <button className="absolute bottom-0 right-0 p-2.5 bg-primary text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all">
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">{user?.fullName || "Chưa đặt tên"}</h2>
                    <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start mt-1">
                      <Mail className="w-4 h-4 mr-2" />
                      {user?.email}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-black uppercase tracking-wider">
                        {user?.roleId === 1 ? "Quản trị viên" : "Nhân viên"}
                      </span>
                      {user?.EmployeeProfile?.employeeCode && (
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-wider">
                          Mã NV: {user.EmployeeProfile.employeeCode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Họ và tên</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={personalInfo.fullName}
                        onChange={(e) => setPersonalInfo((p) => ({ ...p, fullName: e.target.value }))}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Số điện thoại</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={personalInfo.phoneNumber}
                        onChange={(e) => setPersonalInfo((p) => ({ ...p, phoneNumber: e.target.value }))}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Ngày sinh</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={personalInfo.dateOfBirth}
                        onChange={(e) => setPersonalInfo((p) => ({ ...p, dateOfBirth: e.target.value }))}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Giới tính</label>
                    <div className="flex p-1 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                      {["male", "female", "other"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setPersonalInfo((p) => ({ ...p, gender: g }))}
                          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                            personalInfo.gender === g
                              ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          {g === "male" ? "Nam" : g === "female" ? "Nữ" : "Khác"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Địa chỉ</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={personalInfo.address}
                        onChange={(e) => setPersonalInfo((p) => ({ ...p, address: e.target.value }))}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="Nhập địa chỉ của bạn"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="flex items-center space-x-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      <span>{updateProfileMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 animate-card-in">
              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                    <Fingerprint className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">Đổi mật khẩu</h3>
                    <p className="text-gray-500 text-sm font-medium">Nên sử dụng mật khẩu mạnh để bảo vệ tài khoản</p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Mật khẩu hiện tại</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                        className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((s) => ({ ...s, current: !s.current }))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Mật khẩu mới</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                        className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((s) => ({ ...s, new: !s.new }))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Xác nhận mật khẩu mới</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                        className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((s) => ({ ...s, confirm: !s.confirm }))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="flex items-center space-x-2 bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      <Lock className="w-5 h-5" />
                      <span>{changePasswordMutation.isPending ? "Đang xử lý..." : "Cập nhật mật khẩu"}</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-red-50 dark:bg-red-900/10 rounded-[2.5rem] p-8 border border-red-100 dark:border-red-900/20">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-red-900 dark:text-red-400">Khu vực nguy hiểm</h3>
                    <p className="text-red-600/70 text-sm font-medium mt-1">Một khi bạn thực hiện các thao tác này, sẽ không thể hoàn tác.</p>
                    <button className="mt-4 px-6 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all">
                      Vô hiệu hóa tài khoản
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
