"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { SaleService, CreateSaleRequest } from "@/services/SaleService";
import { toast } from "react-toastify";

interface CreateSaleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleCreated?: () => void;
}

export const CreateSaleDialog: React.FC<CreateSaleDialogProps> = ({
  isOpen,
  onClose,
  onSaleCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateSaleRequest>({
    code: "",
    name: "",
    saleType: "PERCENTAGE",
    saleValue: 0,
    applyScope: "SPECIFIC_PRODUCTS",
    startDate: "",
    endDate: "",
    priority: 1,
    description: "",
    minOrderValue: undefined,
    maxDiscountAmount: undefined,
    minPurchaseQuantity: 1,
    quantity: undefined,
  });
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'banner') {
        setBannerImage(file);
        setBannerPreview(URL.createObjectURL(file));
      } else {
        setThumbnailImage(file);
        setThumbnailPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.code || !formData.name || !formData.startDate || !formData.endDate) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (formData.saleValue <= 0) {
      toast.error("Giá trị giảm giá phải lớn hơn 0");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }

    try {
      setLoading(true);
      
      // Format dates to ISO string
      const saleData: CreateSaleRequest = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        description: formData.description || undefined,
        minOrderValue: formData.minOrderValue || undefined,
        maxDiscountAmount: formData.maxDiscountAmount || undefined,
        quantity: formData.quantity || undefined,
      };

      await SaleService.createSale(
        saleData,
        bannerImage || undefined,
        thumbnailImage || undefined
      );
      toast.success("Tạo sale thành công!");
      onSaleCreated?.();
      handleClose();
    } catch (error: any) {
      console.error("Error creating sale:", error);
      toast.error(error.message || "Không thể tạo sale");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      code: "",
      name: "",
      saleType: "PERCENTAGE",
      saleValue: 0,
      applyScope: "SPECIFIC_PRODUCTS",
      startDate: "",
      endDate: "",
      priority: 1,
      description: "",
      minOrderValue: undefined,
      maxDiscountAmount: undefined,
      minPurchaseQuantity: 1,
      quantity: undefined,
    });
    setBannerImage(null);
    setThumbnailImage(null);
    setBannerPreview(null);
    setThumbnailPreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-bold">Tạo Sale Mới</h2>
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
                Mã Sale <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="VD: TEST_EXPIRE333"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên Sale <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Test Sale Expire 3"
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
              placeholder="Mô tả về sale..."
            />
          </div>

          {/* Row 2: Sale Type và Apply Scope */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Loại Sale
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.saleType}
                onChange={(e) => setFormData({ ...formData, saleType: e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT' })}
              >
                <option value="PERCENTAGE">Phần trăm</option>
                <option value="FIXED_AMOUNT">Số tiền cố định</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phạm vi áp dụng
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.applyScope}
                onChange={(e) => setFormData({ ...formData, applyScope: e.target.value as any })}
              >
                <option value="ALL_PRODUCTS">Tất cả sản phẩm</option>
                <option value="SPECIFIC_PRODUCTS">Sản phẩm cụ thể</option>
                <option value="CATEGORY">Theo danh mục</option>
                <option value="BRAND">Theo thương hiệu</option>
              </select>
            </div>
          </div>

          {/* Row 3: Sale Value và Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Giá trị giảm giá <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.saleValue || ""}
                onChange={(e) => setFormData({ ...formData, saleValue: parseFloat(e.target.value) || 0 })}
                placeholder={formData.saleType === "PERCENTAGE" ? "VD: 20" : "VD: 100000"}
                min="0"
                step={formData.saleType === "PERCENTAGE" ? "1" : "1000"}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.saleType === "PERCENTAGE" ? "Phần trăm (%)" : "Số tiền (VNĐ)"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Độ ưu tiên
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.priority || ""}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                placeholder="VD: 1"
                min="1"
              />
            </div>
          </div>

          {/* Row 4: Min Order Value và Max Discount Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Đơn hàng tối thiểu
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.minOrderValue || ""}
                onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) || undefined })}
                placeholder="VD: 500000"
                min="0"
                step="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Giảm tối đa
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.maxDiscountAmount || ""}
                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: parseFloat(e.target.value) || undefined })}
                placeholder="VD: 100000"
                min="0"
                step="1000"
              />
            </div>
          </div>

          {/* Row 5: Min Purchase Quantity và Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Số lượng mua tối thiểu
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.minPurchaseQuantity || ""}
                onChange={(e) => setFormData({ ...formData, minPurchaseQuantity: parseInt(e.target.value) || 1 })}
                placeholder="VD: 1"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Số lượng (tùy chọn)
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.quantity || ""}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || undefined })}
                placeholder="VD: 100"
                min="1"
              />
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

          {/* Images */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Banner Image (tùy chọn)
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handleImageChange(e, 'banner')}
              />
              {bannerPreview && (
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="mt-2 w-full h-32 object-cover rounded-lg border border-gray-200"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Thumbnail Image (tùy chọn)
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handleImageChange(e, 'thumbnail')}
              />
              {thumbnailPreview && (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="mt-2 w-full h-32 object-cover rounded-lg border border-gray-200"
                />
              )}
            </div>
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
              {loading ? "Đang tạo..." : "Tạo Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

