import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { BASE_URL } from "../../api/axiosClient";

const VNPayReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/payment/vnpay-return?${searchParams.toString()}`,
        );

        if (response.status === 200) {
          setStatus("success");
          setMessage("Thanh toán đơn hàng thành công!");
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
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Thành công!</h2>
              <p className="text-gray-600 mt-2">{message}</p>
            </div>
            <div className="pt-4 space-y-3">
              <button
                onClick={() => navigate("/staff/pos")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Tiếp tục bán hàng
              </button>
              <Link
                to="/staff/orders"
                className="block w-full text-blue-600 font-medium py-2"
              >
                Xem lịch sử đơn hàng
              </Link>
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
    </div>
  );
};

export default VNPayReturn;


