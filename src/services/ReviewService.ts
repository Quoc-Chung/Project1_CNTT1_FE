import { ReviewResponse, Review } from "../types/Client/Review/Review";

const API_BASE_URL = "http://103.90.225.90:8080/services/review-service/api";

// Response types
interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

interface PageableResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export class ReviewService {
  /**
   * ====================
   * PRODUCT REVIEW APIs (Cho trang sản phẩm)
   * ====================
   */

  /**
   * 1.1. Lấy danh sách review của sản phẩm
   * GET /api/product-reviews/product/{productId}?page=0&size=10
   */
  static async getReviewsByProductId(
    productId: string,
    page: number = 0,
    size: number = 10,
    token?: string
  ): Promise<ApiResponse<PageableResponse<any>>> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/product-reviews/product/${productId}?page=${page}&size=${size}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching product reviews:", error);
      throw error;
    }
  }

  /**
   * 1.2. Lấy rating trung bình của sản phẩm
   * GET /api/product-reviews/product/{productId}/average-rating
   */
  static async getAverageRating(
    productId: string,
    token?: string
  ): Promise<ApiResponse<number>> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/product-reviews/product/${productId}/average-rating`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching average rating:", error);
      throw error;
    }
  }

  /**
   * 1.3. Đếm số review của sản phẩm
   * GET /api/product-reviews/product/{productId}/count
   */
  static async getReviewCount(
    productId: string,
    token?: string
  ): Promise<ApiResponse<number>> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/product-reviews/product/${productId}/count`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching review count:", error);
      throw error;
    }
  }

  /**
   * 1.4. Tạo review CÓ ảnh (multipart/form-data)
   * POST /api/product-reviews
   */
  static async createReviewWithImages(
    reviewData: {
      productId: string;
      rating: number;
      content: string;
      tags?: string[];
    },
    images: File[],
    token: string
  ): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append("review", JSON.stringify(reviewData));

      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch(`${API_BASE_URL}/product-reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating review with images:", error);
      throw error;
    }
  }

  /**
   * 1.5. Tạo review KHÔNG có ảnh (application/json)
   * POST /api/product-reviews
   */
  static async createReview(
    reviewData: {
      productId: string;
      rating: number;
      content: string;
      tags?: string[];
    },
    token: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/product-reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  }

  /**
   * 1.6. Lọc review theo rating
   * GET /api/product-reviews/rating/{minRating}?page=0&size=10
   */
  static async getReviewsByRating(
    minRating: number,
    page: number = 0,
    size: number = 10,
    token?: string
  ): Promise<ApiResponse<PageableResponse<any>>> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/product-reviews/rating/${minRating}?page=${page}&size=${size}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching reviews by rating:", error);
      throw error;
    }
  }

  /**
   * 1.7. Lấy review HOT
   * GET /api/product-reviews/hot?limit=10
   */
  static async getHotReviews(
    limit: number = 10,
    token?: string
  ): Promise<ApiResponse<any[]>> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/product-reviews/hot?limit=${limit}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching hot reviews:", error);
      throw error;
    }
  }

  /**
   * 1.8. Cập nhật review
   * PUT /api/product-reviews/{id}
   */
  static async updateReview(
    reviewId: number,
    reviewData: {
      rating?: number;
      content?: string;
      tags?: string[];
    },
    images: File[],
    token: string
  ): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append("review", JSON.stringify(reviewData));

      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch(
        `${API_BASE_URL}/product-reviews/${reviewId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating review:", error);
      throw error;
    }
  }

  /**
   * 1.9. Xóa review
   * DELETE /api/product-reviews/{id}
   */
  static async deleteReview(
    reviewId: number,
    token: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/product-reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  }

  /**
   * 2. Like review
   * POST /api/reactions
   */
  static async likeReview(
    reviewId: number,
    token: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetType: "PRODUCT_REVIEW",
          targetId: reviewId,
          type: "LIKE",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error liking review:", error);
      throw error;
    }
  }

  /**
   * ====================
   * HELPER/FALLBACK APIs
   * ====================
   */

  /**
   * Lấy tất cả review (fallback khi không có productId)
   */
  static async getAllReviews(
    page: number = 0,
    size: number = 10,
    token?: string
  ): Promise<ApiResponse<PageableResponse<any>>> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Fallback: Lấy hot reviews hoặc return empty
      const response = await this.getHotReviews(size, token);

      // Transform hot reviews thành pageable format
      return {
        status: response.status,
        message: response.message,
        data: {
          content: response.data || [],
          page: page,
          size: size,
          totalElements: response.data?.length || 0,
          totalPages: 1,
        },
      };
    } catch (error) {
      console.error("Error fetching all reviews:", error);
      throw error;
    }
  }

  /**
   * Lấy review theo ID (Backward compatibility)
   */
  static async getReviewById(id: number): Promise<Review> {
    try {
      const response = await fetch(`${API_BASE_URL}/product-reviews/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== "SUCCESS") {
        throw new Error(data.message || "Failed to fetch review");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching review by ID:", error);
      throw error;
    }
  }
}
