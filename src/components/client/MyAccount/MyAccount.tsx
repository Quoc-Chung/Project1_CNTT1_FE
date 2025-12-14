"use client";
import React from "react";
import Image from "next/image";



const MyAccount = ({ isOpen, onClose, onAvatarChange, avatar }) => {

  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999999 bg-black/70 flex items-center justify-center px-4 py-10 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl shadow-2xl bg-white p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6L18 18" />
          </svg>
        </button>

        <h3 className="text-2xl font-bold text-gray-800 mb-6">Chỉnh sửa thông tin</h3>

        <form>
          {/* Avatar Upload */}
          <div className="mb-6 flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-blue-100 mb-4">
             <Image
              src={avatar || "/avatar.jpg"}
              alt="avatar"
              width={100}  
              height={100}
              className="object-cover"
              unoptimized={avatar && (avatar.startsWith('http://') || avatar.startsWith('https://'))}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const fallbackSrc = "/avatar.jpg";
                if (!target.src.includes('avatar.jpg')) {
                  target.src = fallbackSrc;
                }
              }}
            />
            </div>
            <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200">
              Tải ảnh lên
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarChange}
              />
            </label>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">Họ và tên</label>
              <input
                type="text"
                defaultValue="James Septimus"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                defaultValue="james@example.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Phone + Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">Số điện thoại</label>
              <input
                type="text"
                defaultValue="1234 567890"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">Địa chỉ</label>
              <input
                type="text"
                defaultValue="7398 Smoke Ranch Road, Las Vegas, Nevada 89128"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
          >
            Lưu thay đổi
          </button>
        </form>
      </div>
    </div>
  );
};

export default MyAccount;