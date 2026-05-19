import { useState } from "react";
import { TrendingUp, DollarSign, ShoppingBag, ArrowUpRight, ArrowDownRight, Activity, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { statisticApi } from "../../api/statistic.api";
import Breadcrumb from "../../components/Breadcrumb";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md md:p-6">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    {trendValue && (
      <div className="mt-4 flex items-center text-sm">
        {trend === "up" ? (
          <span className="flex items-center text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-md">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            {trendValue}
          </span>
        ) : trend === "down" ? (
          <span className="flex items-center text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-md">
            <ArrowDownRight className="w-4 h-4 mr-1" />
            {trendValue}
          </span>
        ) : (
          <span className="flex items-center text-gray-600 font-medium bg-gray-50 px-2 py-0.5 rounded-md">
            {trendValue}
          </span>
        )}
        <span className="text-gray-400 ml-2">so với tháng trước</span>
      </div>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 shadow-lg rounded-xl border border-gray-100">
        <p className="text-xs text-gray-400 font-bold uppercase mb-1">{label}</p>
        <p className="text-lg font-black text-primary">
          {Number(payload[0].value).toLocaleString()} đ
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [range, setRange] = useState("30");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats", range],
    queryFn: () => statisticApi.getDashboard({ days: range }),
    refetchInterval: 60000,
  });

  const summary = stats?.summary;
  const revenueData = stats?.revenueOverview || [];
  const revenueByMonth = stats?.revenueByMonth || [];
  const topSelling = stats?.topSelling || [];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4">
          <Breadcrumb 
            items={[
              { label: "Trang chủ" },
              { label: "Tổng quan", active: true }
            ]} 
          />

        </div>
        <div className="flex space-x-2">
          <select 
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none cursor-pointer hover:bg-gray-100 transition"
          >
            <option value="1">Hôm nay</option>
            <option value="7">7 ngày gần nhất</option>
            <option value="30">30 ngày gần nhất</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        <StatCard
          title="Tổng doanh thu"
          value={isLoading ? "..." : `${(summary?.revenue?.value || 0).toLocaleString()} đ`}
          icon={DollarSign}
          trend={summary?.revenue?.trend}
          trendValue={summary?.revenue?.trendValue}
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Tổng đơn hàng"
          value={isLoading ? "..." : (summary?.orders?.value || 0).toString()}
          icon={ShoppingBag}
          trend={summary?.orders?.trend}
          trendValue={summary?.orders?.trendValue}
          colorClass="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Giá trị đơn trung bình"
          value={isLoading ? "..." : `${Math.round(summary?.avgOrderValue?.value || 0).toLocaleString()} đ`}
          icon={TrendingUp}
          colorClass="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Sản phẩm dang bán"
          value={isLoading ? "..." : (summary?.activeProducts?.value || 0).toString()}
          icon={Activity}
          colorClass="bg-emerald-50 text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 md:gap-6">
        <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-6 lg:col-span-2">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-bold text-gray-800">Tổng quan doanh thu</h3>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-gray-500 font-medium">Doanh thu theo ngày</span>
            </div>
          </div>

          <div className="flex-1 min-h-[300px] w-full">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 animate-pulse">
                <p className="text-gray-400">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <Package className="w-5 h-5 mr-2 text-primary" /> Sản phẩm bán chạy
          </h3>
          <div className="flex-1 space-y-5">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex space-x-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-50 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : topSelling.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <Package className="w-12 h-12 text-gray-200 mb-2" />
                <p className="text-gray-400 text-sm">Chưa có dữ liệu bán hàng</p>
              </div>
            ) : (
              topSelling.map((item, i) => (
                <div key={i} className="group flex items-center justify-between p-1 rounded-xl hover:bg-gray-50 transition">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold relative overflow-hidden ${i === 0 ? "bg-amber-50 text-amber-600" :
                      i === 1 ? "bg-slate-50 text-slate-500" :
                        "bg-orange-50 text-orange-600"
                      }`}>
                      {item.image ? (
                        <img src={`http://localhost:3069/images/${item.image}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>#{i + 1}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate">{item.productName}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.productCode} • {item.totalSales} đã bán</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">{item.totalRevenue.toLocaleString()} đ</p>
                    <div className="flex items-center justify-end text-[10px] text-green-500 font-bold">
                      <ArrowUpRight className="w-3 h-3" /> Nổi bật
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>


        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-bold text-gray-800">Xu hướng doanh thu theo tháng</h3>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">12 tháng gần nhất</span>
        </div>
        <div className="h-[320px]">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 animate-pulse">
              <p className="text-gray-400">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickFormatter={(value) => `${Math.round(value / 1000000)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


