/**
 * API Configuration và helper functions
 */

export const API_CONFIG = {
  GATEWAY_URL: "http://103.90.225.90:8080",
  REVIEW_SERVICE: "/services/review-service/api",

  // Default headers
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },
};

/**
 * Helper function để tạo fetch request với CORS credentials
 * Sử dụng fetchWithAuth để tự động refresh token khi hết hạn
 */
import { fetchWithAuth } from './refreshToken';

export const apiFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const defaultOptions: RequestInit = {
    // QUAN TRỌNG: Thêm credentials để gửi cookies và handle CORS
    credentials: "include",
    mode: "cors",
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...(options.headers || {}),
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  };

  try {
    // Sử dụng fetchWithAuth để tự động refresh token khi cần
    const response = await fetchWithAuth(url, mergedOptions);
    return response;
  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
};

/**
 * Helper để build full API URL
 */
export const buildApiUrl = (service: string, endpoint: string): string => {
  return `${API_CONFIG.GATEWAY_URL}${service}${endpoint}`;
};
