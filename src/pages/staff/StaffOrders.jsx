import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { orderApi } from "../../api/order.api";
import {
  History,
  ChevronDown,
  ChevronUp,
  Package,
  Clock,
  CreditCard,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const isRevenueStatus = (status) => ["paid", "completed"].includes(String(status || "").toLowerCase());

const getStatusBadgeClass = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "paid" || normalized === "completed") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (normalized === "pending") {
    return "bg-amber-100 text-amber-700";
  }
  if (normalized === "cancelled") {
    return "bg-red-100 text-red-700";
  }
  return "bg-gray-100 text-gray-700";
};

const StaffOrders = () => {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterType, setFilterType] = useState("today");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const queryParams = useMemo(() => {
    const params = {
      scope: "mine",
      page,
      pageSize,
    };

    if (filterType === "today") {
      params.date = selectedDate;
    } else if (filterType === "month") {
      params.month = selectedMonth;
    } else {
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
    }

    return params;
  }, [filterType, selectedDate, selectedMonth, fromDate, toDate, page]);

  const { data: rawOrders, isLoading } = useQuery({
    queryKey: ["orders-staff", queryParams],
    queryFn: async () => {
      const res = await orderApi.findAll(queryParams);
      return res.data || res;
    },
  });

  const orders = Array.isArray(rawOrders?.items)
    ? rawOrders.items
    : Array.isArray(rawOrders)
      ? rawOrders
      : [];

  const totalPage = Number(rawOrders?.totalPage || 1);
  const revenue = orders
    .filter((order) => isRevenueStatus(order.status))
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const toggleExpand = (id) => {
    setExpandedOrder((prev) => (prev === id ? null : id));
  };

  const updateFilterType = (value) => {
    setFilterType(value);
    setPage(1);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center md:p-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <History className="w-6 h-6 mr-2 text-primary" /> Lịch sử đơn hàng
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Lịch sử đơn hàng của tài khoản đăng nhập
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Doanh Thu (Trang Hiện Tại)</p>
          <p className="text-2xl font-bold text-primary">
            {revenue.toLocaleString()} <span className="text-xs">đ</span>
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateFilterType("today")}
            className={`px-3 py-2 rounded-lg text-sm font-semibold ${
              filterType === "today" ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
           Hôm nay
          </button>
          <button
            onClick={() => updateFilterType("month")}
            className={`px-3 py-2 rounded-lg text-sm font-semibold ${
              filterType === "month" ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            Theo tháng
          </button>
          <button
            onClick={() => updateFilterType("range")}
            className={`px-3 py-2 rounded-lg text-sm font-semibold ${
              filterType === "range" ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            Khoảng ngày
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {filterType === "today" && (
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Ngày</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
          )}

          {filterType === "month" && (
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Tháng</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
          )}

          {filterType === "range" && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Từ ngày</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Đến ngày</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[780px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-xs uppercase tracking-tighter border-b border-gray-100">
                <th className="px-3 py-3 font-semibold md:px-6 md:py-4">Mã đơn</th>
                <th className="px-3 py-3 font-semibold md:px-6 md:py-4">Thời gian</th>
                <th className="px-3 py-3 font-semibold md:px-6 md:py-4">Thanh toán</th>
                <th className="px-3 py-3 font-semibold md:px-6 md:py-4">Trạng thái</th>
                <th className="px-3 py-3 text-right font-semibold md:px-6 md:py-4">Tổng tiền</th>
                <th className="w-10 px-3 py-3 md:px-6 md:py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-3 py-12 text-center text-gray-400 italic md:px-6">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-3 py-16 text-center text-gray-400 md:px-6 md:py-20">
                    <div className="flex flex-col items-center">
                      <Package className="w-12 h-12 text-gray-200 mb-2 opacity-30" />
                      <p className="text-sm font-medium">Không có đơn hàng nào trong bộ lọc hiện tại.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                        expandedOrder === order.id ? "bg-primary/5" : ""
                      }`}
                      onClick={() => toggleExpand(order.id)}
                    >
                      <td className="px-3 py-3 md:px-6 md:py-4">
                        <span className="font-bold text-slate-800">#{order.id}</span>
                      </td>
                      <td className="px-3 py-3 md:px-6 md:py-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-300" />
                          {new Date(order.orderDate).toLocaleString("vi-VN", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </div>
                      </td>
                      <td className="px-3 py-3 md:px-6 md:py-4">
                        <div className="flex items-center text-xs font-semibold text-slate-500 uppercase">
                          <CreditCard className="w-3.5 h-3.5 mr-1.5 text-primary/40" />
                          {order.paymentMethod}
                        </div>
                      </td>
                      <td className="px-3 py-3 md:px-6 md:py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-slate-900 md:px-6 md:py-4">
                        {Number(order.total).toLocaleString()} đ
                      </td>
                      <td className="px-3 py-3 md:px-6 md:py-4">
                        {expandedOrder === order.id ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </td>
                    </tr>
                    {expandedOrder === order.id && (
                      <tr className="bg-gray-50/50">
                        <td colSpan="6" className="border-l-4 border-primary px-4 py-4 md:px-12 md:py-6">
                          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 border-b border-gray-100">
                                <tr className="text-slate-400 text-[10px] font-semibold uppercase">
                                  <th className="px-4 py-2 text-left">Sảm Phẩm</th>
                                  <th className="px-4 py-2 text-center">Số Lượng</th>
                                  <th className="px-4 py-2 text-right">Đơn giá</th>
                                  <th className="px-4 py-2 text-right">Thành Tiền</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                                {order.OrderDetails?.map((detail) => (
                                  <tr key={`${detail.orderId}-${detail.productId}`}>
                                    <td className="px-4 py-3">
                                      <p className="font-semibold text-slate-800">{detail.Product?.productName}</p>
                                      <p className="text-[10px] text-gray-400">{detail.Product?.productCode}</p>
                                    </td>
                                    <td className="px-4 py-3 text-center">{detail.amount}</td>
                                    <td className="px-4 py-3 text-right">
                                      {Number(detail.sellingPrice).toLocaleString()} đ
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-primary">
                                      {Number(detail.subtotal).toLocaleString()} đ
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 bg-white px-4 py-4 md:px-6">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Trang {page} / {Math.max(totalPage, 1)}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(Math.max(totalPage, 1), prev + 1))}
              disabled={page >= Math.max(totalPage, 1)}
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

export default StaffOrders;
