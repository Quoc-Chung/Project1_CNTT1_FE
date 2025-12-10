"use client";

import Breadcrumb from "@/components/client/Common/Breadcrumb";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { login } from "../../../../redux/Client/Auth/Action";
import { LoginRequest } from "../../../../types/Client/Auth/LoginRequest";
import { useAppDispatch } from "../../../../redux/store";
import { toast } from "react-toastify";

const Signin = () => {
  const [formData, setFormData] = useState<LoginRequest>({
    account: "",
    password: "",
  });
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsHydrated(true);
    // Prefetch forgot-password page for instant navigation
    router.prefetch("/forgot-password");
  }, [router]);

 const handleLoginGoogle = () => {
  // Redirect đến backend OAuth endpoint với callback URL
  const callbackUrl = encodeURIComponent(`${window.location.origin}/google-callback`);
  window.location.href = `http://localhost:8081/oauth2/authorization/google?redirect_uri=${callbackUrl}`;
 };
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      const savedAccount = localStorage.getItem("account");
      const savedPassword = localStorage.getItem("password");

      setFormData({
        account: savedAccount || "",
        password: savedPassword || "",
      });

      localStorage.removeItem("account");
      localStorage.removeItem("password");
    }
  }, [isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      const showToast = searchParams.get('showToast');
      const redirect = searchParams.get('redirect');
      
      // Kiểm tra xem có phải vừa logout không
      const justLoggedOut = typeof window !== 'undefined' ? sessionStorage.getItem('justLoggedOut') === 'true' : false;
      
      if (showToast === 'true' && !justLoggedOut) {
        // Xác định message phù hợp dựa trên redirect path
        const isAdminRoute = redirect?.startsWith('/admin-app');
        const toastMessage = isAdminRoute 
          ? "Bạn cần quyền Administrator để truy cập trang này. Vui lòng đăng nhập!" 
          : "Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục!";
        
        setTimeout(() => {
          toast.warning(toastMessage, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          console.log('Toast warning displayed');
        }, 500);
        
        if (redirect) {
          localStorage.setItem("redirectUrl", redirect);
          console.log('Saved redirect URL:', redirect);
 
          if (isAdminRoute) {
            localStorage.setItem("redirectAfterLogin", redirect);
          }
        }
      } else if (justLoggedOut) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('justLoggedOut');
        }
      }
    }
  }, [isHydrated, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleForgetPassword = () => {
    router.push("/forgot-password");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.account.trim()) {
      toast.error("❌ Vui lòng nhập tài khoản!", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }
    
    if (!formData.password.trim()) {
      toast.error("❌ Vui lòng nhập mật khẩu!", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }
    
    setIsLoading(true);
    console.log("Đăng nhập với:", formData);
    
    dispatch(
      login(
        formData,
        (responseData) => {
          setIsLoading(false);
          
          const userRoleNames = responseData?.data?.roleNames || responseData?.roleNames || [];
          
          console.log('Login success - Full response:', responseData);
          console.log('User roleNames:', userRoleNames);
          console.log('Is array?', Array.isArray(userRoleNames));
          
          // Đợi một chút để Redux Persist lưu dữ liệu vào localStorage trước khi redirect
          setTimeout(() => {
            toast.success("🎉 Đăng nhập thành công", {
              autoClose: 1500,
              position: "top-right"
            });
            
            // Đợi thêm một chút để đảm bảo Redux state đã được persist
            setTimeout(() => {
              if (Array.isArray(userRoleNames) && userRoleNames.length > 0 && userRoleNames.includes('Administrator')) {
                console.log('✓ User has Administrator role, redirecting to /admin-app');
                console.log('✓ Redux state should be persisted by now');
                router.push("/admin-app");
              } else {
                console.log('✓ User is regular user, redirecting to home');
                const redirectAfterLogin = localStorage.getItem("redirectAfterLogin");
                const redirectUrl = localStorage.getItem("redirectUrl");
                
                if (redirectAfterLogin) {
                  localStorage.removeItem("redirectAfterLogin");
                  router.replace(redirectAfterLogin);
                } else if (redirectUrl) {
                  localStorage.removeItem("redirectUrl");
                  router.replace(redirectUrl);
                } else {
                  router.push("/");
                }
              }
            }, 200); 
          }, 100); 
        },
        (error: any) => {
          setIsLoading(false);
          console.error("Đăng nhập thất bại:", error);
          
          toast.error("❌ Đăng nhập thất bại! Vui lòng kiểm tra lại tài khoản và mật khẩu.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      )
    );
  };
  return (
    <>
      <div className="h-[200px]">
      </div>

      <section className="overflow-hidden py-5 bg-gray-2 ">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Sign In to Your Account
              </h2>
              <p>Enter your detail below</p>
            </div>

            <form   onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="account" className="block mb-2.5">
                  Account
                </label>
                <input
                  type="text"
                  name="account"
                  id="account"
                  placeholder="Enter your account"
                  value={formData.account}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`rounded-lg border border-gray-3 bg-gray-1 w-full py-3 px-5 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  suppressHydrationWarning
                />
              </div>

              <div className="mb-5">
                <label htmlFor="password" className="block mb-2.5">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Enter your password"
                  autoComplete="on"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`rounded-lg border border-gray-3 bg-gray-1 w-full py-3 px-5 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  suppressHydrationWarning
                />
              </div>

              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={handleForgetPassword}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  suppressHydrationWarning
                >
                  <p>Quên mật khẩu ?</p>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center font-medium text-white py-3 px-6 rounded-lg mt-7.5 transition-all duration-200 ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-dark hover:bg-blue'
                }`}
                suppressHydrationWarning
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang đăng nhập...
                  </div>
                ) : (
                  'Sign in to account'
                )}
              </button>

              <p className="text-center mt-6">
                Don&apos;t have an account?
                <Link href="/signup" className="text-dark hover:text-blue pl-2">
                  Sign Up Now!
                </Link>
              </p>
              <p className="text-center mt-[10px] mb-[70px]"> ---or--- </p>
              {/* Login Buttons */}
              <div className="flex  gap-4">
                {/* Google Button */}
                <button
                  onClick={handleLoginGoogle}
                  className={`
              group relative w-full flex items-center justify-center gap-3 
              bg-gradient-to-r from-red-500 to-orange-400 
              hover:from-red-600 hover:to-orange-500
              text-white font-semibold py-4 px-6 rounded-xl
              transform transition-all duration-300 ease-out
              hover:scale-105 hover:shadow-2xl hover:-translate-y-1
              active:scale-95 active:translate-y-0
              disabled:opacity-70 disabled:cursor-not-allowed
              overflow-hidden
              
            `}
                  suppressHydrationWarning
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                  {/* Google Icon */}
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.61l6.85-6.85C35.64 2.73 30.15 0 24 0 14.64 0 6.48 5.49 2.48 13.44l7.97 6.18C12.29 13.69 17.71 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.1 24.5c0-1.62-.15-3.18-.42-4.68H24v9.09h12.5c-.54 2.89-2.13 5.34-4.54 7.01l7.02 5.46C43.54 37.73 46.1 31.64 46.1 24.5z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.45 28.62c-.48-1.42-.75-2.94-.75-4.62s.27-3.2.75-4.62l-7.97-6.18C.89 16.64 0 20.21 0 24c0 3.79.89 7.36 2.48 10.8l7.97-6.18z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.15 0 11.64-2.02 15.54-5.5l-7.02-5.46c-2.04 1.38-4.64 2.21-8.52 2.21-6.29 0-11.71-4.19-13.55-10.12l-7.97 6.18C6.48 42.51 14.64 48 24 48z"
                    />
                  </svg>

                  google
                </button>

            </div>

            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signin;
