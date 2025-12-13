"use client";

import React, { useState, useEffect } from "react";
import { Category } from "../../types/Client/Category/Category";
import { CategoryService } from "../../services/CategoryService";
import { toast } from "react-toastify";
import { Search, Folder, FolderTree, Eye, X } from "lucide-react";
import Image from "next/image";

const ITEMS_PER_PAGE = 8;

const getCategoryTypeLabel = (category: Category) => {
  if (category.categoryType) {
    const typeMap: Record<string, string> = {
      ROOT: "Danh mục gốc",
      INTERMEDIATE: "Danh mục trung gian",
      LEAF: "Danh mục lá",
    };
    return typeMap[category.categoryType] || category.categoryType;
  }

  if (category.rootCategory) return "Danh mục gốc";
  if (category.leafCategory) return "Danh mục lá";
  return "Danh mục trung gian";
};

const getCategoryStatusLabel = (category: Category) => {
  if (category.leafCategory) return "Danh mục lá";
  if (category.childrenCount > 0) return `Có danh mục con (${category.childrenCount})`;
  return "Không có danh mục con";
};

const getParentLabel = (category: Category) => {
  if (category.parentName) return category.parentName;
  return "Không (Danh mục gốc)";
};

const sortCategoriesHierarchically = (categories: Category[]) => {
  const byParent = new Map<string | null, Category[]>();

  categories.forEach((category) => {
    const key = category.parentId ?? null;
    const existing = byParent.get(key);
    if (existing) {
      existing.push(category);
    } else {
      byParent.set(key, [category]);
    }
  });

  const sortGroup = (group: Category[]) =>
    group.sort((a, b) =>
      (a.displayName || a.name).localeCompare(b.displayName || b.name, undefined, { sensitivity: "base" })
    );

  const result: Category[] = [];
  const visited = new Set<string>();

  const traverse = (parentId: string | null) => {
    const group = byParent.get(parentId);
    if (!group) return;

    sortGroup(group);
    group.forEach((category) => {
      if (visited.has(category.id)) return;

      visited.add(category.id);
      result.push(category);
      traverse(category.id);
    });
  };

  traverse(null);

  const remaining = categories
    .filter((category) => !visited.has(category.id))
    .sort((a, b) =>
      (a.displayName || a.name).localeCompare(b.displayName || b.name, undefined, { sensitivity: "base" })
    );

  return [...result, ...remaining];
};

const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Filter categories when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCategories(categories);
      setCurrentPage(1);
    } else {
      const filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(sortCategoriesHierarchically(filtered));
      setCurrentPage(1);
    }
  }, [searchTerm, categories]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredCategories.length / ITEMS_PER_PAGE));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredCategories, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / ITEMS_PER_PAGE));
  const startIndex = filteredCategories.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, filteredCategories.length);
  const displayStart = filteredCategories.length === 0 ? 0 : startIndex + 1;
  const displayEnd = filteredCategories.length === 0 ? 0 : endIndex;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await CategoryService.getAllCategories();
      const sorted = sortCategoriesHierarchically(data);
      setCategories(sorted);
      setFilteredCategories(sorted);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Không thể tải danh sách danh mục!", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim() === "") {
      loadCategories();
      return;
    }

    try {
      setLoading(true);
      const data = await CategoryService.searchCategoryByName(searchTerm);
      setFilteredCategories(sortCategoriesHierarchically(data));
      setCurrentPage(1);
    } catch (error) {
      toast.error("Không thể tìm kiếm danh mục!", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Ví dụ sử dụng getCategoryById - Mở modal và lấy chi tiết category
  const handleViewDetail = async (categoryId: string) => {
    try {
      setLoadingDetail(true);
      setIsDetailModalOpen(true);
      
      // Sử dụng getCategoryById để lấy chi tiết category
      const categoryDetail = await CategoryService.getCategoryById(categoryId);
      setSelectedCategory(categoryDetail);
      
      toast.success("Đã tải chi tiết danh mục!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Error fetching category detail:", error);
      toast.error("Không thể tải chi tiết danh mục!", {
        position: "top-right",
        autoClose: 3000,
      });
      setIsDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCategory(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách danh mục...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản Lý Danh Mục</h1>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-300">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên danh mục..."
              className="pl-9 pr-3 py-2 w-full border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearchKeyPress}
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 text-sm"
          >
            <Search size={18} />
            <span>Tìm kiếm</span>
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedCategories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            {/* Category Icon */}
            <div className="flex justify-center mb-4">
              {category.imageUrl ? (
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  width={80}
                  height={80}
                  className="h-20 w-20 object-contain"
                  unoptimized
                />
              ) : (
                <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  {category.hasChildren ? (
                    <FolderTree className="h-10 w-10 text-gray-400" />
                  ) : (
                    <Folder className="h-10 w-10 text-gray-400" />
                  )}
                </div>
              )}
            </div>

            {/* Category Info */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {category.displayName || category.name}
              </h3>
              <p className="text-sm text-gray-500 mb-3">{category.slug}</p>

              {/* Category Details */}
              <div className="text-xs text-gray-600 space-y-1">
                <p className="flex justify-center items-center gap-1">
                  <span className="font-medium">Loại danh mục:</span>
                  <span>{getCategoryTypeLabel(category)}</span>
                </p>
                <p className="flex justify-center items-center gap-1">
                  <span className="font-medium">Cấp độ:</span>
                  <span>{category.hierarchyLevel ?? "N/A"}</span>
                </p>
                <p className="flex justify-center items-center gap-1">
                  <span className="font-medium">Danh mục cha:</span>
                  <span>{getParentLabel(category)}</span>
                </p>
                <p className="flex justify-center items-center gap-1">
                  <span className="font-medium">Trạng thái:</span>
                  <span className="font-semibold text-gray-900">{getCategoryStatusLabel(category)}</span>
                </p>
              </div>
            </div>

            {/* Category Type Badge */}
            <div className="flex justify-center mb-2">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  category.rootCategory
                    ? "bg-blue-100 text-blue-800"
                    : category.leafCategory
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {category.rootCategory ? "Danh mục gốc" : category.leafCategory ? "Danh mục lá" : "Danh mục trung gian"}
              </span>
            </div>

            {/* View Detail Button */}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => handleViewDetail(category.id)}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 text-sm"
              >
                <Eye size={16} />
                <span>Xem chi tiết</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {filteredCategories.length > 0 && (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-gray-200 shadow">
          <p className="text-sm text-gray-600">
            Hiển thị {displayStart}-{displayEnd} trên tổng {filteredCategories.length} danh mục
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
      {filteredCategories.length === 0 && (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl bg-white">
          <p className="text-gray-600 text-lg">
            {searchTerm ? "Không tìm thấy danh mục nào!" : "Chưa có danh mục nào!"}
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Chi tiết Danh mục
              </h2>
              <button
                onClick={handleCloseDetailModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {loadingDetail ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải chi tiết...</p>
                  </div>
                </div>
              ) : selectedCategory ? (
                <div className="space-y-4">
                  {/* Category Image */}
                  {selectedCategory.imageUrl && (
                    <div className="flex justify-center mb-4">
                      <Image
                        src={selectedCategory.imageUrl}
                        alt={selectedCategory.name}
                        width={128}
                        height={128}
                        className="h-32 w-32 object-contain border border-gray-200 rounded-lg"
                        unoptimized
                      />
                    </div>
                  )}

                  {/* Category Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">ID</p>
                      <p className="text-sm font-medium text-gray-900">{selectedCategory.id}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Tên</p>
                      <p className="text-sm font-medium text-gray-900">{selectedCategory.name}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Tên hiển thị</p>
                      <p className="text-sm font-medium text-gray-900">{selectedCategory.displayName}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Slug</p>
                      <p className="text-sm font-medium text-gray-900">{selectedCategory.slug}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Loại danh mục</p>
                      <p className="text-sm font-medium text-gray-900">{selectedCategory.categoryType}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Cấp độ</p>
                      <p className="text-sm font-medium text-gray-900">{selectedCategory.hierarchyLevel}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Số sản phẩm</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedCategory.productCount !== null ? selectedCategory.productCount : "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Số danh mục con</p>
                      <p className="text-sm font-medium text-gray-900">{selectedCategory.childrenCount}</p>
                    </div>
                    {selectedCategory.parentName && (
                      <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Danh mục cha</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedCategory.parentName} ({selectedCategory.parentSlug})
                        </p>
                      </div>
                    )}
                    <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Đường dẫn đầy đủ</p>
                      <p className="text-sm font-medium text-gray-900">{selectedCategory.fullPath}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Danh mục gốc</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedCategory.rootCategory ? "Có" : "Không"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Danh mục lá</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedCategory.leafCategory ? "Có" : "Không"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Có danh mục con</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedCategory.hasChildren ? "Có" : "Không"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedCategory.isActive !== null ? (selectedCategory.isActive ? "Hoạt động" : "Không hoạt động") : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={handleCloseDetailModal}
                className="px-2.5 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            {searchTerm ? "Không tìm thấy danh mục nào!" : "Chưa có danh mục nào!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;

