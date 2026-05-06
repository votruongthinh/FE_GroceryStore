import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { DollarSign, ShoppingCart, Activity } from "lucide-react";
import { statisticApi } from "../../api/statistic.api";

const StatCard = ({ title, value, icon: Icon, subtitle, colorClass }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
        {subtitle ? <p className="text-xs text-gray-400 mt-1">{subtitle}</p> : null}
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const CurrencyTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-3">
      <p className="text-xs text-gray-400 font-bold uppercase mb-1">{label}</p>
      <p className="text-sm font-black text-primary">
        {Number(payload[0].value || 0).toLocaleString()} đ
      </p>
    </div>
  );
};

const StaffDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["staff-dashboard"],
    queryFn: async () => {
      const res = await statisticApi.getStaffDashboard();
      return res.data || res;
    },
    refetchInterval: 60000,
  });

  const todayRevenue = Number(data?.todayRevenue || 0);
  const todayOrders = Number(data?.todayOrders || 0);
  const hourlyRevenue = data?.hourlyRevenue || [];
  const monthlyRevenue = data?.monthlyRevenue || [];
  const avgOrderValue = todayOrders > 0 ? todayRevenue / todayOrders : 0;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <h2 className="text-2xl font-black text-gray-900">Bảng Điều Khiển Bán Hàng</h2>
        <p className="text-sm text-gray-500 mt-1">
          Theo dõi doanh thu theo giờ và hiệu suất theo tháng.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
        <StatCard
          title="Doanh Thu Hôm Nay"
          value={isLoading ? "..." : `${todayRevenue.toLocaleString()} đ`}
          icon={DollarSign}
          subtitle="Chỉ tính đơn PAID/COMPLETED"
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Số Đơn Hôm Nay"
          value={isLoading ? "..." : todayOrders.toLocaleString()}
          icon={ShoppingCart}
          subtitle="Tổng số giao dịch thành công"
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Giá Trị Đơn TB"
          value={isLoading ? "..." : `${Math.round(avgOrderValue).toLocaleString()} đ`}
          icon={Activity}
          subtitle="Theo dữ liệu hôm nay"
          colorClass="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 md:gap-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Doanh Thu Theo Giờ (Hôm Nay)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                <Tooltip content={<CurrencyTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Doanh Thu Theo Tháng</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(value) => `${Math.round(value / 1000000)}M`} />
                <Tooltip content={<CurrencyTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
