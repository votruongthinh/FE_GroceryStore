import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "../../api/category.api";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Folder,
  Package,
  Info,
  Layers,
  Check,
  Palette,
} from "lucide-react";
import toast from "react-hot-toast";

const CategoryFormModal = ({ isOpen, onClose, initialData }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    categoryName: initialData?.categoryName || "",
    description: initialData?.description || "",
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      initialData
        ? categoryApi.update(initialData.id, data)
        : categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      toast.success(
        initialData
          ? "Cập nhật danh mục thành công"
          : "Tạo danh mục thành công"
      );
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="bg-primary p-8 text-white">
          <h3 className="text-2xl font-black flex items-center">
            {initialData ? (
              <Edit2 className="w-6 h-6 mr-3" />
            ) : (
              <Plus className="w-6 h-6 mr-3" />
            )}
            {initialData
              ? "Chỉnh sửa danh mục"
              : "Tạo danh mục mới"}
          </h3>
        </div>

        <div className="p-8 space-y-6">
          <input
            type="text"
            value={formData.categoryName}
            onChange={(e) =>
              setFormData((pr) => ({
                ...pr,
                categoryName: e.target.value,
              }))
            }
            className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 border rounded-2xl"
            placeholder="Tên danh mục"
          />

          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((pr) => ({
                ...pr,
                description: e.target.value,
              }))
            }
            className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 border rounded-2xl"
            placeholder="Mô tả"
          />
        </div>

        <div className="px-8 pb-8 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 rounded-2xl"
          >
            Hủy
          </button>

          <button
            onClick={() => mutation.mutate(formData)}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-2xl"
          >
            {mutation.isPending ? "Loading..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Categories = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryApi.findAll();
      return Array.isArray(res.data)
        ? res.data
        : res.data?.items || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => categoryApi.hardDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      toast.success("Đã xóa danh mục");
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      deleteMutation.mutate(id);
    }
  };

  const categories = data || [];

  const filtered = categories.filter(
    (c) =>
      c.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 min-h-screen">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <Layers className="mr-2" /> Danh mục
        </h1>

        <button
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-5 py-2 rounded-xl flex items-center"
        >
          <Plus className="mr-2" /> Thêm
        </button>
      </div>

      <input
        placeholder="Tìm kiếm..."
        className="w-full p-3 border rounded-xl"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="grid md:grid-cols-3 gap-6">
        {filtered.map((item, idx) => (
          <div key={item.id} className="p-5 border rounded-xl">
            <h3 className="font-bold text-lg">
              {item.categoryName}
            </h3>

            <p className="text-sm text-gray-500">
              {item.description}
            </p>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setEditingCategory(item);
                  setIsModalOpen(true);
                }}
              >
                <Edit2 />
              </button>

              <button onClick={() => handleDelete(item.id)}>
                <Trash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

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