import { BASE_API_AUTH_URL } from './configAPI';
import { getCookie, setCookie } from './cookies';

/**
 * Refresh token utility
 * Tự động refresh token khi token hết hạn
 */

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
let autoRefreshInterval: NodeJS.Timeout | null = null;

/**
 * Gọi API refresh token
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  // Nếu đang refresh, đợi promise hiện tại
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getCookie('refreshToken');
  
  if (!refreshToken) {
    console.warn('No refresh token found');
    return null;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${BASE_API_AUTH_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshToken,
        }),
      });

      const data = await response.json();

      if (data.status?.code === '200' && data.data?.accessToken) {
        // Lưu token mới vào cookie
        setCookie('token', data.data.accessToken, 7);
        
        // Lưu refreshToken mới nếu có
        if (data.data.refreshToken) {
          setCookie('refreshToken', data.data.refreshToken, 30);
        }

        // Lưu expiresIn và thời điểm refresh để kiểm tra hết hạn
        if (data.data?.expiresIn && typeof window !== 'undefined') {
          const expiresIn = data.data.expiresIn; // seconds
          const refreshTime = Date.now(); // milliseconds
          localStorage.setItem('tokenExpiresAt', (refreshTime + expiresIn * 1000).toString());
          localStorage.setItem('tokenExpiresIn', expiresIn.toString());
          console.log('Token expires in:', expiresIn, 'seconds');
        }

        console.log('Token refreshed successfully');
        return data.data.accessToken;
      } else {
        console.error('Failed to refresh token:', data.status?.message);
        // Xóa token và refreshToken nếu refresh thất bại
        setCookie('token', '', -1);
        setCookie('refreshToken', '', -1);
        return null;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Xóa token và refreshToken nếu có lỗi
      setCookie('token', '', -1);
      setCookie('refreshToken', '', -1);
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/**
 * Kiểm tra token có hết hạn không
 * Ưu tiên sử dụng expiresIn từ API, nếu không có thì decode JWT
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  // Kiểm tra expiresIn từ localStorage (từ API response)
  if (typeof window !== 'undefined') {
    const expiresAt = localStorage.getItem('tokenExpiresAt');
    if (expiresAt) {
      const expiresAtTime = parseInt(expiresAt, 10);
      const now = Date.now();
      // Kiểm tra nếu token hết hạn trong vòng 5 phút tới (để refresh sớm)
      const bufferTime = 5 * 60 * 1000; // 5 phút
      if (now >= expiresAtTime - bufferTime) {
        return true;
      }
      // Nếu chưa hết hạn theo expiresIn, return false
      return false;
    }
  }

  // Fallback: decode JWT nếu không có expiresIn
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();

    // Kiểm tra nếu token hết hạn trong vòng 5 phút tới (để refresh sớm)
    return now >= exp - 5 * 60 * 1000;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Kiểm tra token có cần refresh không (còn 5 phút nữa hết hạn)
 */
export const shouldRefreshToken = (token: string | null): boolean => {
  if (!token) return false;

  // Kiểm tra expiresIn từ localStorage
  if (typeof window !== 'undefined') {
    const expiresAt = localStorage.getItem('tokenExpiresAt');
    if (expiresAt) {
      const expiresAtTime = parseInt(expiresAt, 10);
      const now = Date.now();
      const bufferTime = 5 * 60 * 1000; // 5 phút
      // Cần refresh nếu còn <= 5 phút nữa là hết hạn
      return now >= expiresAtTime - bufferTime;
    }
  }

  // Fallback: decode JWT
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 phút

    return now >= exp - bufferTime;
  } catch (error) {
    console.error('Error checking token refresh need:', error);
    return false;
  }
};

/**
 * Dừng auto-refresh interval
 */
export const stopAutoRefresh = (): void => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
    console.log('Auto-refresh token stopped');
  }
};

/**
 * Khởi động auto-refresh token định kỳ
 * Kiểm tra mỗi phút và tự động refresh token nếu cần
 */
export const startAutoRefresh = (): void => {
  // Dừng interval cũ nếu có
  stopAutoRefresh();

  // Chỉ chạy trên client side
  if (typeof window === 'undefined') {
    console.log('startAutoRefresh: Skipping (server-side)');
    return;
  }

  const token = getCookie('token');
  const refreshToken = getCookie('refreshToken');

  // Nếu không có token hoặc refreshToken, không cần auto-refresh
  if (!token || !refreshToken) {
    console.log('startAutoRefresh: No token or refreshToken found, skipping auto-refresh', {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken
    });
    return;
  }

  console.log('✅ Starting auto-refresh token interval...');

  // Kiểm tra mỗi phút (60 giây)
  autoRefreshInterval = setInterval(async () => {
    const currentToken = getCookie('token');
    const currentRefreshToken = getCookie('refreshToken');

    // Nếu không còn token hoặc refreshToken, dừng auto-refresh
    if (!currentToken || !currentRefreshToken) {
      console.log('Auto-refresh: Token or refreshToken missing, stopping auto-refresh');
      stopAutoRefresh();
      return;
    }

    // Kiểm tra xem có cần refresh không
    const needsRefresh = shouldRefreshToken(currentToken);
    
    if (needsRefresh) {
      console.log('🔄 Token will expire soon, auto-refreshing...');
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          console.log('✅ Token auto-refreshed successfully');
        } else {
          console.warn('⚠️ Failed to auto-refresh token');
          // Nếu refresh thất bại, dừng auto-refresh
          stopAutoRefresh();
        }
      } catch (error) {
        console.error('❌ Error in auto-refresh:', error);
        stopAutoRefresh();
      }
    } else {
      // Log để debug - chỉ log khi còn <= 10 phút
      const expiresAt = localStorage.getItem('tokenExpiresAt');
      if (expiresAt) {
        const expiresAtTime = parseInt(expiresAt, 10);
        const now = Date.now();
        const minutesLeft = Math.ceil((expiresAtTime - now) / (60 * 1000));
        if (minutesLeft > 0 && minutesLeft <= 10) {
          console.log(`⏰ Token still valid, ${minutesLeft} minutes left until refresh needed`);
        }
      }
    }
  }, 60 * 1000); // Kiểm tra mỗi 60 giây (1 phút)

  // Kiểm tra ngay lập tức khi khởi động
  if (shouldRefreshToken(token)) {
    console.log('🔄 Token needs immediate refresh on startup');
    refreshAccessToken().then(newToken => {
      if (newToken) {
        console.log('✅ Immediate token refresh successful');
      } else {
        console.warn('⚠️ Immediate token refresh failed');
      }
    }).catch(error => {
      console.error('❌ Error in immediate refresh:', error);
    });
  } else {
    // Log thông tin token khi khởi động
    const expiresAt = localStorage.getItem('tokenExpiresAt');
    if (expiresAt) {
      const expiresAtTime = parseInt(expiresAt, 10);
      const now = Date.now();
      const minutesLeft = Math.ceil((expiresAtTime - now) / (60 * 1000));
      console.log(`⏰ Auto-refresh started. Token valid for ${minutesLeft} more minutes`);
    }
  }
};

/**
 * Fetch wrapper với tự động refresh token
 */
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  // Ưu tiên token từ Authorization header trong options, nếu không có thì lấy từ cookie
  let existingAuthHeader: string | undefined;
  if (options.headers) {
    if (options.headers instanceof Headers) {
      existingAuthHeader = options.headers.get('Authorization') || undefined;
    } else if (Array.isArray(options.headers)) {
      const authEntry = options.headers.find(([key]) => key.toLowerCase() === 'authorization');
      existingAuthHeader = authEntry ? authEntry[1] : undefined;
    } else {
      existingAuthHeader = (options.headers as Record<string, string>)['Authorization'] || 
                          (options.headers as Record<string, string>)['authorization'];
    }
  }
  
  // Lấy token từ header hoặc cookie
  let token = existingAuthHeader?.replace(/^Bearer\s+/i, '') || getCookie('token');
  
  // Debug log để kiểm tra token
  if (!token) {
    console.warn('fetchWithAuth: No token found in header or cookie for URL:', url);
  } else {
    console.debug('fetchWithAuth: Using token from', existingAuthHeader ? 'header' : 'cookie', 'for URL:', url);
  }

  // Kiểm tra và refresh token nếu cần
  if (token && isTokenExpired(token)) {
    console.log('Token expired, refreshing...');
    token = await refreshAccessToken();
  }

  // Thêm Authorization header nếu có token
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Chỉ override Authorization nếu có token mới hoặc chưa có Authorization header
  if (token && !existingAuthHeader) {
    if (headers instanceof Headers) {
      headers.set('Authorization', `Bearer ${token}`);
    } else if (Array.isArray(headers)) {
      headers.push(['Authorization', `Bearer ${token}`]);
    } else {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  } else if (token && existingAuthHeader) {
    if (headers instanceof Headers) {
      headers.set('Authorization', existingAuthHeader);
    } else if (Array.isArray(headers)) {
      const authIndex = headers.findIndex(([key]) => key.toLowerCase() === 'authorization');
      if (authIndex >= 0) {
        headers[authIndex] = ['Authorization', existingAuthHeader];
      } else {
        headers.push(['Authorization', existingAuthHeader]);
      }
    } else {
      (headers as Record<string, string>)['Authorization'] = existingAuthHeader;
    }
  }

  // Thực hiện request
  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Helper function để retry request với token mới
  const retryWithNewToken = async (newToken: string | null): Promise<Response> => {
    if (newToken) {
      // Retry request với token mới
      const retryHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        'Authorization': `Bearer ${newToken}`,
      };
      
      return await fetch(url, {
        ...options,
        headers: retryHeaders,
        credentials: 'include',
      });
    }
    return response;
  };

  // Helper function để check response body cho các error codes cần refresh token
  // GEN01, PMS03 (Unauthorized) - các lỗi này thường do token hết hạn hoặc không hợp lệ
  const checkForTokenError = async (res: Response): Promise<{ needsRefresh: boolean; errorCode?: string }> => {
    try {
      // Clone response để không consume body gốc
      const clonedResponse = res.clone();
      const contentType = clonedResponse.headers.get('content-type');
      
      // Chỉ check JSON responses
      if (contentType && contentType.includes('application/json')) {
        const text = await clonedResponse.text();
        if (!text) return { needsRefresh: false };
        
        try {
          const data = JSON.parse(text);
          
          // Check các error codes: GEN01, PMS03 (và các mã khác có thể cần refresh token)
          const statusCode = data?.status?.code || data?.statusCode;
          
          if (statusCode === 'GEN01' || statusCode === 'PMS03') {
            console.log(`Detected ${statusCode} error code, token may be expired or invalid`);
            return { needsRefresh: true, errorCode: statusCode };
          }
        } catch (parseError) {
          // Nếu không parse được JSON, không phải token error
          console.debug('Could not parse JSON for token error check:', parseError);
        }
      }
    } catch (error) {
      // Nếu có lỗi khi clone hoặc đọc response
      console.debug('Could not check for token error:', error);
    }
    
    return { needsRefresh: false };
  };

  // Helper function để handle token refresh và retry
  const handleTokenRefreshAndRetry = async (): Promise<Response> => {
    console.log('Attempting to refresh token due to error...');
    const newToken = await refreshAccessToken();

    if (newToken) {
      console.log('Token refreshed successfully, retrying request...');
      const retriedResponse = await retryWithNewToken(newToken);
      
      // Check lại token error sau khi retry
      const stillTokenError = await checkForTokenError(retriedResponse);
      if (stillTokenError.needsRefresh) {
        console.warn(`Still receiving ${stillTokenError.errorCode} after token refresh, might be a server issue or invalid refresh token`);
      }
      
      return retriedResponse;
    } else {
      console.warn('Failed to refresh token');
      // Nếu refresh thất bại, có thể redirect đến login
      if (typeof window !== 'undefined') {
        // Xóa tất cả auth data
        setCookie('token', '', -1);
        setCookie('refreshToken', '', -1);
        localStorage.removeItem('persist:auth');
        localStorage.removeItem('persist:root');

        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signin')) {
          window.location.href = '/signin';
        }
      }
      return response;
    }
  };

  const tokenError = await checkForTokenError(response);
  if (tokenError.needsRefresh && token) {
    console.log(`${tokenError.errorCode} error detected, refreshing token and retrying...`);
    response = await handleTokenRefreshAndRetry();
    return response;
  }

  if (response.status === 401 && token) {
    console.log('Received 401, attempting to refresh token...');
    response = await handleTokenRefreshAndRetry();
    return response;
  }

  if (response.status === 500 && token) {
    console.log('Received 500, attempting to refresh token and retry...');
    response = await handleTokenRefreshAndRetry();
    return response;
  }

  return response;
};


