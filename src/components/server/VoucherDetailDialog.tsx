"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { VoucherService, VoucherResponse } from "@/services/VoucherService";
import { formatDate, formatPrice } from "@/utils/helpers";
import { toast } from "react-toastify";

interface VoucherDetailDialogProps {
  voucher: VoucherResponse | null;
  voucherId?: number | null;
  voucherCode?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onVoucherUpdated?: () => void;
}

export const VoucherDetailDialog: React.FC<VoucherDetailDialogProps> = ({
  voucher: voucherProp,
  voucherId,
  voucherCode,
  isOpen,
  onClose,
  onVoucherUpdated,
}) => {
  const [voucher, setVoucher] = useState<VoucherResponse | null>(voucherProp);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Nếu có voucher từ props, sử dụng luôn
      if (voucherProp) {
        setVoucher(voucherProp);
        return;
      }
      
      // Nếu có voucherId, fetch theo ID
      if (voucherId) {
        fetchVoucherById(voucherId);
        return;
      }
      
      // Nếu có voucherCode, fetch theo Code
      if (voucherCode) {
        fetchVoucherByCode(voucherCode);
        return;
      }
      
      // Nếu không có gì, set null
      setVoucher(null);
    } else {
      // Reset khi đóng dialog
      setVoucher(null);
    }
  }, [isOpen, voucherProp, voucherId, voucherCode]);

  const fetchVoucherById = async (id: number) => {
    try {
      setLoading(true);
      const data = await VoucherService.getVoucherById(id);
      setVoucher(data);
    } catch (error: any) {
      console.error("Error fetching voucher by ID:", error);
      toast.error(error.message || "Không thể tải chi tiết voucher");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const fetchVoucherByCode = async (code: string) => {
    try {
      setLoading(true);
      const data = await VoucherService.getVoucherByCode(code);
      setVoucher(data);
    } catch (error: any) {
      console.error("Error fetching voucher by code:", error);
      toast.error(error.message || "Không thể tải chi tiết voucher");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Đang tải chi tiết voucher...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Chi Tiết Voucher</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex items-center justify-center p-12">
            <p className="text-gray-500">Không tìm thấy voucher</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { color: string, text: string } } = {
      'ACTIVE': { color: 'bg-green-100 text-green-800', text: 'Đang hoạt động' },
      'SCHEDULED': { color: 'bg-blue-100 text-blue-800', text: 'Đã lên lịch' },
      'EXPIRED': { color: 'bg-red-100 text-red-800', text: 'Hết hạn' },
    };
    return statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: status };
  };

  const formatDiscount = (): string => {
    if (voucher.discountType === 'FIXED_AMOUNT') {
      return formatPrice(voucher.discountValue);
    } else if (voucher.discountType === 'PERCENTAGE') {
      return `${voucher.discountValue}%`;
    }
    return 'N/A';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Chi Tiết Voucher</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Voucher Info */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Code</p>
                <p className="text-lg font-mono font-bold text-gray-900">{voucher.code}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Trạng thái</p>
                <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${getStatusBadge(voucher.status).color}`}>
                  {getStatusBadge(voucher.status).text}
                </span>
              </div>
              <div className="col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Tên voucher</p>
                <p className="text-lg font-bold text-gray-900">{voucher.name}</p>
              </div>
              <div className="col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Mô tả</p>
                <p className="text-base text-gray-900">{voucher.description}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4 border-2 border-red-200">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Giảm giá</p>
                <p className="text-2xl font-bold text-red-600">{formatDiscount()}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Đơn hàng tối thiểu</p>
                <p className="text-xl font-bold text-blue-600">{formatPrice(voucher.minOrderValue)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Ngày bắt đầu</p>
                <p className="text-base font-medium text-gray-900">{formatDate(voucher.startDate)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Ngày kết thúc</p>
                <p className="text-base font-medium text-gray-900">{formatDate(voucher.endDate)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Tổng số lượng</p>
                <p className="text-lg font-bold text-gray-900">{voucher.totalQuantity}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Số lượng còn lại</p>
                <p className="text-lg font-bold text-green-600">{voucher.remainingQuantity}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Đã sử dụng</p>
                <p className="text-lg font-bold text-gray-900">{voucher.usedCount}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Giới hạn mỗi user</p>
                <p className="text-lg font-bold text-gray-900">{voucher.usageLimitPerUser}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">User Scope</p>
                <p className="text-base font-medium text-gray-900">{voucher.userScope}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Loại voucher</p>
                <p className="text-base font-medium text-gray-900">{voucher.voucherType}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Loại giảm giá</p>
                <p className="text-base font-medium text-gray-900">{voucher.discountType}</p>
              </div>
              {voucher.bannerImageUrl && (
                <div className="col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Banner Image</p>
                  <img src={voucher.bannerImageUrl} alt="Banner" className="max-w-full h-auto rounded-lg" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

