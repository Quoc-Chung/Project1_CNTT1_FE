import { BASE_API_URL } from "@/utils/configAPI";
import { getAllCartAction } from "../CartOrder/Action";
import { persistor, store } from "../../store";
import { startAutoRefresh, stopAutoRefresh } from "@/utils/refreshToken";
import {
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAILURE,
  CHANGE_PASSWORD_REQUEST,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAILURE,
  LOGIN_GOOGLE_REQUEST,
  LOGIN_GOOGLE_SUCCESS,
  LOGIN_GOOGLE_FAILURE,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAILURE,
  VERIFY_OTP_REQUEST,
  VERIFY_OTP_SUCCESS,
  VERIFY_OTP_FAILURE,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAILURE,
} from "./ActionType";
import { Register } from "@/types/Client/Auth/Register";
import { LoginRequest } from "../../../types/Client/Auth/LoginRequest";
import { LogoutRequest } from "../../../types/Client/Auth/LogoutRequest";
import { ChangePassword } from "../../../types/Client/Auth/ChangePassword";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { LoginResponse } from "../../../types/Client/Auth/LoginResponse";

// ============== REGISTER ==============
export const register = (data: Register, onSuccess?: any, onError?: any) => {
  return async (dispatch) => {
    dispatch({ type: REGISTER_REQUEST });
    try {
      const res = await fetch(`${BASE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      console.log(resData)
      /*- Return errror if code  not equal 200  -*/
      if (resData.status?.code !== "200") {
        throw new Error(resData.status?.message || "Đăng ký thất bại");
      }
      /*- Gửi mỗi phần data lên trên store -*/
      dispatch({ type: REGISTER_SUCCESS, payload: resData.data });
      onSuccess?.(resData);
    } catch (error: any) {
      dispatch({ type: REGISTER_FAILURE, payload: error.message });
      onError?.(error.message);
    }
  };
};

// ============== LOGIN ==============
export const login = (data: LoginRequest, onSuccess?: any, onError?: any) => {
  return async (dispatch) => {
    dispatch({ type: LOGIN_REQUEST });
    try {
      // Gọi API thực
      const res = await fetch(`${BASE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      // Trả về access token và refresh token
      const resData = await res.json();
      console.log(resData)
      if (resData.status?.code !== "200") {
        throw new Error(resData.status?.message || "Đăng nhập thất bại");
      }

      if (resData.data?.token) {
        console.log('Login Action: Dispatching LOGIN_SUCCESS with payload:', resData.data);
        
        dispatch({ type: LOGIN_SUCCESS, payload: resData.data });
        
        // Đợi state được update và flush persistor để lưu ngay vào localStorage
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Kiểm tra state sau khi dispatch
            const currentState = store.getState();
            console.log('Login Action: Current Redux state after dispatch:', {
              hasAuth: !!currentState.auth,
              hasToken: !!currentState.auth?.token,
              hasUser: !!currentState.auth?.user,
              isLogin: currentState.auth?.isLogin,
              roleNames: currentState.auth?.roleNames
            });
            
            // Flush persistor để đảm bảo dữ liệu được lưu vào localStorage ngay lập tức
            persistor.flush().then(() => {
              console.log('Login Action: Persistor flushed successfully');
              
              // Kiểm tra localStorage sau khi flush
              const persistedAuth = localStorage.getItem('persist:auth');
              
              if (resData.data.token) {
                dispatch(getAllCartAction(
                  resData.data.token,
                  () => {
                  },
                  (err) => {
                    console.warn("Failed to load cart after login:", err);
                  }
                ));
              }
              
              // Khởi động auto-refresh token sau khi login thành công
              if (resData.data.token && resData.data.refreshToken) {
                // Lưu expiresIn vào localStorage nếu có
                if (resData.data.expiresIn && typeof window !== 'undefined') {
                  const expiresIn = resData.data.expiresIn; // seconds
                  const refreshTime = Date.now(); // milliseconds
                  localStorage.setItem('tokenExpiresAt', (refreshTime + expiresIn * 1000).toString());
                  localStorage.setItem('tokenExpiresIn', expiresIn.toString());
                }
                // Khởi động auto-refresh
                startAutoRefresh();
              }
              
              // Gọi onSuccess sau khi đảm bảo dữ liệu đã được persist
              onSuccess?.(resData);
            }).catch((err) => {
              console.error('Login Action: Error flushing persistor:', err);
              
              // Vẫn gọi onSuccess nếu flush fail (không block user)
              if (resData.data.token) {
                dispatch(getAllCartAction(
                  resData.data.token,
                  () => {
                  },
                  (err) => {
                    console.warn("Failed to load cart after login:", err);
                  }
                ));
              }
              onSuccess?.(resData);
            });
          });
        });
      } else {
        throw new Error("Tài khoản hoặc mật khẩu sai");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      dispatch({ type: LOGIN_FAILURE, payload: error.message });
      onError?.(error.message);
    }
  };
};




export const loginWithGoogleCallback = (data: any, onSuccess?: any, onError?: any) => {
  return async (dispatch) => {
    dispatch({ type: LOGIN_GOOGLE_REQUEST });
    try {
      // Gọi API backend để xử lý Google OAuth callback
      const res = await fetch(`${BASE_API_URL}/api/auth/google/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      console.log('Google OAuth callback response:', resData);

      if (resData.status?.code !== "200") {
        throw new Error(resData.status?.message || "Đăng nhập Google thất bại");
      }

      if (resData.data?.token) {
        dispatch({ type: LOGIN_GOOGLE_SUCCESS, payload: resData.data });
        
        // Tự động load giỏ hàng sau khi đăng nhập thành công
        if (resData.data.token) {
          dispatch(getAllCartAction(
            resData.data.token,
            () => {
              // Cart loaded successfully - silent success
            },
            (err) => {
              // Cart load failed - log but don't show error to user
              console.warn("Failed to load cart after Google login:", err);
            }
          ));
        }
        
        onSuccess?.(resData);
      } else {
        throw new Error("Không nhận được token từ Google OAuth");
      }
    } catch (error: any) {
      console.error("Google OAuth error:", error);
      dispatch({ type: LOGIN_GOOGLE_FAILURE, payload: error.message });
      onError?.(error.message);
    }
  };
};


export const updateUser = (formData: FormData, onSuccess?: any, onError?: any) => {
  return async (dispatch) => {
    dispatch({ type: UPDATE_USER_REQUEST });
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_API_URL}/api/users/update`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const resData = await res.json();

      if (resData.status?.code !== "200") {
        throw new Error(resData.status?.message || "Cập nhật user thất bại");
      }

      dispatch({ type: UPDATE_USER_SUCCESS, payload: resData.data });
      onSuccess?.(resData);
    } catch (error: any) {
      dispatch({ type: UPDATE_USER_FAILURE, payload: error.message });
      onError?.(error.message);
    }
  };
};
export const logoutAction = (logoutRequest: LogoutRequest, onSuccess?: any, onError?: any) => async (dispatch) => {
  dispatch({ type: LOGOUT_REQUEST });
  try {
    
    const res = await fetch(`${BASE_API_URL}/api/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${logoutRequest.token}` },
    });
    
    let resData;
    try {
      resData = await res.json();
    } catch (parseError) {

      console.warn('Logout API response is not JSON, continuing with client-side logout');
      resData = { status: { code: 200 } };
    }
    
    const statusCode = resData.status?.code;
    const isSuccess = statusCode === 200 || statusCode === "200";
    
    // Dừng auto-refresh token
    stopAutoRefresh();
    
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      localStorage.removeItem('persist:auth');
      localStorage.removeItem('persist:root');
      localStorage.removeItem('tokenExpiresAt');
      localStorage.removeItem('tokenExpiresIn');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('persist:')) {
          localStorage.removeItem(key);
        }
      });
    }
    
    dispatch({ type: LOGOUT_SUCCESS });
    onSuccess?.(resData);
    
  } catch (error: any) {
    console.error('Logout API error:', error);
    
    // Dừng auto-refresh token
    stopAutoRefresh();
    
    // Vẫn xóa dữ liệu local
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      localStorage.removeItem('persist:auth');
      localStorage.removeItem('persist:root');
      localStorage.removeItem('tokenExpiresAt');
      localStorage.removeItem('tokenExpiresIn');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('persist:')) {
          localStorage.removeItem(key);
        }
      });
    }
    
    dispatch({ type: LOGOUT_SUCCESS }); 
    onSuccess?.({ status: { code: 200 } });
  }
};

export const changePassword = (data: ChangePassword, onSuccess?: any, onError?: any) => {
  return async (dispatch) => {

    dispatch({ type: CHANGE_PASSWORD_REQUEST });
    const { token } = useSelector((state: RootState) => state.auth);
    try {

      const res = await fetch(`${BASE_API_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (resData.status?.code !== "200") {
        throw new Error(resData.status?.message || "Đổi mật khẩu thất bại");
      }

      dispatch({ type: CHANGE_PASSWORD_SUCCESS, payload: resData.data });
      onSuccess?.(resData);
    } catch (error: any) {
      dispatch({ type: CHANGE_PASSWORD_FAILURE, payload: error.message });
      onError?.(error.message);

    }
  };
};

export const loginWithGoogle = (
  data: LoginResponse,
  onSuccess?: (res: LoginResponse) => void,
  onError?: (err: string) => void
) => {
  return async (dispatch: any) => {
    try {
      dispatch({ type: LOGIN_GOOGLE_REQUEST });
      
      dispatch({ type: LOGIN_GOOGLE_SUCCESS, payload: data });
      onSuccess?.(data);
    } catch (error: any) {
      dispatch({ type: LOGIN_GOOGLE_FAILURE, payload: error.message });
      onError?.(error.message);
    }
  };
};



export const forgotPassword = (data : EmailForgetPassword, onSuccess : any , onError : any) => async (dispatch) => {
  dispatch({ type: FORGOT_PASSWORD_REQUEST });
  try {
    const res = await fetch(`${BASE_API_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    
    if (resData.status && resData.status.code !== "200") {
      throw new Error(resData.status.message);
    }
    
    dispatch({ type: FORGOT_PASSWORD_SUCCESS, payload: resData });
    onSuccess?.(resData);
  } catch (error) {
    dispatch({ type: FORGOT_PASSWORD_FAILURE, payload: error.message });
    onError?.(error.message);
  }
};



export const verifyOtp = (data :VerifyOtp , onSuccess : any , onError : any ) => async (dispatch) => {
  dispatch({ type: VERIFY_OTP_REQUEST });
  try {
    const res = await fetch(`${BASE_API_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.status.message);
    dispatch({ type: VERIFY_OTP_SUCCESS, payload: resData });
    onSuccess?.(resData);
  } catch (error) {
    dispatch({ type: VERIFY_OTP_FAILURE, payload: error.message });
    onError?.(error.message);
  }
};

export const resetPassword = (data: ResetForgetPassword, onSuccess: any , onError : any) => async (dispatch) => {
  dispatch({ type: RESET_PASSWORD_REQUEST });
  try {
    const res = await fetch(`${BASE_API_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message);
    dispatch({ type: RESET_PASSWORD_SUCCESS, payload: resData });
    onSuccess?.(resData);
  } catch (error) {
    dispatch({ type: RESET_PASSWORD_FAILURE, payload: error.message });
    onError?.(error.message);
  }
};