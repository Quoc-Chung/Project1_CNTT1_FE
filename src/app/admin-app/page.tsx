"use client";

import { useEffect, useState } from "react";
import { StatisticsService } from "../../services/StatisticsService";
import { RevenueService } from "../../services/RevenueService";
import { BestSellerProduct } from "../../types/Admin/ProductAPI";
import { getCookie } from "../../utils/cookies";
import { DashboardOverview } from "../../components/server/DashboardOverview";
import { DashboardStats, Product } from "@/types/Admin";

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<any>(null);
  const [inventorySummary, setInventorySummary] = useState<any>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = getCookie("token");

        if (!token) {
          throw new Error("Không tìm thấy token xác thực");
        }

        // Fetch statistics và revenue data song song
        const [data, revenueData, revenueReport] = await Promise.all([
          StatisticsService.getAllStatistics(token),
          RevenueService.getLast6MonthsRevenue().catch((err) => {
            console.warn("Error fetching last 6 months revenue:", err);
            return [];
          }),
          RevenueService.getRevenueReport().catch((err) => {
            console.warn("Error fetching revenue report:", err);
            return null;
          })
        ]);

        // Map dữ liệu vào stats - ưu tiên dữ liệu từ RevenueService
        const mappedStats: DashboardStats = {
          totalRevenue: revenueReport?.totalRevenue || data.revenueSummary.totalRevenue || data.todayStats.revenue,
          revenueGrowth: data.revenueSummary.percentChange,
          totalCustomers: data.userStats.totalUsers,
          customerGrowth: 0,
          totalOrders: revenueReport?.totalOrders || data.todayStats.orderCount,
          orderGrowth: 0,
          totalProducts: data.productCount.total
        };

        // Map best sellers sang Product format
        const mappedProducts: Product[] = data.bestSellers.map((item: BestSellerProduct) => ({
          id: item.id,
          name: item.name,
          description: "",
          brandName: "",
          categoryName: "",
          specs: {},
          price: item.price,
          thumbnailUrl: item.imageUrl,
          stock: 0,
          soldCount: item.totalSold,
          createdAt: "",
          updatedAt: "",
          isActive: true
        }));

        setStats(mappedStats);
        setProducts(mappedProducts);
        setOrdersByStatus(data.ordersByStatus);
        setInventorySummary(data.inventorySummary);
        // Ưu tiên sử dụng dữ liệu từ RevenueService, fallback về StatisticsService nếu có lỗi
        setMonthlyRevenue(revenueData.length > 0 ? revenueData : (data.monthlyRevenue || []));
      } catch (err: any) {
        console.error("Error fetching statistics:", err);
        setError(err.message || "Không thể tải thống kê");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <main className="w-full mt-5">
        <div className="flex items-center justify-center h-96">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full mt-5">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </main>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <main className="w-full">
      <DashboardOverview 
        stats={stats} 
        products={products} 
        ordersByStatus={ordersByStatus} 
        inventorySummary={inventorySummary}
        monthlyRevenue={monthlyRevenue}
      />
    </main>
  );
}
