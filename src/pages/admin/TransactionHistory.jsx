import { useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { orderApi } from "../../api/order.api";
import { History, Calendar, X, FileText, Download, CheckCircle2 } from "lucide-react";
import { BASE_URL } from "../../api/axiosClient";

const TransactionHistory = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: rawOrders, isLoading } = useQuery({
    queryKey: ["orders", selectedDate],
    queryFn: async () => {
      const res = await orderApi.findAll({
        date: selectedDate,
        status: "paid,completed",
        page: 1,
        pageSize: 100,
      });
      return res.data || res;
    },
  });

  const orders = Array.isArray(rawOrders?.items) ? rawOrders.items : (Array.isArray(rawOrders) ? rawOrders : []);
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleExportExcel = (orderId) => {
    window.location.href = `${BASE_URL}/order/${orderId}/export`;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:p-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <History className="w-6 h-6 mr-2 text-primary" /> Lịch sử giao dịch
          </h2>
          <p className="text-gray-500 text-sm mt-1">Xem nhật ký và chi tiết giao dịch theo ngày</p>
        </div>

        <div className="flex w-full items-center space-x-3 rounded-xl border border-gray-200 bg-gray-50 p-2 sm:w-auto">
          <Calendar className="w-5 h-5 text-gray-400 ml-2" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 outline-none pr-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
          <p className="text-sm font-medium text-gray-500 mb-1">Số đơn hàng {selectedDate}</p>
          <h3 className="text-3xl font-bold text-gray-900">{orders.length}</h3>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
          <p className="text-sm font-medium text-gray-500 mb-1">Tổng Danh Thu</p>
          <h3 className="text-3xl font-bold text-primary">{totalRevenue.toLocaleString()} đ</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto p-4">
          <table className="min-w-[680px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="rounded-tl-lg px-3 py-3 font-medium md:px-6 md:py-4">Mã Đơn</th>
                <th className="px-3 py-3 font-medium md:px-6 md:py-4">Thời gian</th>
                <th className="px-3 py-3 font-medium md:px-6 md:py-4">Phương thức thanh toán</th>
                <th className="rounded-tr-lg px-3 py-3 text-right font-medium md:px-6 md:py-4">Tổng Tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-3 py-8 text-center text-gray-500 md:px-6">Đang Tải...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-3 py-12 text-center text-gray-500 md:px-6">
                    <div className="flex flex-col items-center">
                      <History className="w-10 h-10 text-gray-300 mb-2" />
                      <p>Không có giao dịch trong ngày này.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => handleRowClick(order)}
                  >
                    <td className="px-3 py-3 font-medium text-gray-900 md:px-6 md:py-4">#{order.id}</td>
                    <td className="px-3 py-3 text-sm text-gray-600 md:px-6 md:py-4">
                      {new Date(order.orderDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-3 py-3 text-sm md:px-6 md:py-4">
                      <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 font-medium capitalize">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-gray-900 md:px-6 md:py-4">
                      {Number(order.total).toLocaleString()} đ
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedOrder && createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-6 backdrop-blur-sm sm:items-center sm:pt-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between gap-4 border-b border-gray-100 bg-gray-50/50 p-4 md:items-center md:p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Chi tiết đơn hàng</h3>
                  <p className="text-sm text-gray-500">#{selectedOrder.id} • {new Date(selectedOrder.orderDate).toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 md:p-6">
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nhân Viên</p>
                  <p className="font-medium text-gray-800">{selectedOrder.Users?.fullName || "Quan tri he thong"}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trạng Thái</p>
                  <div className="flex items-center text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> ĐÃ THANH TOÁN
                  </div>
                </div>
              </div>

              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Sản Phẩm</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">SL</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selectedOrder.OrderDetails?.map((detail) => (
                      <tr key={detail.productId}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 text-sm">{detail.Product?.productName}</p>
                          <p className="text-[10px] text-gray-400">{detail.Product?.productCode}</p>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600">{detail.amount}</td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                          {Number(detail.subtotal).toLocaleString()} đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col space-y-4 border-t border-gray-100 bg-gray-50/50 p-4 md:p-6">
              <div className="flex justify-between items-center px-2">
                <p className="text-gray-500 font-medium">Tổng Tiền</p>
                <p className="text-2xl font-black text-primary">{Number(selectedOrder.total).toLocaleString()} đ</p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleExportExcel(selectedOrder.id)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-2xl font-bold shadow-lg shadow-green-100 transition-all active:scale-95"
                >
                  <Download className="w-5 h-5" />
                  <span>Xuất file Excel (.xlsx)</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};

export default TransactionHistory;
