import { BASE_API_CART_URL } from '@/utils/configAPI';
import { getCookie } from '@/utils/cookies';
import { fetchWithAuth } from '@/utils/refreshToken';

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

  /**
   * Cập nhật trạng thái đơn hàng (Admin)
   */
  static async updateOrderStatus(orderId: string, status: string): Promise<AdminOrderResponse> {
    try {
      const url = `${BASE_API_CART_URL}/api/order/admin/${orderId}/status`;
      
      const response = await fetchWithAuth(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('Update Order Status API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: responseText
        });
        throw new Error(`HTTP error! status: ${response.status} - ${responseText}`);
      }

      let data: AdminOrderDetailApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing update order status response:', parseError);
        throw new Error('Failed to parse update order status response');
      }

      if (String(data.status?.code) === '200') {
        if (data.data) {
          // Đảm bảo status luôn được normalize thành uppercase
          const normalizedStatus = String(data.data.status).toUpperCase();
          
          // Log để debug
          console.log('OrderService.updateOrderStatus - Response:', {
            orderId: data.data.orderId,
            status: normalizedStatus,
            originalStatus: data.data.status
          });
          
          return {
            orderId: data.data.orderId,
            userId: data.data.userId,
            totalAmount: data.data.totalAmount,
            status: normalizedStatus, // Trả về status đã normalize
            createdAt: data.data.createdAt,
            shippingAddress: data.data.shippingAddress,
          };
        } else {
          throw new Error(data.status?.message || 'Failed to update order status: No data returned');
        }
      } else {
        throw new Error(data.status?.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
}

