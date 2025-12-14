"use client";
import React from "react";
import { X } from "lucide-react";
import { SKU } from "@/types/Admin/SKUAPI";
import { formatPrice } from "@/utils/helpers";

interface SKUDetailDialogProps {
  sku: SKU;
  isOpen: boolean;
  onClose: () => void;
}

const SKUDetailDialog: React.FC<SKUDetailDialogProps> = ({ sku, isOpen, onClose }) => {
  if (!isOpen) return null;

  const renderSpecs = () => {
    if (!sku.specs || Object.keys(sku.specs).length === 0) {
      return <div className="text-gray-500">Không có thông tin specs</div>;
    }

    return (
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(sku.specs).map(([key, value]) => (
          <div key={key} className="bg-white p-2 rounded border border-gray-200">
            <div className="text-xs font-medium text-gray-600 capitalize tracking-wide">{key}</div>
            <div className="text-sm text-gray-900 font-medium mt-0.5">{String(value)}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200 px-5 py-3 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Chi Tiết SKU</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Mã SKU</label>
              <div className="mt-1 text-sm text-gray-900 font-mono break-all">{sku.id}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Mã hàng</label>
              <div className="mt-1 text-sm text-gray-900 font-medium">{sku.skuCode || <span className="text-gray-400 italic">N/A</span>}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Mã sản phẩm</label>
              <div className="mt-1 text-sm text-gray-900 font-mono break-all">{sku.productId}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Mã vạch</label>
              <div className="mt-1 text-sm text-gray-900 font-mono">{sku.barcode || <span className="text-gray-400 italic">N/A</span>}</div>
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Thông Tin Giá</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Giá gốc</label>
                <div className="mt-1 text-base font-bold text-gray-900">{formatPrice(sku.price)}</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-md">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Giá giảm</label>
                <div className="mt-1 text-base font-bold text-orange-600">
                  {sku.discountPrice ? formatPrice(sku.discountPrice) : <span className="text-gray-400 italic">N/A</span>}
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-md">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Giá sale</label>
                <div className="mt-1 text-base font-bold text-blue-600">
                  {sku.salePrice ? formatPrice(sku.salePrice) : <span className="text-gray-400 italic">N/A</span>}
                </div>
              </div>
            </div>
            {sku.saleId && (
              <div className="mt-3">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Mã khuyến mãi</label>
                <div className="mt-1 text-sm text-gray-900 font-mono break-all">{sku.saleId}</div>
              </div>
            )}
          </div>

          {/* Stock & Status */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Tồn Kho & Trạng Thái</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Tồn kho</label>
                <div className={`mt-1 text-xl font-bold ${
                  sku.stock > 10 ? 'text-green-600' : sku.stock > 0 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {sku.stock}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Trạng thái</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    sku.isActive
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {sku.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Thông Số Kỹ Thuật</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              {renderSpecs()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t-2 border-gray-200 px-5 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium shadow-sm hover:shadow"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default SKUDetailDialog;

