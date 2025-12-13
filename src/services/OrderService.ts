import { BASE_API_CART_URL } from '@/utils/configAPI';
import { getCookie } from '@/utils/cookies';

export interface AdminOrderResponse {
  orderId: string;
  userId: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingAddress: string;
}

export interface AdminOrdersApiResponse {
  status: {
    code: string;
    message: string;
    description?: string;
  };
  data: AdminOrderResponse[];
  extraData: any;
}

export interface OrderItem {
  productId: string;
  productName: string;
  skuId: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

export interface AdminOrderDetailResponse {
  orderId: string;
  userId: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: string;
}

export interface AdminOrderDetailApiResponse {
  status: {
    code: string;
    message: string;
    description?: string;
  };
  data: AdminOrderDetailResponse;
  extraData: any;
}

export class OrderService {
  /**
   * Lấy tất cả đơn hàng cho admin
   */
  static async getAllOrdersForAdmin(): Promise<AdminOrderResponse[]> {
    try {
      const token = getCookie('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_API_CART_URL}/api/order/admin/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: AdminOrdersApiResponse = await response.json();

      if (data.status.code === '200') {
        return data.data || [];
      } else {
        throw new Error(data.status.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết đơn hàng cho admin
   */
  static async getOrderDetailForAdmin(orderId: string): Promise<AdminOrderDetailResponse> {
    try {
      const token = getCookie('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_API_CART_URL}/api/order/admin/detail/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: AdminOrderDetailApiResponse = await response.json();

      if (data.status.code === '200') {
        return data.data;
      } else {
        throw new Error(data.status.message || 'Failed to fetch order detail');
      }
    } catch (error) {
      console.error('Error fetching order detail:', error);
      throw error;
    }
  }
}

