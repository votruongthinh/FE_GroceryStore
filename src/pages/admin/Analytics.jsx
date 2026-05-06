import { useQuery } from "@tanstack/react-query";
import { statisticApi } from "../../api/statistic.api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  PieChart as PieChartIcon,
  BarChart2,
  Clock,
  CheckCircle2,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const AnalyticsCard = ({ title, children, icon: Icon }) => (
  <div className="flex flex-col rounded-[2rem] border border-gray-100 bg-white p-4 shadow-sm md:p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-bold text-gray-800 flex items-center">
        {Icon && <Icon className="w-5 h-5 mr-2 text-primary" />}
        {title}
      </h3>
    </div>
    <div className="flex-1 min-h-[300px]">
      {children}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label, suffix = "đ" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 shadow-xl rounded-2xl border border-gray-50">
        <p className="text-xs text-gray-400 font-bold uppercase mb-1">{label}</p>
        <p className="text-lg font-black text-primary">
          {payload[0].value.toLocaleString()} {suffix}
        </p>
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => statisticApi.getAnalytics(),
    refetchInterval: 300000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-40 bg-white rounded-[2rem] animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-96 bg-white rounded-[2rem] animate-pulse"></div>
          <div className="h-96 bg-white rounded-[2rem] animate-pulse"></div>
        </div>
      </div>
    );
  }

  const {
    revenueByDay,
    revenueByMonth,
    categoryStats,
    hourlySales,
    statusDistribution,
    topProducts,
    summary,
  } = analytics;

  return (
    <div className="space-y-4 pb-10 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">Phân Tích Kinh Doanh</h1>
          <p className="text-gray-500 font-medium mt-1">Trực quan dữ liệu và xu hướng bán hàng nâng cao.</p>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto rounded-2xl border border-gray-100 bg-white p-1 shadow-sm">
          <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md">Theo tháng</button>
          <button className="px-4 py-2 text-gray-400 text-xs font-bold hover:bg-gray-50 rounded-xl transition">Theo tuần</button>
          <button className="px-4 py-2 text-gray-400 text-xs font-bold hover:bg-gray-50 rounded-xl transition">Tùy chỉnh</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
        <div className="rounded-[2rem] bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-xl shadow-blue-200 md:rounded-[2.5rem] md:p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <DollarSign className="w-6 h-6" />
            </div>
            {summary.revenue.trend === "up" ? <ArrowUpRight className="w-6 h-6 text-blue-200" /> : <ArrowDownRight className="w-6 h-6 text-blue-200" />}
          </div>
          <p className="text-blue-100 font-bold uppercase tracking-widest text-[10px] mb-1">Doanh thu tháng</p>
          <h3 className="text-3xl font-black">{summary.revenue.value.toLocaleString()} đ</h3>
          <div className="mt-4 flex items-center text-xs font-bold text-blue-100">
            <span className="bg-white/20 px-2 py-0.5 rounded-md mr-2">{summary.revenue.trendValue}</span>
            so với tháng trước
          </div>
        </div>

        <div className="rounded-[2rem] bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-white shadow-xl shadow-emerald-200 md:rounded-[2.5rem] md:p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <ShoppingBag className="w-6 h-6" />
            </div>
            {summary.orders.trend === "up" ? <ArrowUpRight className="w-6 h-6 text-emerald-200" /> : <ArrowDownRight className="w-6 h-6 text-emerald-200" />}
          </div>
          <p className="text-emerald-100 font-bold uppercase tracking-widest text-[10px] mb-1">Tổng đơn hàng</p>
          <h3 className="text-3xl font-black">{summary.orders.value.toLocaleString()}</h3>
          <div className="mt-4 flex items-center text-xs font-bold text-emerald-100">
            <span className="bg-white/20 px-2 py-0.5 rounded-md mr-2">{summary.orders.trendValue}</span>
            mức biến dộng
          </div>
        </div>

        <div className="rounded-[2rem] bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white shadow-xl shadow-amber-200 md:rounded-[2.5rem] md:p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <TrendingUp className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-6 h-6 text-amber-100" />
          </div>
          <p className="text-amber-50 font-bold uppercase tracking-widest text-[10px] mb-1">Giá trị đơn trung bình</p>
          <h3 className="text-3xl font-black">{Math.round(summary.avgOrderValue.value).toLocaleString()} đ</h3>
          <div className="mt-4 flex items-center text-xs font-bold text-amber-50">
            <span className="bg-white/20 px-2 py-0.5 rounded-md mr-2">+4.2%</span>
            hiệu suất giỏ hàng
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 md:gap-8">
        <AnalyticsCard title="Diễn biến doanh thu (30 ngày)" icon={BarChart2}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueByDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevAnalytics" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRevAnalytics)" />
            </AreaChart>
          </ResponsiveContainer>
        </AnalyticsCard>

        <AnalyticsCard title="Doanh thu theo tháng" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </AnalyticsCard>

        <AnalyticsCard title="Cơ cấu doanh thu theo danh mục" icon={PieChartIcon}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryStats}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toLocaleString()} đ`} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </AnalyticsCard>

        <AnalyticsCard title="Doanh thu theo giờ (hôm nay)" icon={Clock}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlySales}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsCard>

        <AnalyticsCard title="Phân bố trạng thái đơn hàng" icon={CheckCircle2}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={110}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === "PAID" ? "#10b981" : entry.name === "PENDING" ? "#f59e0b" : "#ef4444"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </AnalyticsCard>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm md:rounded-[2.5rem]">
        <div className="flex flex-col gap-3 border-b border-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between md:p-8">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <Package className="w-6 h-6 mr-3 text-primary" /> Sản phẩm hiệu suất cao
          </h3>
          <button className="text-xs font-black text-primary uppercase tracking-widest hover:underline">Xuất báo cáo</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[780px] w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">
                <th className="px-4 py-3 md:px-8 md:py-4">Thông tin sản phẩm</th>
                <th className="px-4 py-3 md:px-8 md:py-4">Số lượng dã bán</th>
                <th className="px-4 py-3 md:px-8 md:py-4">Tổng doanh thu</th>
                <th className="px-4 py-3 text-right md:px-8 md:py-4">Tỷ lệ dóng góp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topProducts.map((p, i) => (
                <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-4 py-4 md:px-8 md:py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
                        {p.image ? (
                          <img src={`http://localhost:3069/images/${p.image}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-gray-300">#{i + 1}</div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{p.productName}</p>
                        <p className="text-[10px] font-mono text-gray-400">{p.productCode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 md:px-8 md:py-5">
                    <span className="font-bold text-lg text-gray-800">{p.totalSales}</span>
                    <span className="text-[10px] text-gray-400 ml-1 font-bold">SẢN PHẨM</span>
                  </td>
                  <td className="px-4 py-4 md:px-8 md:py-5">
                    <p className="font-black text-gray-900">{p.totalRevenue.toLocaleString()} đ</p>
                  </td>
                  <td className="px-4 py-4 text-right md:px-8 md:py-5">
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden max-w-[100px] ml-auto">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${Math.min(100, (p.totalRevenue / topProducts[0].totalRevenue) * 100)}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;


