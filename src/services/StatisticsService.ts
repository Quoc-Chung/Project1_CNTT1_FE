import { BestSellerProduct } from "../types/Admin/ProductAPI";
import { ProductService } from "./ProductService";

export interface StatisticsResponse {
  todayStats: {
    revenue: number;
    orderCount: number;
  };
  revenueSummary: {
    percentChange: number;
  };
  userStats: {
    totalUsers: number;
  };
  productCount: {
    total: number;
  };
  bestSellers: BestSellerProduct[];
  ordersByStatus: any;
  inventorySummary: any;
}

export class StatisticsService {
  /**
   * Lấy tất cả thống kê cho dashboard
   * @param token - JWT token để xác thực
   */
  static async getAllStatistics(token: string): Promise<StatisticsResponse> {
    try {
      // Fetch các thống kê song song
      const [
        bestSellers,
        productsResult
      ] = await Promise.all([
        // Best sellers
        ProductService.getBestSellers(10).catch(() => []),
        // Products count
        ProductService.getAllProducts(0, 1).catch(() => ({ totalElements: 0 }))
      ]);

      // Mock data cho các thống kê chưa có API
      const mockStats: StatisticsResponse = {
        todayStats: {
          revenue: 0,
          orderCount: 0
        },
        revenueSummary: {
          percentChange: 0
        },
        userStats: {
          totalUsers: 0
        },
        productCount: {
          total: productsResult?.totalElements || 0
        },
        bestSellers: bestSellers || [],
        ordersByStatus: {},
        inventorySummary: {}
      };

      return mockStats;
    } catch (error) {
      console.error("Error fetching statistics:", error);
      throw error;
    }
  }
}

