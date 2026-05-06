import { useState } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  Mail,
  Phone,
  X,
  UserCheck,
  UserMinus,
  Check,
  User,
  Lock,
  Unlock,
} from "lucide-react";
import { userApi } from "../../api/user.api";
import toast from "react-hot-toast";
import useAuthStore from "../../store/useAuthStore";

const Employees = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: "",
    roleId: 2,
    phoneNumber: "",
    gender: "male",
    dateOfBirth: "",
    address: "",
    employeeCode: "",
    status: true,
  });

  const { data: rawUsers, isLoading, isError, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await userApi.findAll();
      return res.data || res;
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data) => (data.id ? userApi.update(data.id, data) : userApi.create(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(editingEmployee ? "Cập nhật nhân viên thành công" : "Thêm nhân viên thành công");
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Không thể lưu nhân viên");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => userApi.softDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Da xoa nhan vien");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }) => userApi.updateStatus(id, status),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(variables.status ? "Đã mở khóa tài khoản nhân viên" : "Đã khóa tài khoản nhân viên");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Không thể cập nhật trạng thái tài khoản");
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn vô hiệu hóa tài khoản này?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (emp) => {
    if (emp.id === currentUser?.id) {
      toast.error("Bạn không thể khóa tài khoản của chính mình");
      return;
    }

    const currentStatus = emp.EmployeeProfile?.status ?? true;
    const nextStatus = !currentStatus;
    const message = nextStatus ? "Mở khóa tài khoản nay?" : "Khóa tạm thời tài khoản này?";

    if (window.confirm(message)) {
      toggleStatusMutation.mutate({ id: emp.id, status: nextStatus });
    }
  };

  const openModal = (emp = null) => {
    if (emp) {
      setEditingEmployee(emp);
      setFormData({
        id: emp.id,
        email: emp.email,
        fullName: emp.fullName || "",
        password: "",
        roleId: emp.roleId,
        phoneNumber: emp.EmployeeProfile?.phoneNumber || "",
        gender: emp.EmployeeProfile?.gender || "male",
        dateOfBirth: emp.EmployeeProfile?.dateOfBirth ? emp.EmployeeProfile.dateOfBirth.split("T")[0] : "",
        address: emp.EmployeeProfile?.address || "",
        employeeCode: emp.EmployeeProfile?.employeeCode || "",
        status: emp.EmployeeProfile?.status ?? true,
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        email: "",
        fullName: "",
        password: "",
        roleId: 2,
        phoneNumber: "",
        gender: "male",
        dateOfBirth: "",
        address: "",
        employeeCode: "",
        status: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const employees = Array.isArray(rawUsers?.items) ? rawUsers.items : (Array.isArray(rawUsers) ? rawUsers : []);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.EmployeeProfile?.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center text-2xl font-black tracking-tight text-gray-900 md:text-3xl">
            <Users className="w-8 h-8 mr-3 text-primary stroke-[2.5px]" />
            Thành Viên Nhân Sự
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Tổng quan nhân sự và quyền truy cập của cửa hàng.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex w-full items-center justify-center space-x-2 rounded-2xl bg-primary px-6 py-3.5 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark active:scale-95 sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm nhân viên</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50 md:rounded-[2rem]">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-50 bg-gray-50/30 p-4 md:flex-row md:items-center md:p-8 md:gap-6">
          <div className="relative w-full flex-1 md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, email hoặc mã nhân viên..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Tổng Nhân Sự: <span className="text-primary ml-1">{employees.length}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                <th className="px-4 py-4 md:px-8 md:py-6">Hồ sơ nhân viên</th>
                <th className="px-4 py-4 md:px-8 md:py-6">Mã nội bộ</th>
                <th className="px-4 py-4 md:px-8 md:py-6">Thông tin liên hệ</th>
                <th className="px-4 py-4 md:px-8 md:py-6">Vai Trò & Trạng Thái</th>
                <th className="px-4 py-4 text-right md:px-8 md:py-6">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-16 text-center md:px-8 md:py-24">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <p className="text-gray-400 font-bold animate-pulse">Đang đồng bộ dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan="5" className="px-4 py-16 text-center md:px-8 md:py-24">
                    <p className="text-red-500 font-semibold">
                      Không thể tải danh sách nhân viên: {error?.response?.data?.message || error?.message}
                    </p>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-16 text-center md:px-8 md:py-24">
                    <div className="flex flex-col items-center justify-center space-y-4 opacity-40">
                      <Users className="w-16 h-16 text-gray-300" />
                      <p className="text-gray-500 font-bold text-xl uppercase tracking-widest">Không có nhân sự phù hợp</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4 md:px-8 md:py-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 text-primary flex items-center justify-center font-black text-xl border border-primary/5">
                            {emp.fullName ? emp.fullName.charAt(0) : <User className="w-6 h-6" />}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${emp.EmployeeProfile?.status ? "bg-green-500" : "bg-gray-400"}`}></div>
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-lg leading-tight">{emp.fullName || "Chưa cập nhật tên"}</p>
                          <p className="text-xs text-gray-400 font-bold mt-1 flex items-center">
                            <Mail className="w-3 h-3 mr-1" /> {emp.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 md:px-8 md:py-6">
                      <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-black font-mono">
                        {emp.EmployeeProfile?.employeeCode || "---"}
                      </span>
                    </td>
                    <td className="px-4 py-4 md:px-8 md:py-6">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-700 flex items-center">
                          <Phone className="w-3 h-3 mr-2 text-primary/60" />
                          {emp.EmployeeProfile?.phoneNumber || "Chưa có số điện thoại"}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium truncate max-w-[150px]">
                          {emp.EmployeeProfile?.address || "Chưa có địa chỉ"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 md:px-8 md:py-6">
                      <div className="flex flex-col space-y-2">
                        <span className={`inline-flex w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${emp.roleId === 1 ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          }`}>
                          {emp.Roles?.name || (emp.roleId === 1 ? "Quan tri vien" : "Nhan vien")}
                        </span>
                        <span className={`text-[10px] font-bold flex items-center ${emp.EmployeeProfile?.status ? "text-green-500" : "text-gray-400"}`}>
                          {emp.EmployeeProfile?.status ? <UserCheck className="w-3 h-3 mr-1" /> : <UserMinus className="w-3 h-3 mr-1" />}
                          {emp.EmployeeProfile?.status ? "ĐANG HOẠT ĐỘNG" : "TẠM KHOÁ"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right md:px-8 md:py-6">
                      <div className="flex items-center justify-end space-x-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                        <button
                          onClick={() => openModal(emp)}
                          className="p-3 bg-white hover:bg-blue-50 text-blue-500 rounded-2xl border border-gray-100 shadow-sm transition-all hover:scale-105 active:scale-95"
                          title="Sửa nhân viên"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(emp)}
                          className={`p-3 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:scale-105 active:scale-95 ${emp.EmployeeProfile?.status ? "hover:bg-amber-50 text-amber-600" : "hover:bg-emerald-50 text-emerald-600"
                            }`}
                          title={emp.EmployeeProfile?.status ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                        >
                          {emp.EmployeeProfile?.status ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-3 bg-white hover:bg-red-50 text-red-500 rounded-2xl border border-gray-100 shadow-sm transition-all hover:scale-105 active:scale-95"
                          title="Xóa nhân viên"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-6 backdrop-blur-sm sm:items-center sm:pt-4 animate-in fade-in duration-300">
          <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-300 md:rounded-[2.5rem]">
            <div className="bg-primary p-8 text-white relative">
              <button
                onClick={closeModal}
                className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black">{editingEmployee ? "Cập nhật thông tin nhân sự" : "Thêm nhân viên mới"}</h2>
                  <p className="text-white/70 font-medium">Nhập thông tin cần thiết để tạo tài khoản.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6 md:space-y-8 md:p-10">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                <div className="space-y-6">
                  <h4 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Thông tin đăng nhập</h4>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Họ và tên</label>
                    <input
                      required
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-gray-700"
                      placeholder="Ví dụ: Nguyen Van A"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Email tài khoản</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-11 pr-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-gray-700"
                        placeholder="nhanvien@store.com"
                      />
                    </div>
                  </div>

                  {!editingEmployee && (
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Mật khẩu tạm thời</label>
                      <input
                        required
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-gray-700"
                        placeholder="••••••••"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Vai trò</label>
                    <select
                      value={formData.roleId}
                      onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-gray-700 appearance-none cursor-pointer"
                    >
                      <option value={2}>Nhân viên</option>
                      <option value={1}>Quản trị viên</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-xs font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Hồ sơ cá nhân</h4>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Mã nhân viên</label>
                      <input
                        type="text"
                        value={formData.employeeCode}
                        onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-black text-gray-700 font-mono text-sm"
                        placeholder="EMP-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Trạng thái</label>
                      <div className="flex items-center h-[54px] space-x-2 px-4 bg-gray-50 border border-gray-200 rounded-2xl">
                        <input
                          type="checkbox"
                          checked={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                          className="w-5 h-5 rounded-md text-primary focus:ring-primary"
                        />
                        <span className="text-xs font-bold text-gray-500 uppercase">Đang hoạt động</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Số điện thoại</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-gray-700"
                        placeholder="+84 ..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Giới tính</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-gray-700"
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Ngày sinh</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-gray-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Địa chỉ</label>
                    <textarea
                      rows="1"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-gray-700 resize-none"
                      placeholder="Nhập địa chỉ đầy đủ..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end md:pt-8">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-gray-200 bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-gray-500 transition-all hover:bg-gray-50"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex items-center justify-center space-x-2 rounded-2xl bg-primary px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary-dark active:scale-95"
                >
                  {saveMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{editingEmployee ? "Cập nhật" : "Xác nhận thêm"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};

export default Employees;
