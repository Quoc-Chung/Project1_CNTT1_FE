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

      const response = await fetchWithAuth(url, {
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
        throw new Error(data.status.message || 'Failed to fetch vouchers');
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
}

