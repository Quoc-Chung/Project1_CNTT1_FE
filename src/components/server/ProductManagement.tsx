"use client"
import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  Eye,
  ArrowUpDown,
} from "lucide-react";
import { Product as AdminProduct, ProductDetail, SortConfig } from "@/types/Admin";
import { Product } from "@/types/Admin/ProductAPI";
import { ProductService } from "@/services/ProductService";
import { CategoryService } from "@/services/CategoryService";
import { BrandService } from "@/services/BrandService";
import { Category } from "@/types/Client/Category/Category";
import { Brand } from "@/types/Admin/BrandAPI";
import { formatPrice } from '../../utils/helpers';
import Image from "next/image";
import { ProductDetails } from "./ProductDetails"; 
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const API_BASE_URL = "http://103.90.225.90:8080/services/product-service/api";

// Component riêng để xử lý image với error handling
const ProductImageCell: React.FC<{ product: Product }> = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!product.thumbnailUrl) {
    return (
      <div className="w-14 h-10 bg-gray-200 rounded-md flex items-center justify-center">
        <span className="text-xs text-gray-400">N/A</span>
      </div>
    );
  }

  if (imageError) {
    return (
      <div className="w-14 h-10 bg-gray-200 rounded-md flex items-center justify-center">
        <span className="text-xs text-gray-400">N/A</span>
      </div>
    );
  }

  return (
    <div className="relative w-14 h-10">
      {!imageLoaded && (
        <div className="absolute inset-0 w-14 h-10 bg-gray-200 rounded-md flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <Image
        src={product.thumbnailUrl}
        alt={product.name}
        width={56}
        height={40}
        className={`object-cover rounded-md ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity`}
        style={{ width: "auto", height: "auto" }}
        onError={() => {
          setImageError(true);
          setImageLoaded(false);
        }}
        onLoad={() => {
          setImageLoaded(true);
        }}
        unoptimized
      />
    </div>
  );
};

const ProductManagement: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Lưu tất cả products để filter
  const [products, setProducts] = useState<Product[]>([]); // Products hiển thị sau khi filter
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  
  // Dropdown data
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [loadingBrands, setLoadingBrands] = useState<boolean>(false);
  
  const router = useRouter();

  // Phân trang từ API
  const [currentPage, setCurrentPage] = useState<number>(0); 
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrevious, setHasPrevious] = useState<boolean>(false);
  const itemsPerPage = 20;

  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "",
    direction: "asc",
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Load categories
  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await CategoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Không thể tải danh mục!", {
        position: "top-right",
        autoClose: 2000,
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  // Load brands
  const loadBrands = async () => {
    try {
      setLoadingBrands(true);
      const data = await BrandService.getAllBrands();
      setBrands(data);
    } catch (error) {
      console.error("Error loading brands:", error);
      toast.error("Không thể tải thương hiệu!", {
        position: "top-right",
        autoClose: 2000,
      });
    } finally {
      setLoadingBrands(false);
    }
  };

  // Load tất cả products một lần (không filter)
  const loadAllProducts = async () => {
    try {
      setLoading(true);
      const allProductsList: Product[] = [];
      let currentPageLoad = 0;
      let hasMore = true;

      // Load tất cả pages
      while (hasMore) {
        const url = `${API_BASE_URL}/product?page=${currentPageLoad}&size=100`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status.code !== "200") {
          throw new Error(data.status.message || "Failed to fetch products");
        }

        allProductsList.push(...data.data.content);
        
        hasMore = data.data.has_next;
        currentPageLoad++;
        
        // Giới hạn tối đa 10 pages để tránh load quá nhiều
        if (currentPageLoad >= 10) break;
      }

      setAllProducts(allProductsList);
      console.log('✅ Loaded all products:', allProductsList.length);
    } catch (error) {
      console.error('❌ Error loading all products:', error);
      toast.error("Không thể tải danh sách sản phẩm!", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter và phân trang products
  useEffect(() => {
    if (allProducts.length === 0) return;

    let filtered = [...allProducts];

    // Filter theo search term (nếu có)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((product: Product) =>
        product.name.toLowerCase().includes(searchLower) ||
        product.brandName?.toLowerCase().includes(searchLower) ||
        product.categoryName?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
      console.log('✅ Filtered by search:', searchTerm, '→', filtered.length, 'products');
    }

    // Filter theo category
    if (selectedCategory) {
      const category = categories.find(cat => cat.id === selectedCategory);
      const categoryName = category ? category.name : selectedCategory;
      filtered = filtered.filter((product: Product) => 
        product.categoryName === categoryName
      );
      console.log('✅ Filtered by category:', categoryName, '→', filtered.length, 'products');
    }
    
    // Filter theo brand
    if (selectedBrand) {
      const brand = brands.find(b => b.id === selectedBrand);
      const brandName = brand ? brand.name : selectedBrand;
      filtered = filtered.filter((product: Product) => 
        product.brandName === brandName
      );
      console.log('✅ Filtered by brand:', brandName, '→', filtered.length, 'products');
    }

    // Phân trang
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filtered.slice(startIndex, endIndex);
    
    setProducts(paginatedProducts);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage) || 1);
    setTotalElements(filtered.length);
    setHasNext(endIndex < filtered.length);
    setHasPrevious(currentPage > 0);
    
    console.log('📦 Final result:', {
      total: filtered.length,
      showing: paginatedProducts.length,
      page: currentPage + 1,
      totalPages: Math.ceil(filtered.length / itemsPerPage) || 1
    });
  }, [allProducts, selectedCategory, selectedBrand, currentPage, categories, brands, itemsPerPage, searchTerm]);

  useEffect(() => {
    loadCategories();
    loadBrands();
    loadAllProducts();
  }, []);

  const handleSearch = () => {
    // Reset về trang đầu khi search
    setCurrentPage(0);
    // Filter sẽ được xử lý tự động qua useEffect với searchTerm
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Client-side filtering (price only, category and brand are filtered by API)
  const filteredProducts = products.filter((product) => {
    const matchesPrice =
      (!priceRange.min || product.price >= parseInt(priceRange.min)) &&
      (!priceRange.max || product.price <= parseInt(priceRange.max));

    return matchesPrice;
  });

  // --- Sắp xếp ---
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortConfig.field) return 0;
    let aValue: any = a[sortConfig.field as keyof Product];
    let bValue: any = b[sortConfig.field as keyof Product];
    if (typeof aValue === "string") aValue = aValue.toLowerCase();
    if (typeof bValue === "string") bValue = bValue.toLowerCase();

    if (sortConfig.direction === "asc") {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  // Display products (already paginated from API, but we show filtered/sorted results)
  const displayProducts = sortedProducts;

  const handleSort = (field: string) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedBrand("");
    setPriceRange({ min: "", max: "" });
    setSortConfig({ field: "", direction: "asc" });
    setCurrentPage(0);
    // Filter sẽ được xử lý tự động qua useEffect
  };

  // --- Hàm chuyển sang Product Detail ---
  const handleViewProductDetails = async (product: Product) => {
    try {
      setLoadingDetail(true);
      // Lấy chi tiết sản phẩm từ API
      const productDetail = await ProductService.getProductById(product.id);
      
      // Lưu trực tiếp Product từ API
      setSelectedProduct(productDetail);
      toast.success("Đã tải chi tiết sản phẩm!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Error fetching product detail:", error);
      toast.error("Không thể tải chi tiết sản phẩm!", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  // --- Pagination handlers ---
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (hasPrevious) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNext) {
      setCurrentPage(currentPage + 1);
    }
  };

  // --- Pagination render ---
  const renderPagination = () => {
    const pages = [];
    // API sử dụng page từ 0, nhưng UI hiển thị từ 1
    const displayPage = currentPage + 1;
    
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i - 1)} // Convert to 0-based
          className={`px-2.5 py-1.5 min-w-[36px] rounded-lg text-sm font-semibold transition-all duration-200 ${
            displayPage === i
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50 scale-105"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md"
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };


  // --- Nếu đang xem chi tiết sản phẩm ---
  if (selectedProduct) {
    // Convert Product (from API) to ProductDetail (for ProductDetails component)
    const productDetail: ProductDetail = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      description: selectedProduct.description || "",
      brandId: selectedProduct.brandName || "", // Use brandName as brandId for display
      categoryId: selectedProduct.categoryName || "", // Use categoryName as categoryId for display
      specs: selectedProduct.specs || {},
    };

    
    return (
      <ProductDetails
        product={productDetail}
        brandName={selectedProduct.brandName}
        categoryName={selectedProduct.categoryName}
        price={selectedProduct.price}
        thumbnailUrl={selectedProduct.thumbnailUrl}
        brands={[
          { id: "1", name: "Apple" },
          { id: "2", name: "Dell" },
          { id: "3", name: "ASUS" },
        ]}
        categories={[
          { id: "1", name: "Laptop cao cấp" },
          { id: "2", name: "Laptop văn phòng" },
        ]}
        onSave={(updatedProduct) => {
          console.log("Updated product:", updatedProduct);
          setSelectedProduct(null); // quay lại danh sách
        }}
        onCancel={() => setSelectedProduct(null)}
      />
    );
  }
  const handleAddProduct = () =>{
     router.push("/admin-app/products/create")
  }

  // --- Giao diện danh sách sản phẩm ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Quản Lý Sản Phẩm
        </h2>
        <button 

        onClick={handleAddProduct}
        className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-md flex items-center space-x-2 transition-colors shadow-sm text-sm">
          <Plus size={16} />
          <span>Thêm Sản Phẩm</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-300">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-2 top-2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, thương hiệu..."
              className="pl-8 pr-2 py-1.5 w-full border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearchKeyPress}
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center space-x-2 text-sm"
          >
            <Search size={16} />
            <span>Tìm kiếm</span>
          </button>

          <select
            className="px-2 py-1.5 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(0); // Reset về trang đầu khi filter
            }}
            disabled={loadingCategories}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            className="px-2 py-1.5 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setCurrentPage(0); // Reset về trang đầu khi filter
            }}
            disabled={loadingBrands}
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>

          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Giá từ"
              className="px-2 py-1.5 border border-gray-400 rounded-lg w-full focus:ring-2 focus:ring-blue-500 text-sm text-gray-800"
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange({ ...priceRange, min: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Đến"
              className="px-2 py-1.5 border border-gray-400 rounded-lg w-full focus:ring-2 focus:ring-blue-500 text-sm text-gray-800"
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange({ ...priceRange, max: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-300">
          <span>Tìm thấy {displayProducts.length} sản phẩm / Tổng {totalElements} sản phẩm</span>
          <button
            onClick={clearFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md text-sm"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[475px]">
        {loading ? (
          <div className="flex items-center justify-center min-h-[475px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải danh sách sản phẩm...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="w-20 px-4 py-3 text-left text-sm font-bold text-gray-900">
                      ID
                    </th>
                    <th className="w-24 px-4 py-3 text-left text-sm font-bold text-gray-900">
                      Ảnh
                    </th>
                    <th
                      className="w-1/4 px-4 py-3 text-left text-sm font-bold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Tên</span>
                        <ArrowUpDown size={14} />
                      </div>
                    </th>
                    <th className="w-32 px-4 py-3 text-left text-sm font-bold text-gray-900">
                      Thương Hiệu
                    </th>
                    <th className="w-32 px-4 py-3 text-left text-sm font-bold text-gray-900">
                      Danh Mục
                    </th>
                    <th
                      className="w-28 px-4 py-3 text-left text-sm font-bold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("price")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Giá</span>
                        <ArrowUpDown size={14} />
                      </div>
                    </th>
                    <th className="w-28 px-4 py-3 text-left text-sm font-bold text-gray-900">
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayProducts.length > 0 ? (
                    displayProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 truncate">
                          {product.id.substring(0, 8)}...
                        </td>
                        <td className="px-4 py-3">
                          <ProductImageCell product={product} />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {product.brandName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {product.categoryName}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-red-600">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Xem chi tiết"
                              onClick={() => handleViewProductDetails(product)}
                              disabled={loadingDetail}
                            >
                              {loadingDetail ? (
                                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              title="Xóa"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-6 text-center text-sm text-gray-500"
                      >
                        Không có sản phẩm nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 -mt-2 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 flex justify-between items-center shadow-sm">
              <p className="text-sm font-medium text-gray-700">
                <span className="font-semibold text-gray-900">Trang {currentPage + 1}/{totalPages || 1}</span>
                <span className="mx-2 text-gray-400">•</span>
                <span>Tổng {totalElements} sản phẩm</span>
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={!hasPrevious}
                  className="px-2.5 py-1.5 rounded-lg text-sm font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none"
                >
                  Trước
                </button>
                <div className="flex items-center space-x-1.5">
                  {renderPagination()}
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={!hasNext}
                  className="px-2.5 py-1.5 rounded-lg text-sm font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none"
                >
                  Sau
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
