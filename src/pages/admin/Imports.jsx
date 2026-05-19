import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PackagePlus, Search, Eye, Trash2, Plus, X, Check, ChevronLeft, ChevronRight, AlertTriangle, PackageOpen, ShoppingCart, Minus } from "lucide-react";
import { importApi } from "../../api/import.api";
import { supplierApi } from "../../api/supplier.api";
import { productApi } from "../../api/product.api";
import toast from "react-hot-toast";
import Breadcrumb from "../../components/Breadcrumb";

const fmt = (v) => Number(v || 0).toLocaleString("vi-VN") + "đ";

const SkeletonRow = () => (<tr className="animate-pulse">{[...Array(6)].map((_, i) => (<td key={i} className="px-4 py-5 md:px-8"><div className="h-4 rounded-lg bg-gray-100" style={{ width: `${50 + Math.random() * 40}%` }} /></td>))}</tr>);

const DeleteModal = ({ isOpen, onClose, onConfirm, code, isPending }) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50"><AlertTriangle className="h-8 w-8 text-red-500" /></div>
        <h3 className="mb-2 text-center text-xl font-black text-gray-900">Xác nhận xóa</h3>
        <p className="mb-8 text-center text-sm text-gray-500">Xóa phiếu nhập <span className="font-bold text-gray-700">{code}</span>? Tồn kho sẽ được hoàn lại.</p>
        <div className="flex space-x-3">
          <button onClick={onClose} className="flex-1 rounded-2xl border border-gray-200 px-6 py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50">Hủy</button>
          <button onClick={onConfirm} disabled={isPending} className="flex-1 rounded-2xl bg-red-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 hover:bg-red-600 active:scale-95">
            {isPending ? <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" /> : "Xóa"}
          </button>
        </div>
      </div>
    </div>, document.body);
};

const DetailModal = ({ imp, onClose }) => {
  if (!imp) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-6 backdrop-blur-sm sm:items-center sm:pt-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl md:rounded-[2.5rem] overflow-hidden">
        <div className="bg-primary p-8 text-white relative">
          <button onClick={onClose} className="absolute right-6 top-6 rounded-xl bg-white/20 p-2 hover:bg-white/30"><X className="h-5 w-5" /></button>
          <h2 className="text-2xl font-black flex items-center"><Eye className="mr-3 h-6 w-6" />Chi tiết phiếu nhập</h2>
          <p className="text-white/70 font-medium mt-1">{imp.importCode}</p>
        </div>
        <div className="p-6 md:p-8 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-400 font-bold text-xs uppercase">Nhà cung cấp</span><p className="font-black text-gray-900">{imp.Suppliers?.supplierName}</p></div>
            <div><span className="text-gray-400 font-bold text-xs uppercase">Nhân viên nhập</span><p className="font-black text-gray-900">{imp.Users?.fullName}</p></div>
            <div><span className="text-gray-400 font-bold text-xs uppercase">Ngày nhập</span><p className="font-bold text-gray-700">{new Date(imp.importDate).toLocaleDateString("vi-VN")}</p></div>
            <div><span className="text-gray-400 font-bold text-xs uppercase">Tổng tiền</span><p className="font-black text-primary text-lg">{fmt(imp.totalAmount)}</p></div>
          </div>
          {imp.note && <p className="text-sm text-gray-500 italic bg-gray-50 rounded-xl p-3">📝 {imp.note}</p>}
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-sm text-left">
              <thead><tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <th className="px-4 py-3">Sản phẩm</th><th className="px-4 py-3">SL</th><th className="px-4 py-3">Giá nhập</th><th className="px-4 py-3">Thành tiền</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {imp.ImportDetails?.map((d, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-bold text-gray-800">{d.Product?.productName || `SP #${d.productId}`}</td>
                    <td className="px-4 py-3 font-mono font-bold">{d.quantity}</td>
                    <td className="px-4 py-3">{fmt(d.importPrice)}</td>
                    <td className="px-4 py-3 font-bold text-primary">{fmt(d.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>, document.body);
};

const CreateModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [supplierId, setSupplierId] = useState("");
  const [note, setNote] = useState("");
  const [lines, setLines] = useState([{ productId: "", quantity: 1, importPrice: 0 }]);

  const { data: suppData } = useQuery({ queryKey: ["suppliers-all"], queryFn: async () => { const r = await supplierApi.findAll({ pageSize: 200 }); return r.data?.items || r.items || []; }, enabled: isOpen });
  const { data: prodData } = useQuery({ queryKey: ["products-all"], queryFn: async () => { const r = await productApi.findAll({ pageSize: 200 }); return r.data?.items || r.items || []; }, enabled: isOpen });

  const suppliers = suppData || [];
  const products = prodData || [];

  const updateLine = (idx, field, val) => setLines((prev) => prev.map((l, i) => i === idx ? { ...l, [field]: val } : l));
  const addLine = () => setLines((prev) => [...prev, { productId: "", quantity: 1, importPrice: 0 }]);
  const removeLine = (idx) => setLines((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  const totalAmount = useMemo(() => lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.importPrice) || 0), 0), [lines]);

  const mutation = useMutation({
    mutationFn: (data) => importApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["imports"] }); toast.success("Tạo phiếu nhập thành công"); onClose(); },
    onError: (err) => toast.error(err.response?.data?.message || "Lỗi tạo phiếu nhập"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplierId) return toast.error("Chọn nhà cung cấp");
    const details = lines.filter((l) => l.productId).map((l) => ({ productId: Number(l.productId), quantity: Number(l.quantity), importPrice: Number(l.importPrice) }));
    if (details.length === 0) return toast.error("Thêm ít nhất 1 sản phẩm");
    mutation.mutate({ supplierId: Number(supplierId), note, importDetails: details });
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-6 backdrop-blur-sm sm:items-center sm:pt-4">
      <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl md:rounded-[2.5rem] max-h-[calc(100vh-2rem)]">
        <div className="bg-primary p-8 text-white relative shrink-0">
          <button onClick={onClose} className="absolute right-6 top-6 rounded-xl bg-white/20 p-2 hover:bg-white/30"><X className="h-5 w-5" /></button>
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md"><PackagePlus className="h-8 w-8" /></div>
            <div><h2 className="text-2xl font-black">Tạo phiếu nhập hàng</h2><p className="text-white/70 font-medium">Chọn nhà cung cấp và thêm sản phẩm</p></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Nhà cung cấp <span className="text-red-400">*</span></label>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3.5 font-bold text-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 appearance-none cursor-pointer">
                <option value="">-- Chọn NCC --</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.supplierName} ({s.supplierCode})</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Ghi chú</label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3.5 font-bold text-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Ghi chú phiếu nhập..." />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-widest text-primary">Danh sách sản phẩm</h4>
              <button type="button" onClick={addLine} className="flex items-center space-x-1 rounded-xl bg-primary/10 px-4 py-2 text-xs font-black text-primary hover:bg-primary/20 transition-all">
                <Plus className="h-4 w-4" /><span>Thêm dòng</span>
              </button>
            </div>

            <div className="space-y-3">
              {lines.map((line, idx) => {
                const sub = (Number(line.quantity) || 0) * (Number(line.importPrice) || 0);
                return (
                  <div key={idx} className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                    <div className="flex-1 min-w-[180px] space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-400">Sản phẩm</label>
                      <select value={line.productId} onChange={(e) => updateLine(idx, "productId", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-primary appearance-none cursor-pointer">
                        <option value="">-- Chọn --</option>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.productName} ({p.productCode})</option>)}
                      </select>
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-400">Số lượng</label>
                      <input type="number" min="1" value={line.quantity} onChange={(e) => updateLine(idx, "quantity", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-primary text-center" />
                    </div>
                    <div className="w-32 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-400">Giá nhập</label>
                      <input type="number" min="0" value={line.importPrice} onChange={(e) => updateLine(idx, "importPrice", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-primary text-right" />
                    </div>
                    <div className="w-28 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-400">Thành tiền</label>
                      <p className="rounded-xl bg-primary/5 px-3 py-2.5 text-sm font-black text-primary text-right">{fmt(sub)}</p>
                    </div>
                    <button type="button" onClick={() => removeLine(idx)} className="rounded-xl border border-gray-200 bg-white p-2.5 text-red-400 hover:bg-red-50 hover:text-red-500 transition-all" title="Xóa dòng">
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 p-4">
              <span className="text-sm font-bold uppercase tracking-widest text-gray-500 mr-4">Tổng cộng</span>
              <span className="text-2xl font-black text-primary">{fmt(totalAmount)}</span>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-2xl border border-gray-200 px-8 py-4 text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50">Hủy</button>
            <button type="submit" disabled={mutation.isPending} className="flex items-center justify-center space-x-2 rounded-2xl bg-primary px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 hover:bg-primary-dark active:scale-95">
              {mutation.isPending ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" /> : <Check className="h-4 w-4" />}
              <span>Tạo phiếu nhập</span>
            </button>
          </div>
        </form>
      </div>
    </div>, document.body);
};

const Imports = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [filterSupplier, setFilterSupplier] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewImport, setViewImport] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: suppList } = useQuery({ queryKey: ["suppliers-filter"], queryFn: async () => { const r = await supplierApi.findAll({ pageSize: 200 }); return r.data?.items || r.items || []; } });

  const { data, isLoading } = useQuery({
    queryKey: ["imports", page, searchTerm, filterSupplier],
    queryFn: async () => {
      const params = { page, pageSize: 10 };
      if (searchTerm.trim()) params.keyword = searchTerm.trim();
      if (filterSupplier) params.supplierId = filterSupplier;
      const res = await importApi.findAll(params);
      return res.data || res;
    },
    keepPreviousData: true,
  });

  const deleteMut = useMutation({
    mutationFn: (id) => importApi.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["imports"] }); toast.success("Đã xóa phiếu nhập"); setDeleteTarget(null); },
    onError: (err) => toast.error(err.response?.data?.message || "Lỗi xóa phiếu nhập"),
  });

  const imports = data?.items || [];
  const totalPage = data?.totalPage || 1;
  const totalItem = data?.totalItem || 0;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4">
          <Breadcrumb 
            items={[
              { label: "Trang chủ" },
              { label: "Nhập hàng", active: true }
            ]} 
          />
        </div>

        <button onClick={() => setIsCreateOpen(true)} className="flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-primary to-primary-dark px-6 py-4 font-black text-white shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
          <Plus className="h-5 w-5" /><span>TẠO PHIẾU NHẬP</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50 md:rounded-[2rem]">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-50 bg-gray-50/30 p-4 md:flex-row md:items-center md:gap-6 md:p-8">
          <div className="relative w-full flex-1 md:max-w-sm">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Tìm theo mã phiếu..." className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} />
          </div>
          <div className="flex items-center gap-4">
            <select value={filterSupplier} onChange={(e) => { setFilterSupplier(e.target.value); setPage(1); }} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-600 outline-none focus:border-primary appearance-none cursor-pointer">
              <option value="">Tất cả NCC</option>
              {(suppList || []).map((s) => <option key={s.id} value={s.id}>{s.supplierName}</option>)}
            </select>
            <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Tổng: <span className="text-primary ml-1">{totalItem}</span></span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead><tr className="border-b border-gray-50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              <th className="px-4 py-4 md:px-8 md:py-6">Mã phiếu</th>
              <th className="px-4 py-4 md:px-8 md:py-6">Nhà cung cấp</th>
              <th className="px-4 py-4 md:px-8 md:py-6">Nhân viên</th>
              <th className="px-4 py-4 md:px-8 md:py-6">Tổng tiền</th>
              <th className="px-4 py-4 md:px-8 md:py-6">Ngày nhập</th>
              <th className="px-4 py-4 text-right md:px-8 md:py-6">Thao tác</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />) : imports.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-16 text-center md:px-8 md:py-24">
                  <div className="flex flex-col items-center space-y-4 opacity-40">
                    <PackageOpen className="h-16 w-16 text-gray-300" />
                    <p className="text-xl font-bold uppercase tracking-widest text-gray-500">Chưa có phiếu nhập</p>
                  </div>
                </td></tr>
              ) : imports.map((imp) => (
                <tr key={imp.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4 md:px-8 md:py-6"><span className="inline-flex items-center rounded-lg bg-primary/5 px-3 py-1 font-mono text-xs font-black text-primary">{imp.importCode}</span></td>
                  <td className="px-4 py-4 md:px-8 md:py-6 font-bold text-gray-800">{imp.Suppliers?.supplierName || "—"}</td>
                  <td className="px-4 py-4 md:px-8 md:py-6 text-gray-600 font-medium">{imp.Users?.fullName || "—"}</td>
                  <td className="px-4 py-4 md:px-8 md:py-6 font-black text-emerald-600">{fmt(imp.totalAmount)}</td>
                  <td className="px-4 py-4 md:px-8 md:py-6 text-gray-500 font-medium">{new Date(imp.importDate).toLocaleDateString("vi-VN")}</td>
                  <td className="px-4 py-4 text-right md:px-8 md:py-6">
                    <div className="flex items-center justify-end space-x-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setViewImport(imp)} className="rounded-2xl border border-gray-100 bg-white p-3 text-blue-500 shadow-sm hover:scale-105 hover:bg-blue-50 active:scale-95 transition-all" title="Xem"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteTarget(imp)} className="rounded-2xl border border-gray-100 bg-white p-3 text-red-500 shadow-sm hover:scale-105 hover:bg-red-50 active:scale-95 transition-all" title="Xóa"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPage > 1 && (
          <div className="flex items-center justify-between border-t border-gray-50 px-4 py-4 md:px-8 md:py-6">
            <p className="text-xs font-bold text-gray-400">Trang {page} / {totalPage}</p>
            <div className="flex space-x-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
              <button disabled={page >= totalPage} onClick={() => setPage((p) => p + 1)} className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>

      {isCreateOpen && <CreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />}
      <DetailModal imp={viewImport} onClose={() => setViewImport(null)} />
      <DeleteModal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMut.mutate(deleteTarget.id)} code={deleteTarget?.importCode} isPending={deleteMut.isPending} />
    </div>
  );
};

export default Imports;
