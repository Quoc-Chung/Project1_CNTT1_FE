'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../redux/store'

export default function ForbiddenPage() {
  const { isLogin, roleNames } = useSelector((state: RootState) => state.auth)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true);
    // Set page title
    document.title = "Truy cập bị từ chối | Proshop";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
          <svg
            className="h-12 w-12 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          403 - Truy cập bị từ chối
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          Xin lỗi, bạn không có quyền truy cập vào trang này.
          {!isHydrated ? ' Vui lòng đăng nhập để tiếp tục.' :
            !isLogin ? ' Vui lòng đăng nhập để tiếp tục.' :
              !roleNames.includes('Administrator') ? ' Chỉ quản trị viên mới có thể truy cập.' :
                ' Vui lòng liên hệ quản trị viên để được hỗ trợ.'}
        </p>

        {/* User info */}
        {isHydrated && isLogin && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Thông tin tài khoản:</strong>
            </p>
            <p className="text-sm text-blue-700">
              Quyền hiện tại: {roleNames.length > 0 ? roleNames.join(', ') : 'Không có quyền'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {!isHydrated ? (
            <div className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg inline-block">
              Đang tải...
            </div>
          ) : !isLogin ? (
            <Link
              href="/signin"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 inline-block"
            >
              Đăng nhập
            </Link>
          ) : (
            <Link
              href="/"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 inline-block"
            >
              Về trang chủ
            </Link>
          )}

          <Link
            href="/contact"
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200 inline-block"
          >
            Liên hệ hỗ trợ
          </Link>
        </div>

        {/* Additional info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ với quản trị viên hệ thống.
          </p>
        </div>
      </div>
    </div>
  )
}
