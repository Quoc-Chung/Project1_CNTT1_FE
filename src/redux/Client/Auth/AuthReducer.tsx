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
import { setCookie, deleteCookie, getCookie } from "../../../utils/cookies";
import { startAutoRefresh, stopAutoRefresh } from "../../../utils/refreshToken";


const initialState = {
  loading: false,
  user: null,
  isLogin: false,
  token: null,
  roleNames: [],
  error: null,

  forgotPassword: {
    loading: false,
    data: null,
    error: null,
  },

  verifyOtp: {
    loading: false,
    data: null,
    error: null,
  },

  resetPassword: {
    loading: false,
    data: null,
    error: null,
  },
};

export const authReducer = (state = initialState, action: any) => {
  switch (action.type) {

    case 'persist/REHYDRATE':
      const rehydratedAuthState = action.payload?.auth;
      
      if (rehydratedAuthState) {
        // Đảm bảo có token trong cookie
        if (rehydratedAuthState.token && typeof window !== 'undefined') {
          const cookieToken = getCookie('token');
          if (!cookieToken && rehydratedAuthState.token) {
            setCookie('token', rehydratedAuthState.token, 7);
          }
        }
        
        const shouldBeLogin = !!(rehydratedAuthState.token || rehydratedAuthState.isLogin === true || rehydratedAuthState.isLogin === 'true');
        
        console.log('AuthReducer REHYDRATE:', {
          hasToken: !!rehydratedAuthState.token,
          isLoginFlag: rehydratedAuthState.isLogin,
          shouldBeLogin,
          hasUser: !!rehydratedAuthState.user
        });
        
        // Khởi động auto-refresh token nếu có token và refreshToken
        if (shouldBeLogin && typeof window !== 'undefined') {
          const refreshToken = getCookie('refreshToken');
          if (rehydratedAuthState.token && refreshToken) {
            // Đợi một chút để đảm bảo cookie đã được set
            setTimeout(() => {
              startAutoRefresh();
            }, 1000);
          }
        }
        
        return {
          ...state,
          ...rehydratedAuthState,
          isLogin: shouldBeLogin,
        };
      }

      return state;
    
    // ============== REGISTER ==============
    case REGISTER_REQUEST:
      return { ...state, loading: true, error: null };
    case REGISTER_SUCCESS:
      return { ...state, loading: false, user: action.payload };
    case REGISTER_FAILURE:
      return { ...state, loading: false, error: action.payload };



    // ============== LOGIN ==============
    case LOGIN_REQUEST:
      return { ...state, loading: true, error: null };
    case LOGIN_SUCCESS:
      console.log('AuthReducer LOGIN_SUCCESS - Full payload:', action.payload);
      

      if (action.payload?.token && typeof window !== 'undefined') {
        setCookie('token', action.payload.token, 7);
        
        // Lưu refreshToken nếu có
        if (action.payload?.refreshToken) {
          setCookie('refreshToken', action.payload.refreshToken, 30); 
          console.log('AuthReducer: Saved refreshToken to cookie');
        }
        
        if (action.payload?.expiresIn && typeof window !== 'undefined') {
          const expiresIn = action.payload.expiresIn;
          const loginTime = Date.now(); 
          localStorage.setItem('tokenExpiresAt', (loginTime + expiresIn * 1000).toString());
          localStorage.setItem('tokenExpiresIn', expiresIn.toString());
          console.log('AuthReducer: Saved token expiration time, expires in:', expiresIn, 'seconds');
        }
        
        // Lấy roleNames từ payload hoặc decode từ JWT
        let roleNamesToSave = action.payload?.roleNames || [];
        
        // Nếu không có roleNames trong payload, thử decode từ JWT
        if ((!roleNamesToSave || roleNamesToSave.length === 0) && action.payload?.token) {
          try {
            const parts = action.payload.token.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              const rawRoles = payload.roleNames || payload.roles || payload.authorities || [];
              // Map ADMIN -> Administrator
              roleNamesToSave = rawRoles.map((role: string) => {
                if (role === 'ADMIN') return 'Administrator';
                if (role === 'MANAGER') return 'Manager';
                if (role === 'SALES') return 'Sales';
                if (role === 'WAREHOUSE') return 'Warehouse';
                return role;
              });
              console.log('AuthReducer: Decoded roleNames from JWT:', roleNamesToSave);
            }
          } catch (e) {
            console.error('AuthReducer: Error decoding JWT for roleNames:', e);
          }
        }
        
        // Lưu roleNames vào cookie và localStorage
        if (roleNamesToSave && Array.isArray(roleNamesToSave) && roleNamesToSave.length > 0) {
          const roleNamesString = JSON.stringify(roleNamesToSave);
          setCookie('userRoleNames', roleNamesString, 7); // Lưu 7 ngày
          localStorage.setItem('userRoleNames', roleNamesString);
          console.log('AuthReducer: Saved roleNames to cookie and localStorage:', roleNamesToSave);
        } else {
          console.warn('AuthReducer: No roleNames to save. Payload roleNames:', action.payload?.roleNames);
        }
      }
      
      // Sử dụng roleNames từ JWT nếu không có trong payload
      const finalRoleNames = action.payload?.roleNames || (() => {
        if (action.payload?.token) {
          try {
            const parts = action.payload.token.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              const rawRoles = payload.roleNames || payload.roles || payload.authorities || [];
              return rawRoles.map((role: string) => {
                if (role === 'ADMIN') return 'Administrator';
                if (role === 'MANAGER') return 'Manager';
                if (role === 'SALES') return 'Sales';
                if (role === 'WAREHOUSE') return 'Warehouse';
                return role;
              });
            }
          } catch (e) {
            console.error('AuthReducer: Error decoding JWT in return statement:', e);
          }
        }
        return [];
      })();
      
      // Tạo user object từ payload để đảm bảo có đầy đủ thông tin
      const userData = {
        ...action.payload,
        token: action.payload.token, // Đảm bảo token có trong user object
      };
      
      const newState = {
        ...state,
        loading: false,
        user: userData, // Lưu toàn bộ user data
        token: action.payload.token,
        isLogin: true,
        roleNames: finalRoleNames
      };
      
      console.log('AuthReducer LOGIN_SUCCESS - New state:', {
        hasUser: !!newState.user,
        hasToken: !!newState.token,
        isLogin: newState.isLogin,
        roleNames: newState.roleNames,
        userKeys: newState.user ? Object.keys(newState.user) : []
      });
      
      // Khởi động auto-refresh token sau khi login thành công
      if (action.payload?.token && action.payload?.refreshToken && typeof window !== 'undefined') {
        // Đợi một chút để đảm bảo cookie đã được set
        setTimeout(() => {
          startAutoRefresh();
        }, 500);
      }
      
      return newState;
    case LOGIN_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ============== LOGIN WITH GOOGLE ==============  
    case LOGIN_GOOGLE_REQUEST:
      return {
        ...state,
        loading: false,
        error: null
      }

    case LOGIN_GOOGLE_SUCCESS:
      // Lưu token vào cookie để middleware có thể kiểm tra
      if (action.payload?.token && typeof window !== 'undefined') {
        setCookie('token', action.payload.token, 7); // Lưu 7 ngày
        
        // Lưu refreshToken nếu có
        if (action.payload?.refreshToken) {
          setCookie('refreshToken', action.payload.refreshToken, 30); // Lưu 30 ngày
        }
        
        // Lưu expiresIn và thời điểm login để kiểm tra hết hạn
        if (action.payload?.expiresIn && typeof window !== 'undefined') {
          const expiresIn = action.payload.expiresIn; // seconds
          const loginTime = Date.now(); // milliseconds
          localStorage.setItem('tokenExpiresAt', (loginTime + expiresIn * 1000).toString());
          localStorage.setItem('tokenExpiresIn', expiresIn.toString());
        }
      }
      return {
        ...state,
        loading: false,
        user: action.payload,
        token: action.payload.token,
        isLogin: true,
        roleNames: action.payload.roleNames || []
      }

    case LOGIN_GOOGLE_FAILURE:
      return { ...state, loading: false, error: action.payload };


    // ============== UPDATE USER ==============
    case UPDATE_USER_REQUEST:
      return { ...state, loading: true, error: null };
    case UPDATE_USER_SUCCESS:
      return { ...state, loading: false, user: action.payload };
    case UPDATE_USER_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ============== LOGOUT ==============
    case LOGOUT_REQUEST:
      return { ...state, loading: true, error: null };
    case LOGOUT_SUCCESS:
      // Dừng auto-refresh token
      stopAutoRefresh();
      
      // Xóa token khỏi cookie khi logout
      if (typeof window !== 'undefined') {
        deleteCookie('token');
        deleteCookie('refreshToken');
        localStorage.removeItem('tokenExpiresAt');
        localStorage.removeItem('tokenExpiresIn');
      }
      return { ...state, loading: false, user: null, token: null, isLogin: false, roleNames: [] };
    case LOGOUT_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ============== CHANGE PASSWORD ==============
    case CHANGE_PASSWORD_REQUEST:
      return { ...state, loading: true, error: null };
    case CHANGE_PASSWORD_SUCCESS:
      return { ...state, loading: false };
    case CHANGE_PASSWORD_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ----- FORGOT PASSWORD -----
    case FORGOT_PASSWORD_REQUEST:
      return {
        ...state,
        forgotPassword: { loading: true, data: null, error: null },
      };

    case FORGOT_PASSWORD_SUCCESS:
      return {
        ...state,
        forgotPassword: { loading: false, data: action.payload, error: null },
      };

    case FORGOT_PASSWORD_FAILURE:
      return {
        ...state,
        forgotPassword: { loading: false, data: null, error: action.payload },
      };

    // ----- VERIFY OTP -----
    case VERIFY_OTP_REQUEST:
      return {
        ...state,
        verifyOtp: { loading: true, data: null, error: null },
      };

    case VERIFY_OTP_SUCCESS:
      return {
        ...state,
        verifyOtp: { loading: false, data: action.payload, error: null },
      };

    case VERIFY_OTP_FAILURE:
      return {
        ...state,
        verifyOtp: { loading: false, data: null, error: action.payload },
      };

    // ----- RESET PASSWORD -----
    case RESET_PASSWORD_REQUEST:
      return {
        ...state,
        resetPassword: { loading: true, data: null, error: null },
      };

    case RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        resetPassword: { loading: false, data: action.payload, error: null },
      };

    case RESET_PASSWORD_FAILURE:
      return {
        ...state,
        resetPassword: { loading: false, data: null, error: action.payload },
      };

    default:
      return state;
  }
};
