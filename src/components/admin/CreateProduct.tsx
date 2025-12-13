"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductCreateRequest } from "../../types/Admin/ProductAPI";
import { ProductService } from "../../services/ProductService";
import { CategoryService } from "../../services/CategoryService";
import { BrandService } from "../../services/BrandService";
import { Category } from "../../types/Client/Category/Category";
import { Brand } from "../../types/Admin/BrandAPI";
import { toast } from "react-toastify";
import { X, Plus } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

const CreateProduct = () => {
  const router = useRouter();
  // Get token from Redux
  const { token } = useSelector((state: RootState) => state.auth);

  // Categories and Brands
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [loadingBrands, setLoadingBrands] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);

  // Form states
  const [formData, setFormData] = useState<Omit<ProductCreateRequest, 'imageUrls'>>({
    name: "",
    description: "",
    brandId: "",
    categoryId: "",
    specs: {},
  });

  const [formErrors, setFormErrors] = useState<{
    name?: string;
    description?: string;
    brandId?: string;
    categoryId?: string;
  }>({});

  // Specs management
  const [specKey, setSpecKey] = useState<string>("");
  const [specValue, setSpecValue] = useState<string>("");


  // Debug: Log token
  useEffect(() => {
  }, [token]);

  // Load categories and brands on mount
  useEffect(() => {
    loadCategoriesAndBrands();
  }, []);

  const loadCategoriesAndBrands = async () => {
    try {
      setLoadingCategories(true);
      const categoriesData = await CategoryService.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Không thể tải danh mục!", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoadingCategories(false);
    }

    try {
      setLoadingBrands(true);
      const brandsData = await BrandService.getAllBrands();
      setBrands(brandsData);
    } catch (error) {
      console.error("Error loading brands:", error);
      toast.error("Không thể tải thương hiệu!", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoadingBrands(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: {
      name?: string;
      description?: string;
      brandId?: string;
      categoryId?: string;
    } = {};

    if (!formData.name.trim()) {
      errors.name = "Tên sản phẩm không được để trống";
    }

    if (!formData.description.trim()) {
      errors.description = "Mô tả không được để trống";
    }

    if (!formData.brandId) {
      errors.brandId = "Vui lòng chọn thương hiệu";
    }

    if (!formData.categoryId) {
      errors.categoryId = "Vui lòng chọn danh mục";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!token) {
      toast.warning("Bạn cần đăng nhập với quyền Administrator!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      setCreating(true);

      // Clean data before sending - ensure all values are valid
      const cleanedSpecs: Record<string, string> = {};
      Object.entries(formData.specs || {}).forEach(([key, value]) => {
        // Only include specs with non-empty string values
        if (value && typeof value === 'string' && value.trim() !== '') {
          cleanedSpecs[key.trim()] = value.trim();
        }
      });

      const cleanedData: ProductCreateRequest = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        brandId: formData.brandId.trim(),
        categoryId: formData.categoryId.trim(),
        specs: cleanedSpecs,
        imageUrls: [], // Empty array - images are uploaded via files, not URLs
      };

      console.log("📤 Sending cleaned product data:", cleanedData);

      await ProductService.createProduct(cleanedData, token);
      toast.success("Tạo sản phẩm thành công!", {
        position: "top-right",
        autoClose: 2000,
      });
      // Redirect to products management page
      router.push("/admin-app/products/management");
    } catch (error: any) {


      let errorMessage = "Tạo sản phẩm thất bại!";

      if (error.message?.includes("500")) {
        errorMessage += " Lỗi server. Vui lòng kiểm tra quyền admin hoặc liên hệ IT.";
      } else if (error.message?.includes("403")) {
        errorMessage += " Bạn không có quyền thực hiện thao tác này.";
      } else if (error.message?.includes("401")) {
        errorMessage += " Token hết hạn. Vui lòng đăng nhập lại.";
      } else if (error.message?.includes("400")) {
        errorMessage += " Dữ liệu không hợp lệ.";
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setCreating(false);
    }
  };

  const handleAddSpec = () => {
    if (specKey.trim() && specValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        specs: {
          ...prev.specs,
          [specKey.trim()]: specValue.trim(),
        },
      }));
      setSpecKey("");
      setSpecValue("");
    }
  };

  const handleRemoveSpec = (key: string) => {
    setFormData((prev) => {
      const newSpecs = { ...prev.specs };
      delete newSpecs[key];
      return {
        ...prev,
        specs: newSpecs,
      };
    });
  };


  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-4 group"
          >
            <svg
              className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Quay lại
          </button>
          <h1 className="text-center text-3xl font-bold">Tạo Sản Phẩm Mới</h1>
          <p className="text-gray-600 mt-2 text-center">
            Điền thông tin chi tiết để thêm sản phẩm vào hệ thống
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Thông tin cơ bản
              </h2>

              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-2.5 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm ${
                    formErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nhập tên sản phẩm"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  className={`w-full px-2.5 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm ${
                    formErrors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Nhập mô tả sản phẩm"
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.description}
                  </p>
                )}
              </div>

              {/* Brand and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thương hiệu <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full px-2.5 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      formErrors.brandId ? "border-red-500" : "border-gray-300"
                    }`}
                    value={formData.brandId}
                    onChange={(e) =>
                      setFormData({ ...formData, brandId: e.target.value })
                    }
                    disabled={loadingBrands}
                  >
                    <option value="">Chọn thương hiệu</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.brandId && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.brandId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full px-2.5 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      formErrors.categoryId
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    disabled={loadingCategories}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.categoryId && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.categoryId}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Specs */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Thông số kỹ thuật
                </h2>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Tên thông số (VD: CPU, RAM)"
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSpec();
                      }
                    }}
                  />
                  <input
                    type="text"
                    className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Giá trị (VD: Apple M3 Pro, 16GB)"
                    value={specValue}
                    onChange={(e) => setSpecValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSpec();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Thêm
                  </button>
                </div>

                {Object.keys(formData.specs || {}).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {Object.entries(formData.specs || {}).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-lg text-sm"
                      >
                        <span className="font-medium">{key}:</span>
                        <span>{value}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(key)}
                          className="text-red-600 hover:text-red-800 ml-2"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>


            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang tạo...
                  </span>
                ) : (
                  "Tạo sản phẩm"
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={creating}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-3 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy bỏ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;

