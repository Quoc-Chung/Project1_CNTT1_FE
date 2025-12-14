"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { createOrderAction, resetOrderStateAction } from "@/redux/Client/Order/Action";
import { CreateOrderRequest, OrderItemRequest } from "@/types/Client/Order/order";
import { CartOrderResponse } from "@/types/Client/CartOrder/cartorder";
import { toast } from "react-toastify";
import { BASE_API_CART_URL } from "@/utils/configAPI";
import addressDataRaw from "@/utils/address.json";
import { useRouter } from "next/navigation";

interface AddressData {
  name: string;
  districts: {
    name: string;
    wards: { name: string }[];
  }[];
}

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckoutDialog: React.FC<CheckoutDialogProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { cart } = useAppSelector((state) => state.cart);
  const { token } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.order);

  // Lấy selectedCartItems từ sessionStorage (các sản phẩm đã được chọn từ giỏ hàng)
  const [selectedCartItems, setSelectedCartItems] = useState<CartOrderResponse[]>([]);

  // Load selectedCartItems từ sessionStorage khi component mount hoặc isOpen thay đổi
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
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
  }, [isOpen, cart]);

  // Address state
  const [selectedProvinceIndex, setSelectedProvinceIndex] = useState<string>("");
  const [selectedDistrictIndex, setSelectedDistrictIndex] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [detailedAddress, setDetailedAddress] = useState<string>("");

  // Order state
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("COD");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Address data - import directly (Next.js supports JSON imports)
  const provinces = (addressDataRaw as unknown) as AddressData[];

  // Sử dụng selectedCartItems thay vì cart để tính toán
  const itemsToUse = selectedCartItems.length > 0 ? selectedCartItems : cart;

  // Calculate totals
  const subtotal = itemsToUse.reduce((total, item) => total + (item.productPrice * item.quantity), 0);
  // Phí vận chuyển: mặc định miễn phí
  const shippingFee = 0;
  const discount = appliedVoucher ? subtotal * 0.1 : 0;
  const total = subtotal + shippingFee - discount;

  // Get selected province
  const selectedProvince = selectedProvinceIndex !== "" 
    ? provinces[parseInt(selectedProvinceIndex)] 
    : null;

  // Get selected district
  const selectedDistrict = selectedProvince && selectedDistrictIndex !== ""
    ? selectedProvince.districts[parseInt(selectedDistrictIndex)]
    : null;

  // Get available districts
  const availableDistricts = selectedProvince ? selectedProvince.districts : [];

  // Get available wards
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

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
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
  const handleApplyVoucher = () => {
    if (voucherCode.trim()) {
      // Simple validation (replace with actual API call)
      const code = voucherCode.trim().toLowerCase();
      if (code === "sale10" || code === "discount10") {
        setAppliedVoucher(code);
        toast.success("Mã giảm giá đã được áp dụng (10%)");
      } else {
        toast.error("Mã giảm giá không hợp lệ");
      }
    }
  };

  // Handle place order
  const handlePlaceOrder = () => {
    // Validate
    if (!selectedProvince || !selectedDistrict || !selectedWard) {
      toast.error("Vui lòng chọn đầy đủ địa chỉ");
      return;
    }

    if (!detailedAddress.trim()) {
      toast.error("Vui lòng nhập địa chỉ chi tiết");
      return;
    }

    if (itemsToUse.length === 0) {
      toast.error("Không có sản phẩm nào được chọn");
      return;
    }

    if (!token) {
      toast.error("Vui lòng đăng nhập để đặt hàng");
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  // Handle confirm order
  const handleConfirmOrder = () => {
    const shippingAddress = buildShippingAddress();

    // Sử dụng itemsToUse (selectedCartItems) thay vì cart
    const orderItems: OrderItemRequest[] = itemsToUse.map((item) => ({
      productId: item.productId,
      skuId: item.skuId,
      quantity: item.quantity,
    }));

    const orderRequest: CreateOrderRequest = {
      items: orderItems,
      shippingAddress: shippingAddress,
    };

    dispatch(
      createOrderAction(
        orderRequest,
        token!,
        (res) => {
          toast.success("Đặt hàng thành công!");
          dispatch(resetOrderStateAction());
          setShowConfirmDialog(false);
          // Xóa selectedCartItems khỏi sessionStorage sau khi đặt hàng thành công
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('selectedCartItems');
          }
          onClose();
          resetForm();
          // Redirect to order history page
          router.push(`/my-account?tab=orders`);
        },
        (error) => {
          toast.error(`Đặt hàng thất bại: ${error}`);
        }
      )
    );
  };

  // Reset form
  const resetForm = () => {
    setSelectedProvinceIndex("");
    setSelectedDistrictIndex("");
    setSelectedWard("");
    setDetailedAddress("");
    setVoucherCode("");
    setAppliedVoucher(null);
    setPaymentMethod("COD");
  };

  // Close handler
  const handleClose = () => {
    if (!loading) {
      // Xóa selectedCartItems khỏi sessionStorage khi đóng dialog
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('selectedCartItems');
      }
      onClose();
      resetForm();
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Main Checkout Dialog */}
      <div
        className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-8 bg-dark/70 backdrop-blur-sm ease-linear duration-300"
        onClick={handleClose}
      >
        <div
          className="bg-white shadow-3 rounded-[10px] max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-3 px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center z-10">
            <h2 className="text-xl sm:text-2xl font-medium text-dark">Thanh toán</h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-dark-5 hover:text-dark text-2xl sm:text-3xl font-bold disabled:opacity-50 ease-out duration-200"
            >
              ×
            </button>
          </div>

          <div className="flex flex-col lg:flex-row overflow-y-auto no-scrollbar">
            {/* Left: Address Form */}
            <div className="lg:w-1/2 p-4 sm:p-6 lg:p-8.5 border-r border-gray-3">
              <h3 className="text-lg sm:text-xl font-medium text-dark mb-5">
                Địa chỉ giao hàng
              </h3>

              {/* Province Dropdown */}
              <div className="mb-5">
                <label className="block mb-2.5 text-dark">
                  Tỉnh/Thành phố <span className="text-red">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedProvinceIndex}
                    onChange={handleProvinceChange}
                    className="w-full rounded-md border border-gray-3 bg-gray-1 text-dark py-2.5 px-5 pr-9 appearance-none outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  >
                    <option value="">-- Chọn Tỉnh/Thành phố --</option>
                    {provinces.map((province, index) => (
                      <option key={index} value={index.toString()}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-4 pointer-events-none">
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
              <div className="mb-5">
                <label className="block mb-2.5 text-dark">
                  Quận/Huyện <span className="text-red">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedDistrictIndex}
                    onChange={handleDistrictChange}
                    disabled={!selectedProvince}
                    className="w-full rounded-md border border-gray-3 bg-gray-1 text-dark py-2.5 px-5 pr-9 appearance-none outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:bg-gray-1 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">-- Chọn Quận/Huyện --</option>
                    {availableDistricts.map((district, index) => (
                      <option key={index} value={index.toString()}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-4 pointer-events-none">
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
              <div className="mb-5">
                <label className="block mb-2.5 text-dark">
                  Xã/Phường <span className="text-red">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    disabled={!selectedDistrict}
                    className="w-full rounded-md border border-gray-3 bg-gray-1 text-dark py-2.5 px-5 pr-9 appearance-none outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:bg-gray-1 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">-- Chọn Xã/Phường --</option>
                    {availableWards.map((ward, index) => (
                      <option key={index} value={ward.name}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-4 pointer-events-none">
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
              <div className="mb-5">
                <label className="block mb-2.5 text-dark">
                  Địa chỉ chi tiết <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  value={detailedAddress}
                  onChange={(e) => setDetailedAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, ..."
                  className="w-full rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 text-dark py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>
            </div>

            {/* Right: Order Information */}
            <div className="lg:w-1/2 p-4 sm:p-6 lg:p-8.5">
              <h3 className="text-lg sm:text-xl font-medium text-dark mb-5">
                Thông tin đơn hàng
              </h3>

              {/* Order Items */}
              <div className="mb-6">
                <h4 className="font-medium text-dark mb-3">Sản phẩm</h4>
                <div className="space-y-3 mb-4">
                  {itemsToUse.length === 0 ? (
                    <p className="text-dark-5 text-sm">Không có sản phẩm nào được chọn</p>
                  ) : (
                    itemsToUse.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-2.5 border-b border-gray-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-dark">
                            {item.productName}
                          </p>
                          <p className="text-xs text-dark-5">
                            Số lượng: {item.quantity}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-dark">
                          {formatCurrency(item.productPrice * item.quantity)}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-gray-3 pt-3">
                  <div className="flex justify-between text-sm text-dark-4 mb-2">
                    <span>Tạm tính:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {appliedVoucher && (
                    <div className="flex justify-between text-sm text-green-600 mb-2">
                      <span>Giảm giá (10%):</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-dark-4 mb-2">
                    <span>Phí vận chuyển:</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg text-dark pt-2 border-t border-gray-3">
                    <span>Tổng cộng:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Voucher/Discount Code */}
              <div className="mb-5">
                <label className="block mb-2.5 text-dark">
                  Mã giảm giá / Voucher
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Nhập mã giảm giá"
                    className="flex-1 rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 text-dark py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    className="px-4 py-2.5 bg-gray-1 hover:bg-gray-2 text-dark border border-gray-3 rounded-md transition-colors duration-200 ease-out"
                  >
                    Áp dụng
                  </button>
                </div>
                {appliedVoucher && (
                  <p className="text-sm mt-2 text-green-600">
                    Mã giảm giá đã được áp dụng (10%)
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block mb-2.5 text-dark">
                  Phương thức thanh toán <span className="text-red">*</span>
                </label>
                <div className="relative">
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-md border border-gray-3 bg-gray-1 text-dark py-2.5 px-5 pr-9 appearance-none outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  >
                    <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                    <option value="BANK">Chuyển khoản ngân hàng</option>
                    <option value="EWALLET">Ví điện tử (MoMo, ZaloPay)</option>
                    <option value="CARD">Thẻ tín dụng/Ghi nợ</option>
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-4 pointer-events-none">
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

              {/* Place Order Button */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading || itemsToUse.length === 0}
                className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:bg-gray-4 disabled:cursor-not-allowed"
              >
                {loading ? "Đang xử lý..." : `Đặt hàng (${itemsToUse.length} sản phẩm)`}
              </button>
            </div>
          </div>
        </div>
      </div>

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
                      <span>Giảm giá:</span>
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
              
              <div className="bg-gray-1 rounded-lg p-4">
                <h4 className="font-medium text-dark mb-2">Phương thức thanh toán:</h4>
                <p className="text-sm text-dark-4">
                  {paymentMethod === 'COD' && 'Thanh toán khi nhận hàng (COD)'}
                  {paymentMethod === 'BANK' && 'Chuyển khoản ngân hàng'}
                  {paymentMethod === 'EWALLET' && 'Ví điện tử (MoMo, ZaloPay)'}
                  {paymentMethod === 'CARD' && 'Thẻ tín dụng/Ghi nợ'}
                </p>
              </div>
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

export default CheckoutDialog;

