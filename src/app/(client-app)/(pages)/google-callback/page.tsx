"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "../../../../redux/store";
import { loginWithGoogleCallback } from "../../../../redux/Client/Auth/Action";

const GoogleCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Đăng nhập Google | Proshop";
    const processCallback = async () => {
      try {
        // Lấy các tham số từ URL callback
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const scope = searchParams.get("scope");
        const authuser = searchParams.get("authuser");
        const prompt = searchParams.get("prompt");

        console.log("Google OAuth Callback Parameters:", {
          code,
          state,
          scope,
          authuser,
          prompt
        });

        if (!code) {
          throw new Error("Không nhận được authorization code từ Google");
        }

        // Gửi code về backend để xử lý
        const callbackData = {
          code,
          state,
          scope,
          authuser,
          prompt
        };

        dispatch(
          loginWithGoogleCallback(
            callbackData,
            (response) => {
              console.log("Google login success - Full response:", response);

              // Kiểm tra role để quyết định redirect
              const userRoleNames = response?.data?.roleNames || response?.roleNames || [];
              console.log('User roleNames:', userRoleNames);
              console.log('Is array?', Array.isArray(userRoleNames));

              if (Array.isArray(userRoleNames) && userRoleNames.length > 0 && userRoleNames.includes('Administrator')) {
                console.log('✓ User has Administrator role, redirecting to /admin-app');
                setTimeout(() => {
                  router.push("/admin-app");
                }, 100);
              } else {
                console.log('✓ User is regular user, redirecting to home');
                // Redirect về trang trước đó hoặc trang chủ
                const redirectAfterLogin = localStorage.getItem("redirectAfterLogin");
                setTimeout(() => {
                  if (redirectAfterLogin) {
                    localStorage.removeItem("redirectAfterLogin");
                    router.replace(redirectAfterLogin);
                  } else {
                    router.push("/");
                  }
                }, 100);
              }
            },
            (error) => {
              console.error("Google login error:", error);
              setError(error);
              setIsProcessing(false);

              // Redirect về trang đăng nhập sau 3 giây
              setTimeout(() => {
                router.push("/signin");
              }, 3000);
            }
          )
        );
      } catch (err) {
        console.error("Callback processing error:", err);
        setError(err instanceof Error ? err.message : "Lỗi không xác định");
        setIsProcessing(false);

        setTimeout(() => {
          router.push("/signin");
        }, 3000);
      }
    };

    processCallback();
  }, [router, searchParams, dispatch]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
            {/* Error Icon */}
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Đăng nhập thất bại
            </h1>

            <p className="text-gray-600 mb-6">
              {error}
            </p>

            <p className="text-sm text-gray-500">
              Đang chuyển về trang đăng nhập...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
          {/* Google Logo Animation */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-red-500 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>

              {/* Spinning Ring */}
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-red-500 border-b-yellow-500 border-l-green-500 rounded-full animate-spin"></div>

              {/* Outer Glow Ring */}
              <div className="absolute -inset-2 border-2 border-blue-200 rounded-full animate-pulse opacity-50"></div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Đăng nhập Google
          </h1>

          {/* Loading Text */}
          <p className="text-gray-600 mb-6 text-lg">
            Đang xử lý đăng nhập...
          </p>

          {/* Loading Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 via-yellow-500 to-green-500 rounded-full animate-pulse"></div>
          </div>

          {/* Loading Dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          </div>

          {/* Status Message */}
          <div className="mt-6 text-sm text-gray-500">
            Vui lòng chờ trong giây lát...
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Bảo mật và được bảo vệ bởi Google
          </p>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-red-200 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-yellow-200 rounded-full opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 right-10 w-18 h-18 bg-green-200 rounded-full opacity-20 animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default GoogleCallbackPage;
