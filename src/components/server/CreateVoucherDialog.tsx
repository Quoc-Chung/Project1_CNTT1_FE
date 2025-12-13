"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { VoucherService, CreateVoucherRequest } from "@/services/VoucherService";
import { toast } from "react-toastify";

interface CreateVoucherDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVoucherCreated?: () => void;
}

export const CreateVoucherDialog: React.FC<CreateVoucherDialogProps> = ({
  isOpen,
  onClose,
  onVoucherCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateVoucherRequest>({
    code: "",
    name: "",
    description: "",
    voucherType: "ORDER_DISCOUNT",
    discountType: "FIXED_AMOUNT",
    discountValue: 0,
    minOrderValue: 0,
    maxDiscountAmount: 0,
    totalQuantity: 0,
    usageLimitPerUser: 1,
    userScope: "ALL_USERS",
    startDate: "",
    endDate: "",
    bannerImageUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.code || !formData.name || !formData.startDate || !formData.endDate) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (formData.discountValue <= 0) {
      toast.error("Giá trị giảm giá phải lớn hơn 0");
      return;
    }

    if (formData.totalQuantity <= 0) {
      toast.error("Số lượng voucher phải lớn hơn 0");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }

    try {
      setLoading(true);
      
      // Format dates to ISO string
      const voucherData: CreateVoucherRequest = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        bannerImageUrl: formData.bannerImageUrl || undefined,
      };

      await VoucherService.createVoucher(voucherData);
      toast.success("Tạo voucher thành công!");
      onVoucherCreated?.();
      handleClose();
    } catch (error: any) {
      console.error("Error creating voucher:", error);
      toast.error(error.message || "Không thể tạo voucher");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      code: "",
      name: "",
      description: "",
      voucherType: "ORDER_DISCOUNT",
      discountType: "FIXED_AMOUNT",
      discountValue: 0,
      minOrderValue: 0,
      maxDiscountAmount: 0,
      totalQuantity: 0,
      usageLimitPerUser: 1,
      userScope: "ALL_USERS",
      startDate: "",
      endDate: "",
      bannerImageUrl: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-bold">Tạo Voucher Mới</h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Row 1: Code và Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mã Voucher <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="VD: GIANGSINH2025"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên Voucher <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Voucher Năm Mới 2025"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="VD: Giảm 100K cho đơn hàng từ 500K"
            />
          </div>

          {/* Row 2: Voucher Type và Discount Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Loại Voucher
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.voucherType}
                onChange={(e) => setFormData({ ...formData, voucherType: e.target.value })}
              >
                <option value="ORDER_DISCOUNT">Giảm giá đơn hàng</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Loại Giảm Giá
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              >
                <option value="FIXED_AMOUNT">Số tiền cố định</option>
                <option value="PERCENTAGE">Phần trăm</option>
              </select>
            </div>
          </div>

          {/* Row 3: Discount Value và Min Order Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Giá trị giảm giá <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.discountValue || ""}
                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                placeholder="VD: 100000"
                min="0"
                step="1000"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.discountType === "FIXED_AMOUNT" ? "Số tiền (VNĐ)" : "Phần trăm (%)"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Đơn hàng tối thiểu
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.minOrderValue || ""}
                onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) || 0 })}
                placeholder="VD: 500000"
                min="0"
                step="1000"
              />
            </div>
          </div>

          {/* Row 4: Max Discount Amount và Total Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Giảm tối đa
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.maxDiscountAmount || ""}
                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: parseFloat(e.target.value) || 0 })}
                placeholder="VD: 100000"
                min="0"
                step="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tổng số lượng <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.totalQuantity || ""}
                onChange={(e) => setFormData({ ...formData, totalQuantity: parseInt(e.target.value) || 0 })}
                placeholder="VD: 1000"
                min="1"
                required
              />
            </div>
          </div>

          {/* Row 5: Usage Limit và User Scope */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Giới hạn sử dụng/user
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.usageLimitPerUser || ""}
                onChange={(e) => setFormData({ ...formData, usageLimitPerUser: parseInt(e.target.value) || 1 })}
                placeholder="VD: 1"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phạm vi người dùng
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.userScope}
                onChange={(e) => setFormData({ ...formData, userScope: e.target.value })}
              >
                <option value="ALL_USERS">Tất cả người dùng</option>
              </select>
            </div>
          </div>

          {/* Row 6: Start Date và End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Banner Image URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL Banner (tùy chọn)
            </label>
            <input
              type="url"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.bannerImageUrl}
              onChange={(e) => setFormData({ ...formData, bannerImageUrl: e.target.value })}
              placeholder="https://cdn.example.com/voucher/newyear.jpg"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Đang tạo..." : "Tạo Voucher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

