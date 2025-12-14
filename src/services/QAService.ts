import { fetchWithAuth } from '@/utils/refreshToken';

const API_BASE_URL = "http://103.90.225.90:8080/services/review-service/api";

// Response types
interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

/**
 * Backend is inconsistent between returning `status` ("SUCCESS") and `success` (boolean),
 * so we normalize everything here to keep existing UI logic untouched.
 */
const normalizeResponse = <T>(raw: any): ApiResponse<T> => {
  // Handle new API format: { success: true, message: "...", data: {...} }
  if (raw && typeof raw.success === "boolean") {
    return {
      status: raw.success ? "SUCCESS" : "FAILED",
      message: raw.message || raw.status?.message,
      data: raw.data || raw,
    };
  }
  // Handle old API format: { status: "SUCCESS", data: {...} }
  if (raw && raw.status && typeof raw.status === "string") {
    return {
      status: raw.status,
      message: raw.message,
      data: raw.data || raw,
    };
  }
  // Fallback: wrap in standard format
  return {
    status: "SUCCESS",
    message: raw?.message,
    data: raw?.data || raw,
  };
};

interface PageableResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export class QAService {
  /**
   * ====================
   * QUESTION APIs (Câu hỏi)
   * ====================
   */

  /**
   * 1.1. Lấy danh sách câu hỏi
   * GET /api/questions?page=0&size=10
   */
  static async getAllQuestions(
    page: number = 0,
    size: number = 10,
    token?: string
  ): Promise<ApiResponse<PageableResponse<any>>> {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/questions?page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Đọc response text trước để có thể parse nhiều lần nếu cần
      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('QAService.getAllQuestions - HTTP Error:', {
          status: response.status,
          statusText: response.statusText,
          body: responseText
        });
        throw new Error(`HTTP error! status: ${response.status} - ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('QAService.getAllQuestions - Parse Error:', parseError);
        console.error('Response text:', responseText);
        throw new Error('Failed to parse response: ' + (parseError as Error).message);
      }

      const normalized = normalizeResponse<PageableResponse<any>>(data);
      
      // Debug log
      console.log('QAService.getAllQuestions - Response:', {
        normalizedStatus: normalized.status,
        hasData: !!normalized.data,
        hasContent: !!normalized.data?.content,
        contentLength: normalized.data?.content?.length || 0,
        totalPages: normalized.data?.totalPages,
        totalElements: normalized.data?.totalElements
      });
      
      return normalized;
    } catch (error) {
      console.error("QAService.getAllQuestions - Error:", error);
      throw error;
    }
  }

  /**
   * 1.2. Lấy chi tiết câu hỏi (kèm câu trả lời)
   * GET /api/questions/{id}
   */
  static async getQuestionById(
    questionId: number,
    token?: string
  ): Promise<ApiResponse<any>> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return normalizeResponse(data);
    } catch (error) {
      console.error("Error fetching question by ID:", error);
      throw error;
    }
  }

  /**
   * 1.3. Tạo câu hỏi mới
   * POST /api/questions
   */
  static async createQuestion(
    questionData: {
      title: string;
      content: string;
      categoryId: number;
      tags: string[];
    },
    token: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(questionData),
      });

      // Đọc response text trước để có thể parse nhiều lần nếu cần
      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('QAService.createQuestion - HTTP Error:', {
          status: response.status,
          statusText: response.statusText,
          body: responseText
        });
        throw new Error(`HTTP error! status: ${response.status} - ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('QAService.createQuestion - Parse Error:', parseError);
        console.error('Response text:', responseText);
        throw new Error('Failed to parse response: ' + (parseError as Error).message);
      }

      const normalized = normalizeResponse(data);
      
      // Debug log
      console.log('QAService.createQuestion - Response:', {
        normalizedStatus: normalized.status,
        hasData: !!normalized.data,
        questionId: (normalized.data as any)?.id
      });
      
      return normalized;
    } catch (error) {
      console.error("Error creating question:", error);
      throw error;
    }
  }

  /**
   * 1.4. Tìm kiếm câu hỏi
   * GET /api/questions/search?keyword=laptop&page=0&size=10
   */
  static async searchQuestions(
    keyword: string,
    page: number = 0,
    size: number = 10,
    token?: string
  ): Promise<ApiResponse<PageableResponse<any>>> {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/questions/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Đọc response text trước để có thể parse nhiều lần nếu cần
      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('QAService.searchQuestions - HTTP Error:', {
          status: response.status,
          statusText: response.statusText,
          body: responseText
        });
        throw new Error(`HTTP error! status: ${response.status} - ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('QAService.searchQuestions - Parse Error:', parseError);
        console.error('Response text:', responseText);
        throw new Error('Failed to parse response: ' + (parseError as Error).message);
      }

      const normalized = normalizeResponse<PageableResponse<any>>(data);
      
      // Debug log
      console.log('QAService.searchQuestions - Response:', {
        normalizedStatus: normalized.status,
        hasData: !!normalized.data,
        hasContent: !!normalized.data?.content,
        contentLength: normalized.data?.content?.length || 0,
        keyword: keyword
      });
      
      return normalized;
    } catch (error) {
      console.error("Error searching questions:", error);
      throw error;
    }
  }

  /**
   * 1.5. Lấy câu hỏi theo category
   * GET /api/questions/category/{categoryId}?page=0&size=10
   */
  static async getQuestionsByCategory(
    categoryId: number,
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
        `${API_BASE_URL}/questions/category/${categoryId}?page=${page}&size=${size}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return normalizeResponse(data);
    } catch (error) {
      console.error("Error fetching questions by category:", error);
      throw error;
    }
  }

  /**
   * 1.6. Lấy câu hỏi HOT
   * GET /api/questions/hot?limit=10
   */
  static async getHotQuestions(
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
        `${API_BASE_URL}/questions/hot?limit=${limit}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return normalizeResponse(data);
    } catch (error) {
      console.error("Error fetching hot questions:", error);
      throw error;
    }
  }

  /**
   * 1.7. Cập nhật câu hỏi
   * PUT /api/questions/{id}
   */
  static async updateQuestion(
    questionId: number,
    questionData: {
      title: string;
      content: string;
      tags: string[];
    },
    token: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return normalizeResponse(data);
    } catch (error) {
      console.error("Error updating question:", error);
      throw error;
    }
  }

  /**
   * 1.8. Xóa câu hỏi
   * DELETE /api/questions/{id}
   */
  static async deleteQuestion(
    questionId: number,
    token: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return normalizeResponse(data);
    } catch (error) {
      console.error("Error deleting question:", error);
      throw error;
    }
  }

  /**
   * 1.9. Like câu hỏi
   * POST /api/reactions
   */
  static async likeQuestion(
    questionId: number,
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
          targetType: "QUESTION",
          targetId: questionId,
          type: "LIKE",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return normalizeResponse(data);
    } catch (error) {
      console.error("Error liking question:", error);
      throw error;
    }
  }

  /**
   * ====================
   * ANSWER APIs (Câu trả lời)
   * ====================
   */

  /**
   * 2.1. Lấy tất cả câu trả lời của câu hỏi
   * GET /api/answers/question/{questionId}
   */
  static async getAnswersByQuestionId(
    questionId: number,
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
        `${API_BASE_URL}/answers/question/${questionId}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return normalizeResponse(data);
    } catch (error) {
      console.error("Error fetching answers:", error);
      throw error;
    }
  }

  /**
   * 2.2. Tạo câu trả lời
   * POST /api/answers
   */
  static async createAnswer(
    answerData: {
      questionId: number;
      content: string;
    },
    token: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(answerData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return normalizeResponse(data);
    } catch (error) {
      console.error("Error creating answer:", error);
      throw error;
    }
  }

  /**
   * 2.3. Cập nhật câu trả lời
   * PUT /api/answers/{id}
   */
  static async updateAnswer(
    answerId: number,
    content: string,
    token: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/answers/${answerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return normalizeResponse(data);
    } catch (error) {
      console.error("Error updating answer:", error);
      throw error;
    }
  }

  /**
   * 2.4. Xóa câu trả lời
   * DELETE /api/answers/{id}
   */
  static async deleteAnswer(
    answerId: number,
    token: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/answers/${answerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting answer:", error);
      throw error;
    }
  }

  /**
   * 2.5. Like câu trả lời
   * POST /api/reactions
   */
  static async likeAnswer(
    answerId: number,
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
          targetType: "ANSWER",
          targetId: answerId,
          type: "LIKE",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error liking answer:", error);
      throw error;
    }
  }

  /**
   * 2.6. Dislike câu trả lời
   * POST /api/reactions
   */
  static async dislikeAnswer(
    answerId: number,
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
          targetType: "ANSWER",
          targetId: answerId,
          type: "DISLIKE",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error disliking answer:", error);
      throw error;
    }
  }
}
