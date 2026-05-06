import { useState, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { productApi } from "../api/product.api";
import { categoryApi } from "../api/category.api";
import { X, Upload, PackageSearch } from "lucide-react";
import { createPortal } from "react-dom";
import { IMAGE_URL } from "../api/axiosClient";
import toast from "react-hot-toast";

const getInitialFormData = (initialData) => ({
  productName: initialData?.productName || "",
  productCode: initialData?.productCode || "",
  categoryId: initialData?.categoryId || "",
  originalPrice: initialData?.originalPrice || "",
  salePrice: initialData?.salePrice || "",
  stock_quantity: initialData?.stock_quantity || "",
  unit: initialData?.unit || "cái",
  status: initialData?.status ?? true,
});

const ProductFormModal = ({ isOpen, onClose, initialData }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(() => getInitialFormData(initialData));
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(() =>
    initialData?.image ? `${IMAGE_URL}/${initialData.image}` : null,
  );

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryApi.findAll();
      return Array.isArray(res.data) ? res.data : (res.data?.items || []);
    },
  });
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const mutation = useMutation({
    mutationFn: (submitData) => {
      const fd = new FormData();
      Object.keys(submitData).forEach((key) => {
        if (key !== "image") {
          fd.append(key, submitData[key]);
        }
      });
      if (imageFile) {
        fd.append("image", imageFile);
      }

      if (initialData) {
        return productApi.update(initialData.id, fd);
      }
      return productApi.create(fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.success(initialData ? "Cập nhật sản phẩm thành công" : "Tạo sản phẩm thành công");
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Không thể lưu sản phẩm");
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-6 backdrop-blur-sm sm:items-center sm:pt-4">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold">{initialData ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
          <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center">
              <div
                className="w-32 h-32 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden group relative transition-colors hover:border-primary/50 hover:bg-primary/5"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewImage ? (
                  <>
                    <img src={previewImage} alt="Xem trước ảnh" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    <PackageSearch className="w-8 h-8 text-gray-400 mb-2 group-hover:text-primary transition-colors" />
                    <span className="text-xs font-medium text-gray-500 group-hover:text-primary transition-colors">Tải ảnh</span>
                  </>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                <input
                  type="text"
                  required
                  value={formData.productName}
                  onChange={(e) => setFormData((p) => ({ ...p, productName: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã sản phẩm</label>
                <input
                  type="text"
                  required
                  value={formData.productCode}
                  onChange={(e) => setFormData((p) => ({ ...p, productCode: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData((p) => ({ ...p, categoryId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.categoryName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tồn</label>
                <input
                  type="number"
                  required
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData((p) => ({ ...p, stock_quantity: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá vốn</label>
                <input
                  type="number"
                  required
                  value={formData.originalPrice}
                  onChange={(e) => setFormData((p) => ({ ...p, originalPrice: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán</label>
                <input
                  type="number"
                  required
                  value={formData.salePrice}
                  onChange={(e) => setFormData((p) => ({ ...p, salePrice: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
                <input
                  type="text"
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData((p) => ({ ...p, unit: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Ví dụ: cái, hộp, kg"
                />
              </div>

              <div className="flex items-center pt-8">
                <input
                  type="checkbox"
                  id="status"
                  checked={formData.status}
                  onChange={(e) => setFormData((p) => ({ ...p, status: e.target.checked }))}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <label htmlFor="status" className="ml-2 block text-sm text-gray-900">
                  Đang kinh doanh
                </label>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex space-x-3 justify-end rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="productForm"
            disabled={mutation.isPending}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition shadow-lg shadow-primary/30 flex items-center"
          >
            {mutation.isPending ? "Đang lưu..." : "Lưu sản phẩm"}
          </button>
        </div>
      </div>

    </div>,
    document.body,
  );
};

export default ProductFormModal;
