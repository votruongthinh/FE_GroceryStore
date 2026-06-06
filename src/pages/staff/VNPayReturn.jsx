import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckCircle, XCircle, Loader2, ArrowLeft, Printer, X, Receipt, RefreshCw } from "lucide-react";
import { BASE_URL } from "../../api/axiosClient";
import { orderApi } from "../../api/order.api";
import useAuthStore from "../../store/useAuthStore";
import POSReceipt from "../../components/pos/POSReceipt";
import InvoiceA4 from "../../components/pos/InvoiceA4";

const VNPayReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [order, setOrder] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptType, setReceiptType] = useState("pos");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/payment/vnpay-return?${searchParams.toString()}`,
        );

        if (response.status === 200) {
          const orderId = response.data.orderId;
          setStatus("success");
          setMessage("Thanh toán đơn hàng thành công!");
          
          try {
            const orderRes = await orderApi.findOne(orderId);
            setOrder(orderRes.data || orderRes);
          } catch (err) {
            console.error("Lỗi lấy thông tin đơn hàng:", err);
          }
        } else {
          setStatus("error");
          setMessage(response.data.message || "Thanh toán thất bại.");
        }
      } catch (error) {
        console.error("Lỗi xác thực:", error);
        setStatus("error");
        setMessage(error.response?.data?.message || "Có lỗi xảy ra trong quá trình xác thực.");
      }
    };

    if (searchParams.get("vnp_ResponseCode")) {
      verifyPayment();
      return;
    }

    const timer = window.setTimeout(() => {
      setStatus("error");
      setMessage("Dữ liệu thanh toán không hợp lệ.");
    }, 0);

    return () => window.clearTimeout(timer);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100 animate-card-in">
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
            <h2 className="text-2xl font-bold text-gray-800">Đang xác thực...</h2>
            <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="relative">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto animate-in zoom-in duration-500" />
              <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full scale-150 -z-10 opacity-50"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Thành công!</h2>
              <p className="text-gray-600 mt-2">{message}</p>
              {order && (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest leading-none mb-1">Mã đơn hàng</p>
                    <p className="font-bold text-slate-700">#HD{order.id.toString().padStart(6, '0')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest leading-none mb-1">Tổng tiền</p>
                    <p className="font-bold text-primary italic">{Number(order.total).toLocaleString()} đ</p>
                  </div>
                </div>
              )}
            </div>
            <div className="pt-4 space-y-3">
              {order && (
                <button
                  onClick={() => setShowReceipt(true)}
                  className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 text-sm uppercase tracking-widest active:scale-95"
                >
                  <Receipt className="w-5 h-5" />
                  XUẤT HÓA ĐƠN
                </button>
              )}
              <button
                onClick={() => navigate("/staff/pos")}
                className="w-full bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                Tiếp tục bán hàng
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <XCircle className="w-20 h-20 text-red-500 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Thất bại</h2>
              <p className="text-gray-600 mt-2">{message}</p>
            </div>
            <div className="pt-4">
              <button
                onClick={() => navigate("/staff/pos")}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại POS
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RECEIPT MODAL (Shared with POS) */}
      {showReceipt && order && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 print:p-0 print:bg-white">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:rounded-none print:w-auto">
            
            {/* Header / Tabs */}
            <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between print:hidden">
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                <button 
                  onClick={() => setReceiptType("pos")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${receiptType === 'pos' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Bill K80
                </button>
                <button 
                  onClick={() => setReceiptType("a4")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${receiptType === 'a4' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Hóa đơn A4
                </button>
              </div>
              <button 
                onClick={() => setShowReceipt(false)}
                className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6 bg-slate-50/30 custom-scrollbar print:p-0 print:overflow-visible print:bg-white">
              <div className="flex justify-center">
                {receiptType === 'pos' ? (
                  <POSReceipt order={order} user={user} />
                ) : (
                  <InvoiceA4 order={order} user={user} />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-white border-t border-slate-100 flex gap-3 print:hidden">
              <button 
                onClick={() => window.print()}
                className="flex-1 py-4 bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 text-sm uppercase tracking-widest active:scale-95"
              >
                <Printer className="w-5 h-5" />
                In hóa đơn
              </button>
              
              <button 
                onClick={() => navigate("/staff/pos")}
                className="w-16 h-14 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl transition-all active:scale-95"
                title="Quay lại POS"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VNPayReturn;
