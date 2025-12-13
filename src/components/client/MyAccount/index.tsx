"use client";
import React, { useEffect, useState } from "react";
import MyAccount from "./MyAccount";
import OrderAccount from "./OrderAccount";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import PasswordReset from "./PasswordReset";
import { RootState, useAppDispatch, persistor } from "../../../redux/store";
import { useSelector } from "react-redux";
import { logoutAction } from "../../../redux/Client/Auth/Action";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const UserDashboard = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("information");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [avatar, setAvatar] = useState("/avatar.jpg");

  const { user, token } = useSelector((state: RootState) => state.auth);
  
  useEffect(()=>{
     if(user && user.avatarUrl && user.avatarUrl.trim() !== ""){
       setAvatar(user.avatarUrl)
     } else {
       setAvatar("/avatar.jpg") 
     }
    
  },[user])
  
  const handleLogout = () => {
    dispatch(
      logoutAction(
        { token },
        async () => {
          // Purge redux-persist để xóa sạch dữ liệu đã persist
          try {
            await persistor.purge();
          } catch (error) {
            console.error('Error purging persistor:', error);
          }
          
          // Đảm bảo xóa hết localStorage liên quan đến auth
          if (typeof window !== 'undefined') {
            localStorage.removeItem('persist:auth');
            localStorage.removeItem('persist:root');
            // Xóa thêm các key có thể có
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('persist:')) {
                localStorage.removeItem(key);
              }
            });
          }
          
          toast.success("🎉Logout thành công");
          setTimeout(() => {
            router.push("/");
          }, 2000);
        },
        (err) => {
          toast.error(`Logout thất bại: ${err}`, {
            autoClose: 3000,
            position: "top-right"
          });
        }
      )
    );
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {

    }
  }
  return (
    <>
      <Breadcrumb title={"Thông tin người dùng"} pages={["Thông tin người dùng"]} />
      <MyAccount
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onAvatarChange={handleAvatarChange}
        avatar={avatar}
      />

      <section className="py-16 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Sidebar */}
            <div className="col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden h-[410px]">
              {/* Header với avatar */}
              <div className="relative p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">

                <span className="absolute bottom-9 left-22 w-4 h-4 bg-green-500 border-2 border-white rounded-full z-10"></span>
                <div className=" flex items-center gap-4">
                  {/* Avatar đẹp hơn */}
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md z-0">
                    <Image
                      src={avatar || "/avatar.jpg"}
                      alt="User avatar"
                      fill
                      className="object-cover z-0" 
                    />
                    {/* chấm online */}
                 
                  </div>


                  <div>
                    <p className="text-xl font-bold tracking-wide">{user?.fullName}</p>
                    <p className="text-sm text-blue-100">Thành viên Mới</p>
                  </div>
                </div>
              </div>

              {/* Sidebar menu */}
              <div className="p-6 space-y-3">
                <button
                  onClick={() => setActiveTab("information")}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-left transition-all duration-200 font-medium ${activeTab === "information"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 
        1.79-4 4 1.79 4 4 4zm0 2c-2.67 
        0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  Thông tin tài khoản
                </button>

                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-left transition-all duration-200 font-medium ${activeTab === "orders"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 18c-1.1 0-1.99.9-1.99 
        2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM17 
        18c-1.1 0-1.99.9-1.99 2s.89 2 
        1.99 2 2-.9 2-2-.9-2-2-2zM7 
        13h10l2-8H5l2 8zM4 2v2h2l3.6 
        7.59-1.35 2.45c-.16.28-.25.61-.25.96 
        0 1.1.9 2 2 2h12v-2H7.42c-.13 
        0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 
        0 1.41-.41 1.75-1.03l3.86-7.01L19 
        4H5.21l-.94-2H4z" />
                  </svg>
                  Lịch sử đơn hàng
                </button>

                <button
                  onClick={() => setActiveTab("change-password")}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-left transition-all duration-200 font-medium ${activeTab === "change-password"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                >
                  <div className="relative w-[24px] h-[24px] text-black">
                    <Image
                      src="/reset-password.png"
                      alt="Reset password"
                      fill
                      className="object-contain"
                    />
                  </div>

                  Đổi mật khẩu
                </button>


                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 hover:text-red-700 font-medium transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 7l-1.41 1.41L18.17 
        11H8v2h10.17l-2.58 2.58L17 
        17l5-5-5-5zM4 5h8V3H4c-1.1 
        0-2 .9-2 2v14c0 1.1.9 2 2 
        2h8v-2H4V5z" />
                  </svg>
                  Đăng xuất
                </button>
              </div>
            </div>


            {/* Main content */}
            <div className="col-span-1 lg:col-span-3">
              {activeTab === "information" && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-8">Thông tin tài khoản</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">

                    <div className="space-y-4">
                      <div className="p-4 border rounded-xl bg-gray-50 shadow-sm">
                        <p className="text-[15px] font-medium text-gray-500 tracking-wide">Họ và tên</p>
                        <p className="text-base font-semibold text-gray-900">{user?.fullName}</p>
                      </div>
                      <div className="p-4 border rounded-xl bg-gray-50 shadow-sm">
                        <p className="text-[15px] font-medium text-gray-500 tracking-wide">Email</p>
                        <p className="text-base font-semibold text-gray-900">{user?.email}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 border rounded-xl bg-gray-50 shadow-sm">
                        <p className="text-[15px] font-medium text-gray-500 tracking-wide">Số điện thoại</p>
                        <p className="text-base font-semibold text-gray-900">{user?.phone}</p>
                      </div>
                      <div className="p-4 border rounded-xl bg-gray-50 shadow-sm">
                        <p className="text-[15px] font-medium text-gray-500 tracking-wide">Địa chỉ</p>
                        <p className="text-base font-semibold text-gray-900">
                          {user?.address}
                        </p>
                      </div>
                    </div>


                  </div>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="mt-6 px-6 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 font-medium"
                  >
                    Chỉnh sửa thông tin
                  </button>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <OrderAccount />
                </div>
              )}

               {activeTab === "change-password" && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <PasswordReset />
                </div>
              )}
            </div>




          </div>
        </div>
      </section>
    </>
  );
};

export default UserDashboard;