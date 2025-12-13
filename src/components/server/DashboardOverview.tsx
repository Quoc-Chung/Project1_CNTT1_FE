"use client"
import React, { useState } from "react";
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

interface DashboardOverviewProps {
  stats: DashboardStats;
  products: Product[];
}

// Mock data cho biểu đồ doanh thu
const mockChartData = [
  { month: "Tháng 1", revenue: 125000000, orders: 45 },
  { month: "Tháng 2", revenue: 185000000, orders: 62 },
  { month: "Tháng 3", revenue: 142000000, orders: 48 },
  { month: "Tháng 4", revenue: 210000000, orders: 78 },
  { month: "Tháng 5", revenue: 275000000, orders: 95 },
  { month: "Tháng 6", revenue: 320000000, orders: 112 },
];

// Mock data cho biểu đồ đơn hàng theo trạng thái
const mockOrderStatusData = [
  { status: "Chờ xử lý", count: 15, color: "bg-yellow-500" },
  { status: "Đang xử lý", count: 28, color: "bg-blue-500" },
  { status: "Đang giao hàng", count: 42, color: "bg-purple-500" },
  { status: "Hoàn thành", count: 156, color: "bg-green-500" },
  { status: "Đã hủy", count: 8, color: "bg-red-500" },
];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  products,
}) => {
  const [chartType, setChartType] = useState<'revenue' | 'orders'>('revenue');
  const maxValue = Math.max(...mockChartData.map(d => chartType === 'revenue' ? d.revenue : d.orders));

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
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  chartType === 'revenue'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Doanh Thu
              </button>
              <button
                onClick={() => setChartType('orders')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  chartType === 'orders'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Đơn Hàng
              </button>
            </div>
          </div>
          
          {/* Chart Container */}
          <div className="h-80 relative">
            <div className="h-full flex items-end justify-between gap-3 pb-8">
              {mockChartData.map((data, index) => {
                const value = chartType === 'revenue' ? data.revenue : data.orders;
                const height = (value / maxValue) * 100;
                const displayValue = chartType === 'revenue' 
                  ? formatPrice(value) 
                  : `${value} đơn`;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    {/* Bar */}
                    <div className="relative w-full flex items-end justify-center mb-2">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 hover:opacity-90 cursor-pointer ${
                          chartType === 'revenue'
                            ? 'bg-gradient-to-t from-blue-600 to-blue-400'
                            : 'bg-gradient-to-t from-purple-600 to-purple-400'
                        }`}
                        style={{ height: `${height}%`, minHeight: '8px' }}
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                          <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {displayValue}
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Month Label */}
                    <div className="text-xs text-gray-600 font-medium text-center mt-2">
                      {data.month.split(' ')[1]}
                    </div>
                    
                    {/* Value Label */}
                    <div className="text-xs text-gray-500 text-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {chartType === 'revenue' 
                        ? `${(value / 1000000).toFixed(0)}M`
                        : `${value}`
                      }
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
              <span>{chartType === 'revenue' ? formatPrice(maxValue) : maxValue}</span>
              <span>{chartType === 'revenue' ? formatPrice(maxValue / 2) : Math.floor(maxValue / 2)}</span>
              <span>0</span>
            </div>
          </div>
          
          {/* Chart Legend */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${
                chartType === 'revenue' ? 'bg-blue-500' : 'bg-purple-500'
              }`}></div>
              <span className="text-xs text-gray-600">
                {chartType === 'revenue' ? 'Doanh Thu (VNĐ)' : 'Số Đơn Hàng'}
              </span>
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
                    className={`w-8 h-8 flex items-center justify-center text-xs font-bold text-white rounded-full flex-shrink-0 ${
                      index === 0
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
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart3 size={20} className="text-purple-600" />
          Thống Kê Đơn Hàng Theo Trạng Thái
        </h3>
        
        {/* Chart Container */}
        <div className="h-80 relative">
          <div className="h-full flex items-end justify-between gap-4 pb-8">
            {mockOrderStatusData.map((data, index) => {
              const maxCount = Math.max(...mockOrderStatusData.map(d => d.count));
              const height = (data.count / maxCount) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  {/* Bar */}
                  <div className="relative w-full flex items-end justify-center mb-2">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 hover:opacity-90 cursor-pointer ${data.color}`}
                      style={{ height: `${height}%`, minHeight: '8px' }}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {data.count} đơn
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Label */}
                  <div className="text-xs text-gray-600 font-medium text-center mt-2 leading-tight">
                    {data.status.split(' ').map((word, i) => (
                      <div key={i}>{word}</div>
                    ))}
                  </div>
                  
                  {/* Count Label */}
                  <div className="text-sm font-bold text-gray-900 text-center mt-2">
                    {data.count}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
            <span>{Math.max(...mockOrderStatusData.map(d => d.count))}</span>
            <span>{Math.floor(Math.max(...mockOrderStatusData.map(d => d.count)) / 2)}</span>
            <span>0</span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {mockOrderStatusData.map((data, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${data.color}`}></div>
                <span className="text-xs text-gray-600">{data.status}</span>
              </div>
            ))}
          </div>
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
                {products.reduce((sum, p) => sum + (p.stock || 0), 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="text-sm text-gray-600 mb-1">Sắp hết hàng (&lt; 5)</div>
              <div className="text-2xl font-bold text-orange-600">
                {products.filter((p) => (p.stock || 0) < 5 && (p.stock || 0) > 0).length}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-gray-600 mb-1">Hết hàng</div>
              <div className="text-2xl font-bold text-red-600">
                {products.filter((p) => (p.stock || 0) === 0).length}
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
                value: 24, 
                icon: <Calendar size={16} className="text-blue-600" />,
                color: "text-blue-600"
              },
              { 
                label: "Chờ xử lý", 
                value: 15, 
                icon: <Clock size={16} className="text-yellow-600" />,
                color: "text-yellow-600"
              },
              { 
                label: "Đang xử lý", 
                value: 28, 
                icon: <Activity size={16} className="text-blue-600" />,
                color: "text-blue-600"
              },
              { 
                label: "Hoàn thành", 
                value: 156, 
                icon: <CheckCircle size={16} className="text-green-600" />,
                color: "text-green-600"
              },
              { 
                label: "Đơn hủy", 
                value: 8, 
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
