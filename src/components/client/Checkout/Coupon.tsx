import React, { useState } from "react";

interface CouponProps {
  value?: string;
  onChange?: (value: string) => void;
  onApply?: (code: string) => void;
}

const Coupon: React.FC<CouponProps> = ({ value, onChange, onApply }) => {
  const [selectedCoupon, setSelectedCoupon] = useState<string>("");
  const [customCode, setCustomCode] = useState<string>(value || "");

  // Danh sách mã giảm giá có sẵn
  const availableCoupons = [
    { code: "", label: "-- Chọn mã giảm giá --" },
    { code: "SALE10", label: "SALE10 - Giảm 10%" },
    { code: "SALE20", label: "SALE20 - Giảm 20%" },
    { code: "FREESHIP", label: "FREESHIP - Miễn phí vận chuyển" },
    { code: "NEWUSER", label: "NEWUSER - Giảm 15% cho khách hàng mới" },
  ];

  const handleCouponSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedCoupon(code);
    if (code) {
      setCustomCode(code);
      if (onChange) {
        onChange(code);
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
  };

  const handleApply = () => {
    if (customCode.trim() && onApply) {
      onApply(customCode.trim());
    }
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
                className="w-full rounded-md border border-gray-3 bg-white text-dark py-2 px-3 pr-9 appearance-none outline-none transition-all duration-200 hover:border-gray-4 hover:bg-gray-1 focus:border-gray-4 focus:bg-white focus:shadow-sm focus:ring-1 focus:ring-gray-300 cursor-pointer text-sm"
              >
                {availableCoupons.map((coupon, index) => (
                  <option key={index} value={coupon.code} className="text-dark py-2">
                    {coupon.label}
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
                placeholder="Nhập mã code giảm giá"
                className="rounded-md border border-gray-3 bg-white placeholder:text-dark-5 placeholder:text-sm text-dark w-full py-2 px-3 text-sm outline-none duration-200 hover:border-gray-4 hover:bg-gray-1 focus:border-gray-4 focus:bg-white focus:shadow-sm focus:ring-1 focus:ring-gray-300"
              />

              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center justify-center font-medium text-white bg-blue py-2 px-5 rounded-md ease-out duration-200 hover:bg-blue-dark whitespace-nowrap text-sm"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coupon;
