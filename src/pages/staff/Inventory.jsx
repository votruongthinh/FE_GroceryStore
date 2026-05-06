import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Package, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { productApi } from "../../api/product.api";

const Inventory = () => {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [threshold, setThreshold] = useState(10);
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const pageSize = 12;

  const { data, isLoading } = useQuery({
    queryKey: ["staff-inventory", page, keyword, threshold, onlyLowStock],
    queryFn: async () => {
      const res = await productApi.inventory({
        page,
        pageSize,
        keyword: keyword || undefined,
        threshold,
        onlyLowStock,
      });
      return res.data || res;
    },
  });

  const items = useMemo(() => data?.items || [], [data?.items]);
  const totalPage = Math.max(1, Number(data?.totalPage || 1));
  const totalItem = Number(data?.totalItem || 0);
  const totalLowStock = Number(data?.totalLowStock || 0);

  const outOfStockCount = useMemo(
    () => items.filter((item) => Number(item.stock_quantity) <= 0).length,
    [items],
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <h2 className="text-2xl font-black text-gray-900">Quản Lý Kho</h2>
        <p className="text-sm text-gray-500 mt-1">
          Theo dõi tồn kho để báo admin kịp thời khi hàng sắp hết.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
          <p className="text-sm text-gray-500 font-medium">Tổng Mặt Hàng</p>
          <p className="text-3xl font-black text-gray-900 mt-1">{totalItem.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
          <p className="text-sm text-gray-500 font-medium">Sắp Hết Hàng (&lt; {threshold})</p>
          <p className="text-3xl font-black text-amber-600 mt-1">{totalLowStock.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
          <p className="text-sm text-gray-500 font-medium">Hết Hàng (Trang Hiện Tại)</p>
          <p className="text-3xl font-black text-red-600 mt-1">{outOfStockCount.toLocaleString()}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="grid grid-cols-1 items-end gap-4 border-b border-gray-100 p-4 md:grid-cols-4 md:p-6">
          <div className="md:col-span-2 relative">
            <label className="text-xs font-semibold text-gray-500 mb-1 block">TÌM KIẾM SẢN PHẨM</label>
            <Search className="w-4 h-4 absolute left-3 top-[34px] text-gray-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              placeholder="Nhập tên hoặc mã sản phẩm..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">NGƯỠNG CẢNH BÁO</label>
            <input
              type="number"
              min={1}
              value={threshold}
              onChange={(e) => {
                const value = Math.max(1, Number(e.target.value || 1));
                setThreshold(value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2">
            <input
              type="checkbox"
              checked={onlyLowStock}
              onChange={(e) => {
                setOnlyLowStock(e.target.checked);
                setPage(1);
              }}
              className="w-4 h-4"
            />
            Chỉ hiện thị sản phẩm sắp hết.
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[680px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="px-3 py-3 font-medium md:px-6 md:py-4">Sản Phẩm</th>
                <th className="px-3 py-3 font-medium md:px-6 md:py-4">Giá Bán</th>
                <th className="px-3 py-3 font-medium md:px-6 md:py-4">Tồn Kho</th>
                <th className="px-3 py-3 font-medium md:px-6 md:py-4">Canh Báo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-3 py-10 text-center text-gray-500 md:px-6">
                   Đang tải dữ liệu kho...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-3 py-12 text-center text-gray-500 md:px-6">
                    <div className="flex flex-col items-center">
                      <Package className="w-10 h-10 text-gray-300 mb-2" />
                      Không có sản phẩm phù hợp
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((product) => {
                  const isLow = Number(product.stock_quantity) < threshold;
                  const isOut = Number(product.stock_quantity) <= 0;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 md:px-6 md:py-4">
                        <p className="font-semibold text-gray-900">{product.productName}</p>
                        <p className="text-xs text-gray-500">{product.productCode}</p>
                      </td>
                      <td className="px-3 py-3 font-semibold text-gray-700 md:px-6 md:py-4">
                        {Number(product.salePrice).toLocaleString()} đ
                      </td>
                      <td className="px-3 py-3 md:px-6 md:py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            isOut
                              ? "bg-red-100 text-red-700"
                              : isLow
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {product.stock_quantity} {product.unit || "don vi"}
                        </span>
                      </td>
                      <td className="px-3 py-3 md:px-6 md:py-4">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-bold">
                            <AlertTriangle className="w-4 h-4" />
                            Sắp hết
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">Bình thường</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 p-4 md:p-6">
          <p className="text-sm text-gray-500">
            Trang <span className="font-semibold">{page}</span> / {totalPage}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(totalPage, prev + 1))}
              disabled={page >= totalPage}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
