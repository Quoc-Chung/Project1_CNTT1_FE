"use client"
import React, { useState, useMemo } from "react";
import {
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  BarChart3,
  Activity,
  XCircle,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";
import { DashboardStats, Product } from "@/types/Admin";
import { formatDate, formatPrice } from '../../utils/helpers';
import Image from "next/image";

interface OrdersByStatus {
  CANCELLED: number;
  DELIVERED: number;
  COMPLETED: number;
  CONFIRMED: number;
  RETURNED: number;
  PROCESSING: number;
  PENDING: number;
  SHIPPING: number;
}

interface InventorySummary {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  lowStockThreshold: number;
}

interface MonthlyRevenueData {
  month: string;
  revenue: number;
  orders: number;
}

interface DashboardOverviewProps {
  stats: DashboardStats;
  products: Product[];
  ordersByStatus?: OrdersByStatus;
  inventorySummary?: InventorySummary;
  monthlyRevenue?: MonthlyRevenueData[];
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  products,
  ordersByStatus,
  inventorySummary,
  monthlyRevenue = [],
}) => {
  // Sử dụng dữ liệu thực từ API, nếu không có thì dùng mock data
  const chartData = monthlyRevenue.length > 0 ? monthlyRevenue : [
    { month: "Tháng 1", revenue: 0, orders: 0 },
    { month: "Tháng 2", revenue: 0, orders: 0 },
    { month: "Tháng 3", revenue: 0, orders: 0 },
    { month: "Tháng 4", revenue: 0, orders: 0 },
    { month: "Tháng 5", revenue: 0, orders: 0 },
    { month: "Tháng 6", revenue: 0, orders: 0 },
  ];

  // Map order status data cho biểu đồ
  const orderStatusData = ordersByStatus ? [
    { status: "Chờ xử lý", count: ordersByStatus.PENDING || 0, color: "bg-yellow-500" },
    { status: "Đang xử lý", count: ordersByStatus.PROCESSING || 0, color: "bg-blue-500" },
    { status: "Đã xác nhận", count: ordersByStatus.CONFIRMED || 0, color: "bg-indigo-500" },
    { status: "Đang giao", count: ordersByStatus.SHIPPING || 0, color: "bg-purple-500" },
    { status: "Đã giao", count: ordersByStatus.DELIVERED || 0, color: "bg-teal-500" },
    { status: "Hoàn thành", count: ordersByStatus.COMPLETED || 0, color: "bg-green-500" },
    { status: "Đã hủy", count: ordersByStatus.CANCELLED || 0, color: "bg-red-500" },
    { status: "Trả hàng", count: ordersByStatus.RETURNED || 0, color: "bg-orange-500" },
  ] : [
    { status: "Chờ xử lý", count: 0, color: "bg-yellow-500" },
    { status: "Đang xử lý", count: 0, color: "bg-blue-500" },
    { status: "Đang giao hàng", count: 0, color: "bg-purple-500" },
    { status: "Hoàn thành", count: 0, color: "bg-green-500" },
    { status: "Đã hủy", count: 0, color: "bg-red-500" },
  ];
  
  const [chartType, setChartType] = useState<'revenue' | 'orders'>('revenue');
  
  // Tính maxValue an toàn
  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 1;
    const values = chartData.map(d => chartType === 'revenue' ? d.revenue : d.orders);
    const max = Math.max(...values);
    return max > 0 ? max : 1; // Tránh chia cho 0
  }, [chartData, chartType]);

  return (
    <div className="mt-5 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Tổng Quan</h2>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Calendar size={14} />
          <span>Cập nhật: {formatDate(new Date().toISOString())}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Tổng Doanh Thu",
            value: formatPrice(stats.totalRevenue),
            icon: <DollarSign size={28} className="opacity-80" />,
            trend: `+${stats.revenueGrowth}% so với tháng trước`,
            color: "bg-blue-600",
          },
          {
            title: "Khách Hàng",
            value: stats.totalCustomers.toLocaleString(),
            icon: <Users size={28} className="opacity-80" />,
            trend: `+${stats.customerGrowth}%`,
            color: "bg-green-600",
          },
          {
            title: "Đơn Hàng",
            value: stats.totalOrders.toLocaleString(),
            icon: <ShoppingCart size={28} className="opacity-80" />,
            trend: `+${stats.orderGrowth}%`,
            color: "bg-purple-600",
          },
          {
            title: "Sản Phẩm",
            value: stats.totalProducts,
            icon: <Package size={28} className="opacity-80" />,
            trend: `Đang hoạt động`,
            color: "bg-orange-600",
          },
        ].map((card, idx) => (
          <div key={idx} className={`${card.color} p-4 rounded-lg text-white shadow-lg h-full transition-transform hover:scale-105`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs opacity-90">{card.title}</p>
                <p className="text-xl font-bold mt-1">{card.value}</p>
                <p className="text-xs flex items-center mt-2">
                  <TrendingUp size={12} className="mr-1" />
                  {card.trend}
                </p>
              </div>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Biểu Đồ Thống Kê</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setChartType('revenue')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${chartType === 'revenue'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                Doanh Thu
              </button>
              <button
                onClick={() => setChartType('orders')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${chartType === 'orders'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                Đơn Hàng
              </button>
            </div>
          </div>

          {/* Chart Container */}
          <div className="h-80 relative bg-gradient-to-b from-gray-50 to-white rounded-lg p-4">
            {/* Grid Lines Background */}
            <div className="absolute inset-0 flex flex-col justify-between px-8 py-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-t border-gray-200 border-dashed"></div>
              ))}
            </div>

            {/* Chart Bars */}
            <div className="relative h-full flex items-end justify-between gap-2 px-8 pb-6">
              {chartData.map((data, index) => {
                const value = chartType === 'revenue' ? data.revenue : data.orders;
                const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                const displayValue = chartType === 'revenue'
                  ? formatPrice(value)
                  : `${value} đơn`;
                const shortValue = chartType === 'revenue'
                  ? value >= 1000000 
                    ? `${(value / 1000000).toFixed(1)}M`
                    : value >= 1000
                    ? `${(value / 1000).toFixed(0)}K`
                    : value.toString()
                  : `${value}`;
                
                // Màu sắc gradient động dựa trên giá trị
                const getBarGradient = () => {
                  if (chartType === 'revenue') {
                    if (height >= 80) return 'bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400';
                    if (height >= 60) return 'bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400';
                    if (height >= 40) return 'bg-gradient-to-t from-indigo-600 via-indigo-500 to-indigo-400';
                    if (height >= 20) return 'bg-gradient-to-t from-purple-600 via-purple-500 to-purple-400';
                    if (height > 0) return 'bg-gradient-to-t from-gray-500 via-gray-400 to-gray-300';
                    return 'bg-gray-200';
                  } else {
                    if (height >= 80) return 'bg-gradient-to-t from-purple-600 via-purple-500 to-purple-400';
                    if (height >= 60) return 'bg-gradient-to-t from-indigo-600 via-indigo-500 to-indigo-400';
                    if (height >= 40) return 'bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400';
                    if (height >= 20) return 'bg-gradient-to-t from-cyan-600 via-cyan-500 to-cyan-400';
                    if (height > 0) return 'bg-gradient-to-t from-gray-500 via-gray-400 to-gray-300';
                    return 'bg-gray-200';
                  }
                };

                return (
                  <div key={index} className="flex-1 flex flex-col items-center group relative h-full">
                    {/* Value Label on Top */}
                    {value > 0 && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10">
                        <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                          {displayValue}
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    )}

                    {/* Bar Container */}
                    <div className="relative w-full flex-1 flex items-end justify-center mb-1">
                      <div
                        className={`w-full rounded-t-xl transition-all duration-700 ease-out cursor-pointer group-hover:scale-105 group-hover:shadow-2xl relative overflow-hidden ${getBarGradient()}`}
                        style={{ 
                          height: `${Math.max(height, value > 0 ? 3 : 0)}%`,
                          minHeight: value > 0 ? '12px' : '0px',
                          animation: `slideUp 0.6s ease-out ${index * 0.1}s both`,
                          boxShadow: value > 0 ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                        }}
                      >
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent pointer-events-none"></div>
                        
                        {/* Value Display on Bar (always visible if > 0) */}
                        {value > 0 && height >= 15 && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-white text-[10px] font-bold drop-shadow-lg">
                              {shortValue}
                            </span>
                          </div>
                        )}

                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Month Label */}
                    <div className="text-xs font-semibold text-gray-700 text-center mt-2 min-h-[32px] flex items-center justify-center">
                      {data.month.split(' ')[1]}
                    </div>

                    {/* Value Label Below (always visible) */}
                    {value > 0 && (
                      <div className="text-xs font-bold text-gray-600 text-center mt-1">
                        {shortValue}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Y-axis labels */}
            <div className="absolute left-2 top-0 h-full flex flex-col justify-between text-xs font-semibold text-gray-600 pr-2 py-4">
              <span className="bg-white/80 px-1 rounded">{chartType === 'revenue' ? formatPrice(maxValue) : Math.floor(maxValue).toLocaleString()}</span>
              <span className="bg-white/80 px-1 rounded">{chartType === 'revenue' ? formatPrice(maxValue * 0.75) : Math.floor(maxValue * 0.75).toLocaleString()}</span>
              <span className="bg-white/80 px-1 rounded">{chartType === 'revenue' ? formatPrice(maxValue * 0.5) : Math.floor(maxValue * 0.5).toLocaleString()}</span>
              <span className="bg-white/80 px-1 rounded">{chartType === 'revenue' ? formatPrice(maxValue * 0.25) : Math.floor(maxValue * 0.25).toLocaleString()}</span>
              <span className="bg-white/80 px-1 rounded">0</span>
            </div>
          </div>

          {/* Chart Animation Styles */}
          <style jsx>{`
            @keyframes slideUp {
              from {
                height: 0%;
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>

          {/* Chart Legend & Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-lg shadow-sm ${chartType === 'revenue' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                  : 'bg-gradient-to-br from-purple-500 to-purple-600'
                }`}></div>
                <span className="text-sm font-semibold text-gray-700">
                  {chartType === 'revenue' ? 'Doanh Thu (VNĐ)' : 'Số Đơn Hàng'}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Tổng: <span className="font-bold text-gray-700">
                  {chartType === 'revenue' 
                    ? formatPrice(chartData.reduce((sum, d) => sum + d.revenue, 0))
                    : chartData.reduce((sum, d) => sum + d.orders, 0).toLocaleString() + ' đơn'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Sản Phẩm Bán Chạy</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {products
              .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
              .slice(0, 5)
              .map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-200"
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center text-xs font-bold text-white rounded-full flex-shrink-0 ${index === 0
                      ? "bg-yellow-500"
                      : index === 1
                        ? "bg-gray-400"
                        : index === 2
                          ? "bg-orange-500"
                          : "bg-blue-500"
                      }`}
                  >
                    {index + 1}
                  </div>

                  <Image
                    src={product.thumbnailUrl}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="rounded-lg object-cover flex-shrink-0"
                    style={{ width: "auto", height: "auto" }}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{product.soldCount || 0} đã bán</p>
                  </div>

                  <p className="text-sm font-bold text-gray-900 flex-shrink-0">{formatPrice(product.price)}</p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Order Status Chart */}
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <BarChart3 size={24} className="text-purple-600" />
          Thống Kê Đơn Hàng Theo Trạng Thái
        </h3>

        {/* Chart Container */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="h-80 relative">
            {/* Grid background */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border-t border-gray-200"></div>
              ))}
            </div>

            <div className="h-full flex items-end justify-between gap-6 relative z-10">
              {orderStatusData.map((data, index) => {
                const maxCount = Math.max(...orderStatusData.map(d => d.count), 1);
                const height = maxCount > 0 ? (data.count / maxCount) * 100 : 0;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    {/* Value Label on top */}
                    <div className="mb-3 min-h-[28px] flex items-center">
                      {data.count > 0 && (
                        <div className="bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
                          <span className="text-base font-bold text-gray-800">{data.count}</span>
                        </div>
                      )}
                    </div>

                    {/* Bar Column */}
                    <div className="relative w-full max-w-[80px] flex items-end justify-center group">
                      <div
                        className={`w-full rounded-t-xl transition-all duration-300 cursor-pointer relative overflow-hidden group-hover:scale-105 ${data.color}`}
                        style={{
                          height: `${height}%`,
                          minHeight: data.count > 0 ? '20px' : '2px',
                          boxShadow: data.count > 0 ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                        }}
                      >
                        {/* Glossy effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>

                        {/* Hover Tooltip */}
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-30">
                          <div className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-xl whitespace-nowrap">
                            <div className="font-bold text-sm">{data.status}</div>
                            <div className="text-xs text-gray-300 mt-0.5">{data.count} đơn hàng</div>
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-800"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Label */}
                    <div className="mt-4 text-center">
                      <div className="text-xs font-bold text-gray-700 leading-tight">
                        {data.status.split(' ').map((word, i) => (
                          <div key={i}>{word}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-4 gap-3">
          {orderStatusData.map((data, index) => (
            <div key={index} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow">
              <div className={`w-5 h-5 rounded ${data.color} flex-shrink-0`}></div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-700 truncate">{data.status}</div>
                <div className="text-xs text-gray-500">{data.count} đơn</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Thống Kê Kho Hàng */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-blue-600" />
            Thống Kê Kho Hàng
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-gray-600 mb-1">Tổng sản phẩm</div>
              <div className="text-2xl font-bold text-blue-600">
                {inventorySummary?.totalProducts?.toLocaleString() || 0}
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="text-sm text-gray-600 mb-1">Sắp hết hàng</div>
              <div className="text-2xl font-bold text-orange-600">
                {inventorySummary?.lowStock || 0}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-gray-600 mb-1">Hết hàng</div>
              <div className="text-2xl font-bold text-red-600">
                {inventorySummary?.outOfStock || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Thống Kê Đơn Hàng */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-purple-600" />
            Thống Kê Đơn Hàng
          </h3>
          <div className="space-y-3">
            {[
              {
                label: "Hôm nay",
                value: stats.totalOrders,
                icon: <Calendar size={16} className="text-blue-600" />,
                color: "text-blue-600"
              },
              {
                label: "Chờ xử lý",
                value: ordersByStatus?.PENDING || 0,
                icon: <Clock size={16} className="text-yellow-600" />,
                color: "text-yellow-600"
              },
              {
                label: "Đang xử lý",
                value: ordersByStatus?.PROCESSING || 0,
                icon: <Activity size={16} className="text-blue-600" />,
                color: "text-blue-600"
              },
              {
                label: "Hoàn thành",
                value: ordersByStatus?.COMPLETED || 0,
                icon: <CheckCircle size={16} className="text-green-600" />,
                color: "text-green-600"
              },
              {
                label: "Đơn hủy",
                value: ordersByStatus?.CANCELLED || 0,
                icon: <XCircle size={16} className="text-red-600" />,
                color: "text-red-600"
              },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition">
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-sm text-gray-700 font-medium">{item.label}:</span>
                </div>
                <span className={`font-bold text-lg ${item.color}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
