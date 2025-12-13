"use client";
import React, { useState, useEffect } from "react";
import { VoucherService, VoucherResponse } from "@/services/VoucherService";
import { toast } from "react-toastify";

interface CouponProps {
  value?: string;
  onChange?: (value: string) => void;
  onApply?: (voucher: VoucherResponse | null) => void;
  subtotal?: number; // Tổng tiền đơn hàng để validate minOrderValue
}

const Coupon: React.FC<CouponProps> = ({ value, onChange, onApply, subtotal = 0 }) => {
  const [selectedCoupon, setSelectedCoupon] = useState<string>("");
  const [customCode, setCustomCode] = useState<string>(value || "");
  const [availableVouchers, setAvailableVouchers] = useState<VoucherResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherResponse | null>(null);
  const [applying, setApplying] = useState(false);

  // Fetch danh sách voucher active khi component mount
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        const vouchers = await VoucherService.getActiveVouchers();
        // Lọc chỉ lấy voucher ACTIVE và isActive = true
        const activeVouchers = vouchers.filter(
          v => v.status === 'ACTIVE' && v.isActive === true
        );
        setAvailableVouchers(activeVouchers);
      } catch (error: any) {
        console.error('Error fetching vouchers:', error);
        // Không hiển thị lỗi nếu không fetch được, chỉ log
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  const handleCouponSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedCoupon(code);
    if (code) {
      setCustomCode(code);
      if (onChange) {
        onChange(code);
      }
      // Tự động apply khi chọn từ dropdown
      const selectedVoucher = availableVouchers.find(v => v.code === code);
      if (selectedVoucher) {
        validateAndApplyVoucher(selectedVoucher);
      }
    } else {
      // Reset khi chọn "-- Chọn mã giảm giá --"
      setAppliedVoucher(null);
      if (onApply) {
        onApply(null);
      }
    }
  };

  const handleCustomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setCustomCode(code);
    setSelectedCoupon("");
    if (onChange) {
      onChange(code);
    }
    // Reset applied voucher khi nhập mã mới
    if (appliedVoucher) {
      setAppliedVoucher(null);
      if (onApply) {
        onApply(null);
      }
    }
  };

  // Validate và apply voucher
  const validateAndApplyVoucher = async (voucher: VoucherResponse) => {
    // Kiểm tra minOrderValue
    if (voucher.minOrderValue > 0 && subtotal < voucher.minOrderValue) {
      toast.error(`Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')}₫ để áp dụng voucher này`);
      return;
    }

    // Kiểm tra ngày hết hạn
    const now = new Date();
    const endDate = new Date(voucher.endDate);
    if (now > endDate) {
      toast.error("Voucher đã hết hạn");
      return;
    }

    // Kiểm tra số lượng còn lại
    if (voucher.remainingQuantity <= 0) {
      toast.error("Voucher đã hết lượt sử dụng");
      return;
    }

    // Apply voucher
    setAppliedVoucher(voucher);
    if (onApply) {
      onApply(voucher);
    }

    // Hiển thị thông báo thành công
    const discountText = voucher.discountType === 'FIXED_AMOUNT' 
      ? `${voucher.discountValue.toLocaleString('vi-VN')}₫`
      : `${voucher.discountValue}%`;
    toast.success(`Đã áp dụng voucher "${voucher.name}" - Giảm ${discountText}`);
  };

  const handleApply = async () => {
    if (!customCode.trim()) {
      toast.error("Vui lòng nhập mã voucher");
      return;
    }

    setApplying(true);
    try {
      // Tìm voucher trong danh sách đã fetch
      const voucher = availableVouchers.find(
        v => v.code.toUpperCase() === customCode.trim().toUpperCase()
      );

      if (voucher) {
        validateAndApplyVoucher(voucher);
      } else {
        // Nếu không tìm thấy trong danh sách, thử fetch từ API theo code
        try {
          const fetchedVoucher = await VoucherService.getVoucherByCode(customCode.trim());
          if (fetchedVoucher.status === 'ACTIVE' && fetchedVoucher.isActive) {
            validateAndApplyVoucher(fetchedVoucher);
          } else {
            toast.error("Voucher không khả dụng");
          }
        } catch (error: any) {
          toast.error(error.message || "Mã voucher không hợp lệ hoặc không tồn tại");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể áp dụng voucher");
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setCustomCode("");
    setSelectedCoupon("");
    if (onChange) {
      onChange("");
    }
    if (onApply) {
      onApply(null);
    }
    toast.info("Đã xóa voucher");
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-6">
      <div className="border-b border-gray-3 py-4 px-4 sm:px-8.5">
        <h3 className="font-bold text-lg text-dark">Mã code giảm giá</h3>
      </div>

      <div className="py-6 px-4 sm:px-8.5">
        <div className="space-y-4">
          {/* Dropdown chọn mã giảm giá */}
          <div>
            <label className="block mb-2 text-dark font-bold text-sm">
              Chọn mã giảm giá
            </label>
            <div className="relative">
              <select
                value={selectedCoupon}
                onChange={handleCouponSelect}
                disabled={loading || !!appliedVoucher}
                className="w-full rounded-md border border-gray-3 bg-white text-dark py-2 px-3 pr-9 appearance-none outline-none transition-all duration-200 hover:border-gray-4 hover:bg-gray-1 focus:border-gray-4 focus:bg-white focus:shadow-sm focus:ring-1 focus:ring-gray-300 cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" className="text-dark py-2">
                  -- Chọn mã giảm giá --
                </option>
                {loading ? (
                  <option value="" disabled>Đang tải...</option>
                ) : availableVouchers.length === 0 ? (
                  <option value="" disabled>Không có voucher nào</option>
                ) : (
                  availableVouchers.map((voucher) => {
                    const discountText = voucher.discountType === 'FIXED_AMOUNT' 
                      ? `${voucher.discountValue.toLocaleString('vi-VN')}₫`
                      : `${voucher.discountValue}%`;
                    return (
                      <option key={voucher.id} value={voucher.code} className="text-dark py-2">
                        {voucher.code} - {voucher.name} (Giảm {discountText})
                      </option>
                    );
                  })
                )}
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

          {/* Input nhập mã tùy chỉnh */}
          <div>
            <label className="block mb-2 text-dark font-bold text-sm">
              Hoặc nhập mã code giảm giá
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                name="coupon"
                id="coupon"
                value={customCode}
                onChange={handleCustomCodeChange}
                disabled={!!appliedVoucher}
                placeholder="Nhập mã code giảm giá"
                className="rounded-md border border-gray-3 bg-white placeholder:text-dark-5 placeholder:text-sm text-dark w-full py-2 px-3 text-sm outline-none duration-200 hover:border-gray-4 hover:bg-gray-1 focus:border-gray-4 focus:bg-white focus:shadow-sm focus:ring-1 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />

              {appliedVoucher ? (
                <button
                  type="button"
                  onClick={handleRemoveVoucher}
                  className="inline-flex items-center justify-center font-medium text-white bg-red-600 py-2 px-5 rounded-md ease-out duration-200 hover:bg-red-700 whitespace-nowrap text-sm"
                >
                  Xóa
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applying || !customCode.trim()}
                  className="inline-flex items-center justify-center font-medium text-white bg-blue py-2 px-5 rounded-md ease-out duration-200 hover:bg-blue-dark whitespace-nowrap text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? "Đang kiểm tra..." : "Áp dụng"}
                </button>
              )}
            </div>
          </div>

          {/* Hiển thị thông tin voucher đã áp dụng */}
          {appliedVoucher && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-green-800 mb-1">
                    ✓ Voucher đã được áp dụng: {appliedVoucher.name}
                  </p>
                  <p className="text-sm text-green-700 mb-1">
                    Mã: <span className="font-mono font-bold">{appliedVoucher.code}</span>
                  </p>
                  <p className="text-sm text-green-700">
                    {appliedVoucher.discountType === 'FIXED_AMOUNT' 
                      ? `Giảm ${appliedVoucher.discountValue.toLocaleString('vi-VN')}₫`
                      : `Giảm ${appliedVoucher.discountValue}%`}
                    {appliedVoucher.maxDiscountAmount > 0 && appliedVoucher.discountType === 'PERCENTAGE' && (
                      <span className="ml-1">
                        (Tối đa {appliedVoucher.maxDiscountAmount.toLocaleString('vi-VN')}₫)
                      </span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveVoucher}
                  className="text-green-700 hover:text-green-900 ml-2"
                  title="Xóa voucher"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Coupon;
