import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../../api/product.api";
import { Search, Plus, Edit2, Trash2, PackageSearch, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import ProductFormModal from "../../components/ProductFormModal";
import { IMAGE_URL } from "../../api/axiosClient";

const Products = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, searchTerm, minPrice, maxPrice],
    queryFn: async () => {
      const res = await productApi.findAll({
        page,
        pageSize,
        keyword: searchTerm,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
      });
      return res.data || res;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productApi.hardDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const products = data?.items || [];
  const totalPage = data?.totalPage || 1;
  const totalItem = data?.totalItem || 0;
  const displayProducts = products;

  const outOfStockCount = products.filter((p) => p.stock_quantity <= 0).length;
  const lowStockCount = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 5).length;

  return (
    <div className="flex h-full flex-col space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
        <div className="flex items-center space-x-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-500">
            <PackageSearch className="h-7 w-7 md:h-8 md:w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tổng sản phẩm</p>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
          <div className="rounded-xl bg-amber-50 p-3 text-amber-500">
            <AlertTriangle className="h-7 w-7 md:h-8 md:w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Sắp hết hàng (≤ 5)</p>
            <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
          <div className="rounded-xl bg-red-50 p-3 text-red-500">
            <AlertTriangle className="h-7 w-7 md:h-8 md:w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Hết hàng</p>
            <p className="text-2xl font-bold text-gray-900">{outOfStockCount}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="grid grid-cols-1 items-end gap-4 rounded-t-2xl border-b border-gray-100 bg-white p-4 md:grid-cols-2 md:p-6 lg:grid-cols-4">
          <div className="relative">
            <label className="text-xs font-semibold text-gray-500 mb-1 block">TÌM KIẾM</label>
            <Search className="w-4 h-4 absolute left-3 top-[34px] text-gray-400" />
            <input
              type="text"
              placeholder="Mã hoặc tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">GIÁ TỪ</label>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">GIÁ ĐẾN</label>
            <input
              type="number"
              placeholder="Tối da..."
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleAdd}
              className="flex-1 flex items-center justify-center space-x-2 bg-primary text-white px-4 py-2 rounded-xl shadow-sm hover:bg-primary-dark transition text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm sản phẩm</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-sm text-gray-500">
                <th className="px-3 py-3 font-medium md:px-6 md:py-4">Sản phẩm</th>
                <th className="px-3 py-3 font-medium md:px-6 md:py-4">Danh mục</th>
                <th className="px-3 py-3 font-medium md:px-6 md:py-4">Giá bán</th>
                <th className="px-3 py-3 font-medium md:px-6 md:py-4">Tồn kho</th>
                <th className="px-3 py-3 font-medium md:px-6 md:py-4">Trạng thái</th>
                <th className="px-3 py-3 text-right font-medium md:px-6 md:py-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-3 py-8 text-center text-gray-500 md:px-6">Đang tải sản phẩm...</td>
                </tr>
              ) : displayProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-3 py-8 text-center text-gray-500 md:px-6">Không tìm thấy sản phẩm.</td>
                </tr>
              ) : (
                displayProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-3 py-3 md:px-6 md:py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                          {product.image ? (
                            <img src={`${IMAGE_URL}/${product.image}`} alt={product.productName} className="w-full h-full object-cover" />
                          ) : (
                            <PackageSearch className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.productName}</p>
                          <p className="text-xs text-gray-500">{product.productCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600 md:px-6 md:py-4">{product.Category?.categoryName || "Chưa phân loại"}</td>
                    <td className="px-3 py-3 text-sm text-gray-600 md:px-6 md:py-4">{Number(product.salePrice).toLocaleString()} đ</td>
                    <td className="px-3 py-3 md:px-6 md:py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.stock_quantity > 5 ? "bg-green-100 text-green-700" :
                          product.stock_quantity > 0 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                        }`}>
                        {product.stock_quantity} {product.unit}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm md:px-6 md:py-4">
                      {product.status ? (
                        <span className="text-green-600 font-medium tracking-wide text-xs uppercase">Đang bán</span>
                      ) : (
                        <span className="text-gray-400 font-medium tracking-wide text-xs uppercase">Ngưng bán</span>
                      )}
                    </td>
                    <td className="space-x-2 px-3 py-3 text-right md:px-6 md:py-4">
                      <button
                        onClick={() => handleEdit(product)}
                        className="rounded-lg p-2.5 text-blue-600 transition hover:bg-blue-50"
                        title="Sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="rounded-lg p-2.5 text-red-600 transition hover:bg-red-50"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 rounded-b-2xl border-t border-gray-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <p className="text-sm text-gray-500">
            Hiển thị <span className="font-medium">{(page - 1) * pageSize + 1}</span> dến{" "}
            <span className="font-medium">{Math.min(page * pageSize, totalItem)}</span> trong tổng{" "}
            <span className="font-medium">{totalItem}</span> sản phẩm
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-1">
              {[...Array(totalPage)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition ${page === i + 1
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 border border-transparent"
                    }`}
                >
                  {i + 1}
                </button>
              )).slice(Math.max(0, page - 3), Math.min(totalPage, page + 2))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
              disabled={page === totalPage}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

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

