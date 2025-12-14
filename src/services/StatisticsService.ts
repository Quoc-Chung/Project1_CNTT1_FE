import { BestSellerProduct } from "../types/Admin/ProductAPI";
import { ProductService } from "./ProductService";
import { OrderService, AdminOrderResponse } from "./OrderService";
import { UserService } from "./UserService";

export interface StatisticsResponse {
  todayStats: {
    revenue: number;
    orderCount: number;
  };
  revenueSummary: {
    percentChange: number;
    totalRevenue: number;
    previousMonthRevenue: number;
  };
  userStats: {
    totalUsers: number;
  };
  productCount: {
    total: number;
  };
  bestSellers: BestSellerProduct[];
  ordersByStatus: {
    CANCELLED: number;
    DELIVERED: number;
    COMPLETED: number;
    CONFIRMED: number;
    RETURNED: number;
    PROCESSING: number;
    PENDING: number;
    SHIPPING: number;
  };
  inventorySummary: {
    totalProducts: number;
    lowStock: number;
    outOfStock: number;
    lowStockThreshold: number;
  };
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
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
        productsResult,
        orders,
        users
      ] = await Promise.all([
        // Best sellers
        ProductService.getBestSellers(10).catch(() => []),
        // Products count
        ProductService.getAllProducts(0, 1).catch(() => ({ totalElements: 0 })),
        // Orders
        OrderService.getAllOrdersForAdmin().catch(() => []),
        // Users
        UserService.getAllUsers().catch(() => [])
      ]);

      // Tính tổng doanh thu từ các đơn đã hoàn thành (COMPLETED, DELIVERED)
      const completedOrders = orders.filter((order: AdminOrderResponse) => 
        order.status === 'COMPLETED' || order.status === 'DELIVERED'
      );
      const totalRevenue = completedOrders.reduce((sum: number, order: AdminOrderResponse) => 
        sum + (order.totalAmount || 0), 0
      );

      // Đếm đơn hàng theo trạng thái
      const ordersByStatus = {
        CANCELLED: orders.filter((o: AdminOrderResponse) => o.status === 'CANCELLED').length,
        DELIVERED: orders.filter((o: AdminOrderResponse) => o.status === 'DELIVERED').length,
        COMPLETED: orders.filter((o: AdminOrderResponse) => o.status === 'COMPLETED').length,
        CONFIRMED: orders.filter((o: AdminOrderResponse) => o.status === 'CONFIRMED').length,
        RETURNED: orders.filter((o: AdminOrderResponse) => o.status === 'RETURNED').length,
        PROCESSING: orders.filter((o: AdminOrderResponse) => o.status === 'PROCESSING').length,
        PENDING: orders.filter((o: AdminOrderResponse) => o.status === 'PENDING').length,
        SHIPPING: orders.filter((o: AdminOrderResponse) => o.status === 'SHIPPING').length,
      };

      // Tính doanh thu và đơn hàng theo tháng (6 tháng gần nhất)
      const monthlyRevenue = this.calculateMonthlyRevenue(orders);

      // Tính doanh thu tháng trước để tính phần trăm tăng trưởng
      const currentMonth = new Date().getMonth();
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const currentMonthRevenue = monthlyRevenue.find(m => {
        const monthNum = parseInt(m.month.split(' ')[1]) - 1;
        return monthNum === currentMonth;
      })?.revenue || 0;
      const previousMonthRevenue = monthlyRevenue.find(m => {
        const monthNum = parseInt(m.month.split(' ')[1]) - 1;
        return monthNum === previousMonth;
      })?.revenue || 0;
      
      const percentChange = previousMonthRevenue > 0 
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
        : 0;

      // Đếm đơn hàng hôm nay
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = orders.filter((order: AdminOrderResponse) => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });
      const todayRevenue = todayOrders
        .filter((o: AdminOrderResponse) => o.status === 'COMPLETED' || o.status === 'DELIVERED')
        .reduce((sum: number, o: AdminOrderResponse) => sum + (o.totalAmount || 0), 0);

      const stats: StatisticsResponse = {
        todayStats: {
          revenue: todayRevenue,
          orderCount: todayOrders.length
        },
        revenueSummary: {
          percentChange: Math.round(percentChange * 100) / 100,
          totalRevenue: totalRevenue,
          previousMonthRevenue: previousMonthRevenue
        },
        userStats: {
          totalUsers: users.length
        },
        productCount: {
          total: productsResult?.totalElements || 0
        },
        bestSellers: bestSellers || [],
        ordersByStatus: ordersByStatus,
        inventorySummary: {
          totalProducts: productsResult?.totalElements || 0,
          lowStock: 0, // Cần API để tính
          outOfStock: 0, // Cần API để tính
          lowStockThreshold: 10
        },
        monthlyRevenue: monthlyRevenue
      };

      return stats;
    } catch (error) {
      console.error("Error fetching statistics:", error);
      throw error;
    }
  }

  /**
   * Tính doanh thu và số đơn hàng theo tháng (6 tháng gần nhất)
   */
  private static calculateMonthlyRevenue(orders: AdminOrderResponse[]): Array<{
    month: string;
    revenue: number;
    orders: number;
  }> {
    const monthNames = [
      "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
      "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ];

    // Lấy 6 tháng gần nhất
    const currentDate = new Date();
    const monthlyData: { [key: number]: { revenue: number; orders: number } } = {};

    // Khởi tạo 6 tháng gần nhất
    for (let i = 0; i < 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthIndex = date.getMonth();
      monthlyData[monthIndex] = { revenue: 0, orders: 0 };
    }

    // Tính toán từ orders
    orders.forEach((order: AdminOrderResponse) => {
      const orderDate = new Date(order.createdAt);
      const monthIndex = orderDate.getMonth();
      
      if (monthlyData[monthIndex] !== undefined) {
        monthlyData[monthIndex].orders++;
        // Chỉ tính doanh thu từ đơn đã hoàn thành
        if (order.status === 'COMPLETED' || order.status === 'DELIVERED') {
          monthlyData[monthIndex].revenue += order.totalAmount || 0;
        }
      }
    });

    // Chuyển đổi thành array và sắp xếp theo thứ tự thời gian (mới nhất trước)
    const result = Object.entries(monthlyData)
      .map(([monthIndex, data]) => ({
        month: monthNames[parseInt(monthIndex)],
        revenue: data.revenue,
        orders: data.orders
      }))
      .reverse(); // Đảo ngược để tháng mới nhất ở đầu

    return result;
  }
}

