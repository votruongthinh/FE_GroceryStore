import { useState, useRef, useEffect } from "react";
import { Bell, AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { productApi } from "../api/product.api";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const threshold = 10;
  const inventoryRoute =
    Number(user?.roleId) === 1 ? "/admin/products" : "/staff/inventory";

  const { data: rawProducts } = useQuery({
    queryKey: ["low-stock-products", threshold],
    queryFn: async () => {
      const res = await productApi.lowStock({
        threshold,
        page: 1,
        pageSize: 50,
      });
      return res.data || res;
    },
    refetchInterval: 30000,
  });

  const lowStockProducts = Array.isArray(rawProducts?.items)
    ? rawProducts.items
    : Array.isArray(rawProducts)
      ? rawProducts
      : [];

  const unreadCount = lowStockProducts.length;

  // click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !buttonRef.current?.contains(event.target) &&
        !dropdownRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // esc close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative">
      {/* BUTTON */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:bg-gray-100 rounded-full"
      >
        <Bell className="w-6 h-6" />

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className="
              fixed z-[999]

              /* MOBILE: center */
              left-1/2 -translate-x-1/2 top-20
              w-[92vw] max-w-[420px]

              /* DESKTOP */
              sm:left-auto sm:translate-x-0
              sm:right-6 sm:top-16 sm:w-[22rem]

              bg-white rounded-2xl shadow-2xl border border-gray-100
              overflow-hidden
            "
          >
            {/* HEADER */}
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-700">Thông báo</h3>
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">
                {unreadCount} Cảnh báo
              </span>
            </div>

            {/* LIST */}
            <div className="max-h-[350px] overflow-y-auto">
              {lowStockProducts.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">
                    Tất cả sản phẩm vẫn còn hàng
                  </p>
                </div>
              ) : (
                lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      navigate(inventoryRoute);
                      setIsOpen(false);
                    }}
                    className="p-4 hover:bg-gray-50 cursor-pointer border-b flex gap-3"
                  >
                    <div
                      className={`p-2 rounded-lg ${p.stock_quantity === 0
                          ? "bg-red-100 text-red-600"
                          : "bg-amber-100 text-amber-600"
                        }`}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-bold truncate">
                        {p.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {p.stock_quantity === 0
                          ? "Đã hết hàng"
                          : `Sắp hết: ${p.stock_quantity} ${p.unit || "đơn vị"
                          }`}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* FOOTER */}
            {lowStockProducts.length > 0 && (
              <button
                onClick={() => {
                  navigate(inventoryRoute);
                  setIsOpen(false);
                }}
                className="w-full py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 border-t"
              >
                Quản lý kho
              </button>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

export default NotificationCenter;