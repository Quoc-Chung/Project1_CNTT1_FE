"use client";
import React, { useState, useEffect } from "react";
import { VoucherService, VoucherResponse } from "@/services/VoucherService";
import { formatDate, formatPrice } from "@/utils/helpers";
import Image from "next/image";
import Link from "next/link";
import { Ticket, Calendar, Percent } from "lucide-react";

const Vouchers = () => {
  const [allVouchers, setAllVouchers] = useState<VoucherResponse[]>([]);
  const [displayedVouchers, setDisplayedVouchers] = useState<VoucherResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllVouchers = async () => {
      try {
        setLoading(true);
        // Load tất cả voucher từ API (không có filter)
        const data = await VoucherService.getAllVouchers();
        
        // Debug: Log tất cả voucher để kiểm tra
        console.log("All vouchers from API:", data);
        console.log("Total vouchers:", data.length);
        console.log("Vouchers by status:", {
          ACTIVE: data.filter(v => v.status === 'ACTIVE').length,
          SCHEDULED: data.filter(v => v.status === 'SCHEDULED').length,
          EXPIRED: data.filter(v => v.status === 'EXPIRED').length,
        });
        console.log("Vouchers by isActive:", {
          active: data.filter(v => v.isActive === true).length,
          inactive: data.filter(v => v.isActive === false).length,
        });
        
        setAllVouchers(data);
        
        // Hiển thị TẤT CẢ voucher (không lọc gì cả)
        setDisplayedVouchers(data);
        
        console.log("Displayed vouchers:", data.length);
      } catch (error: any) {
        console.error("Error fetching vouchers:", error);
        // Nếu lỗi, set empty array
        setAllVouchers([]);
        setDisplayedVouchers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllVouchers();
  }, []);

  const formatDiscount = (voucher: VoucherResponse): string => {
    if (voucher.discountType === 'FIXED_AMOUNT') {
      return formatPrice(voucher.discountValue);
    } else if (voucher.discountType === 'PERCENTAGE') {
      return `${voucher.discountValue}%`;
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Đang tải voucher...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (displayedVouchers.length === 0) {
    return null; // Không hiển thị gì nếu không có voucher active
  }

  return (
    <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Ticket className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Voucher Khuyến Mãi
            </h2>
          </div>
          <p className="text-gray-600">Những ưu đãi đặc biệt dành cho bạn</p>
        </div>

        {/* Vouchers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedVouchers.map((voucher) => (
            <Link
              key={voucher.id}
              href={`/shop-with-sidebar?voucher=${voucher.code}`}
              className="group relative bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Banner Image */}
              {voucher.bannerImageUrl && (
                <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
                  <Image
                    src={voucher.bannerImageUrl}
                    alt={voucher.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              )}

              {/* Content */}
              <div className="p-5">
                {/* Discount Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                      <Percent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Giảm giá</p>
                      <p className="text-xl font-black text-red-600">{formatDiscount(voucher)}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    voucher.status === 'ACTIVE' && voucher.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : voucher.status === 'SCHEDULED'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {voucher.status === 'ACTIVE' && voucher.isActive ? 'ACTIVE' : voucher.status}
                  </div>
                </div>

                {/* Voucher Name */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {voucher.name}
                </h3>

                {/* Description */}
                {voucher.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {voucher.description}
                  </p>
                )}

                {/* Code */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Mã voucher</p>
                  <p className="text-base font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg inline-block">
                    {voucher.code}
                  </p>
                </div>

                {/* Conditions */}
                <div className="space-y-2 mb-4">
                  {voucher.minOrderValue > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Đơn hàng tối thiểu: <strong>{formatPrice(voucher.minOrderValue)}</strong></span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(voucher.startDate)} - {formatDate(voucher.endDate)}
                    </span>
                  </div>
                </div>

                {/* Usage Info */}
                <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                  <span>Còn lại: <strong className="text-green-600">{voucher.remainingQuantity}</strong></span>
                  <span>Đã dùng: <strong>{voucher.usedCount}</strong></span>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/10 group-hover:to-blue-500/5 transition-all duration-300 pointer-events-none"></div>
              </div>

              {/* Arrow Indicator */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                <svg 
                  className="w-5 h-5 text-blue-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Vouchers;

