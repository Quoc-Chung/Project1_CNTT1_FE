"use client";
import React, { useState, FormEvent, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Breadcrumb from "../Common/Breadcrumb";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { createOrderAction, resetOrderStateAction } from "@/redux/Client/Order/Action";
import { removeProductFromCartAction } from "@/redux/Client/CartOrder/Action";
import { CreateOrderRequest, OrderItemRequest } from "@/types/Client/Order/order";
import { toast } from "react-toastify";
import addressDataRaw from "@/utils/address.json";
import { ProductService } from "@/services/ProductService";
import { CartOrderResponse } from "@/types/Client/CartOrder/cartorder";
import { VoucherResponse, VoucherService } from "@/services/VoucherService";
import { normalizeImageUrl } from "@/utils/helpers";

interface AddressData {
  name: string;
  districts: {
    name: string;
    wards: { name: string }[];
  }[];
}

const Checkout = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Get cart items and auth token from Redux
  const { cart } = useAppSelector((state) => state.cart);
  const { token, user } = useAppSelector((state) => state.auth);
  const { loading, success, error } = useAppSelector((state) => state.order);

  const [selectedCartItems, setSelectedCartItems] = useState<CartOrderResponse[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedItems = sessionStorage.getItem('selectedCartItems');
      if (storedItems) {
        try {
          const parsedItems = JSON.parse(storedItems) as CartOrderResponse[];
          setSelectedCartItems(parsedItems);
        } catch (error) {
          console.error('Error parsing selectedCartItems:', error);
          // Fallback to full cart if parsing fails
          setSelectedCartItems(cart);
        }
      } else {
        // Nếu không có selectedCartItems, sử dụng toàn bộ cart
        setSelectedCartItems(cart);
      }
    }
  }, []); 

  // Address data
  const provinces = (addressDataRaw as unknown) as AddressData[];

  // Address form state
  const [selectedProvinceIndex, setSelectedProvinceIndex] = useState<string>("");
  const [selectedDistrictIndex, setSelectedDistrictIndex] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [detailedAddress, setDetailedAddress] = useState<string>("");
  
  // Other form state
  const [notes, setNotes] = useState("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherResponse | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Product images state
  const [productImages, setProductImages] = useState<{ [key: string]: string }>({});
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: string]: boolean }>({});
  const fetchedImagesRef = useRef<Set<string>>(new Set());

  // Sử dụng selectedCartItems thay vì cart
  const itemsToUse = selectedCartItems.length > 0 ? selectedCartItems : cart;
  
  // Fetch product images for selected cart items - chỉ fetch khi items thay đổi (theo ID)
  const itemsToUseIds = useMemo(() => {
    return itemsToUse.map(item => item.id).sort().join(',');
  }, [itemsToUse]);

  useEffect(() => {
    const fetchAllProductImages = async () => {
      const imageMap: { [key: string]: string } = {};
      const loadingMap: { [key: string]: boolean } = {};
      const currentItemIds = new Set(itemsToUse.map(item => item.id));
      
      // Clean up fetchedImagesRef to only include current items
      fetchedImagesRef.current = new Set(
        Array.from(fetchedImagesRef.current).filter(id => currentItemIds.has(id))
      );
      
      // First, set images from item data if available
      itemsToUse.forEach((item) => {
        if (item.productImage || item.thumbnailUrl) {
          const normalized = normalizeImageUrl(item.productImage || item.thumbnailUrl);
          imageMap[item.id] = normalized.url;
          loadingMap[item.id] = false;
        } else if (productImages[item.id]) {
          // Use cached image
          imageMap[item.id] = productImages[item.id];
          loadingMap[item.id] = false;
        } else {
          loadingMap[item.id] = true;
        }
      });

      // Update loading states immediately for items with images
      setImageLoadingStates(loadingMap);
      
      // Then fetch missing images
      const itemsToFetch = itemsToUse.filter(item => !imageMap[item.id] && !fetchedImagesRef.current.has(item.id));
      
      if (itemsToFetch.length > 0) {
        const fetchPromises = itemsToFetch.map(async (item) => {
          try {
            fetchedImagesRef.current.add(item.id);
            const product = await ProductService.getProductById(item.productId);
            if (product.thumbnailUrl && product.thumbnailUrl.trim() !== '') {
              const normalized = normalizeImageUrl(product.thumbnailUrl);
              imageMap[item.id] = normalized.url;
            } else {
              imageMap[item.id] = "/images/products/product-1-1.png";
            }
          } catch (error) {
            console.error(`Error fetching product image for ${item.productId}:`, error);
            imageMap[item.id] = "/images/products/product-1-1.png";
          } finally {
            loadingMap[item.id] = false;
          }
        });
        
        await Promise.all(fetchPromises);
      }
      
      // Update state only if there are changes
      setProductImages(prev => {
        const updated = { ...prev, ...imageMap };
        return updated;
      });
      setImageLoadingStates(prev => ({ ...prev, ...loadingMap }));
    };
    
    if (itemsToUse.length > 0) {
      fetchAllProductImages();
    } else {
      // Reset states when no items
      setProductImages({});
      setImageLoadingStates({});
      fetchedImagesRef.current.clear();
    }
  }, [itemsToUseIds]); // Chỉ trigger khi danh sách IDs thay đổi

  // Get selected province and district
  const selectedProvince = selectedProvinceIndex !== "" 
    ? provinces[parseInt(selectedProvinceIndex)] 
    : null;

  const selectedDistrict = selectedProvince && selectedDistrictIndex !== ""
    ? selectedProvince.districts[parseInt(selectedDistrictIndex)]
    : null;

  const availableDistricts = selectedProvince ? selectedProvince.districts : [];
  const availableWards = selectedDistrict ? selectedDistrict.wards : [];

  // Build shipping address string
  const buildShippingAddress = (): string => {
    const parts: string[] = [];
    if (detailedAddress) parts.push(detailedAddress);
    if (selectedWard) parts.push(selectedWard);
    if (selectedDistrict) parts.push(selectedDistrict.name);
    if (selectedProvince) parts.push(selectedProvince.name);
    return parts.join(", ");
  };

  // Validate phone number: phải có 10 chữ số và bắt đầu bằng 0
  const validatePhoneNumber = (phone: string): boolean => {
    // Loại bỏ khoảng trắng và ký tự đặc biệt
    const cleanedPhone = phone.replace(/\s+/g, '').trim();
    // Kiểm tra: phải có đúng 10 chữ số và bắt đầu bằng 0
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(cleanedPhone);
  };

  // Handle province change
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvinceIndex(e.target.value);
    setSelectedDistrictIndex("");
    setSelectedWard("");
  };

  // Handle district change
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistrictIndex(e.target.value);
    setSelectedWard("");
  };

  // Handle voucher apply - nhận voucher object từ Coupon component
  const handleApplyVoucher = (voucher: VoucherResponse | null) => {
    setAppliedVoucher(voucher);
    if (voucher) {
      setVoucherCode(voucher.code);
      // Lưu voucher code vào localStorage để sử dụng sau khi đặt hàng
      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingVoucherCode', voucher.code);
      }
    } else {
      setVoucherCode("");
      // Xóa voucher code khỏi localStorage khi bỏ áp dụng
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pendingVoucherCode');
      }
    }
  };

  // Handle voucher code change
  const handleVoucherChange = (code: string) => {
    setVoucherCode(code);
    if (!code) {
      setAppliedVoucher(null);
    }
  };

  // Handle form submission - hiển thị dialog xác nhận
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate token first
    if (!token || token.trim() === "") {
      toast.error("Vui lòng đăng nhập để đặt hàng");
      router.push("/signin");
      return;
    }

    if (itemsToUse.length === 0) {
      toast.error("Không có sản phẩm nào được chọn");
      return;
    }

    // Validate address
    if (!selectedProvince || !selectedDistrict || !selectedWard) {
      toast.error("Vui lòng chọn đầy đủ địa chỉ");
      return;
    }

    if (!detailedAddress.trim()) {
      toast.error("Vui lòng nhập địa chỉ chi tiết");
      return;
    }

    // Validate phone number
    if (!phoneNumber.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast.error("Số điện thoại bạn không hợp lệ. Vui lòng nhập số điện thoại 10 chữ số bắt đầu bằng 0");
      return;
    }

    // Hiển thị dialog xác nhận thay vì submit ngay
    setShowConfirmDialog(true);
  };

  // Handle confirm order - gọi API đặt hàng
  const handleConfirmOrder = () => {
    const shippingAddress = buildShippingAddress();

    // Convert selected cart items to order items (chỉ các sản phẩm đã chọn)
    const orderItems: OrderItemRequest[] = itemsToUse.map((item) => ({
      productId: item.productId,
      skuId: item.skuId, // Use skuId from cart
      quantity: item.quantity,
    }));

    const orderRequest: CreateOrderRequest = {
      items: orderItems,
      shippingAddress: shippingAddress,
    };

    // Ensure token is valid before dispatching
    const cleanToken = token.trim();
    if (!cleanToken) {
      toast.error("Token không hợp lệ. Vui lòng đăng nhập lại.");
      router.push("/signin");
      return;
    }

    // Dispatch create order action with token
    dispatch(
      createOrderAction(
        orderRequest,
        cleanToken,
        async (res) => {
          // Lấy orderId từ response
          const orderId = res.data?.orderId;
          const orderValue = res.data?.totalAmount || subtotal;
          
          // Lấy userId từ JWT token hoặc user object
          let userId: number | null = null;
          
          // Thử lấy từ user object trước
          if (user && (user as any).userId) {
            userId = (user as any).userId;
          } else if (user && (user as any).id) {
            userId = (user as any).id;
          } else if (token) {
            // Decode JWT để lấy userId
            try {
              const parts = token.split('.');
              if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1]));
                userId = payload.userId || payload.user_id || payload.id || null;
              }
            } catch (e) {
              console.error('Error decoding JWT for userId:', e);
            }
          }
          
          // Kiểm tra và apply voucher nếu có
          if (orderId && userId && typeof window !== 'undefined') {
            const pendingVoucherCode = localStorage.getItem('pendingVoucherCode');
            
            if (pendingVoucherCode && appliedVoucher) {
              try {
                console.log('Applying voucher to order:', {
                  code: pendingVoucherCode,
                  orderId,
                  orderValue,
                  userId: userId
                });
                
                await VoucherService.applyVoucher({
                  code: pendingVoucherCode,
                  userId: userId,
                  orderId: orderId,
                  orderValue: orderValue
                });
                
                console.log('Voucher applied successfully');
                // Xóa voucher code khỏi localStorage sau khi apply thành công
                localStorage.removeItem('pendingVoucherCode');
               
              } catch (voucherError: any) {
                console.error('Error applying voucher:', voucherError);
                // Không block flow đặt hàng nếu apply voucher thất bại
                toast.warning(`Đặt hàng thành công nhưng không thể áp dụng voucher: ${voucherError.message || 'Lỗi không xác định'}`);
                // Vẫn xóa voucher code để tránh apply lại lần sau
                localStorage.removeItem('pendingVoucherCode');
              }
            } else {
              // Xóa voucher code nếu không có voucher
              localStorage.removeItem('pendingVoucherCode');
            }
          } else if (typeof window !== 'undefined') {
            // Xóa voucher code nếu không có orderId hoặc userId
            localStorage.removeItem('pendingVoucherCode');
          }
          
          toast.success("Đặt hàng thành công!");
          
          // Xóa các sản phẩm trong đơn hàng khỏi giỏ hàng
          if (cleanToken && itemsToUse.length > 0) {
            // Xóa từng sản phẩm khỏi giỏ hàng
            const removePromises = itemsToUse.map((item) => {
              return new Promise<void>((resolve) => {
                dispatch(
                  removeProductFromCartAction(
                    item.productId,
                    item.skuId,
                    cleanToken,
                    () => {
                      resolve();
                    },
                    (error) => {
                      // Log lỗi nhưng không block flow
                      console.error(`Lỗi khi xóa sản phẩm ${item.productId} khỏi giỏ hàng:`, error);
                      resolve(); // Vẫn resolve để không block các sản phẩm khác
                    }
                  )
                );
              });
            });
            
            // Đợi tất cả các sản phẩm được xóa (hoặc có lỗi)
            await Promise.all(removePromises);
          }
          
          // Reset order state
          dispatch(resetOrderStateAction());
          // Xóa selectedCartItems khỏi sessionStorage sau khi đặt hàng thành công
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('selectedCartItems');
          }
          // Đóng dialog
          setShowConfirmDialog(false);
          // Redirect to order history page
          router.push(`/my-account?tab=orders`);
        },
        (error) => {
          toast.error(`Đặt hàng thất bại: ${error}`);
          // Không đóng dialog khi có lỗi để người dùng có thể thử lại
        }
      )
    );
  };

  // Calculate totals (chỉ tính cho các sản phẩm đã chọn)
  const subtotal = itemsToUse.reduce((total, item) => total + (item.productPrice * item.quantity), 0);
  // Phí vận chuyển: mặc định miễn phí
  const shippingFee = 0;
  
  // Calculate discount based on applied voucher
  const calculateDiscount = (): number => {
    if (!appliedVoucher) return 0;
    
    // Kiểm tra minOrderValue
    if (appliedVoucher.minOrderValue > 0 && subtotal < appliedVoucher.minOrderValue) {
      return 0;
    }
    
    let discountAmount = 0;
    
    if (appliedVoucher.discountType === 'FIXED_AMOUNT') {
      // Giảm số tiền cố định
      discountAmount = appliedVoucher.discountValue;
    } else if (appliedVoucher.discountType === 'PERCENTAGE') {
      // Giảm theo phần trăm
      discountAmount = (subtotal * appliedVoucher.discountValue) / 100;
      
      // Áp dụng maxDiscountAmount nếu có
      if (appliedVoucher.maxDiscountAmount > 0 && discountAmount > appliedVoucher.maxDiscountAmount) {
        discountAmount = appliedVoucher.maxDiscountAmount;
      }
    }
    
    // Đảm bảo discount không vượt quá subtotal
    return Math.min(discountAmount, subtotal);
  };
  
  const discount = calculateDiscount();
  const total = subtotal + shippingFee - discount;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <>
      <style jsx global>{`
        select {
          font-size: 14px;
        }
        select option {
          padding: 8px 12px;
          background-color: white;
          color: #1F2937;
          font-size: 14px;
          transition: background-color 0.2s ease;
        }
        select option:hover {
          background-color: #F3F4F6 !important;
        }
        select option:checked,
        select option:focus {
          background-color: #E5E7EB;
          color: #1F2937;
        }
        select:focus option:checked {
          background-color: #E5E7EB;
        }
      `}</style>
      <Breadcrumb title={"Đặt hàng"} pages={["Đặt hàng"]} />
      <section className="overflow-hidden py-5 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11 items-start">
              {/* <!-- checkout left --> */}
              <div className="lg:max-w-[670px] w-full">
                {/* <!-- Address Selection --> */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
                  <h3 className="font-bold text-lg text-dark mb-6">
                    Địa chỉ giao hàng
                  </h3>

                  {/* Province Dropdown */}
                  <div className="mb-4">
                    <label className="block mb-2 text-dark font-bold text-sm">
                      Tỉnh/Thành phố <span className="text-red">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedProvinceIndex}
                        onChange={handleProvinceChange}
                        className="w-full rounded-md border border-gray-3 bg-white text-dark py-2 px-3 pr-9 appearance-none outline-none transition-all duration-200 hover:border-gray-4 hover:bg-gray-1 focus:border-gray-4 focus:bg-white focus:shadow-sm focus:ring-1 focus:ring-gray-300 cursor-pointer text-sm"
                        required
                      >
                        <option value="" className="text-dark-5 py-2">-- Chọn Tỉnh/Thành phố --</option>
                        {provinces.map((province, index) => (
                          <option key={index} value={index.toString()} className="text-dark py-2">
                            {province.name}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-4 pointer-events-none transition-transform duration-200">
                        <svg
                          className="fill-current"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2.41469 5.03569L8.0015 10.492L13.5844 4.98735C13.6809 4.89086 13.8199 4.89087 13.9147 4.98569C14.0092 5.08024 14.0095 5.21864 13.9155 5.31345L8.16469 10.9643C8.06838 11.0606 8.00039 11.0667 7.82064 10.9991L2.08526 5.36345C1.99127 5.26865 1.99154 5.13024 2.08609 5.03569C2.18092 4.94086 2.31986 4.94086 2.41469 5.03569Z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* District Dropdown */}
                  <div className="mb-4">
                    <label className="block mb-2 text-dark font-bold text-sm">
                      Quận/Huyện <span className="text-red">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedDistrictIndex}
                        onChange={handleDistrictChange}
                        disabled={!selectedProvince}
                        className="w-full rounded-md border border-gray-3 bg-white text-dark py-2 px-3 pr-9 appearance-none outline-none transition-all duration-200 hover:border-gray-4 hover:bg-gray-1 focus:border-gray-4 focus:bg-white focus:shadow-sm focus:ring-1 focus:ring-gray-300 cursor-pointer text-sm disabled:bg-gray-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-3 disabled:hover:shadow-none"
                        required
                      >
                        <option value="" className="text-dark-5 py-2">-- Chọn Quận/Huyện --</option>
                        {availableDistricts.map((district, index) => (
                          <option key={index} value={index.toString()} className="text-dark py-2">
                            {district.name}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-4 pointer-events-none transition-transform duration-200">
                        <svg
                          className="fill-current"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2.41469 5.03569L8.0015 10.492L13.5844 4.98735C13.6809 4.89086 13.8199 4.89087 13.9147 4.98569C14.0092 5.08024 14.0095 5.21864 13.9155 5.31345L8.16469 10.9643C8.06838 11.0606 8.00039 11.0667 7.82064 10.9991L2.08526 5.36345C1.99127 5.26865 1.99154 5.13024 2.08609 5.03569C2.18092 4.94086 2.31986 4.94086 2.41469 5.03569Z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* Ward Dropdown */}
                  <div className="mb-4">
                    <label className="block mb-2 text-dark font-bold text-sm">
                      Xã/Phường <span className="text-red">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        disabled={!selectedDistrict}
                        className="w-full rounded-md border border-gray-3 bg-white text-dark py-2 px-3 pr-9 appearance-none outline-none transition-all duration-200 hover:border-gray-4 hover:bg-gray-1 focus:border-gray-4 focus:bg-white focus:shadow-sm focus:ring-1 focus:ring-gray-300 cursor-pointer text-sm disabled:bg-gray-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-3 disabled:hover:shadow-none"
                        required
                      >
                        <option value="" className="text-dark-5 py-2">-- Chọn Xã/Phường --</option>
                        {availableWards.map((ward, index) => (
                          <option key={index} value={ward.name} className="text-dark py-2">
                            {ward.name}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-4 pointer-events-none transition-transform duration-200">
                        <svg
                          className="fill-current"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2.41469 5.03569L8.0015 10.492L13.5844 4.98735C13.6809 4.89086 13.8199 4.89087 13.9147 4.98569C14.0092 5.08024 14.0095 5.21864 13.9155 5.31345L8.16469 10.9643C8.06838 11.0606 8.00039 11.0667 7.82064 10.9991L2.08526 5.36345C1.99127 5.26865 1.99154 5.13024 2.08609 5.03569C2.18092 4.94086 2.31986 4.94086 2.41469 5.03569Z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* Detailed Address Input */}
                  <div className="mb-4">
                    <label className="block mb-2 text-dark font-bold text-sm">
                      Địa chỉ chi tiết <span className="text-red">*</span>
                    </label>
                    <input
                      type="text"
                      value={detailedAddress}
                      onChange={(e) => setDetailedAddress(e.target.value)}
                      placeholder="Số nhà, tên đường, ..."
                      className="w-full rounded-md border border-gray-3 bg-white placeholder:text-dark-5 placeholder:text-sm text-dark py-2 px-3 text-sm outline-none duration-200 hover:border-gray-4 hover:bg-gray-1 focus:border-gray-4 focus:bg-white focus:shadow-sm focus:ring-1 focus:ring-gray-300"
                      required
                    />
                  </div>

                  {/* Phone Number Input */}
                  <div className="mb-4">
                    <label className="block mb-2 text-dark font-bold text-sm">
                      Số điện thoại <span className="text-red">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        // Chỉ cho phép nhập số
                        const value = e.target.value.replace(/\D/g, '');
                        // Giới hạn tối đa 10 chữ số
                        const limitedValue = value.slice(0, 10);
                        setPhoneNumber(limitedValue);
                      }}
                      placeholder="Nhập số điện thoại (VD: 0912345678)"
                      maxLength={10}
                      className="w-full rounded-md border border-gray-3 bg-white placeholder:text-dark-5 placeholder:text-sm text-dark py-2 px-3 text-sm outline-none duration-200 hover:border-gray-4 hover:bg-gray-1 focus:border-gray-4 focus:bg-white focus:shadow-sm focus:ring-1 focus:ring-gray-300"
                      required
                    />
                    {phoneNumber && !validatePhoneNumber(phoneNumber) && (
                      <p className="text-red text-xs mt-1">
                        Số điện thoại phải có 10 chữ số và bắt đầu bằng 0
                      </p>
                    )}
                  </div>
                </div>

                {/* <!-- others note box --> */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-6">
                  <div>
                    <label htmlFor="notes" className="block mb-2 text-dark font-bold text-sm">
                      Ghi chú đơn hàng (không bắt buộc)
                    </label>
                    <textarea
                      name="notes"
                      id="notes"
                      rows={5}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ghi chú về đơn hàng của bạn, ví dụ: yêu cầu đặc biệt khi giao hàng."
                      className="rounded-md border border-gray-3 bg-white placeholder:text-dark-5 placeholder:text-sm w-full p-3 text-sm outline-none duration-200 hover:border-gray-4 hover:bg-gray-1 focus:border-gray-4 focus:bg-white focus:shadow-sm focus:ring-1 focus:ring-gray-300"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* // <!-- checkout right --> */}
              <div className="max-w-[455px] w-full">
                {/* <!-- order list box --> */}
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">
                      Đơn hàng của bạn
                    </h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    {/* <!-- title --> */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <h4 className="font-medium text-dark">Sản phẩm</h4>
                      </div>
                      <div>
                        <h4 className="font-medium text-dark text-right">
                          Thành tiền
                        </h4>
                      </div>
                    </div>

                    {/* <!-- product items from cart --> */}
                    {itemsToUse.length === 0 ? (
                      <div className="py-5 text-center text-dark-5">
                        Không có sản phẩm nào được chọn
                      </div>
                    ) : (
                      itemsToUse.map((item) => {
                        // Get image from state or fallback
                        const imageUrl = productImages[item.id] || 
                                        item.productImage || 
                                        item.thumbnailUrl || 
                                        "/images/products/product-1-1.png";
                        const normalized = normalizeImageUrl(imageUrl);
                        const isLoading = imageLoadingStates[item.id] === true;
                        
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-5 border-b border-gray-3"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {/* Product Image */}
                              <div className="flex items-center justify-center rounded-[5px] bg-gray-2 w-16 h-16 flex-shrink-0 relative">
                                {isLoading && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-[5px]">
                                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                  </div>
                                )}
                                <Image
                                  src={normalized.url}
                                  alt={item.productName || "product"}
                                  width={64}
                                  height={64}
                                  className={`object-contain rounded-[5px] transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                                  style={{ width: "auto", height: "auto" }}
                                  unoptimized={normalized.isExternal}
                                  onLoad={() => {
                                    setImageLoadingStates(prev => ({ ...prev, [item.id]: false }));
                                  }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    if (target.src !== "/images/products/product-1-1.png") {
                                      setImageLoadingStates(prev => ({ ...prev, [item.id]: false }));
                                      setProductImages(prev => ({ ...prev, [item.id]: "/images/products/product-1-1.png" }));
                                      target.src = "/images/products/product-1-1.png";
                                    }
                                  }}
                                />
                              </div>
                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-dark font-medium truncate">
                                  {item.productName}
                                </p>
                                <p className="text-sm text-dark-5">
                                  Số lượng: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-dark text-right font-medium whitespace-nowrap">
                                {formatCurrency(item.productPrice * item.quantity)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* <!-- discount --> */}
                    {appliedVoucher && discount > 0 && (
                      <div className="flex items-center justify-between py-5 border-b border-gray-3">
                        <div>
                          <p className="text-dark">Giảm giá ({appliedVoucher.code})</p>
                          <p className="text-xs text-dark-5">{appliedVoucher.name}</p>
                        </div>
                        <div>
                          <p className="text-green-600 text-right">-{formatCurrency(discount)}</p>
                        </div>
                      </div>
                    )}

                    {/* <!-- shipping fee --> */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <p className="text-dark">Phí vận chuyển</p>
                        <p className="text-xs text-green-600">Miễn phí</p>
                      </div>
                      <div>
                        <p className="text-right text-green-600">Miễn phí</p>
                      </div>
                    </div>

                    {/* <!-- total --> */}
                    <div className="flex items-center justify-between pt-5">
                      <div>
                        <p className="font-medium text-lg text-dark">Tổng cộng</p>
                      </div>
                      <div>
                        <p className="font-medium text-lg text-dark text-right">
                          {formatCurrency(total)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* <!-- coupon box --> */}
                <Coupon 
                  value={voucherCode}
                  onChange={handleVoucherChange}
                  onApply={handleApplyVoucher}
                  subtotal={subtotal}
                />

                {/* <!-- payment box --> */}
                <PaymentMethod />

                {/* <!-- checkout button --> */}
                <button
                  type="submit"
                  disabled={loading || itemsToUse.length === 0}
                  className="w-full flex justify-center font-medium text-white bg-blue py-1.5 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:bg-gray-4 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang xử lý..." : `Đặt hàng (${itemsToUse.length} sản phẩm)`}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm ease-linear duration-300"
          onClick={() => !loading && setShowConfirmDialog(false)}
        >
          <div
            className="bg-white shadow-3 rounded-[10px] max-w-lg w-full p-6 sm:p-8.5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl sm:text-2xl font-medium text-dark mb-4 text-center">
              Xác nhận đặt hàng
            </h3>
            
            {/* Order Summary */}
            <div className="mb-6 space-y-3">
              <div className="bg-gray-1 rounded-lg p-4">
                <h4 className="font-medium text-dark mb-3">Thông tin đơn hàng:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dark-4">Số sản phẩm:</span>
                    <span className="text-dark font-medium">{itemsToUse.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-4">Tạm tính:</span>
                    <span className="text-dark font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  {appliedVoucher && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá ({appliedVoucher.code}):</span>
                      <span className="font-medium">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-dark-4">Phí vận chuyển:</span>
                    <span className="font-medium text-green-600">Miễn phí</span>
                  </div>
                  <div className="border-t border-gray-3 pt-2 mt-2 flex justify-between">
                    <span className="text-dark font-medium">Tổng cộng:</span>
                    <span className="text-red-600 font-bold text-lg">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-1 rounded-lg p-4">
                <h4 className="font-medium text-dark mb-2">Địa chỉ giao hàng:</h4>
                <p className="text-sm text-dark-4">{buildShippingAddress()}</p>
              </div>
              
              {phoneNumber && (
                <div className="bg-gray-1 rounded-lg p-4">
                  <h4 className="font-medium text-dark mb-2">Số điện thoại:</h4>
                  <p className="text-sm text-dark-4">{phoneNumber}</p>
                </div>
              )}
            </div>

            <p className="text-dark-4 mb-6 text-center">
              Bạn có chắc chắn muốn đặt hàng không?
            </p>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleConfirmOrder}
                disabled={loading}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors duration-200 ease-out disabled:bg-gray-4 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  'Xác nhận'
                )}
              </button>
              <button
                onClick={() => setShowConfirmDialog(false)}
                disabled={loading}
                className="px-6 py-2.5 bg-gray-300 hover:bg-gray-400 text-dark font-medium rounded-md transition-colors duration-200 ease-out disabled:bg-gray-4 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Checkout;
