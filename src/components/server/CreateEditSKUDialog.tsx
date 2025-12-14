"use client";
import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { SKUService } from "@/services/SKUService";
import { SKUCreateRequest, SKUUpdateRequest } from "@/types/Admin/SKUAPI";
import { SKU, SKUSpecs } from "@/types/Admin/SKUAPI";
import { Product } from "@/types/Admin/ProductAPI";
import { toast } from "react-toastify";

interface CreateEditSKUDialogProps {
  isOpen: boolean;
  mode: "create" | "edit";
  sku: SKU | null;
  products: Product[];
  onClose: () => void;
  onSave: () => void;
}

const CreateEditSKUDialog: React.FC<CreateEditSKUDialogProps> = ({
  isOpen,
  mode,
  sku,
  products,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SKUCreateRequest>({
    productId: "",
    skuCode: "",
    specs: {},
    price: 0,
    discountPrice: null,
    stock: 0,
    barcode: "",
    isActive: true,
  });

  const [specsEntries, setSpecsEntries] = useState<Array<{ key: string; value: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && sku) {
        // Load SKU data for editing
        setFormData({
          productId: sku.productId,
          skuCode: sku.skuCode || "",
          specs: sku.specs || {},
          price: sku.price,
          discountPrice: sku.discountPrice,
          stock: sku.stock,
          barcode: sku.barcode || "",
          isActive: sku.isActive,
        });

        // Convert specs object to entries array
        if (sku.specs) {
          const entries = Object.entries(sku.specs).map(([key, value]) => ({
            key,
            value: String(value),
          }));
          setSpecsEntries(entries);
        } else {
          setSpecsEntries([]);
        }
      } else {
        // Reset form for create mode
        setFormData({
          productId: "",
          skuCode: "",
          specs: {},
          price: 0,
          discountPrice: null,
          stock: 0,
          barcode: "",
          isActive: true,
        });
        setSpecsEntries([]);
      }
    }
  }, [isOpen, mode, sku]);

  const handleAddSpec = () => {
    setSpecsEntries([...specsEntries, { key: "", value: "" }]);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecsEntries(specsEntries.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index: number, field: "key" | "value", value: string) => {
    const updated = [...specsEntries];
    updated[index][field] = value;
    setSpecsEntries(updated);
  };

  const buildSpecsObject = (): SKUSpecs => {
    const specs: SKUSpecs = {};
    specsEntries.forEach((entry) => {
      if (entry.key.trim() && entry.value.trim()) {
        // Try to parse as number or boolean, otherwise keep as string
        const trimmedValue = entry.value.trim();
        if (trimmedValue === "true" || trimmedValue === "false") {
          specs[entry.key.trim()] = trimmedValue === "true";
        } else if (!isNaN(Number(trimmedValue)) && trimmedValue !== "") {
          specs[entry.key.trim()] = Number(trimmedValue);
        } else {
          specs[entry.key.trim()] = trimmedValue;
        }
      }
    });
    return specs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (mode === "create") {
      if (!formData.productId) {
        toast.error("Vui lòng chọn sản phẩm");
        return;
      }
      if (!formData.skuCode.trim()) {
        toast.error("Vui lòng nhập mã hàng");
        return;
      }
      if (formData.price <= 0) {
        toast.error("Giá phải lớn hơn 0");
        return;
      }
      if (formData.stock < 0) {
        toast.error("Tồn kho không được âm");
        return;
      }
    }

    try {
      setLoading(true);

      const specs = buildSpecsObject();

      if (mode === "create") {
        const createData: SKUCreateRequest = {
          ...formData,
          specs,
          discountPrice: formData.discountPrice || null,
          barcode: formData.barcode || null,
        };
        await SKUService.createSKU(createData);
        toast.success("Tạo mã hàng thành công!");
      } else {
        const updateData: SKUUpdateRequest = {
          price: formData.price,
          discountPrice: formData.discountPrice || null,
          stock: formData.stock,
          isActive: formData.isActive,
        };
        if (sku) {
          await SKUService.updateSKU(sku.id, updateData);
          toast.success("Cập nhật mã hàng thành công!");
        }
      }

      onSave();
      handleClose();
    } catch (error: any) {
      console.error("Error saving SKU:", error);
      toast.error(error.message || `Không thể ${mode === "create" ? "tạo" : "cập nhật"} mã hàng`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      productId: "",
      skuCode: "",
      specs: {},
      price: 0,
      discountPrice: null,
      stock: 0,
      barcode: "",
      isActive: true,
    });
    setSpecsEntries([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3 rounded-t-xl flex justify-between items-center shadow-md">
          <h2 className="text-lg font-semibold">
            {mode === "create" ? "Tạo Mã Hàng Mới" : "Sửa Mã Hàng"}
          </h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors p-1 hover:bg-white/10 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Product Selection (only for create) */}
          {mode === "create" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Sản phẩm <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                required
              >
                <option value="">-- Chọn sản phẩm --</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mã Hàng (only for create) */}
          {mode === "create" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mã Hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.skuCode}
                onChange={(e) => setFormData({ ...formData, skuCode: e.target.value })}
                placeholder="VD: SKU-00077"
                required
              />
            </div>
          )}

          {/* Price and Discount Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Giá <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Giá giảm
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.discountPrice || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountPrice: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                placeholder="Không bắt buộc"
              />
            </div>
          </div>

          {/* Stock and Barcode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tồn kho <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Barcode
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="Không bắt buộc"
              />
            </div>
          </div>

          {/* Specs (only for create) */}
          {mode === "create" && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Thông số kỹ thuật
                </label>
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 text-xs font-medium px-2 py-1 hover:bg-blue-50 rounded transition-colors"
                >
                  <Plus size={14} />
                  <span>Thêm spec</span>
                </button>
              </div>
              <div className="space-y-2">
                {specsEntries.map((entry, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Tên spec (VD: cpu, ram)"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={entry.key}
                      onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Giá trị (VD: Intel i7, 16GB)"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={entry.value}
                      onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(index)}
                      className="px-2.5 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {specsEntries.length === 0 && (
                  <div className="text-xs text-gray-500 italic py-2">
                    Chưa có thông số kỹ thuật. Nhấn "Thêm spec" để thêm.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Status */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span className="text-sm font-medium text-gray-700">Hoạt động</span>
            </label>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : mode === "create" ? "Tạo Mã Hàng" : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditSKUDialog;

