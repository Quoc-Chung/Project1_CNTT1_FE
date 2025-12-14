import { BASE_API_SALE_SERVICE_URL } from '@/utils/configAPI';
import { fetchWithAuth } from '@/utils/refreshToken';

export interface VoucherResponse {
  id: number;
  code: string;
  name: string;
  description: string;
  voucherType: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number;
  totalQuantity: number;
  remainingQuantity: number;
  usedCount: number;
  usageLimitPerUser: number;
  userScope: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED';
  isActive: boolean;
  bannerImageUrl: string | null;
  thumbnailImageUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface VouchersApiResponse {
  data: VoucherResponse[];
  error: any;
  status: {
    code: string;
    message: string;
    label?: string;
  };
}

export interface VoucherApiResponse {
  data: VoucherResponse;
  error: any;
  status: {
    code: string;
    message: string;
    label?: string;
  };
}

export interface CreateVoucherRequest {
  code: string;
  name: string;
  description: string;
  voucherType: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number;
  totalQuantity: number;
  usageLimitPerUser: number;
  userScope: string;
  startDate: string;
  endDate: string;
  bannerImageUrl?: string;
}

export class VoucherService {
  /**
   * Lấy tất cả voucher với filter
   */
  static async getAllVouchers(filters?: {
    status?: string;
    code?: string;
    fromDate?: string;
    toDate?: string;
    userScope?: string;
  }): Promise<VoucherResponse[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.code) params.append('code', filters.code);
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);
      if (filters?.userScope) params.append('userScope', filters.userScope);

      const url = `${BASE_API_SALE_SERVICE_URL}/api/v1/vouchers${params.toString() ? `?${params.toString()}` : ''}`;
      
      // Debug: Log URL để kiểm tra
      console.log('Fetching vouchers from URL:', url);

      const response = await fetchWithAuth(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Đọc response text trước để có thể parse nhiều lần nếu cần
      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('Voucher API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: responseText
        });
        throw new Error(`HTTP error! status: ${response.status} - ${responseText}`);
      }

      let data: VouchersApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing voucher response:', parseError);
        console.error('Response text:', responseText);
        throw new Error('Failed to parse voucher response: ' + (parseError as Error).message);
      }
      
      // Debug: Log response để kiểm tra
      console.log('Voucher API Response:', {
        statusCode: data.status?.code,
        statusMessage: data.status?.message,
        totalVouchers: data.data?.length || 0,
        hasData: !!data.data,
        dataType: Array.isArray(data.data) ? 'array' : typeof data.data,
        vouchers: data.data?.map(v => ({
          id: v.id,
          code: v.code,
          status: v.status,
          isActive: v.isActive
        }))
      });

      // Kiểm tra status code (hỗ trợ cả string và number)
      const statusCode = data.status?.code;
      const isSuccess = statusCode === '200' || (typeof statusCode === 'number' && statusCode === 200) || String(statusCode) === '200';
      if (isSuccess) {
        // Đảm bảo data.data là array
        if (Array.isArray(data.data)) {
          return data.data;
        } else if (data.data && typeof data.data === 'object') {
          // Nếu data.data không phải array, có thể là object đơn lẻ hoặc có structure khác
          console.warn('Voucher API returned non-array data:', data.data);
          return [];
        } else {
          console.warn('Voucher API returned invalid data format:', data);
          return [];
        }
      } else {
        const errorMessage = data.status?.message || data.error || 'Failed to fetch vouchers';
        console.error('Voucher API returned error:', {
          statusCode: data.status?.code,
          message: errorMessage,
          fullResponse: data
        });
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      throw error;
    }
  }

  /**
   * Lấy voucher theo ID
   */
  static async getVoucherById(id: number): Promise<VoucherResponse> {
    try {
      const response = await fetchWithAuth(`${BASE_API_SALE_SERVICE_URL}/api/v1/vouchers/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: VoucherApiResponse = await response.json();

      if (data.status.code === '200') {
        return data.data;
      } else {
        throw new Error(data.status.message || 'Failed to fetch voucher');
      }
    } catch (error) {
      console.error('Error fetching voucher:', error);
      throw error;
    }
  }

  /**
   * Lấy voucher theo code
   */
  static async getVoucherByCode(code: string): Promise<VoucherResponse> {
    try {
      const response = await fetchWithAuth(`${BASE_API_SALE_SERVICE_URL}/api/v1/vouchers/code/${code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: VoucherApiResponse = await response.json();

      if (data.status.code === '200') {
        return data.data;
      } else {
        throw new Error(data.status.message || 'Failed to fetch voucher');
      }
    } catch (error) {
      console.error('Error fetching voucher:', error);
      throw error;
    }
  }

  /**
   * Lấy voucher đang active
   */
  static async getActiveVouchers(): Promise<VoucherResponse[]> {
    try {
      const response = await fetchWithAuth(`${BASE_API_SALE_SERVICE_URL}/api/v1/vouchers/active`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: VouchersApiResponse = await response.json();

      if (data.status.code === '200') {
        return data.data || [];
      } else {
        throw new Error(data.status.message || 'Failed to fetch active vouchers');
      }
    } catch (error) {
      console.error('Error fetching active vouchers:', error);
      throw error;
    }
  }

  /**
   * Tạo voucher mới
   */
  static async createVoucher(voucherData: CreateVoucherRequest): Promise<VoucherResponse> {
    try {
      const response = await fetchWithAuth(`${BASE_API_SALE_SERVICE_URL}/api/v1/vouchers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voucherData),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: VoucherApiResponse = await response.json();

      if (data.status.code === '200') {
        return data.data;
      } else {
        throw new Error(data.status.message || 'Failed to create voucher');
      }
    } catch (error) {
      console.error('Error creating voucher:', error);
      throw error;
    }
  }

  /**
   * Áp dụng voucher cho đơn hàng
   * POST /api/v1/vouchers/apply
   */
  static async applyVoucher(request: {
    code: string;
    userId: number;
    orderId: string;
    orderValue: number;
  }): Promise<{
    voucherUsageId: number;
    voucherId: number;
    userId: number;
    orderId: string;
    orderValue: number;
    discountAmount: number;
    finalOrderValue: number;
    appliedAt: string;
  }> {
    try {
      const response = await fetchWithAuth(`${BASE_API_SALE_SERVICE_URL}/api/v1/vouchers/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      // Đọc response text trước để có thể parse nhiều lần nếu cần
      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('Voucher Apply API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: responseText
        });
        throw new Error(`HTTP error! status: ${response.status} - ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing voucher apply response:', parseError);
        console.error('Response text:', responseText);
        throw new Error('Failed to parse response: ' + (parseError as Error).message);
      }

      // Kiểm tra status code (hỗ trợ cả string và number)
      const statusCode = data.status?.code;
      const isSuccess = statusCode === '200' || (typeof statusCode === 'number' && statusCode === 200) || (statusCode && String(statusCode) === '200');
      
      if (isSuccess) {
        return data.data;
      } else {
        const errorMessage = data.status?.message || data.error || 'Failed to apply voucher';
        console.error('Voucher Apply API returned error:', {
          statusCode: data.status?.code,
          message: errorMessage,
          fullResponse: data
        });
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error applying voucher:', error);
      throw error;
    }
  }
}

