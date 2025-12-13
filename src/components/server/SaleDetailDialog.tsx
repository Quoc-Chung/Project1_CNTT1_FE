"use client";
import React from "react";
import { X } from "lucide-react";
import { SaleResponse } from "@/services/SaleService";
import { formatDate, formatPrice } from "@/utils/helpers";

interface SaleDetailDialogProps {
  sale: SaleResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSaleUpdated?: () => void;
}

export const SaleDetailDialog: React.FC<SaleDetailDialogProps> = ({
  sale,
  isOpen,
  onClose,
  onSaleUpdated,
}) => {
  if (!isOpen || !sale) return null;

  const formatDiscount = (sale: SaleResponse): string => {
    if (sale.saleType === 'FIXED_AMOUNT') {
      return formatPrice(sale.saleValue);
    } else if (sale.saleType === 'PERCENTAGE') {
      return `${sale.saleValue}%`;
    }
    return 'N/A';
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { color: string, text: string } } = {
      'ACTIVE': { color: 'bg-green-100 text-green-800', text: 'Đang hoạt động' },
      'SCHEDULED': { color: 'bg-blue-100 text-blue-800', text: 'Đã lên lịch' },
      'EXPIRED': { color: 'bg-red-100 text-red-800', text: 'Hết hạn' },
    };
    return statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: status };
  };

  const getApplyScopeBadge = (scope: string) => {
    const scopeMap: { [key: string]: { color: string, text: string } } = {
      'ALL_PRODUCTS': { color: 'bg-purple-100 text-purple-800', text: 'Tất cả sản phẩm' },
      'SPECIFIC_PRODUCTS': { color: 'bg-orange-100 text-orange-800', text: 'Sản phẩm cụ thể' },
      'CATEGORY': { color: 'bg-indigo-100 text-indigo-800', text: 'Theo danh mục' },
      'BRAND': { color: 'bg-pink-100 text-pink-800', text: 'Theo thương hiệu' },
    };
    return scopeMap[scope] || { color: 'bg-gray-100 text-gray-800', text: scope };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-bold">Chi Tiết Sale</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Sale Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">Mã Sale</p>
              <p className="text-lg font-mono font-semibold text-gray-900">{sale.code}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">Trạng thái</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(sale.status).color}`}>
                {getStatusBadge(sale.status).text}
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">Tên Sale</p>
              <p className="text-base font-medium text-gray-900">{sale.name}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">Phạm vi áp dụng</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getApplyScopeBadge(sale.applyScope).color}`}>
                {getApplyScopeBadge(sale.applyScope).text}
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">Loại giảm giá</p>
              <p className="text-base font-medium text-gray-900">
                {sale.saleType === 'PERCENTAGE' ? 'Phần trăm' : 'Số tiền cố định'}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">Giá trị giảm giá</p>
              <p className="text-xl font-bold text-red-600">{formatDiscount(sale)}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">Ngày bắt đầu</p>
              <p className="text-base font-medium text-gray-900">{formatDate(sale.startDate)}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">Ngày kết thúc</p>
              <p className="text-base font-medium text-gray-900">{formatDate(sale.endDate)}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">Độ ưu tiên</p>
              <p className="text-base font-medium text-gray-900">{sale.priority}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">Đã sử dụng</p>
              <p className="text-base font-medium text-gray-900">{sale.usedCount}</p>
            </div>
            {sale.minOrderValue && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">Đơn hàng tối thiểu</p>
                <p className="text-base font-medium text-gray-900">{formatPrice(sale.minOrderValue)}</p>
              </div>
            )}
            {sale.maxDiscountAmount && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">Giảm tối đa</p>
                <p className="text-base font-medium text-gray-900">{formatPrice(sale.maxDiscountAmount)}</p>
              </div>
            )}
            {sale.description && (
              <div className="col-span-2 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">Mô tả</p>
                <p className="text-base text-gray-900">{sale.description}</p>
              </div>
            )}
          </div>

          {/* Images */}
          {(sale.bannerImageUrl || sale.thumbnailImageUrl) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hình ảnh</h3>
              <div className="grid grid-cols-2 gap-4">
                {sale.bannerImageUrl && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Banner</p>
                    <img
                      src={sale.bannerImageUrl}
                      alt="Banner"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                {sale.thumbnailImageUrl && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Thumbnail</p>
                    <img
                      src={sale.thumbnailImageUrl}
                      alt="Thumbnail"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

