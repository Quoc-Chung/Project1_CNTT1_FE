'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '../../../../redux/store'
import { getCookie } from '../../../../utils/cookies'

interface AdminRouteProps {
  children: React.ReactNode
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const router = useRouter()
  const { isLogin, roleNames, token } = useSelector((state: RootState) => state.auth)
  const [isHydrated, setIsHydrated] = useState(false)
  const [authStatus, setAuthStatus] = useState<'checking' | 'authorized' | 'redirecting'>('checking')
  const [isLoggingOut, setIsLoggingOut] = useState(false) // Track logout state

  const { finalToken, finalRoleNames, finalIsLogin } = useMemo(() => {
    let t = token
    let r = roleNames
    let l = isLogin
    if (typeof window !== 'undefined') {
      if (!t) {
        const cookieToken = getCookie('token');
        if (cookieToken) {
          t = cookieToken;
          l = true;          
        }
      }
      if (!r || r.length === 0) {
        const roleNamesCookie = getCookie('userRoleNames');
        if (roleNamesCookie) {
          try {
            r = JSON.parse(roleNamesCookie);
            console.log('AdminRoute: Found roleNames from cookie (via getCookie):', r);
          } catch (e) {
            console.error('AdminRoute: Error parsing roleNames cookie:', e, 'Raw value:', roleNamesCookie);
          }
        }
      }
      if ((!r || r.length === 0)) {
        try {
          const stored = localStorage.getItem('userRoleNames');
          if (stored) {
            r = JSON.parse(stored);
            console.log('AdminRoute: Found roleNames from localStorage:', r);
          }
        } catch (e) {
          console.error('AdminRoute: Error reading roleNames from localStorage:', e);
        }
      }
      if ((!r || r.length === 0) && t) {
        try {
          const parts = t.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const rawRoles = payload.roleNames || payload.roles || payload.authorities || [];
            // Map ADMIN -> Administrator
            r = rawRoles.map((role: string) => {
              if (role === 'ADMIN') return 'Administrator';
              if (role === 'MANAGER') return 'Manager';
              if (role === 'SALES') return 'Sales';
              if (role === 'WAREHOUSE') return 'Warehouse';
              return role;
            });
            console.log('AdminRoute: Decoded roleNames from JWT:', r);
          }
        } catch (e) {
          console.error('AdminRoute: Error decoding JWT for roleNames:', e);
        }
      }
    }
    return { finalToken: t, finalRoleNames: r, finalIsLogin: l };
  }, [token, roleNames, isLogin]);
  const hasAdminRole = useMemo(() => {
    console.log('AdminRoute: Checking admin role:', {
      hasToken: !!finalToken,
      hasIsLogin: finalIsLogin,
      roleNames: finalRoleNames,
      roleNamesType: typeof finalRoleNames,
      isArray: Array.isArray(finalRoleNames),
    });

    if (!finalToken) {
      return false;
    }
    if (!finalIsLogin) {
      return false;
    }
    if (!finalRoleNames || !Array.isArray(finalRoleNames) || finalRoleNames.length === 0) {
      return false;
    }
    const hasAdmin = 
      finalRoleNames.includes('Administrator') || 
      finalRoleNames.includes('ADMIN') ||
      finalRoleNames.includes('admin') ||
      finalRoleNames.some((role: string) => {
        const roleUpper = String(role).toUpperCase().trim();
        return roleUpper === 'ADMIN' || roleUpper === 'ADMINISTRATOR';
      });
    return hasAdmin;
  }, [finalToken, finalIsLogin, finalRoleNames]);

  useEffect(() => {
    const justLoggedOut = typeof window !== 'undefined' ? sessionStorage.getItem('justLoggedOut') === 'true' : false;
  
    // Nếu đang logout, chỉ set state, KHÔNG redirect (để Sidebar xử lý redirect)
    if (justLoggedOut && !finalToken) {
      setIsLoggingOut(true); // Set state để giữ lại trong render
      setAuthStatus('redirecting'); // Set để không hiển thị loading
      return;
    }
  }, [finalToken, router]);
  useEffect(() => {
    const justLoggedOut = typeof window !== 'undefined' ? sessionStorage.getItem('justLoggedOut') === 'true' : false;
    
    if (justLoggedOut) {
      setIsHydrated(true);
      console.log('AdminRoute: Hydrated immediately (logout detected)');
      return;
    }
    const timer = setTimeout(() => {
      setIsHydrated(true);
      console.log('AdminRoute: Hydrated after delay');
    }, 500); 

    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!isHydrated || authStatus !== 'checking') return;
    const justLoggedOut = typeof window !== 'undefined' ? sessionStorage.getItem('justLoggedOut') === 'true' : false;
    
    // Nếu đang logout, chỉ set state, KHÔNG redirect (để Sidebar xử lý)
    if (justLoggedOut && !finalToken) {
      console.log('AdminRoute: Logout detected during check, keeping UI visible - Sidebar will handle redirect');
      setIsLoggingOut(true);
      setAuthStatus('redirecting');
      // KHÔNG redirect ở đây - để Sidebar xử lý bằng window.location.href
      return;
    }

    console.log('AdminRoute: Full check:', { 
      hasToken: !!finalToken,
      tokenLength: finalToken?.length || 0,
      isLogin: finalIsLogin,
      hasRoleNames: !!finalRoleNames && finalRoleNames.length > 0,
      roleNames: finalRoleNames,
      roleNamesString: JSON.stringify(finalRoleNames),
      hasAdminRole,
      authStatus
    });
    
    if (!finalToken) {
      console.log('AdminRoute: No token found, redirecting to signin');
      setAuthStatus('redirecting');
      router.replace('/signin');
      return;
    }

    if (!hasAdminRole) {
      console.log('AdminRoute: No admin role, redirecting to 403.');
      console.log('AdminRoute: Current roles:', finalRoleNames);
      console.log('AdminRoute: Role check details:', {
        includesAdministrator: finalRoleNames?.includes('Administrator'),
        includesADMIN: finalRoleNames?.includes('ADMIN'),
        includesadmin: finalRoleNames?.includes('admin'),
      });
      setAuthStatus('redirecting');
      setTimeout(() => {
        router.push('/403');
      }, 100);
      return;
    }

    console.log('AdminRoute: ✓ User has Administrator access, allowing access');
    setAuthStatus('authorized');
  }, [isHydrated, finalToken, hasAdminRole, finalRoleNames, finalIsLogin, router, authStatus]);

  // Kiểm tra logout ngay đầu render - ưu tiên cao nhất
  const justLoggedOut = typeof window !== 'undefined' ? sessionStorage.getItem('justLoggedOut') === 'true' : false;
  if ((justLoggedOut || isLoggingOut) && !finalToken) {
    // Nếu đang logout, luôn hiển thị children để toast có thể hiển thị, không hiển thị loading
    return <>{children}</>;
  }

  // Nếu đang redirect, kiểm tra xem có phải logout không
  if (authStatus === 'redirecting') {
    // Nếu đang logout, vẫn hiển thị children để toast có thể hiển thị (không block UI)
    if (isLoggingOut) {
      return <>{children}</>; // Vẫn hiển thị children để toast hiển thị, nhưng redirect đang diễn ra
    }
    // Nếu không phải logout (ví dụ: unauthorized), hiển thị loading
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }


  if (!isHydrated || authStatus === 'checking') {
    if (justLoggedOut || isLoggingOut) {
      return <>{children}</>;
    }
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Đang kiểm tra quyền...</p>
        </div>
      </div>
    );
  }


  if (authStatus === 'authorized' && hasAdminRole) {
    return <>{children}</>;
  }

  if (justLoggedOut || isLoggingOut) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        
      </div>
    </div>
  );
}

export default AdminRoute