import { useState } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  Search,
  Phone,
  Mail,
  MapPin,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  PackageOpen,
} from "lucide-react";
import { supplierApi } from "../../api/supplier.api";
import toast from "react-hot-toast";
import Breadcrumb from "../../components/Breadcrumb";

/* ───────────────────── Skeleton Loader ───────────────────── */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-4 py-5 md:px-8 md:py-6">
        <div className="h-4 rounded-lg bg-gray-100" style={{ width: `${50 + Math.random() * 40}%` }} />
      </td>
    ))}
  </tr>
);

/* ───────────────────── Delete Confirm Modal ───────────────────── */
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, name, isPending }) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-red-50">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="mb-2 text-center text-xl font-black text-gray-900">Xác nhận xóa</h3>
        <p className="mb-8 text-center text-sm text-gray-500">
          Bạn có chắc muốn xóa nhà cung cấp <span className="font-bold text-gray-700">"{name}"</span>?
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 rounded-2xl bg-red-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-600 active:scale-95"
          >
            {isPending ? (
              <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              "Xóa"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

/* ───────────────────── Form Modal ───────────────────── */
const SupplierFormModal = ({ isOpen, onClose, editingSupplier }) => {
  const queryClient = useQueryClient();
  const isEditing = Boolean(editingSupplier);

  const [formData, setFormData] = useState({
    supplierCode: editingSupplier?.supplierCode || "",
    supplierName: editingSupplier?.supplierName || "",
    phoneNumber: editingSupplier?.phoneNumber || "",
    email: editingSupplier?.email || "",
    address: editingSupplier?.address || "",
    description: editingSupplier?.description || "",
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      isEditing
        ? supplierApi.update(editingSupplier.id, data)
        : supplierApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success(isEditing ? "Cập nhật nhà cung cấp thành công" : "Tạo nhà cung cấp thành công");
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Không thể lưu nhà cung cấp");
    },
  });

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-6 backdrop-blur-sm sm:items-center sm:pt-4">
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl md:rounded-[2.5rem]">
        {/* Header */}
        <div className="relative bg-primary p-8 text-white">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 rounded-xl bg-white/20 p-2 transition hover:bg-white/30"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
              <Truck className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black">
                {isEditing ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp mới"}
              </h2>
              <p className="font-medium text-white/70">Nhập thông tin nhà cung cấp</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                Mã NCC <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="text"
                value={formData.supplierCode}
                onChange={handleChange("supplierCode")}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3.5 font-bold text-gray-700 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="VD: NCC-001"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                Tên NCC <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="text"
                value={formData.supplierName}
                onChange={handleChange("supplierName")}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3.5 font-bold text-gray-700 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="Tên nhà cung cấp"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange("phoneNumber")}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-5 font-bold text-gray-700 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="0912345678"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-5 font-bold text-gray-700 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Địa chỉ</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={formData.address}
                onChange={handleChange("address")}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-5 font-bold text-gray-700 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="Nhập địa chỉ"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Mô tả</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={handleChange("description")}
              className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3.5 font-bold text-gray-700 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="Ghi chú thêm..."
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-gray-200 bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-gray-500 transition-all hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center justify-center space-x-2 rounded-2xl bg-primary px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary-dark active:scale-95"
            >
              {mutation.isPending ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span>{isEditing ? "Cập nhật" : "Tạo mới"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

/* ───────────────────── Main Page ───────────────────── */
const Suppliers = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["suppliers", page, searchTerm],
    queryFn: async () => {
      const params = { page, pageSize: 10 };
      if (searchTerm.trim()) params.keyword = searchTerm.trim();
      const res = await supplierApi.findAll(params);
      return res.data || res;
    },
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => supplierApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Đã xóa nhà cung cấp");
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Không thể xóa nhà cung cấp");
    },
  });

  const suppliers = data?.items || [];
  const totalPage = data?.totalPage || 1;
  const totalItem = data?.totalItem || 0;

  const openCreateModal = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4">
          <Breadcrumb 
            items={[
              { label: "Trang chủ" },
              { label: "Nhà cung cấp", active: true }
            ]} 
          />
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-primary to-primary-dark px-6 py-4 font-black text-white shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          <span>THÊM NHÀ CUNG CẤP</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50 md:rounded-[2rem]">
        {/* Search & Stats */}
        <div className="flex flex-col justify-between gap-4 border-b border-gray-50 bg-gray-50/30 p-4 md:flex-row md:items-center md:gap-6 md:p-8">
          <div className="relative w-full flex-1 md:max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, mã, hoặc SĐT..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="text-sm font-bold uppercase tracking-widest text-gray-400">
            Tổng: <span className="ml-1 text-primary">{totalItem}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <th className="px-4 py-4 md:px-8 md:py-6">Nhà cung cấp</th>
                <th className="px-4 py-4 md:px-8 md:py-6">Mã NCC</th>
                <th className="px-4 py-4 md:px-8 md:py-6">Liên hệ</th>
                <th className="px-4 py-4 md:px-8 md:py-6">Địa chỉ</th>
                <th className="px-4 py-4 text-right md:px-8 md:py-6">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-16 text-center md:px-8 md:py-24">
                    <div className="flex flex-col items-center justify-center space-y-4 opacity-40">
                      <PackageOpen className="h-16 w-16 text-gray-300" />
                      <p className="text-xl font-bold uppercase tracking-widest text-gray-500">
                        Chưa có nhà cung cấp
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s.id} className="group transition-colors hover:bg-gray-50/50">
                    <td className="px-4 py-4 md:px-8 md:py-6">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/5 bg-gradient-to-br from-primary/10 to-primary/20 font-black text-xl text-primary">
                          {s.supplierName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-lg font-black leading-tight text-gray-900">{s.supplierName}</p>
                          {s.description && (
                            <p className="mt-0.5 max-w-[200px] truncate text-xs text-gray-400">{s.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 md:px-8 md:py-6">
                      <span className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-1 font-mono text-xs font-black text-gray-600">
                        {s.supplierCode}
                      </span>
                    </td>
                    <td className="px-4 py-4 md:px-8 md:py-6">
                      <div className="space-y-1">
                        <p className="flex items-center text-sm font-bold text-gray-700">
                          <Phone className="mr-2 h-3 w-3 text-primary/60" />
                          {s.phoneNumber || "—"}
                        </p>
                        <p className="flex items-center text-xs text-gray-400">
                          <Mail className="mr-2 h-3 w-3 text-gray-300" />
                          {s.email || "—"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 md:px-8 md:py-6">
                      <p className="max-w-[180px] truncate text-sm text-gray-500">{s.address || "—"}</p>
                    </td>
                    <td className="px-4 py-4 text-right md:px-8 md:py-6">
                      <div className="flex items-center justify-end space-x-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                        <button
                          onClick={() => openEditModal(s)}
                          className="rounded-2xl border border-gray-100 bg-white p-3 text-blue-500 shadow-sm transition-all hover:scale-105 hover:bg-blue-50 active:scale-95"
                          title="Sửa"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          className="rounded-2xl border border-gray-100 bg-white p-3 text-red-500 shadow-sm transition-all hover:scale-105 hover:bg-red-50 active:scale-95"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPage > 1 && (
          <div className="flex items-center justify-between border-t border-gray-50 px-4 py-4 md:px-8 md:py-6">
            <p className="text-xs font-bold text-gray-400">
              Trang {page} / {totalPage}
            </p>
            <div className="flex space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 transition-all hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= totalPage}
                onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
                className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 transition-all hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isModalOpen && (
        <SupplierFormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          editingSupplier={editingSupplier}
        />
      )}

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        name={deleteTarget?.supplierName}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
};

export default Suppliers;
