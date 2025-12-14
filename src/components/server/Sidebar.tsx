"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  User,
  Tag,
  Folder,
  Ticket,
  Percent,
  FileText,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch, persistor } from "../../redux/store";
import { logoutAction } from "../../redux/Client/Auth/Action";
import { toast } from "react-toastify";

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isHydrated, setIsHydrated] = useState(false);
   
  const { user, token, isLogin, roleNames } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleLogout = () => {
    console.log('Sidebar: Logout started');
    
    // Hiển thị toast ngay lập tức - TRƯỚC TẤT CẢ
    const toastId = toast.success("🎉 Đăng xuất thành công!", {
      autoClose: 2000,
      position: "top-right",
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      toastId: 'logout-success',
    });
    
    console.log('Sidebar: Toast displayed with ID:', toastId);
    
    // Set flag để AdminRoute biết đang logout
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('justLoggedOut', 'true');
    }
    
    // Xóa dữ liệu
    if (typeof window !== 'undefined') {
      localStorage.removeItem('persist:auth');
      localStorage.removeItem('persist:root');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('persist:')) {
          localStorage.removeItem(key);
        }
      });
    }
    
    // Đợi đủ lâu để toast được render và hiển thị rõ ràng
    // Dùng nhiều frame để đảm bảo DOM update hoàn tất
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Đợi thêm để đảm bảo toast được render vào DOM
          setTimeout(() => {
            console.log('Sidebar: Redirecting to signin after toast display');
            // Dùng window.location.href để force redirect
            window.location.href = "/signin";
          }, 1000); // Tăng delay lên 1000ms để toast có đủ thời gian hiển thị
        });
      });
    });
    
    // Dispatch logout action để cleanup Redux state (chạy background)
    dispatch(
      logoutAction(
        { token },
        async () => {
          persistor.purge().catch((error) => {
            console.error('Error purging persistor:', error);
          }); 
        },
        (err) => {
          console.error('Logout error:', err);
        }
      )
    );
  };
  
  const menuItems = [
    { href: "/admin-app/dashboard", icon: BarChart3, label: "Dashboard Tổng Quan" },
    { href: "/admin-app/products/management", icon: Package, label: "Quản Lý Sản Phẩm" },
    { href: "/admin-app/brands/management", icon: Tag, label: "Quản Lý Thương Hiệu" },
    { href: "/admin-app/categories/management", icon: Folder, label: "Quản Lý Danh Mục" },
    { href: "/admin-app/inventorys/management", icon: Package, label: "Quản Lý Kho Hàng" },
    { href: "/admin-app/orders", icon: ShoppingCart, label: "Quản Lý Đơn Hàng" },
    { href: "/admin-app/customers/management", icon: Users, label: "Quản Lý Khách Hàng" },
    { href: "/admin-app/vouchers", icon: Ticket, label: "Quản Lý Voucher" },
    { href: "/admin-app/sales", icon: Percent, label: "Quản Lý Sale" },
    { href: "/admin-app/blogs/management", icon: FileText, label: "Quản Lý Blog" },
  ];

  return (
    <div className="w-72 h-screen bg-gradient-to-b from-gray-50 to-white shadow-xl flex flex-col relative overflow-hidden transition-all duration-500 fixed left-0 top-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse-slow pointer-events-none" />

      {/* User Profile - Sticky */}
      <div className="relative z-10 p-4 border-b border-gray-200/30 bg-white/80 backdrop-blur-sm sticky top-0 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center transition-transform duration-300 rounded-full shadow-md w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:scale-105">
            <User size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {isHydrated ? (user?.fullName || 'Admin User') : 'Admin User'}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {isHydrated ? (user?.email || 'admin@company.com') : 'admin@company.com'}
            </p>
            <span className="inline-block mt-1 px-3 py-1 text-[11px] font-medium rounded-full bg-purple-100 text-purple-700 transition-colors duration-200">
              {isHydrated ? (roleNames?.includes('Administrator') ? 'Administrator' : roleNames?.join(', ') || 'User') : 'User'}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-400 transition-all duration-200 hover:text-red-500 hover:scale-110 hover:bg-red-50 rounded-lg cursor-pointer"
            title="Đăng xuất"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="relative z-20 flex-1 p-4 overflow-y-auto custom-scrollbar min-h-0">
        <ul className="pb-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = isHydrated ? pathname === item.href : false;

            return (
              <li key={item.href} className="group relative">
                <Link
                  href={item.href}
                  prefetch={true}
                  scroll={true}
                  className={`w-full px-4 py-2.5 rounded-xl flex items-center space-x-3 transition-all duration-200 cursor-pointer select-none relative z-10 ${isActive
                    ? "bg-blue-600 text-white shadow-lg border-r-4 border-blue-400"
                    : "text-gray-600 hover:bg-gray-100/70 hover:text-gray-900 active:bg-gray-200/70"
                    }`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <div className="transition-transform duration-150 group-hover:scale-110 flex-shrink-0 pointer-events-none">
                    <item.icon size={20} />
                  </div>
                  <span className="text-sm font-medium tracking-tight flex-1 pointer-events-none">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer - Sticky */}
      <div className="relative z-10 p-4 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm sticky bottom-0 flex-shrink-0">
        <div className="text-[11px] text-gray-500 text-center leading-snug opacity-0 animate-fade-in delay-500">
          <p className="font-medium">Laptop Store Admin v2.0</p>
          <p>© 2024 All rights reserved</p>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(243, 244, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
