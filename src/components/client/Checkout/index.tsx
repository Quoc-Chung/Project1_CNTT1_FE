"use client";
import React, { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Breadcrumb from "../Common/Breadcrumb";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { createOrderAction, resetOrderStateAction } from "@/redux/Client/Order/Action";
import { CreateOrderRequest, OrderItemRequest } from "@/types/Client/Order/order";
import { toast } from "react-toastify";
import addressDataRaw from "@/utils/address.json";
import { ProductService } from "@/services/ProductService";
import { CartOrderResponse } from "@/types/Client/CartOrder/cartorder";

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
  const { token } = useAppSelector((state) => state.auth);
  const { loading, success, error } = useAppSelector((state) => state.order);

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
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  
  // Product images state
  const [productImages, setProductImages] = useState<{ [key: string]: string }>({});
  
  // Fetch product images for all cart items
  useEffect(() => {
    const fetchAllProductImages = async () => {
      const imageMap: { [key: string]: string } = {};
      
      await Promise.all(
        cart.map(async (item) => {
          // Use existing image if available
          if (item.productImage || item.thumbnailUrl) {
            imageMap[item.id] = item.productImage || item.thumbnailUrl || "/images/products/product-1-1.png";
            return;
          }
          
          // Fetch from API
          try {
            const product = await ProductService.getProductById(item.productId);
            if (product.thumbnailUrl) {
              imageMap[item.id] = product.thumbnailUrl;
            } else {
              imageMap[item.id] = "/images/products/product-1-1.png";
            }
          } catch (error) {
            console.error(`Error fetching product image for ${item.productId}:`, error);
            imageMap[item.id] = "/images/products/product-1-1.png";
          }
        })
      );
      
      setProductImages(imageMap);
    };
    
    if (cart.length > 0) {
      fetchAllProductImages();
    }
  }, [cart]);

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

  // Handle voucher apply
  const handleApplyVoucher = (code: string) => {
    if (code.trim()) {
      // Simple validation (replace with actual API call)
      const codeUpper = code.trim().toUpperCase();
      const validCodes = ["SALE10", "SALE20", "FREESHIP", "NEWUSER"];
      
      if (validCodes.includes(codeUpper)) {
        setAppliedVoucher(codeUpper);
        setVoucherCode(codeUpper);
        toast.success("Mã giảm giá đã được áp dụng!");
      } else {
        toast.error("Mã giảm giá không hợp lệ");
      }
    }
  };

  // Handle voucher change
  const handleVoucherChange = (code: string) => {
    setVoucherCode(code);
    if (!code) {
      setAppliedVoucher(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate token first
    if (!token || token.trim() === "") {
      toast.error("Vui lòng đăng nhập để đặt hàng");
      router.push("/signin");
      return;
    }

    if (cart.length === 0) {
      toast.error("Giỏ hàng trống");
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

    const shippingAddress = buildShippingAddress();

    // Convert cart items to order items
    const orderItems: OrderItemRequest[] = cart.map((item) => ({
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
        (res) => {
          toast.success("Đặt hàng thành công!");
          // Reset order state
          dispatch(resetOrderStateAction());
          // Redirect to order success page or order details
          router.push(`/my-account`);
        },
        (error) => {
          toast.error(`Đặt hàng thất bại: ${error}`);
        }
      )
    );
  };

  // Calculate totals
  const subtotal = cart.reduce((total, item) => total + (item.productPrice * item.quantity), 0);
  const shippingFee = 375000; // Fixed shipping fee
  const discount = appliedVoucher ? subtotal * 0.1 : 0; // 10% discount if voucher applied
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
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Nhập số điện thoại"
                      className="w-full rounded-md border border-gray-3 bg-white placeholder:text-dark-5 placeholder:text-sm text-dark py-2 px-3 text-sm outline-none duration-200 hover:border-gray-4 hover:bg-gray-1 focus:border-gray-4 focus:bg-white focus:shadow-sm focus:ring-1 focus:ring-gray-300"
                      required
                    />
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
                    {cart.length === 0 ? (
                      <div className="py-5 text-center text-dark-5">
                        Giỏ hàng trống
                      </div>
                    ) : (
                      cart.map((item) => {
                        // Get image from state or fallback
                        const productImage = productImages[item.id] || 
                                            item.productImage || 
                                            item.thumbnailUrl || 
                                            "/images/products/product-1-1.png";
                        
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-5 border-b border-gray-3"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {/* Product Image */}
                              <div className="flex items-center justify-center rounded-[5px] bg-gray-2 w-16 h-16 flex-shrink-0">
                                <Image
                                  src={productImage}
                                  alt={item.productName || "product"}
                                  width={64}
                                  height={64}
                                  className="object-contain rounded-[5px]"
                                  style={{ width: "auto", height: "auto" }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/images/products/product-1-1.png";
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
                          <p className="text-dark">Giảm giá ({appliedVoucher})</p>
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
                      </div>
                      <div>
                        <p className="text-dark text-right">{formatCurrency(shippingFee)}</p>
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
                />

                {/* <!-- payment box --> */}
                <PaymentMethod />

                {/* <!-- checkout button --> */}
                <button
                  type="submit"
                  disabled={loading || cart.length === 0}
                  className="w-full flex justify-center font-medium text-white bg-blue py-1.5 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:bg-gray-4 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang xử lý..." : "Đặt hàng"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;
