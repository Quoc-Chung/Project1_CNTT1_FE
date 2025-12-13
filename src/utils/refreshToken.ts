import { BASE_API_AUTH_URL } from './configAPI';
import { getCookie, setCookie } from './cookies';

/**
 * Refresh token utility
 * Tự động refresh token khi token hết hạn
 */

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

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
 * Fetch wrapper với tự động refresh token
 */
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  let token = getCookie('token');

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

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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

  // Nếu nhận được 401 (Unauthorized), thử refresh token và retry
  if (response.status === 401 && token) {
    console.log('Received 401, attempting to refresh token...');
    const newToken = await refreshAccessToken();

    if (newToken) {
      response = await retryWithNewToken(newToken);
    } else {
      // Nếu refresh thất bại, có thể redirect đến login
      if (typeof window !== 'undefined') {
        // Xóa tất cả auth data
        setCookie('token', '', -1);
        setCookie('refreshToken', '', -1);
        localStorage.removeItem('persist:auth');
        localStorage.removeItem('persist:root');
        
        // Redirect đến login page nếu không phải đang ở đó
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
  }

  // Nếu nhận được 500 (Internal Server Error), thử refresh token và retry
  // Lỗi 500 có thể do token không hợp lệ hoặc server issue
  if (response.status === 500 && token) {
    console.log('Received 500, attempting to refresh token and retry...');
    const newToken = await refreshAccessToken();

    if (newToken) {
      console.log('Token refreshed successfully, retrying request...');
      response = await retryWithNewToken(newToken);
      
      // Nếu vẫn lỗi 500 sau khi refresh, có thể là lỗi server thật sự
      if (response.status === 500) {
        console.warn('Still receiving 500 after token refresh, might be a server issue');
      }
    } else {
      console.warn('Failed to refresh token on 500 error');
    }
  }

  return response;
};

