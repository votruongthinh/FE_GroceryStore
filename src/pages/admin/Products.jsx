import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../../api/product.api";
import { categoryApi } from "../../api/category.api";
import { 
  Search, Plus, Edit2, Trash2, Package, AlertTriangle, 
  ChevronLeft, ChevronRight, Filter, X, Grid, List, 
  CheckCircle2, AlertCircle, ShoppingBag, ArrowUpRight, 
  ChevronDown, SlidersHorizontal, PackageSearch, History
} from "lucide-react";
import ProductFormModal from "../../components/ProductFormModal";
import PriceRangeSlider from "../../components/PriceRangeSlider";
import Breadcrumb from "../../components/Breadcrumb";
import { IMAGE_URL } from "../../api/axiosClient";
import toast from "react-hot-toast";

const fmt = (v) => Number(v || 0).toLocaleString("vi-VN") + "đ";

const StatCard = ({ icon: Icon, label, value, sub, color, bgColor }) => (
  <div className="flex items-center space-x-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${bgColor} ${color}`}>
      <Icon className="h-8 w-8" />
    </div>
    <div>
      <p className="text-xs font-black uppercase tracking-widest text-gray-400">{label}</p>
      <div className="flex items-baseline space-x-2">
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <span className="text-[10px] font-bold text-gray-400">{sub}</span>
      </div>
    </div>
  </div>
);

const Products = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list"); // list or grid
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [stockStatus, setStockStatus] = useState("all"); // all, low, out
  const [status, setStatus] = useState("all"); // all, active, inactive

  const pageSize = 10;

  const { data: categoriesData } = useQuery({
    queryKey: ["categories-all"],
    queryFn: async () => {
      const res = await categoryApi.findAll({ pageSize: 100 });
      return res.data?.items || res.items || [];
    }
  });

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, search, selectedCategory, minPrice, maxPrice, stockStatus, status],
    queryFn: async () => {
      const params = {
        page,
        pageSize,
        keyword: search,
        categoryId: selectedCategory || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        status: status === "all" ? undefined : status === "active" ? true : false,
      };
      
      // Stock filtering usually handled on frontend in this setup but let's see if API supports it
      const res = await productApi.findAll(params);
      let result = res.data || res;

      // Local filtering for stock status if API doesn't support specific flags
      if (stockStatus === "low") {
        result.items = result.items.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5);
      } else if (stockStatus === "out") {
        result.items = result.items.filter(p => p.stock_quantity <= 0);
      }

      return result;
    },
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productApi.hardDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.success("Xóa sản phẩm thành công");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Lỗi khi xóa sản phẩm");
    }
  });

  const products = data?.items || [];
  const totalPage = data?.totalPage || 1;
  const totalItem = data?.totalItem || 0;

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setStockStatus("all");
    setStatus("all");
    setPage(1);
  };

  const stats = useMemo(() => {
    const total = totalItem;
    const low = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length;
    const out = products.filter(p => p.stock_quantity <= 0).length;
    const active = products.filter(p => p.status).length;
    return { total, low, out, active };
  }, [products, totalItem]);

  return (
    <div className="min-h-full space-y-8">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <Breadcrumb 
            items={[
              { label: "Trang chủ" },
              { label: "Sản phẩm", active: true }
            ]} 
          />
        </div>
        <button
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-primary to-primary-dark px-6 py-4 font-black text-white shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          <span>THÊM SẢN PHẨM</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={Package} 
          label="Tổng sản phẩm" 
          value={stats.total} 
          sub="sản phẩm" 
          color="text-blue-500" 
          bgColor="bg-blue-50" 
        />
        <StatCard 
          icon={AlertCircle} 
          label="Sắp hết hàng" 
          value={stats.low} 
          sub="sản phẩm" 
          color="text-amber-500" 
          bgColor="bg-amber-50" 
        />
        <StatCard 
          icon={AlertTriangle} 
          label="Hết hàng" 
          value={stats.out} 
          sub="sản phẩm" 
          color="text-red-500" 
          bgColor="bg-red-50" 
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Đang bán" 
          value={stats.active} 
          sub="sản phẩm" 
          color="text-emerald-500" 
          bgColor="bg-emerald-50" 
        />
      </div>

      {/* Main Content Layout: 30% Filter / 70% Table */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Desktop Filter Sidebar (30%) */}
        <aside className="hidden w-full shrink-0 lg:block lg:w-[300px]">
          <div className="sticky top-24 space-y-6 rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900">Bộ lọc</h2>
              <Filter className="h-5 w-5 text-primary" />
            </div>

            <div className="space-y-6">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Tìm kiếm</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 py-3.5 pl-5 pr-11 text-sm font-bold text-gray-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5"
                    placeholder="Mã hoặc tên sản phẩm..."
                  />
                  <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Giá bán</label>
                </div>
                <div className="px-2">
                  <div className="flex items-center justify-between mb-2 text-[10px] font-bold text-gray-400">
                    <span>0đ</span>
                    <span>2.000.000đ+</span>
                  </div>
                  <PriceRangeSlider
                    min={0}
                    max={2000000}
                    minVal={Number(minPrice) || 0}
                    maxVal={Number(maxPrice) || 2000000}
                    onChange={({ min, max }) => {
                      setMinPrice(min.toString());
                      setMaxPrice(max.toString());
                      setPage(1);
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 ml-1">Từ</span>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0"
                        value={minPrice}
                        onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                        className="w-full rounded-xl border border-gray-100 bg-gray-50/50 p-3 pr-8 text-sm font-bold text-gray-700 outline-none focus:border-primary"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">đ</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 ml-1">Đến</span>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="500k"
                        value={maxPrice}
                        onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                        className="w-full rounded-xl border border-gray-100 bg-gray-50/50 p-3 pr-8 text-sm font-bold text-gray-700 outline-none focus:border-primary"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">đ</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Danh mục</label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                    className="w-full appearance-none rounded-2xl border border-gray-100 bg-gray-50/50 p-4 text-sm font-bold text-gray-700 outline-none focus:border-primary"
                  >
                    <option value="">Chọn danh mục</option>
                    {categoriesData?.map(c => (
                      <option key={c.id} value={c.id}>{c.categoryName}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Stock Status */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Tồn kho</label>
                <div className="space-y-3">
                  {[
                    { id: "all", label: "Tất cả", color: null },
                    { id: "active", label: "Còn hàng", color: "bg-emerald-500" },
                    { id: "low", label: "Sắp hết hàng (≤ 5)", color: "bg-amber-500" },
                    { id: "out", label: "Hết hàng", color: "bg-red-500" }
                  ].map(item => (
                    <label key={item.id} className="flex cursor-pointer items-center group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={stockStatus === item.id}
                          onChange={() => { setStockStatus(item.id); setPage(1); }}
                          className="h-5 w-5 rounded border-2 border-gray-200 text-primary focus:ring-0 transition-all checked:border-primary"
                        />
                      </div>
                      <div className="ml-3 flex items-center">
                        {item.color && <span className={`mr-2 h-2 w-2 rounded-full ${item.color}`} />}
                        <span className={`text-sm font-bold transition-colors ${stockStatus === item.id ? "text-slate-900" : "text-gray-500 group-hover:text-gray-700"}`}>
                          {item.label}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Trạng thái</label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    className="w-full appearance-none rounded-2xl border border-gray-100 bg-gray-50/50 p-4 text-sm font-bold text-gray-700 outline-none focus:border-primary"
                  >
                    <option value="all">Chọn trạng thái</option>
                    <option value="active">Đang bán</option>
                    <option value="inactive">Ngưng bán</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <button 
                  onClick={() => setPage(1)}
                  className="flex w-full items-center justify-center space-x-2 rounded-2xl bg-primary py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20 active:scale-95"
                >
                  <Filter className="h-4 w-4" />
                  <span>Áp dụng bộ lọc</span>
                </button>
                <button 
                  onClick={resetFilters}
                  className="flex w-full items-center justify-center space-x-2 rounded-2xl border border-gray-200 bg-white py-4 text-xs font-black uppercase tracking-widest text-gray-500 transition-all hover:bg-gray-50 active:scale-95"
                >
                  <History className="h-4 w-4" />
                  <span>Đặt lại</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Filter Button */}
        <div className="flex items-center justify-between lg:hidden">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center space-x-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-700"
          >
            <Filter className="h-4 w-4" />
            <span>BỘ LỌC</span>
          </button>
          <div className="flex items-center space-x-2 rounded-2xl bg-white p-1 shadow-sm">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-xl transition-all ${viewMode === "list" ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:bg-gray-100"}`}
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-xl transition-all ${viewMode === "grid" ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:bg-gray-100"}`}
            >
              <Grid className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Product List/Grid Section (70%) */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm md:px-8">
            <h3 className="text-xl font-black text-gray-900">Danh sách sản phẩm</h3>
            <div className="hidden items-center space-x-4 lg:flex">
              <div className="flex items-center space-x-2 rounded-2xl bg-gray-50 p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-black transition-all ${viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <List className="h-4 w-4" />
                  <span>LIST</span>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-black transition-all ${viewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <Grid className="h-4 w-4" />
                  <span>GRID</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table View */}
          {viewMode === "list" ? (
            <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      <th className="px-8 py-6">Sản phẩm</th>
                      <th className="px-8 py-6">Danh mục</th>
                      <th className="px-8 py-6">Giá bán</th>
                      <th className="px-8 py-6">Tồn kho</th>
                      <th className="px-8 py-6">Trạng thái</th>
                      <th className="px-8 py-6 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan="6" className="px-8 py-6"><div className="h-12 w-full rounded-2xl bg-gray-50" /></td>
                        </tr>
                      ))
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-8 py-24 text-center">
                          <div className="flex flex-col items-center justify-center space-y-4 opacity-40">
                            <PackageSearch className="h-16 w-16 text-gray-300" />
                            <p className="text-xl font-bold uppercase tracking-widest text-gray-500">Không tìm thấy sản phẩm</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p.id} className="group transition-colors hover:bg-gray-50/50">
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-50">
                                {p.image ? (
                                  <img src={`${IMAGE_URL}/${p.image}`} alt={p.productName} className="h-full w-full object-cover" />
                                ) : (
                                  <Package className="h-6 w-6 text-gray-300" />
                                )}
                              </div>
                              <div>
                                <p className="font-black text-gray-900">{p.productName}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{p.productCode}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="rounded-xl bg-gray-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-600">
                              {p.Category?.categoryName || "Chưa phân loại"}
                            </span>
                          </td>
                          <td className="px-8 py-6 font-black text-gray-900">{fmt(p.salePrice)}</td>
                          <td className="px-8 py-6">
                            <div className="space-y-1">
                              <div className={`flex items-center text-sm font-black ${p.stock_quantity > 5 ? "text-emerald-600" : p.stock_quantity > 0 ? "text-amber-500" : "text-red-500"}`}>
                                {p.stock_quantity} {p.unit}
                              </div>
                              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                                <div 
                                  className={`h-full rounded-full ${p.stock_quantity > 5 ? "bg-emerald-500" : p.stock_quantity > 0 ? "bg-amber-500" : "bg-red-500"}`} 
                                  style={{ width: `${Math.min(100, (p.stock_quantity / 50) * 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            {p.status ? (
                              <div className="flex items-center text-xs font-black uppercase tracking-widest text-emerald-500">
                                <span className="mr-2 flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                Đang bán
                              </div>
                            ) : (
                              <div className="flex items-center text-xs font-black uppercase tracking-widest text-gray-400">
                                <span className="mr-2 flex h-2 w-2 rounded-full bg-gray-300" />
                                Ngưng bán
                              </div>
                            )}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => { setEditingProduct(p); setIsModalOpen(true); }}
                                className="rounded-xl border border-gray-100 bg-white p-3 text-blue-500 shadow-sm transition-all hover:scale-110 hover:bg-blue-50"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => { if(confirm("Xóa sản phẩm này?")) deleteMutation.mutate(p.id); }}
                                className="rounded-xl border border-gray-100 bg-white p-3 text-red-500 shadow-sm transition-all hover:scale-110 hover:bg-red-50"
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
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 animate-pulse rounded-[2rem] bg-gray-50" />
                ))
              ) : products.map((p) => (
                <div key={p.id} className="group relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="flex items-start justify-between">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-50">
                      {p.image ? (
                        <img src={`${IMAGE_URL}/${p.image}`} alt={p.productName} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-8 w-8 text-gray-200" />
                      )}
                    </div>
                    <div className="flex space-x-2">
                       <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="rounded-xl p-2 text-blue-500 hover:bg-blue-50 transition-all"><Edit2 className="h-4 w-4" /></button>
                       <button onClick={() => { if(confirm("Xóa sản phẩm này?")) deleteMutation.mutate(p.id); }} className="rounded-xl p-2 text-red-500 hover:bg-red-50 transition-all"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="line-clamp-1 text-lg font-black text-gray-900">{p.productName}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{p.productCode} • {p.Category?.categoryName || "Chưa phân loại"}</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Giá bán</p>
                      <p className="text-xl font-black text-primary">{fmt(p.salePrice)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tồn kho</p>
                      <p className={`text-sm font-black ${p.stock_quantity > 5 ? "text-emerald-500" : p.stock_quantity > 0 ? "text-amber-500" : "text-red-500"}`}>
                        {p.stock_quantity} {p.unit}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPage > 1 && (
            <div className="flex items-center justify-between rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm md:px-8">
              <p className="hidden text-xs font-black uppercase tracking-widest text-gray-400 md:block">
                Trang {page} / {totalPage} ({totalItem} sản phẩm)
              </p>
              <div className="flex items-center space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="rounded-2xl border border-gray-100 bg-white p-3 text-gray-400 transition-all hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex space-x-1">
                  {[...Array(totalPage)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`h-11 w-11 rounded-2xl text-xs font-black transition-all ${page === i + 1 ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                      {i + 1}
                    </button>
                  )).slice(Math.max(0, page - 3), Math.min(totalPage, page + 2))}
                </div>
                <button
                  disabled={page >= totalPage}
                  onClick={() => setPage(p => p + 1)}
                  className="rounded-2xl border border-gray-100 bg-white p-3 text-gray-400 transition-all hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterOpen && createPortal(
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsFilterOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto rounded-t-[3rem] bg-white p-8 shadow-2xl transition-transform animate-in slide-in-from-bottom duration-500">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900">Bộ lọc</h2>
                <Filter className="h-6 w-6 text-primary" />
             </div>
             
             <div className="space-y-8 pb-12">
                {/* Search */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Tìm kiếm</label>
                  <div className="relative">
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-[1.5rem] border border-gray-100 bg-gray-50/50 py-5 pl-6 pr-14 text-sm font-bold text-gray-700 outline-none" placeholder="Mã hoặc tên sản phẩm..." />
                    <Search className="absolute right-5 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Khoảng giá</label>
                  <div className="px-2">
                    <PriceRangeSlider
                      min={0}
                      max={2000000}
                      minVal={Number(minPrice) || 0}
                      maxVal={Number(maxPrice) || 2000000}
                      onChange={({ min, max }) => {
                        setMinPrice(min.toString());
                        setMaxPrice(max.toString());
                        setPage(1);
                      }}
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 ml-2">Từ</span>
                      <div className="relative">
                        <input type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full rounded-[1.2rem] border border-gray-100 bg-gray-50/50 p-4 pr-10 text-sm font-bold text-gray-700 outline-none" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">đ</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 ml-2">Đến</span>
                      <div className="relative">
                        <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full rounded-[1.2rem] border border-gray-100 bg-gray-50/50 p-4 pr-10 text-sm font-bold text-gray-700 outline-none" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">đ</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Danh mục</label>
                  <div className="relative">
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full rounded-[1.5rem] border border-gray-100 bg-gray-50/50 p-5 text-sm font-bold text-gray-700 outline-none appearance-none">
                      <option value="">Chọn danh mục</option>
                      {categoriesData?.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Stock Status */}
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Tình trạng kho</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {id:"all",label:"Tất cả", color: null},
                      {id:"active",label:"Còn hàng", color: "bg-emerald-500"},
                      {id:"low",label:"Sắp hết hàng", color: "bg-amber-500"},
                      {id:"out",label:"Hết hàng", color: "bg-red-500"}
                    ].map(item => (
                       <button 
                        key={item.id} 
                        onClick={() => setStockStatus(item.id)} 
                        className={`flex items-center justify-center rounded-2xl py-4 text-xs font-black transition-all ${stockStatus === item.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-gray-50 text-gray-500"}`}
                      >
                         {item.color && <span className={`mr-2 h-2 w-2 rounded-full ${stockStatus === item.id ? "bg-white" : item.color}`} />}
                         {item.label}
                       </button>
                    ))}
                  </div>
                </div>
             </div>

             <div className="sticky bottom-0 grid grid-cols-2 gap-4 bg-white pt-4 pb-4">
                <button 
                  onClick={resetFilters}
                  className="rounded-[1.5rem] border border-gray-100 bg-white py-5 text-xs font-black uppercase tracking-[0.2em] text-gray-500 active:scale-95"
                >
                  Đặt lại
                </button>
                <button 
                  onClick={() => { setPage(1); setIsFilterOpen(false); }}
                  className="rounded-[1.5rem] bg-primary py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-primary/20 active:scale-95"
                >
                  Áp dụng
                </button>
             </div>
          </div>
        </div>,
        document.body
      )}

      {isModalOpen && (
        <ProductFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={editingProduct}
        />
      )}
    </div>
  );
};

export default Products;
