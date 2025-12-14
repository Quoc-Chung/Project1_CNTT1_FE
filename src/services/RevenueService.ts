import { fetchWithAuth } from "../utils/refreshToken";
import { BASE_API_CART_URL } from "../utils/configAPI";

// Sử dụng order-service URL (revenue API có thể nằm trong order-service)
// Có thể override bằng environment variable nếu revenue service riêng
const API_BASE_URL = process.env.NEXT_PUBLIC_REVENUE_SERVICE_URL || BASE_API_CART_URL;

// Response types
interface ApiResponse<T> {
  status: {
    code: string;
    label: string;
  };
  data: T;
  errors: any;
}

// Revenue Report Response
export interface RevenueReport {
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

// Daily Revenue Response
export interface DailyRevenue {
  date: string;
  revenue: number;
  orderCount: number;
}

export class RevenueService {
  /**
   * 1. Lấy báo cáo doanh thu (tháng hiện tại hoặc custom date range)
   * GET /api/revenue/report?startDate=2024-01-01&endDate=2024-12-31
   */
  static async getRevenueReport(
    startDate?: string,
    endDate?: string
  ): Promise<RevenueReport> {
    try {
      let url = `${API_BASE_URL}/api/revenue/report`;
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetchWithAuth(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error('Revenue Report API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: responseText
        });
        throw new Error(`HTTP error! status: ${response.status} - ${responseText}`);
      }

      let data: ApiResponse<RevenueReport>;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing revenue report response:', parseError);
        throw new Error('Failed to parse revenue report response');
      }

      if (data.status.code === "200") {
        return data.data;
      } else {
        throw new Error(data.status.label || "Failed to fetch revenue report");
      }
    } catch (error) {
      console.error("Error fetching revenue report:", error);
      throw error;
    }
  }

  /**
   * 2. Lấy doanh thu theo ngày trong tháng
   * GET /api/revenue/monthly?year=2024&month=12
   */
  static async getMonthlyRevenue(
    year?: number,
    month?: number
  ): Promise<DailyRevenue[]> {
    try {
      let url = `${API_BASE_URL}/api/revenue/monthly`;
      const params = new URLSearchParams();
      if (year) params.append("year", year.toString());
      if (month) params.append("month", month.toString());

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetchWithAuth(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error('Monthly Revenue API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: responseText
        });
        throw new Error(`HTTP error! status: ${response.status} - ${responseText}`);
      }

      let data: ApiResponse<DailyRevenue[]>;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing monthly revenue response:', parseError);
        throw new Error('Failed to parse monthly revenue response');
      }

      if (data.status.code === "200") {
        return data.data || [];
      } else {
        throw new Error(data.status.label || "Failed to fetch monthly revenue");
      }
    } catch (error) {
      console.error("Error fetching monthly revenue:", error);
      throw error;
    }
  }

  /**
   * 3. Trigger tính toán doanh thu thủ công
   * POST /api/revenue/calculate
   */
  static async calculateRevenue(): Promise<string> {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/revenue/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error('Calculate Revenue API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: responseText
        });
        throw new Error(`HTTP error! status: ${response.status} - ${responseText}`);
      }

      let data: ApiResponse<string>;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing calculate revenue response:', parseError);
        throw new Error('Failed to parse calculate revenue response');
      }

      if (data.status.code === "200") {
        return data.data;
      } else {
        throw new Error(data.status.label || "Failed to calculate revenue");
      }
    } catch (error) {
      console.error("Error calculating revenue:", error);
      throw error;
    }
  }

  /**
   * 4. Lấy doanh thu 6 tháng gần nhất (để hiển thị biểu đồ)
   */
  static async getLast6MonthsRevenue(): Promise<{ month: string, revenue: number, orders: number }[]> {
    try {
      const result: { month: string, revenue: number, orders: number }[] = [];
      const currentDate = new Date();

      // Lấy dữ liệu cho 6 tháng gần nhất
      for (let i = 5; i >= 0; i--) {
        const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const year = targetDate.getFullYear();
        const month = targetDate.getMonth() + 1;

        try {
          const monthlyData = await this.getMonthlyRevenue(year, month);

          // Tính tổng revenue và orders trong tháng
          const totalRevenue = monthlyData.reduce((sum, day) => sum + day.revenue, 0);
          const totalOrders = monthlyData.reduce((sum, day) => sum + day.orderCount, 0);

          result.push({
            month: `Tháng ${month}`,
            revenue: totalRevenue,
            orders: totalOrders
          });
        } catch (error) {
          console.error(`Error fetching data for ${year}-${month}:`, error);
          // Nếu lỗi, thêm data 0
          result.push({
            month: `Tháng ${month}`,
            revenue: 0,
            orders: 0
          });
        }
      }

      return result;
    } catch (error) {
      console.error("Error fetching last 6 months revenue:", error);
      throw error;
    }
  }
}
