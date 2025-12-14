import { fetchWithAuth } from '../utils/refreshToken';
import { BASE_API_PRODUCT_URL } from '../utils/configAPI';
import { SKU, SKUCreateRequest, SKUUpdateRequest, SKUApiResponse } from '../types/Admin/SKUAPI';

const API_BASE_URL = `${BASE_API_PRODUCT_URL}/api`;

export class SKUService {
  /**
   * Lấy tất cả SKU
   */
  static async getAllSKUs(): Promise<SKU[]> {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/sku`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: SKUApiResponse = await response.json();

      if (data.status.code !== '200') {
        throw new Error(data.status.message || 'Failed to fetch SKUs');
      }

      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error('Error fetching SKUs:', error);
      throw error;
    }
  }

  /**
   * Lấy SKU theo ID
   */
  static async getSKUById(id: string): Promise<SKU> {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/sku/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: SKUApiResponse = await response.json();

      if (data.status.code !== '200') {
        throw new Error(data.status.message || 'Failed to fetch SKU');
      }

      if (!data.data || Array.isArray(data.data)) {
        throw new Error('Invalid SKU data received');
      }

      return data.data as SKU;
    } catch (error) {
      console.error('Error fetching SKU by ID:', error);
      throw error;
    }
  }

  /**
   * Tạo SKU mới
   */
  static async createSKU(request: SKUCreateRequest): Promise<SKU> {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/sku`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: SKUApiResponse = await response.json();

      if (data.status.code !== '200') {
        throw new Error(data.status.message || 'Failed to create SKU');
      }

      if (!data.data || Array.isArray(data.data)) {
        throw new Error('Invalid SKU data received');
      }

      return data.data as SKU;
    } catch (error) {
      console.error('Error creating SKU:', error);
      throw error;
    }
  }

  /**
   * Cập nhật SKU
   */
  static async updateSKU(id: string, request: SKUUpdateRequest): Promise<SKU> {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/sku/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: SKUApiResponse = await response.json();

      if (data.status.code !== '200') {
        throw new Error(data.status.message || 'Failed to update SKU');
      }

      if (!data.data || Array.isArray(data.data)) {
        throw new Error('Invalid SKU data received');
      }

      return data.data as SKU;
    } catch (error) {
      console.error('Error updating SKU:', error);
      throw error;
    }
  }

  /**
   * Xóa SKU
   */
  static async deleteSKU(id: string): Promise<void> {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/sku/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: SKUApiResponse = await response.json();

      if (data.status.code !== '200') {
        throw new Error(data.status.message || 'Failed to delete SKU');
      }
    } catch (error) {
      console.error('Error deleting SKU:', error);
      throw error;
    }
  }

  /**
   * Lấy SKU theo Product ID
   */
  static async getSKUsByProductId(productId: string): Promise<SKU[]> {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/sku/by-product/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: SKUApiResponse = await response.json();

      if (data.status.code !== '200') {
        throw new Error(data.status.message || 'Failed to fetch SKUs by product');
      }

      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error('Error fetching SKUs by product ID:', error);
      throw error;
    }
  }

  /**
   * Lấy SKU theo Category ID
   */
  static async getSKUsByCategoryId(categoryId: string): Promise<SKU[]> {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/sku/by-category/${categoryId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: SKUApiResponse = await response.json();

      if (data.status.code !== '200') {
        throw new Error(data.status.message || 'Failed to fetch SKUs by category');
      }

      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error('Error fetching SKUs by category ID:', error);
      throw error;
    }
  }
}

