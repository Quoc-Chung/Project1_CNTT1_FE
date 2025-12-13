import { BASE_API_SALE_SERVICE_URL } from '@/utils/configAPI';
import { fetchWithAuth } from '@/utils/refreshToken';
import { getCookie } from '@/utils/cookies';

export interface SaleResponse {
  id: number;
  code: string;
  name: string;
  description: string | null;
  saleType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  saleValue: number;
  applyScope: 'ALL_PRODUCTS' | 'SPECIFIC_PRODUCTS' | 'CATEGORY' | 'BRAND';
  startDate: string;
  endDate: string;
  priority: number;
  isActive: boolean;
  status: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED';
  minOrderValue: number | null;
  maxDiscountAmount: number | null;
  minPurchaseQuantity: number;
  quantity: number | null;
  usedCount: number;
  totalAppliedCount: number;
  bannerImageUrl: string | null;
  thumbnailImageUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface SalesApiResponse {
  data: SaleResponse[];
  error: any;
  status: {
    code: string;
    message: string;
    label?: string;
  };
}

export interface SaleApiResponse {
  data: SaleResponse;
  error: any;
  status: {
    code: string;
    message: string;
    label?: string;
  };
}

export interface CreateSaleRequest {
  code: string;
  name: string;
  saleType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  saleValue: number;
  applyScope: 'ALL_PRODUCTS' | 'SPECIFIC_PRODUCTS' | 'CATEGORY' | 'BRAND';
  startDate: string;
  endDate: string;
  priority: number;
  description?: string;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  minPurchaseQuantity?: number;
  quantity?: number;
}

export interface UpdateSaleRequest extends CreateSaleRequest {}

export interface ActivateSaleRequest {
  productId: string;
  skuCode: string;
  specs: Record<string, any>;
  price: number;
  discountPrice: number;
  stock: number;
  barcode: string;
  isActive: boolean;
}

export class SaleService {
  /**
   * Lấy tất cả sale
   */
  static async getAllSales(): Promise<SaleResponse[]> {
    try {
      const response = await fetchWithAuth(`${BASE_API_SALE_SERVICE_URL}/api/v1/sales`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: SalesApiResponse = await response.json();

      if (data.status.code === '200') {
        return data.data || [];
      } else {
        throw new Error(data.status.message || 'Failed to fetch sales');
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
  }

  /**
   * Lấy sale đang hoạt động
   */
  static async getActiveSales(): Promise<SaleResponse[]> {
    try {
      const response = await fetchWithAuth(`${BASE_API_SALE_SERVICE_URL}/api/v1/sales/active`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: SalesApiResponse = await response.json();

      if (data.status.code === '200') {
        return data.data || [];
      } else {
        throw new Error(data.status.message || 'Failed to fetch active sales');
      }
    } catch (error) {
      console.error('Error fetching active sales:', error);
      throw error;
    }
  }

  /**
   * Lấy sale theo ID
   */
  static async getSaleById(id: number): Promise<SaleResponse> {
    try {
      const response = await fetchWithAuth(`${BASE_API_SALE_SERVICE_URL}/api/v1/sales/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: SaleApiResponse = await response.json();

      if (data.status.code === '200') {
        return data.data;
      } else {
        throw new Error(data.status.message || 'Failed to fetch sale');
      }
    } catch (error) {
      console.error('Error fetching sale:', error);
      throw error;
    }
  }

  /**
   * Tạo sale mới (với upload file)
   */
  static async createSale(
    saleData: CreateSaleRequest,
    bannerImage?: File,
    thumbnailImage?: File
  ): Promise<SaleResponse> {
    try {
      // Loại bỏ các trường undefined/null để tránh lỗi backend
      const cleanSaleData: any = {
        code: saleData.code,
        name: saleData.name,
        saleType: saleData.saleType,
        saleValue: saleData.saleValue,
        applyScope: saleData.applyScope,
        startDate: saleData.startDate,
        endDate: saleData.endDate,
        priority: saleData.priority,
      };

      // Chỉ thêm các trường optional nếu có giá trị
      if (saleData.description) {
        cleanSaleData.description = saleData.description;
      }
      if (saleData.minOrderValue !== undefined && saleData.minOrderValue !== null) {
        cleanSaleData.minOrderValue = saleData.minOrderValue;
      }
      if (saleData.maxDiscountAmount !== undefined && saleData.maxDiscountAmount !== null) {
        cleanSaleData.maxDiscountAmount = saleData.maxDiscountAmount;
      }
      if (saleData.minPurchaseQuantity !== undefined && saleData.minPurchaseQuantity !== null) {
        cleanSaleData.minPurchaseQuantity = saleData.minPurchaseQuantity;
      }
      if (saleData.quantity !== undefined && saleData.quantity !== null) {
        cleanSaleData.quantity = saleData.quantity;
      }

      const formData = new FormData();
      
      // Thêm sale JSON
      formData.append('sale', JSON.stringify(cleanSaleData));
      
      // Thêm banner image nếu có
      if (bannerImage) {
        formData.append('bannerImage', bannerImage);
      }
      
      // Thêm thumbnail image nếu có
      if (thumbnailImage) {
        formData.append('thumbnailImage', thumbnailImage);
      }

      // Lấy token từ cookie
      const token = getCookie('token');

      if (!token) {
        throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      // Không set Content-Type header khi dùng FormData, browser sẽ tự động set với boundary
      const response = await fetch(`${BASE_API_SALE_SERVICE_URL}/api/v1/sales`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Không set Content-Type, browser sẽ tự động set cho FormData
        },
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Sale creation error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: SaleApiResponse = await response.json();

      if (data.status.code === '200') {
        return data.data;
      } else {
        throw new Error(data.status.message || 'Failed to create sale');
      }
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  }

  /**
   * Cập nhật sale
   */
  static async updateSale(
    id: number,
    saleData: UpdateSaleRequest,
    bannerImage?: File,
    thumbnailImage?: File
  ): Promise<SaleResponse> {
    try {
      // Loại bỏ các trường undefined/null để tránh lỗi backend
      const cleanSaleData: any = {
        code: saleData.code,
        name: saleData.name,
        saleType: saleData.saleType,
        saleValue: saleData.saleValue,
        applyScope: saleData.applyScope,
        startDate: saleData.startDate,
        endDate: saleData.endDate,
        priority: saleData.priority,
      };

      // Chỉ thêm các trường optional nếu có giá trị
      if (saleData.description) {
        cleanSaleData.description = saleData.description;
      }
      if (saleData.minOrderValue !== undefined && saleData.minOrderValue !== null) {
        cleanSaleData.minOrderValue = saleData.minOrderValue;
      }
      if (saleData.maxDiscountAmount !== undefined && saleData.maxDiscountAmount !== null) {
        cleanSaleData.maxDiscountAmount = saleData.maxDiscountAmount;
      }
      if (saleData.minPurchaseQuantity !== undefined && saleData.minPurchaseQuantity !== null) {
        cleanSaleData.minPurchaseQuantity = saleData.minPurchaseQuantity;
      }
      if (saleData.quantity !== undefined && saleData.quantity !== null) {
        cleanSaleData.quantity = saleData.quantity;
      }

      const formData = new FormData();
      
      // Thêm sale JSON
      formData.append('sale', JSON.stringify(cleanSaleData));
      
      // Thêm banner image nếu có
      if (bannerImage) {
        formData.append('bannerImage', bannerImage);
      }
      
      // Thêm thumbnail image nếu có
      if (thumbnailImage) {
        formData.append('thumbnailImage', thumbnailImage);
      }

      // Lấy token từ cookie
      const token = getCookie('token');

      if (!token) {
        throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      // Không set Content-Type header khi dùng FormData, browser sẽ tự động set với boundary
      const response = await fetch(`${BASE_API_SALE_SERVICE_URL}/api/v1/sales/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Không set Content-Type, browser sẽ tự động set cho FormData
        },
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Sale update error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: SaleApiResponse = await response.json();

      if (data.status.code === '200') {
        return data.data;
      } else {
        throw new Error(data.status.message || 'Failed to update sale');
      }
    } catch (error) {
      console.error('Error updating sale:', error);
      throw error;
    }
  }

  /**
   * Kích hoạt sale cho sản phẩm
   */
  static async activateSale(id: number, activateData: ActivateSaleRequest): Promise<SaleResponse> {
    try {
      const response = await fetchWithAuth(`${BASE_API_SALE_SERVICE_URL}/api/v1/sales/${id}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activateData),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: SaleApiResponse = await response.json();

      if (data.status.code === '200') {
        return data.data;
      } else {
        throw new Error(data.status.message || 'Failed to activate sale');
      }
    } catch (error) {
      console.error('Error activating sale:', error);
      throw error;
    }
  }

  /**
   * Xóa sale
   */
  static async deleteSale(id: number): Promise<void> {
    try {
      const response = await fetchWithAuth(`${BASE_API_SALE_SERVICE_URL}/api/v1/sales/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.status.code !== '200') {
        throw new Error(data.status.message || 'Failed to delete sale');
      }
    } catch (error) {
      console.error('Error deleting sale:', error);
      throw error;
    }
  }
}

