"use client";

import React, { useState, useEffect } from "react";
import { Brand, BrandUpdateRequest } from "../../types/Admin/BrandAPI";
import { BrandService } from "../../services/BrandService";
import { toast } from "react-toastify";
import { Search, Plus, Pencil, Trash2, X, Check, Image as ImageIcon } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Image from "next/image";

const ITEMS_PER_PAGE = 8;

const BrandManagement = () => {
  // Get token from Redux
  const { token } = useSelector((state: RootState) => state.auth);
  
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
  }>({
    name: "",
    slug: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    logoFile?: string;
    slug?: string;
  }>({});

  // Debug: Log token
  useEffect(() => {
    console.log("🔑 BrandManagement - Token:", token ? `${token.substring(0, 30)}...` : "NULL");
  }, [token]);

  // Load brands on mount
  useEffect(() => {
    loadBrands();
  }, []);

  // Filter brands when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBrands(brands);
      setCurrentPage(1);
    } else {
      const filtered = brands.filter((brand) =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBrands(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, brands]);

  // Ensure current page is always in range, especially after filtering
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredBrands.length / ITEMS_PER_PAGE));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredBrands, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredBrands.length / ITEMS_PER_PAGE));
  const startIndex = filteredBrands.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, filteredBrands.length);
  const displayStart = filteredBrands.length === 0 ? 0 : startIndex + 1;
  const displayEnd = filteredBrands.length === 0 ? 0 : endIndex;
  const paginatedBrands = filteredBrands.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const loadBrands = async () => {
    try {
      setLoading(true);
      const data = await BrandService.getAllBrands();
      setBrands(data);
      setFilteredBrands(data);
    } catch (error) {
      toast.error("Không thể tải danh sách thương hiệu!", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setSelectedBrand(null);
    setFormData({
      name: "",
      slug: "",
    });
    setLogoFile(null);
    setLogoPreview(null);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (brand: Brand) => {
    setModalMode("edit");
    setSelectedBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
    });
    setLogoFile(null);
    setLogoPreview(brand.logoUrl);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBrand(null);
    setFormData({
      name: "",
      slug: "",
    });
    setLogoFile(null);
    setLogoPreview(null);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: { name?: string; logoFile?: string; slug?: string } = {};
    const trimmedName = formData.name.trim();
    const trimmedSlug = formData.slug.trim();
    const slugChanged =
      modalMode === "create" ||
      !selectedBrand ||
      trimmedSlug !== selectedBrand.slug;

    if (!trimmedName) {
      errors.name = "Tên thương hiệu không được để trống";
    }

    if (!trimmedSlug) {
      errors.slug = "Slug không được để trống";
    } else if (slugChanged && !/^[a-z0-9-]+$/.test(trimmedSlug)) {
      errors.slug = "Slug chỉ được chứa chữ thường, số và dấu gạch ngang";
    }

    // Chỉ validate file khi tạo mới
    if (modalMode === "create" && !logoFile) {
      errors.logoFile = "Vui lòng chọn file logo";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    const trimmedSlug = formData.slug.trim();

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
      if (modalMode === "create") {
        if (!logoFile) {
          toast.error("Vui lòng chọn file logo!", {
            position: "top-right",
            autoClose: 3000,
          });
          return;
        }
        await BrandService.createBrand(
          {
            name: trimmedName,
            slug: trimmedSlug,
            logoUrl: "",
          },
          logoFile,
          token
        );
        toast.success("Tạo thương hiệu thành công!", {
          position: "top-right",
          autoClose: 2000,
        });
      } else {
        if (!selectedBrand) return;
        const updatePayload: BrandUpdateRequest = {
          name: trimmedName,
          slug: trimmedSlug,
        };

        if (selectedBrand.logoUrl) {
          updatePayload.logoUrl = selectedBrand.logoUrl;
        }

        await BrandService.updateBrand(
          selectedBrand.id,
          updatePayload,
          logoFile ?? undefined,
          token
        );
        toast.success("Cập nhật thương hiệu thành công!", {
          position: "top-right",
          autoClose: 2000,
        });
      }

      handleCloseModal();
      loadBrands(); // Reload danh sách
    } catch (error: any) {
      console.error("❌ Brand operation failed:", error);
      
      // Parse error message to provide better feedback
      let errorMessage = modalMode === "create"
        ? "Tạo thương hiệu thất bại!"
        : "Cập nhật thương hiệu thất bại!";
      
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
    }
  };

  const handleDelete = async (brand: Brand) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa thương hiệu "${brand.name}"?`)) {
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
      await BrandService.deleteBrand(brand.id, token);
      toast.success("Xóa thương hiệu thành công!", {
        position: "top-right",
        autoClose: 2000,
      });
      loadBrands(); // Reload danh sách
    } catch (error: any) {
      console.error("❌ Delete brand failed:", error);
      
      let errorMessage = "Xóa thương hiệu thất bại!";
      
      if (error.message?.includes("500")) {
        errorMessage += " Lỗi server. Vui lòng kiểm tra quyền admin hoặc liên hệ IT.";
      } else if (error.message?.includes("403")) {
        errorMessage += " Bạn không có quyền thực hiện thao tác này.";
      } else if (error.message?.includes("401")) {
        errorMessage += " Token hết hạn. Vui lòng đăng nhập lại.";
      } else if (error.message?.includes("409")) {
        errorMessage += " Thương hiệu đang được sử dụng, không thể xóa.";
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error khi user nhập
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setFormErrors((prev) => ({
          ...prev,
          logoFile: "File phải là hình ảnh",
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors((prev) => ({
          ...prev,
          logoFile: "File không được vượt quá 5MB",
        }));
        return;
      }

      setLogoFile(file);
      setFormErrors((prev) => ({
        ...prev,
        logoFile: undefined,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setFormData((prev) => ({
      ...prev,
      name,
      slug,
    }));

    if (formErrors.name) {
      setFormErrors((prev) => ({
        ...prev,
        name: undefined,
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách thương hiệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản Lý Thương Hiệu</h1>
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Thêm Thương Hiệu</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-300">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc slug..."
            className="pl-9 pr-3 py-2 w-full border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedBrands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            {/* Logo */}
            <div className="flex justify-center mb-4">
              {brand.logoUrl ? (
                <Image
                  src={brand.logoUrl}
                  alt={brand.name}
                  width={80}
                  height={80}
                  className="h-20 w-20 object-contain"
                  unoptimized
                />
              ) : (
                <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-gray-400" />
                </div>
              )}
            </div>

            {/* Brand Info */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{brand.name}</h3>
              <p className="text-sm text-gray-500">{brand.slug}</p>
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => handleOpenEditModal(brand)}
                className="flex items-center space-x-1 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors text-sm"
              >
                <Pencil size={14} />
                <span>Sửa</span>
              </button>
              <button
                onClick={() => handleDelete(brand)}
                className="flex items-center space-x-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
              >
                <Trash2 size={14} />
                <span>Xóa</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {filteredBrands.length > 0 && (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-gray-200 shadow">
          <p className="text-sm text-gray-600">
            Hiển thị {displayStart}-{displayEnd} trên tổng {filteredBrands.length} thương hiệu
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`px-3 py-1 rounded-lg border text-sm transition-colors ${
                  currentPage === pageNumber
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredBrands.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            {searchTerm ? "Không tìm thấy thương hiệu nào!" : "Chưa có thương hiệu nào!"}
          </p>
        </div>
      )}

      {/* Modal Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === "create" ? "Thêm Thương Hiệu Mới" : "Chỉnh Sửa Thương Hiệu"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Thương Hiệu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="VD: Apple, Samsung, Dell..."
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.slug ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="VD: apple, samsung, dell..."
                />
                {formErrors.slug && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.slug}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Tự động tạo từ tên. Chỉ dùng chữ thường, số và dấu gạch ngang.
                </p>
              </div>

              {/* Logo File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.logoFile ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.logoFile && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.logoFile}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Chọn file hình ảnh (JPG, PNG, GIF). Kích thước tối đa: 5MB
                </p>
              </div>

              {/* Logo Preview */}
              {logoPreview && (
                <div className="border border-gray-300 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Xem trước logo:</p>
                  <div className="flex justify-center">
                    <Image
                      src={logoPreview}
                      alt="Logo preview"
                      width={80}
                      height={80}
                      className="h-20 w-20 object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <X size={16} />
                  <span>Hủy</span>
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Check size={16} />
                  <span>{modalMode === "create" ? "Tạo Mới" : "Cập Nhật"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandManagement;

