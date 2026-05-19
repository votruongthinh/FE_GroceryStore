import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "../../api/category.api";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Layers,
  ChevronRight,
  MoreVertical,
  Filter,
  Grid,
  List,
  LayoutGrid,
  Droplet,
  Cookie,
  Soup,
  FlaskConical,
  Milk,
  Package,
  Box,
  Snowflake,
  Leaf,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "../../components/Breadcrumb";

const formatDate = (dateString) => {
  if (!dateString) return "---";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateString));
};

const getCategoryStyles = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("nước") || n.includes("uống")) return { icon: Droplet, color: "bg-blue-100 text-blue-600" };
  if (n.includes("bánh") || n.includes("kẹo")) return { icon: Cookie, color: "bg-purple-100 text-purple-600" };
  if (n.includes("mì") || n.includes("cháo") || n.includes("phở")) return { icon: Soup, color: "bg-emerald-100 text-emerald-600" };
  if (n.includes("gia vị")) return { icon: FlaskConical, color: "bg-orange-100 text-orange-600" };
  if (n.includes("sữa")) return { icon: Milk, color: "bg-indigo-100 text-indigo-600" };
  if (n.includes("khô")) return { icon: Package, color: "bg-rose-100 text-rose-600" };
  if (n.includes("hộp")) return { icon: Box, color: "bg-violet-100 text-violet-600" };
  if (n.includes("lạnh")) return { icon: Snowflake, color: "bg-cyan-100 text-cyan-600" };
  if (n.includes("rau") || n.includes("quả") || n.includes("trái")) return { icon: Leaf, color: "bg-amber-100 text-amber-600" };
  if (n.includes("cá nhân") || n.includes("dùng")) return { icon: Sparkles, color: "bg-pink-100 text-pink-600" };
  return { icon: Layers, color: "bg-gray-100 text-gray-600" };
};

const CategoryFormModal = ({ isOpen, onClose, initialData }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    categoryName: initialData?.categoryName || "",
    description: initialData?.description || "",
    status: initialData?.status ?? true,
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      initialData
        ? categoryApi.update(initialData.id, data)
        : categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      toast.success(
        initialData ? "Cập nhật danh mục thành công" : "Tạo danh mục mới thành công"
      );
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800 animate-page-enter">
        <div className="bg-primary/10 px-8 py-6 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-bold flex items-center text-primary">
            {initialData ? <Edit2 className="w-5 h-5 mr-3" /> : <Plus className="w-5 h-5 mr-3" />}
            {initialData ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
          </h3>
        </div>

        <div className="p-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Tên danh mục</label>
            <input
              type="text"
              value={formData.categoryName}
              onChange={(e) => setFormData((pr) => ({ ...pr, categoryName: e.target.value }))}
              className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="VD: Nước uống, Bánh kẹo..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Mô tả</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((pr) => ({ ...pr, description: e.target.value }))}
              className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Nhập mô tả ngắn cho danh mục..."
            />
          </div>
        </div>

        <div className="px-8 pb-8 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 transition-all"
          >
            Hủy
          </button>

          <button
            onClick={() => mutation.mutate(formData)}
            disabled={mutation.isPending || !formData.categoryName}
            className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {mutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
};

const CategoryCard = ({ item, onEdit, onDelete }) => {
  const { icon: Icon, color } = getCategoryStyles(item.categoryName);
  const productCount = item._count?.Product || 0;

  return (
    <div className="group bg-white dark:bg-gray-900 p-6 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/20 transition-all duration-300 animate-card-in relative">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-4 rounded-2xl ${color} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(item)}
            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(item.id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-1">{item.categoryName}</h3>
          <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-black px-2 py-0.5 rounded-full">
            {productCount}
          </span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 min-h-[40px]">
          {item.description || "Chưa có mô tả cho danh mục này."}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
        <div className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
          Cập nhật: {formatDate(item.updatedAt)}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
      </div>
    </div>
  );
};

const Categories = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [sortBy, setSortBy] = useState("A-Z");
  const [viewType, setViewType] = useState("grid");

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryApi.findAll();
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => categoryApi.hardDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      toast.success("Đã xóa danh mục thành công");
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa danh mục này? Hành động này không thể hoàn tác.")) {
      deleteMutation.mutate(id);
    }
  };

  const categories = data?.items || [];
  
  const filtered = categories
    .filter(
      (c) =>
        c.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "A-Z") return a.categoryName.localeCompare(b.categoryName);
      if (sortBy === "Z-A") return b.categoryName.localeCompare(a.categoryName);
      return 0;
    });

  return (
    <div className="space-y-6 animate-page-enter">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <LayoutGrid className="w-8 h-8 text-primary" />
            </div>
            <div>
              <Breadcrumb items={[{ label: "Trang chủ" }, { label: "Danh mục", active: true }]} />
              <h1 className="text-3xl font-black text-gray-900 dark:text-white mt-1">Danh mục</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Quản lý và tổ chức các nhóm sản phẩm</p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingCategory(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center space-x-3 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            <span>THÊM DANH MỤC</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-4 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            placeholder="Tìm kiếm danh mục..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl">
            <span className="text-sm font-bold text-gray-500 px-3">Sắp xếp:</span>
            <select 
              className="bg-transparent border-none text-sm font-bold text-gray-700 dark:text-gray-300 outline-none pr-8 py-2"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="A-Z">A → Z</option>
              <option value="Z-A">Z → A</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl">
            <button 
              onClick={() => setViewType("grid")}
              className={`p-2 rounded-lg transition-all ${viewType === "grid" ? "bg-white dark:bg-gray-700 text-primary shadow-sm" : "text-gray-400"}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewType("list")}
              className={`p-2 rounded-lg transition-all ${viewType === "list" ? "bg-white dark:bg-gray-700 text-primary shadow-sm" : "text-gray-400"}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white dark:bg-gray-900 p-6 rounded-[1.5rem] h-[200px] animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <CategoryCard 
                key={item.id} 
                item={item} 
                onEdit={(item) => {
                  setEditingCategory(item);
                  setIsModalOpen(true);
                }} 
                onDelete={handleDelete} 
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-800">
              <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Không tìm thấy danh mục nào phù hợp.</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-6">
            <p className="text-sm text-gray-500 font-medium">
              Hiển thị <span className="text-gray-900 dark:text-white font-bold">{filtered.length}</span> trong tổng số <span className="text-gray-900 dark:text-white font-bold">{data?.totalItem || filtered.length}</span> danh mục
            </p>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20">1</button>
              <button className="p-2 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}

      {isModalOpen && (
        <CategoryFormModal
          isOpen={isModalOpen}
          initialData={editingCategory}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Categories;