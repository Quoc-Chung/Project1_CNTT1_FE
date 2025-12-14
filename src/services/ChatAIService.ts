import { fetchWithAuth } from '@/utils/refreshToken';
import { BASE_API_CHAT_AI_URL } from '@/utils/configAPI';

// Response types
interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

interface ChatMessage {
  text: string;
  image?: string;
}

interface ChatRequest {
  message: string;
  image?: string; // Base64 encoded image
  conversationId?: string; // Optional: để tiếp tục cuộc hội thoại
}

interface ChatResponse {
  response: string;
  conversationId?: string;
}

/**
 * Chat AI Service
 * Service để giao tiếp với AI Chat API
 */
export class ChatAIService {
  /**
   * Gửi tin nhắn đến AI Chat
   * POST /api/chat/send
   */
  static async sendMessage(
    request: ChatRequest,
    token?: string
  ): Promise<ApiResponse<ChatResponse>> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetchWithAuth(
        `${BASE_API_CHAT_AI_URL}/api/chat/send`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ChatAIService.sendMessage - HTTP Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Normalize response
      const normalized: ApiResponse<ChatResponse> = {
        status: data.status || (data.success ? "SUCCESS" : "FAILED"),
        message: data.message,
        data: {
          response: data.data?.response || data.response || data.message || "Xin lỗi, tôi không thể trả lời câu hỏi này.",
          conversationId: data.data?.conversationId || data.conversationId,
        },
      };

      return normalized;
    } catch (error) {
      console.error("ChatAIService.sendMessage - Error:", error);
      throw error;
    }
  }

  /**
   * Gửi tin nhắn với ảnh đến AI Chat
   * POST /api/chat/send-with-image
   */
  static async sendMessageWithImage(
    message: string,
    imageBase64: string,
    conversationId?: string,
    token?: string
  ): Promise<ApiResponse<ChatResponse>> {
    return this.sendMessage(
      {
        message,
        image: imageBase64,
        conversationId,
      },
      token
    );
  }

  /**
   * Lấy lịch sử cuộc hội thoại
   * GET /api/chat/history/{conversationId}
   */
  static async getConversationHistory(
    conversationId: string,
    token?: string
  ): Promise<ApiResponse<ChatMessage[]>> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetchWithAuth(
        `${BASE_API_CHAT_AI_URL}/api/chat/history/${conversationId}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        status: data.status || "SUCCESS",
        message: data.message,
        data: data.data || [],
      };
    } catch (error) {
      console.error("ChatAIService.getConversationHistory - Error:", error);
      throw error;
    }
  }
}

