"use client";
import React, { useState, useEffect } from "react";
import { Plus, Eye, Pencil, Trash2, Search, Filter, X } from "lucide-react";
import { SKUService } from "@/services/SKUService";
import { ProductService } from "@/services/ProductService";
import { CategoryService } from "@/services/CategoryService";
import { SKU, SKUCreateRequest, SKUUpdateRequest } from "@/types/Admin/SKUAPI";
import { Product } from "@/types/Admin/ProductAPI";
import { Category } from "@/types/Client/Category/Category";
import { formatPrice } from "@/utils/helpers";
import { toast } from "react-toastify";
import SKUDetailDialog from "./SKUDetailDialog";
import CreateEditSKUDialog from "./CreateEditSKUDialog";

const ITEMS_PER_PAGE = 10;

export const SKUManagement: React.FC = () => {
  const [skus, setSkus] = useState<SKU[]>([]);
  const [filteredSkus, setFilteredSkus] = useState<SKU[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  
  // Dropdown data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  
  // Dialog states
  const [selectedSKU, setSelectedSKU] = useState<SKU | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState<boolean>(false);
  const [isCreateEditDialogOpen, setIsCreateEditDialogOpen] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingSKU, setEditingSKU] = useState<SKU | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load all SKUs
  const loadSKUs = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading SKUs from API...');
      const data = await SKUService.getAllSKUs();
      console.log('✅ Loaded SKUs:', data.length, 'items');
      setSkus(data);
      
      // Apply current filters after loading
      if (selectedProductId) {
        console.log('🔍 Applying product filter:', selectedProductId);
        const filtered = await SKUService.getSKUsByProductId(selectedProductId);
        setFilteredSkus(filtered);
      } else if (selectedCategoryId) {
        console.log('🔍 Applying category filter:', selectedCategoryId);
        const filtered = await SKUService.getSKUsByCategoryId(selectedCategoryId);
        setFilteredSkus(filtered);
      } else {
        // Apply search filter if exists
        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase().trim();
          const filtered = data.filter(sku =>
            sku.skuCode?.toLowerCase().includes(searchLower) ||
            sku.barcode?.toLowerCase().includes(searchLower) ||
            sku.id.toLowerCase().includes(searchLower)
          );
          setFilteredSkus(filtered);
        } else {
          setFilteredSkus(data);
        }
      }
    } catch (error: any) {
      console.error('❌ Error loading SKUs:', error);
      toast.error(error.message || 'Không thể tải danh sách mã hàng');
      setSkus([]);
      setFilteredSkus([]);
    } finally {
      setLoading(false);
    }
  };

  // Load all products for dropdown
  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const allProducts: Product[] = [];
      let page = 0;
      let hasMore = true;

      while (hasMore) {
        const result = await ProductService.getAllProducts(page, 100);
        allProducts.push(...result.products);
        hasMore = result.hasNext;
        page++;
      }

      setProducts(allProducts);
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Load all categories for dropdown
  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await CategoryService.getAllCategories();
      setCategories(data);
    } catch (error: any) {
      console.error('Error loading categories:', error);
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Filter SKUs
  const applyFilters = async () => {
    try {
      setLoading(true);
      let filtered: SKU[] = [];

      // If product filter is selected, fetch SKUs by product
      if (selectedProductId) {
        console.log('🔍 Filtering by product ID:', selectedProductId);
        filtered = await SKUService.getSKUsByProductId(selectedProductId);
        console.log('✅ Found', filtered.length, 'SKUs for product');
      }
      // If category filter is selected, fetch SKUs by category
      else if (selectedCategoryId) {
        console.log('🔍 Filtering by category ID:', selectedCategoryId);
        filtered = await SKUService.getSKUsByCategoryId(selectedCategoryId);
        console.log('✅ Found', filtered.length, 'SKUs for category');
      }
      // Otherwise, use all SKUs from state
      else {
        filtered = [...skus];
        console.log('📦 Using all SKUs:', filtered.length);
      }

      // Apply search filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        const beforeSearch = filtered.length;
        filtered = filtered.filter(sku =>
          sku.skuCode?.toLowerCase().includes(searchLower) ||
          sku.barcode?.toLowerCase().includes(searchLower) ||
          sku.id.toLowerCase().includes(searchLower)
        );
        console.log(`🔎 Search "${searchTerm}": ${beforeSearch} → ${filtered.length} SKUs`);
      }

      setFilteredSkus(filtered);
      setCurrentPage(1);
    } catch (error: any) {
      console.error('Error filtering SKUs:', error);
      toast.error(error.message || 'Không thể lọc mã hàng');
      // Fallback to all SKUs on error
      setFilteredSkus([...skus]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadSKUs();
    loadProducts();
    loadCategories();
  }, []);

  // Apply filters when filter states change (but wait for initial load)
  useEffect(() => {
    // Only apply filters after initial SKUs are loaded
    if (skus.length > 0 || selectedProductId || selectedCategoryId) {
      applyFilters();
    } else if (!loading && skus.length === 0 && !selectedProductId && !selectedCategoryId) {
      // If no filters and no SKUs loaded, ensure filteredSkus is empty
      setFilteredSkus([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId, selectedCategoryId, searchTerm]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSkus.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedSkus = filteredSkus.slice(startIndex, endIndex);

  // Handle view detail
  const handleViewDetail = async (sku: SKU) => {
    try {
      setLoading(true);
      const detail = await SKUService.getSKUById(sku.id);
      setSelectedSKU(detail);
      setIsDetailDialogOpen(true);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải chi tiết SKU');
    } finally {
      setLoading(false);
    }
  };

  // Handle create
  const handleCreate = () => {
    setDialogMode("create");
    setEditingSKU(null);
    setIsCreateEditDialogOpen(true);
  };

  // Handle edit
  const handleEdit = (sku: SKU) => {
    setDialogMode("edit");
    setEditingSKU(sku);
    setIsCreateEditDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mã hàng này?')) {
      return;
    }

    try {
      setDeletingId(id);
      await SKUService.deleteSKU(id);
      toast.success('Xóa mã hàng thành công');
      await loadSKUs();
      await applyFilters();
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa mã hàng');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle save (create or update)
  const handleSave = async () => {
    await loadSKUs();
    await applyFilters();
    setIsCreateEditDialogOpen(false);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedProductId("");
    setSelectedCategoryId("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Quản Lý Mã Hàng</h2>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Plus size={16} />
          <span>Tạo Mã Hàng Mới</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm mã hàng, barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Product Filter */}
          <select
            value={selectedProductId}
            onChange={(e) => {
              setSelectedProductId(e.target.value);
              setSelectedCategoryId(""); // Clear category when product is selected
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
            disabled={loadingProducts}
          >
            <option value="">Tất cả sản phẩm</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategoryId}
            onChange={(e) => {
              setSelectedCategoryId(e.target.value);
              setSelectedProductId(""); // Clear product when category is selected
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
            disabled={loadingCategories}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.displayName || category.name}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {(searchTerm || selectedProductId || selectedCategoryId) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center space-x-1.5 transition-colors text-gray-700 font-medium"
            >
              <X size={16} />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : paginatedSkus.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-sm">Không có mã hàng nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Mã Hàng</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Giá</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Giá giảm</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tồn kho</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Barcode</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {paginatedSkus.map((sku, index) => (
                    <tr
                      key={sku.id}
                      className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {sku.skuCode || <span className="text-gray-400 italic">N/A</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs text-gray-600 font-mono">{sku.productId.substring(0, 8)}...</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatPrice(sku.price)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {sku.discountPrice ? (
                            <span className="text-orange-600 font-medium">{formatPrice(sku.discountPrice)}</span>
                          ) : (
                            <span className="text-gray-400 italic">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                          sku.stock > 10 
                            ? 'bg-green-100 text-green-700' 
                            : sku.stock > 0 
                            ? 'bg-orange-100 text-orange-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {sku.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs text-gray-600 font-mono">
                          {sku.barcode || <span className="text-gray-400 italic">N/A</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          sku.isActive
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {sku.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => handleViewDetail(sku)}
                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(sku)}
                            className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                            title="Sửa"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(sku.id)}
                            disabled={deletingId === sku.id}
                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-700">
                  Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredSkus.length)} / {filteredSkus.length} mã hàng
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Trước
                  </button>
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-lg ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Dialog */}
      {selectedSKU && (
        <SKUDetailDialog
          sku={selectedSKU}
          isOpen={isDetailDialogOpen}
          onClose={() => {
            setIsDetailDialogOpen(false);
            setSelectedSKU(null);
          }}
        />
      )}

      {/* Create/Edit Dialog */}
      <CreateEditSKUDialog
        isOpen={isCreateEditDialogOpen}
        mode={dialogMode}
        sku={editingSKU}
        products={products}
        onClose={() => {
          setIsCreateEditDialogOpen(false);
          setEditingSKU(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
};

