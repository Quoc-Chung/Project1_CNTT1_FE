import {
  Product,
  ProductListResponse,
  ProductDetailResponse,
  ProductCreateRequest,
  BestSellerProduct,
  BestSellersResponse,
} from "../types/Admin/ProductAPI";
import { SKUResponse } from "../types/Client/Product/Product";
import { fetchWithAuth } from "../utils/refreshToken";

const API_BASE_URL = "http://103.90.225.90:8080/services/product-service/api";

export class ProductService {
  /**
   * Lấy danh sách sản phẩm với phân trang
   * @param page - Số trang (bắt đầu từ 0)
   * @param size - Số lượng sản phẩm mỗi trang
   */
  static async getAllProducts(
    page: number = 0,
    size: number = 6
  ): Promise<{
    products: Product[];
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    currentPage: number;
    totalElements: number;
  }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/product?page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ProductListResponse = await response.json();

      if (data.status.code !== "200") {
        throw new Error(data.status.message || "Failed to fetch products");
      }

      return {
        products: data.data.content,
        totalPages: data.data.total_pages,
        hasNext: data.data.has_next,
        hasPrevious: data.data.has_previous,
        currentPage: data.data.current_page,
        totalElements: data.data.total_elements,
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  /**
   * Lấy sản phẩm theo ID
   * @param id - ID của sản phẩm
   */
  static async getProductById(id: string): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/product/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ProductDetailResponse = await response.json();

      if (data.status.code !== "200") {
        throw new Error(data.status.message || "Failed to fetch product");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      throw error;
    }
  }

  /**
   * Tìm kiếm sản phẩm
   * @param searchTerm - Từ khóa tìm kiếm
   * @param page - Số trang (bắt đầu từ 0)
   * @param size - Số lượng sản phẩm mỗi trang
   */
  static async searchProducts(
    searchTerm: string,
    page: number = 0,
    size: number = 10
  ): Promise<{
    products: Product[];
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    currentPage: number;
    totalElements: number;
  }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/product/search?keyword=${encodeURIComponent(
          searchTerm
        )}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ProductListResponse = await response.json();

      if (data.status.code !== "200") {
        throw new Error(data.status.message || "Failed to search products");
      }

      return {
        products: data.data.content,
        totalPages: data.data.total_pages,
        hasNext: data.data.has_next,
        hasPrevious: data.data.has_previous,
        currentPage: data.data.current_page,
        totalElements: data.data.total_elements,
      };
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    }
  }

  /**
   * Tạo sản phẩm mới
   * @param productData - Dữ liệu sản phẩm cần tạo
   * @param token - JWT token để xác thực
   */
  static async createProduct(
    productData: ProductCreateRequest,
    token: string
  ): Promise<Product> {
    try {
      const requestBody = JSON.stringify(productData);
      
      console.log("🚀 CREATE PRODUCT - Request:", {
        url: `${API_BASE_URL}/product/create`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ? token.substring(0, 20) + "..." : "NULL"}`,
        },
        body: requestBody,
        parsedData: productData,
      });

      const response = await fetch(`${API_BASE_URL}/product/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: requestBody,
      });

      console.log("📡 CREATE PRODUCT - Response:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ CREATE PRODUCT - Error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: ProductDetailResponse = await response.json();
      console.log("✅ CREATE PRODUCT - Success data:", data);

      if (data.status.code !== "200" && data.status.code !== "201") {
        throw new Error(data.status.message || "Failed to create product");
      }

      return data.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  /**
   * Lấy danh sách sản phẩm mới nhất
   * @param limit - Số lượng sản phẩm cần lấy
   */
  static async getLatestProducts(limit: number = 10): Promise<Product[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/statistics/latest?limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status.code !== "200") {
        throw new Error(data.status.message || "Failed to fetch latest products");
      }

      return data.data || [];
    } catch (error) {
      console.error("Error fetching latest products:", error);
      throw error;
    }
  }

  /**
   * Lấy danh sách SKU theo productId
   * @param productId - ID của sản phẩm
   */
  static async getSKUsByProductId(productId: string): Promise<SKUResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sku/by-product/${productId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SKUResponse = await response.json();

      if (data.status.code !== "200") {
        throw new Error(data.status.message || "Failed to fetch SKUs");
      }

      return data;
    } catch (error) {
      console.error("Error fetching SKUs by product ID:", error);
      throw error;
    }
  }

  /**
   * Lấy danh sách sản phẩm bán chạy
   * @param limit - Số lượng sản phẩm cần lấy (mặc định: 10)
   */
  static async getBestSellers(limit: number = 10): Promise<BestSellerProduct[]> {
    try {
      const url = `${API_BASE_URL}/products/statistics/best-sellers?limit=${limit}`;
      
      console.log('Fetching best sellers from URL:', url);

      const response = await fetchWithAuth(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Đọc response text trước để có thể parse nhiều lần nếu cần
      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('Best Sellers API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: responseText
        });
        throw new Error(`HTTP error! status: ${response.status} - ${responseText}`);
      }

      let data: BestSellersResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing best sellers response:', parseError);
        throw new Error('Failed to parse best sellers response');
      }
      
      // Debug: Log response để kiểm tra
      console.log('Best Sellers API Response:', {
        statusCode: data.status?.code,
        statusMessage: data.status?.message,
        totalProducts: data.data?.length || 0,
        hasData: !!data.data,
        dataType: Array.isArray(data.data) ? 'array' : typeof data.data,
        products: data.data?.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          totalSold: p.totalSold
        }))
      });

      // Kiểm tra status code
      if (data.status?.code === '200' || data.status?.code === 200) {
        // Đảm bảo data.data là array
        if (Array.isArray(data.data)) {
          return data.data;
        } else {
          console.warn('Best Sellers API returned non-array data or invalid format:', data);
          return [];
        }
      } else {
        throw new Error(data.status?.message || 'Failed to fetch best sellers');
      }
    } catch (error) {
      console.error('Error fetching best sellers:', error);
      throw error;
    }
  }
}

