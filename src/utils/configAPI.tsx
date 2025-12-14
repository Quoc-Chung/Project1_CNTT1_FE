export const BASE_API_AUTH_URL  = "http://103.90.225.90:8080/services/auth-service";

export const BASE_API_PRODUCT_URL = "http://103.90.225.90:8080/services/product-service";

export const BASE_API_CART_URL = "http://103.90.225.90:8080/services/order-service"; 

export const BASE_API_AL_URL = "http://103.90.225.90:8080/services/auth-service";

export const BASE_API_SALE_SERVICE_URL = "http://103.90.225.90:8080/services/sale-service";

export const BASE_API_REVIEW_URL = "http://103.90.225.90:8080/services/review-service";

// Chat AI Service URL - Cấu hình URL của Chat AI service
// Nếu bạn có service riêng, thay đổi URL này
// Ví dụ: "http://103.90.225.90:8080/services/chat-ai-service"
export const BASE_API_CHAT_AI_URL = process.env.NEXT_PUBLIC_CHAT_AI_URL || "http://103.90.225.90:8080/services/chat-ai-service";

export const BASE_API_URL = BASE_API_AUTH_URL;