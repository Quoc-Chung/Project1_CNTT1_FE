"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { menuData } from "./menuData";
import Dropdown from "./Dropdown";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch, persistor } from "../../../redux/store";
import { logoutAction } from "../../../redux/Client/Auth/Action";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";


const Header = () => {
  const router = useRouter();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { openCartModal } = useCartModalContext();


  const { user, token, isLogin } = useSelector((state: RootState) => state.auth);
  const { cart: cartItems } = useSelector((state: RootState) => state.cart);
  
  // Tính tổng tiền từ cart items - sử dụng useMemo để tối ưu performance
  const totalPrice = React.useMemo(() => {
    return cartItems?.reduce((total, item) => {
      return total + (item.productPrice * item.quantity);
    }, 0) || 0;
  }, [cartItems]);

  useEffect(() => {
    const checkHydration = () => {
      if (typeof window !== 'undefined') {
        const hasPersistData = localStorage.getItem('persist:auth') || localStorage.getItem('persist:cart');

        if (hasPersistData || token || user) {
          setIsHydrated(true);
        } else {
          setTimeout(() => setIsHydrated(true), 200);
        }
      } else {
        setIsHydrated(true);
      }
    };
    
    // Đợi một chút để đảm bảo PersistGate đã rehydrate
    const timer = setTimeout(checkHydration, 150);
    
    return () => clearTimeout(timer);
  }, [token, user]);

  const getFilteredMenuData = () => {
    return menuData.filter(item => {
      if (item.title === "Cart" || item.title === "Q&A") {
        return isHydrated && isLogin;
      }

      return true;
    });
  };

  const handleAccountClick = (e) => {
    if (isHydrated && !isLogin) {
      e.preventDefault();
      router.push("/signin")
    }
  };

  const dispatch = useAppDispatch();

  const handleLogout = (e) => {
    e.preventDefault();
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
            // Set flag để ProtectedRoute biết đây là logout, không hiển thị toast "chưa đăng nhập"
            sessionStorage.setItem('justLoggedOut', 'true');
            
            localStorage.removeItem('persist:auth');
            localStorage.removeItem('persist:root');
            // Xóa thêm các key có thể có
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('persist:')) {
                localStorage.removeItem(key);
              }
            });
          }
          
          toast.success("🎉Logout thành công", {
            autoClose: 1500,
            position: "top-right"
          });
          router.push("/");
        },
        (err) => {
          toast.error(`Logout thất bại: ${err}`, {
            autoClose: 2000,
            position: "top-right"
          });
        }
      )
    );
  }
  function getDisplayName(user: any) {
  if (!user) return "account";
  
  if (user.account?.endsWith("@gmail.com")) {
    return user.fullName && user.fullName.trim() !== "" 
      ? user.fullName 
      : user.account;
  }
  return user.account;
}


  const handleOpenCartModal = () => {
    // Chuyển đến trang giỏ hàng thay vì mở modal
    router.push("/cart");
  };

  const handleStickyMenu = useCallback(() => {
    if (isHydrated && window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  }, [isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      window.addEventListener("scroll", handleStickyMenu);
      return () => window.removeEventListener("scroll", handleStickyMenu);
    }
  }, [isHydrated, handleStickyMenu]);


  return (
    <header
      className={`fixed left-0 top-0 w-full z-9999 bg-white transition-shadow duration-100 ${stickyMenu && "shadow"
        }`}
    >
      <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
        <div
          className={`flex flex-col lg:flex-row gap-5 items-end lg:items-center xl:justify-between ${stickyMenu ? "py-4" : "py-6"
            }`}
        >
          <div className="xl:w-auto flex-col sm:flex-row w-full flex sm:justify-between sm:items-center gap-5 sm:gap-10">
            <Link className="flex-shrink-0" href="/" prefetch={true}>
              <div className="flex relative">
                <Image
                  src="/images/logo/image.png"
                  alt="Logo"
                  width={50}
                  height={36}
                  style={{ width: "auto", height: "auto" }}
                />
                <p className="pl-2 pt-1 text-4xl font-bold text-blue"> ProShop </p>
              </div>

            </Link>
          </div>

          <div className="flex w-full lg:w-auto items-center gap-7.5">
            <div className="hidden xl:flex items-center gap-3.5">
            </div>

            <span className="hidden xl:block w-px h-7.5 bg-gray-4"></span>

            <div className="flex w-full lg:w-auto justify-between items-center gap-5">
              <div className="flex items-center gap-5">
                <Link href={isHydrated ? (isLogin ? "/my-account" : "/signin") : "/signin"} prefetch={true}
                  className="flex items-center gap-2.5 transition-none"
                  onClick={handleAccountClick}
                  suppressHydrationWarning
                >
                  <Image
                    src={isHydrated ? (user?.avatarUrl ? user.avatarUrl : "/images/avatars/nologin.png") : "/images/avatars/nologin.png"}
                    alt=""
                    width={30}
                    height={30}
                    className="rounded-full"
                  />


                  <div>
                    <span className="block text-[12px] text-red-700 uppercase font-bold">
                     {isHydrated ? (isLogin ? getDisplayName(user) : "account") : "account"}
                    </span>
                    <p className="font-medium text-custom-sm text-dark">
                      {isHydrated ? (user && isLogin ?
                        <button onClick={handleLogout}> Logout </button> : <button  >Login</button>) : <button>Login</button>}
                    </p>
                  </div>
                </Link>

                {isHydrated && isLogin && (
                  <button
                    onClick={handleOpenCartModal}
                    className="flex items-center gap-2.5"
                  >
                  <span className="inline-block relative">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15.5433 9.5172C15.829 9.21725 15.8174 8.74252 15.5174 8.45686C15.2175 8.17119 14.7428 8.18277 14.4571 8.48272L12.1431 10.9125L11.5433 10.2827C11.2576 9.98277 10.7829 9.97119 10.483 10.2569C10.183 10.5425 10.1714 11.0173 10.4571 11.3172L11.6 12.5172C11.7415 12.6658 11.9378 12.75 12.1431 12.75C12.3483 12.75 12.5446 12.6658 12.6862 12.5172L15.5433 9.5172Z"
                        fill="#3C50E0"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M1.29266 2.7512C1.43005 2.36044 1.8582 2.15503 2.24896 2.29242L2.55036 2.39838C3.16689 2.61511 3.69052 2.79919 4.10261 3.00139C4.54324 3.21759 4.92109 3.48393 5.20527 3.89979C5.48725 4.31243 5.60367 4.76515 5.6574 5.26153C5.66124 5.29706 5.6648 5.33321 5.66809 5.36996L17.1203 5.36996C17.9389 5.36995 18.7735 5.36993 19.4606 5.44674C19.8103 5.48584 20.1569 5.54814 20.4634 5.65583C20.7639 5.76141 21.0942 5.93432 21.3292 6.23974C21.711 6.73613 21.7777 7.31414 21.7416 7.90034C21.7071 8.45845 21.5686 9.15234 21.4039 9.97723L21.3935 10.0295L21.3925 10.0341L20.8836 12.5033C20.7339 13.2298 20.6079 13.841 20.4455 14.3231C20.2731 14.8346 20.0341 15.2842 19.6076 15.6318C19.1811 15.9793 18.6925 16.1226 18.1568 16.1882C17.6518 16.25 17.0278 16.25 16.2862 16.25L10.8804 16.25C9.53464 16.25 8.44479 16.25 7.58656 16.1283C6.69032 16.0012 5.93752 15.7285 5.34366 15.1022C4.79742 14.526 4.50529 13.9144 4.35897 13.0601C4.22191 12.2598 4.20828 11.2125 4.20828 9.75996V7.03832C4.20828 6.29837 4.20726 5.80316 4.16611 5.42295C4.12678 5.0596 4.05708 4.87818 3.96682 4.74609C3.87876 4.61723 3.74509 4.4968 3.44186 4.34802C3.11902 4.18961 2.68026 4.03406 2.01266 3.79934L1.75145 3.7075C1.36068 3.57012 1.15527 3.14197 1.29266 2.7512ZM5.70828 6.86996L5.70828 9.75996C5.70828 11.249 5.72628 12.1578 5.83744 12.8068C5.93933 13.4018 6.11202 13.7324 6.43219 14.0701C6.70473 14.3576 7.08235 14.5418 7.79716 14.6432C8.53783 14.7482 9.5209 14.75 10.9377 14.75H16.2406C17.0399 14.75 17.5714 14.7487 17.9746 14.6993C18.3573 14.6525 18.5348 14.571 18.66 14.469C18.7853 14.3669 18.9009 14.2095 19.024 13.8441C19.1537 13.4592 19.2623 12.9389 19.4237 12.156L19.9225 9.73591L19.9229 9.73369C20.1005 8.84376 20.217 8.2515 20.2444 7.80793C20.2704 7.38648 20.2043 7.23927 20.1429 7.15786C20.1367 7.15259 20.0931 7.11565 19.9661 7.07101C19.8107 7.01639 19.5895 6.97049 19.2939 6.93745C18.6991 6.87096 17.9454 6.86996 17.089 6.86996H5.70828Z"
                        fill="#3C50E0"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5.2502 19.5C5.2502 20.7426 6.25756 21.75 7.5002 21.75C8.74285 21.75 9.7502 20.7426 9.7502 19.5C9.7502 18.2573 8.74285 17.25 7.5002 17.25C6.25756 17.25 5.2502 18.2573 5.2502 19.5ZM7.5002 20.25C7.08599 20.25 6.7502 19.9142 6.7502 19.5C6.7502 19.0857 7.08599 18.75 7.5002 18.75C7.91442 18.75 8.2502 19.0857 8.2502 19.5C8.2502 19.9142 7.91442 20.25 7.5002 20.25Z"
                        fill="#3C50E0"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M14.25 19.5001C14.25 20.7427 15.2574 21.7501 16.5 21.7501C17.7426 21.7501 18.75 20.7427 18.75 19.5001C18.75 18.2574 17.7426 17.2501 16.5 17.2501C15.2574 17.2501 14.25 18.2574 14.25 19.5001ZM16.5 20.2501C16.0858 20.2501 15.75 19.9143 15.75 19.5001C15.75 19.0859 16.0858 18.7501 16.5 18.7501C16.9142 18.7501 17.25 19.0859 17.25 19.5001C17.25 19.9143 16.9142 20.2501 16.5 20.2501Z"
                        fill="#3C50E0"
                      />
                    </svg>

                    <span className="flex items-center justify-center font-medium text-2xs absolute -right-2 -top-2.5 bg-blue w-4.5 h-4.5 rounded-full text-white">
                      {cartItems?.length || 0}
                    </span>
                  </span>

                  <div>
                    <span className="block text-2xs text-dark-4 uppercase">
                      cart
                    </span>
                    <p className="font-medium text-custom-sm text-dark">
                      {totalPrice.toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                </button>
                )}
              </div>

              {/* <!-- Hamburger Toggle BTN --> */}
              <button
                id="Toggle"
                aria-label="Toggler"
                className="xl:hidden block"
                onClick={() => setNavigationOpen(!navigationOpen)}
              >
                <span className="block relative cursor-pointer w-5.5 h-5.5">
                  <span className="du-block absolute right-0 w-full h-full">
                    <span
                      className={`block relative top-0 left-0 bg-dark rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 ${!navigationOpen && "!w-full delay-300"
                        }`}
                    ></span>
                    <span
                      className={`block relative top-0 left-0 bg-dark rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-150 ${!navigationOpen && "!w-full delay-400"
                        }`}
                    ></span>
                    <span
                      className={`block relative top-0 left-0 bg-dark rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-200 ${!navigationOpen && "!w-full delay-500"
                        }`}
                    ></span>
                  </span>

                  <span className="block absolute right-0 w-full h-full rotate-45">
                    <span
                      className={`block bg-dark rounded-sm ease-in-out duration-200 delay-300 absolute left-2.5 top-0 w-0.5 h-full ${!navigationOpen && "!h-0"
                        }`}
                    ></span>
                    <span
                      className={`block bg-dark rounded-sm ease-in-out duration-200 delay-400 absolute left-0 top-2.5 w-full h-0.5 ${!navigationOpen && "!h-0 delay-200"
                        }`}
                    ></span>
                  </span>
                </span>
              </button>
              {/* //   <!-- Hamburger Toggle BTN --> */}
            </div>
          </div>
        </div>
        {/* <!-- header top end --> */}
      </div>

      <div className="border-t border-gray-3">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
          <div className="flex items-center justify-between">
            {/* <!--=== Main Nav Start ===--> */}
            <div
              className={`w-[288px] absolute right-4 top-full xl:static xl:w-auto h-0 xl:h-auto invisible xl:visible xl:flex items-center justify-between ${navigationOpen &&
                `!visible bg-white shadow-lg border border-gray-3 !h-auto max-h-[400px] overflow-y-scroll rounded-md p-5`
                }`}
            >
              {/* <!-- Main Nav Start --> */}
              <nav>
                <ul className="flex xl:items-center flex-col xl:flex-row gap-5 xl:gap-6">
                  {getFilteredMenuData().map((menuItem, i) =>
                    menuItem.submenu ? (
                      <Dropdown
                        key={i}
                        menuItem={menuItem}
                        stickyMenu={stickyMenu}
                      />
                    ) : (
                      <li
                        key={i}
                        className="group relative"
                      >
                        <Link
                          href={menuItem.path}
                          prefetch={true}
                          className={`text-custom-sm font-medium text-dark flex transition-none ${stickyMenu ? "xl:py-4" : "xl:py-6"
                            }`}
                        >
                          {menuItem.title}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </nav>
              {/* //   <!-- Main Nav End --> */}
            </div>



            <div className="hidden xl:block">
              <ul className="flex items-center gap-5.5">
                
              </ul>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
