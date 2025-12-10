"use client";
import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Breadcrumb from "../Common/Breadcrumb";
import CustomSelect from "./CustomSelect";
import CategoryDropdown from "./CategoryDropdown";
import GenderDropdown from "./GenderDropdown";
import ColorsDropdwon from "./ColorsDropdwon";
import ProductGrid from "./ProductGrid";
import Pagination from "./Pagination";
import { useAppSelector } from "@/redux/store";

// Dynamic import PriceDropdown to avoid SSR issues with react-range-slider-input
const PriceDropdown = dynamic(() => import("./PriceDropdown"), {
  ssr: false,
  loading: () => (
    <div className="bg-white shadow-1 rounded-lg py-3 pl-6 pr-5.5">
      <p className="text-dark">Price</p>
    </div>
  ),
});
import { Product, ProductsResponse } from "@/types/Client/Product/Product";
import { BASE_API_PRODUCT_URL } from "@/utils/configAPI";

const ShopWithSidebar = () => {
  const [productStyle, setProductStyle] = useState<"grid" | "list">("grid");
  const [productSidebar, setProductSidebar] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  
  // API states
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  
  // Lấy dữ liệu từ Redux
  const { categories: reduxCategories, loading: categoriesLoading } = useAppSelector((state) => state.category);
  const { brands: reduxBrands, loading: brandsLoading } = useAppSelector((state) => state.brand);

  // Transform categories từ Redux format sang format của CategoryDropdown
  const categories = React.useMemo(() => {
    return reduxCategories.map((cat) => ({
      name: cat.name || cat.displayName,
      products: cat.productCount || 0,
      isRefined: false,
      id: cat.id,
    }));
  }, [reduxCategories]);

  // Transform brands từ Redux format sang format của GenderDropdown
  const brands = React.useMemo(() => {
    return reduxBrands.map((brand) => ({
      name: brand.name,
      products: 0, // Brand service không trả về product count
      id: brand.id,
    }));
  }, [reduxBrands]);
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Single category only
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null); // Single brand only
  const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>({
    min: null,
    max: null,
  });
  
  // Cache for products
  const [productsCache, setProductsCache] = useState<{ [key: string]: Product[] }>({});

  // Build search API URL with filters (mapped to new API endpoint)
  const buildSearchUrl = useCallback((page: number = 1, size: number = 6) => {
    const params = new URLSearchParams();
    params.append('page', String(page - 1));
    params.append('size', String(size));
    
    // name parameter (search term) - only add if has value
    if (searchTerm && searchTerm.trim()) {
      params.append('name', searchTerm.trim());
    }
    
    // category parameter (category name, not ID) - need to get category name from selectedCategory
    // We'll need to find category name from categories array
    if (selectedCategory && categories.length > 0) {
      const category = categories.find(cat => cat.id === selectedCategory);
      if (category?.name) {
        params.append('category', category.name);
      }
    }
    
    // brand parameter (brand name, not ID) - need to get brand name from selectedBrand
    // We'll need to find brand name from brands array
    if (selectedBrand && brands.length > 0) {
      const brand = brands.find(b => b.id === selectedBrand);
      if (brand?.name) {
        params.append('brand', brand.name);
      }
    }
    
    // Price range - only add if set
    if (priceRange.min !== null && priceRange.min !== undefined) {
      params.append('minPrice', String(priceRange.min));
    }
    if (priceRange.max !== null && priceRange.max !== undefined) {
      params.append('maxPrice', String(priceRange.max));
    }
    
    return `${BASE_API_PRODUCT_URL}/api/product/search?${params.toString()}`;
  }, [searchTerm, selectedCategory, selectedBrand, priceRange, categories, brands]);

  // Fetch products from API with search and filters
  const fetchProducts = useCallback(async (page: number = 1) => {
    const cacheKey = `${page}-${searchTerm}-${selectedCategory || 'null'}-${selectedBrand || 'null'}-${priceRange.min}-${priceRange.max}`;
    
    // Check cache first
    if (productsCache[cacheKey]) {
      setProducts(productsCache[cacheKey]);
      setCurrentPage(page);
      return;
    }

    try {
      setLoading(true);
      
      // Build URL safely - only include filters if categories/brands are available when needed
      let url: string;
      if ((selectedCategory && categories.length === 0) || (selectedBrand && brands.length === 0)) {
        // If filter is selected but data not loaded yet, build URL without that filter for now
        const params = new URLSearchParams();
        params.append('page', String(page - 1));
        params.append('size', '6');
        
        if (searchTerm && searchTerm.trim()) {
          params.append('name', searchTerm.trim());
        }
        
        // Only add category if categories are loaded
        if (selectedCategory && categories.length > 0) {
          const category = categories.find(cat => cat.id === selectedCategory);
          if (category?.name) {
            params.append('category', category.name);
          }
        }
        
        // Only add brand if brands are loaded
        if (selectedBrand && brands.length > 0) {
          const brand = brands.find(b => b.id === selectedBrand);
          if (brand?.name) {
            params.append('brand', brand.name);
          }
        }
        
        if (priceRange.min !== null && priceRange.min !== undefined) {
          params.append('minPrice', String(priceRange.min));
        }
        if (priceRange.max !== null && priceRange.max !== undefined) {
          params.append('maxPrice', String(priceRange.max));
        }
        
        url = `${BASE_API_PRODUCT_URL}/api/product/search?${params.toString()}`;
      } else {
        url = buildSearchUrl(page, 6);
      }
      
      console.log("🔍 Fetching products from:", url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error("❌ API Error Response:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: url
        });
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
    
      const data: ProductsResponse = await response.json();
      
      if (data.status.code === "200") {
        const productsList = data.data.content || [];
        console.log("✅ Products found:", productsList.length);
        
        setProducts(productsList);
        setCurrentPage(data.data.current_page || page);
        setTotalPages(data.data.total_pages || 1);
        setTotalElements(data.data.total_elements || 0);
        setHasNext(data.data.has_next || false);
        setHasPrevious(data.data.has_previous || false);
        
        // Cache the products with filter key
        setProductsCache(prev => ({
          ...prev,
          [cacheKey]: productsList
        }));
      } else {
        console.error("❌ API returned error:", data.status);
        setProducts([]);
      }
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [buildSearchUrl, productsCache, searchTerm, selectedCategory, selectedBrand, priceRange, categories, brands]);

  // Prefetch next page
  const prefetchNextPage = useCallback(async (currentPage: number) => {
    const nextPage = currentPage + 1;
    if (nextPage <= totalPages) {
      const cacheKey = `${nextPage}-${searchTerm}-${selectedCategory || 'null'}-${selectedBrand || 'null'}-${priceRange.min}-${priceRange.max}`;
      if (!productsCache[cacheKey]) {
        try {
          const url = buildSearchUrl(nextPage, 6); // 6 products per page
          const response = await fetch(url);
          const data: ProductsResponse = await response.json();
          
          if (data.status.code === "200") {
            setProductsCache(prev => ({
              ...prev,
              [cacheKey]: data.data.content
            }));
          }
        } catch (error) {
          console.error("Error prefetching next page:", error);
        }
      }
    }
  }, [totalPages, productsCache, buildSearchUrl, searchTerm, selectedCategory, selectedBrand, priceRange]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchProducts(page);
      // Prefetch next page after successful load
      setTimeout(() => prefetchNextPage(page), 100);
    }
  };

  const [hasMounted, setHasMounted] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);


  useEffect(() => {
    // Fetch data on mount
    const initializeData = async () => {
      try {
        const params = new URLSearchParams();
        params.append('page', '0');
        params.append('size', '6'); // 6 products per page

        
        const url = `${BASE_API_PRODUCT_URL}/api/product/search?${params.toString()}`;
        console.log("🔍 Initial fetch from:", url);
        
        setLoading(true);
        
        // Fetch với error handling tốt hơn
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error("❌ API Error Response:", {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
            url: url
          });
          // Không throw error, chỉ log và set empty array
          setProducts([]);
          setLoading(false);
          setHasMounted(true);
          setIsInitialLoad(false);
          return;
        }
        
        const data: ProductsResponse = await response.json();
        console.log("📦 Initial products response:", data);
        
        if (data.status && data.status.code === "200" && data.data) {
          const productsList = data.data.content || [];
          console.log("✅ Initial products found:", productsList.length);
          
          setProducts(productsList);
          setCurrentPage(data.data.current_page !== undefined ? data.data.current_page + 1 : 1);
          setTotalPages(data.data.total_pages || 1);
          setTotalElements(data.data.total_elements || 0);
          setHasNext(data.data.has_next || false);
          setHasPrevious(data.data.has_previous || false);
        } else {
          console.error("❌ API returned error:", data.status || data);
          setProducts([]);
        }
      } catch (error: any) {
        console.error("❌ Error fetching initial products:", error);
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        setProducts([]);
      } finally {
        setLoading(false);
        setHasMounted(true);
        setIsInitialLoad(false);
      }
    };
    
    // Đợi một chút để đảm bảo Redux đã hydrate xong
    setTimeout(() => {
      initializeData();
    }, 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount 

  useEffect(() => {
    if (isInitialLoad || !hasMounted) return; 

    const needsCategories = selectedCategory && categories.length === 0;
    const needsBrands = selectedBrand && brands.length === 0;
    
    if (needsCategories || needsBrands) {
      return; // Wait for data to load
    }
    
    setCurrentPage(1);
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, selectedBrand, priceRange.min, priceRange.max, hasMounted, isInitialLoad, categories, brands]);



  const options = [
    { label: "Latest Products", value: "0" },
    { label: "Best Selling", value: "1" },
    { label: "Old Products", value: "2" },
  ];


  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  // Prefetch next page after products load
  useEffect(() => {
    if (currentPage === 1 && products.length > 0) {
      setTimeout(() => prefetchNextPage(1), 500);
    }
  }, [currentPage, products.length, prefetchNextPage]);

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);

    // closing sidebar while clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (!event.target) return;
      if (!(event.target as HTMLElement).closest(".sidebar-content")) {
        setProductSidebar(false);
      }
    }

    if (productSidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  return (
    <>
      <Breadcrumb
        title={"Khám phá tất cả sản phẩm"}
        pages={["shop", "shop with sidebar"]}
      />
      <section className="overflow-hidden relative pb-2 pt-5 lg:pt-3 xl:pt-5 bg-[#f3f4f6]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex gap-7.5">
            {/* <!-- Sidebar Start --> */}
            <div
              className={`sidebar-content fixed xl:z-1 z-9999 left-0 top-0 xl:translate-x-0 xl:static max-w-[310px] xl:max-w-[270px] w-full ease-out duration-200 ${
                productSidebar
                  ? "translate-x-0 bg-white p-5 h-screen overflow-y-auto"
                  : "-translate-x-full"
              }`}
            >
              <button
                onClick={() => setProductSidebar(!productSidebar)}
                aria-label="button for product sidebar toggle"
                className={`xl:hidden absolute -right-12.5 sm:-right-8 flex items-center justify-center w-8 h-8 rounded-md bg-white shadow-1 ${
                  stickyMenu
                    ? "lg:top-20 sm:top-34.5 top-35"
                    : "lg:top-24 sm:top-39 top-37"
                }`}
              >
                <svg
                  className="fill-current"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10.0068 3.44714C10.3121 3.72703 10.3328 4.20146 10.0529 4.5068L5.70494 9.25H20C20.4142 9.25 20.75 9.58579 20.75 10C20.75 10.4142 20.4142 10.75 20 10.75H4.00002C3.70259 10.75 3.43327 10.5742 3.3135 10.302C3.19374 10.0298 3.24617 9.71246 3.44715 9.49321L8.94715 3.49321C9.22704 3.18787 9.70147 3.16724 10.0068 3.44714Z"
                    fill=""
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M20.6865 13.698C20.5668 13.4258 20.2974 13.25 20 13.25L4.00001 13.25C3.5858 13.25 3.25001 13.5858 3.25001 14C3.25001 14.4142 3.5858 14.75 4.00001 14.75L18.2951 14.75L13.9472 19.4932C13.6673 19.7985 13.6879 20.273 13.9932 20.5529C14.2986 20.8328 14.773 20.8121 15.0529 20.5068L20.5529 14.5068C20.7539 14.2876 20.8063 13.9703 20.6865 13.698Z"
                    fill=""
                  />
                </svg>
              </button>

              <form onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-6">
                  {/* <!-- filter box --> */}
                  <div className="bg-white shadow-1 rounded-lg py-4 px-5">
                    <div className="flex items-center justify-between">
                      <p>Filters:</p>
                      <button 
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCategory(null);
                          setSelectedBrand(null);
                          setPriceRange({ min: null, max: null });
                        }}
                        className="text-blue hover:text-blue-700 transition-colors"
                      >
                        Clean All
                      </button>
                    </div>
                  </div>

                  {/* <!-- category box --> */}
                  <CategoryDropdown 
                    categories={categories} 
                    loading={categoriesLoading}
                    selectedCategory={selectedCategory}
                    onCategoryChange={(categoryId: string | null) => setSelectedCategory(categoryId)}
                  />

                  {/* <!-- brand box (using GenderDropdown component) --> */}
                  <GenderDropdown 
                    genders={brands} 
                    loading={brandsLoading}
                    selectedBrand={selectedBrand}
                    onBrandChange={(brandId: string | null) => setSelectedBrand(brandId)}
                  />
                  {/* // <!-- price range box --> */}
                  <PriceDropdown 
                    priceRange={priceRange}
                    onPriceChange={(min: number | null, max: number | null) => setPriceRange({ min, max })}
                  />
                </div>
              </form>
            </div>
            {/* // <!-- Sidebar End --> */}

            {/* // <!-- Content Start --> */}
            <div className="xl:max-w-[870px] w-full">
              {/* Search Bar */}
              <div className="rounded-lg bg-white shadow-1 pl-4 pr-4 py-3 mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Clear search"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
                <div className="flex items-center justify-between">
                  {/* <!-- top bar left --> */}
                  <div className="flex flex-wrap items-center gap-4">
                    <CustomSelect options={options} />

                    <p>
                      Showing <span className="text-dark">
                        {products.length} of {totalElements}
                      </span>{" "}
                      Products
                      {(searchTerm || selectedCategory || selectedBrand || priceRange.min !== null || priceRange.max !== null) && (
                        <span className="text-gray-500 text-sm ml-2">
                          (đã lọc)
                        </span>
                      )}
                    </p>
                  </div>

                  {/* <!-- top bar right --> */}
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setProductStyle("grid")}
                      aria-label="button for product grid tab"
                      className={`${
                        productStyle === "grid"
                          ? "bg-blue border-blue text-white"
                          : "text-dark bg-gray-1 border-gray-3"
                      } flex items-center justify-center w-10.5 h-9 rounded-[5px] border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                    >
                      <svg
                        className="fill-current"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M4.836 1.3125C4.16215 1.31248 3.60022 1.31246 3.15414 1.37244C2.6833 1.43574 2.2582 1.57499 1.91659 1.91659C1.57499 2.2582 1.43574 2.6833 1.37244 3.15414C1.31246 3.60022 1.31248 4.16213 1.3125 4.83598V4.914C1.31248 5.58785 1.31246 6.14978 1.37244 6.59586C1.43574 7.06671 1.57499 7.49181 1.91659 7.83341C2.2582 8.17501 2.6833 8.31427 3.15414 8.37757C3.60022 8.43754 4.16213 8.43752 4.83598 8.4375H4.914C5.58785 8.43752 6.14978 8.43754 6.59586 8.37757C7.06671 8.31427 7.49181 8.17501 7.83341 7.83341C8.17501 7.49181 8.31427 7.06671 8.37757 6.59586C8.43754 6.14978 8.43752 5.58787 8.4375 4.91402V4.83601C8.43752 4.16216 8.43754 3.60022 8.37757 3.15414C8.31427 2.6833 8.17501 2.2582 7.83341 1.91659C7.49181 1.57499 7.06671 1.43574 6.59586 1.37244C6.14978 1.31246 5.58787 1.31248 4.91402 1.3125H4.836ZM2.71209 2.71209C2.80983 2.61435 2.95795 2.53394 3.30405 2.4874C3.66632 2.4387 4.15199 2.4375 4.875 2.4375C5.59801 2.4375 6.08368 2.4387 6.44596 2.4874C6.79205 2.53394 6.94018 2.61435 7.03791 2.71209C7.13565 2.80983 7.21607 2.95795 7.2626 3.30405C7.31131 3.66632 7.3125 4.15199 7.3125 4.875C7.3125 5.59801 7.31131 6.08368 7.2626 6.44596C7.21607 6.79205 7.13565 6.94018 7.03791 7.03791C6.94018 7.13565 6.79205 7.21607 6.44596 7.2626C6.08368 7.31131 5.59801 7.3125 4.875 7.3125C4.15199 7.3125 3.66632 7.31131 3.30405 7.2626C2.95795 7.21607 2.80983 7.13565 2.71209 7.03791C2.61435 6.94018 2.53394 6.79205 2.4874 6.44596C2.4387 6.08368 2.4375 5.59801 2.4375 4.875C2.4375 4.15199 2.4387 3.66632 2.4874 3.30405C2.53394 2.95795 2.61435 2.80983 2.71209 2.71209Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M13.086 9.5625C12.4121 9.56248 11.8502 9.56246 11.4041 9.62244C10.9333 9.68574 10.5082 9.82499 10.1666 10.1666C9.82499 10.5082 9.68574 10.9333 9.62244 11.4041C9.56246 11.8502 9.56248 12.4121 9.5625 13.086V13.164C9.56248 13.8379 9.56246 14.3998 9.62244 14.8459C9.68574 15.3167 9.82499 15.7418 10.1666 16.0834C10.5082 16.425 10.9333 16.5643 11.4041 16.6276C11.8502 16.6875 12.4121 16.6875 13.0859 16.6875H13.164C13.8378 16.6875 14.3998 16.6875 14.8459 16.6276C15.3167 16.5643 15.7418 16.425 16.0834 16.0834C16.425 15.7418 16.5643 15.3167 16.6276 14.8459C16.6875 14.3998 16.6875 13.8379 16.6875 13.1641V13.086C16.6875 12.4122 16.6875 11.8502 16.6276 11.4041C16.5643 10.9333 16.425 10.5082 16.0834 10.1666C15.7418 9.82499 15.3167 9.68574 14.8459 9.62244C14.3998 9.56246 13.8379 9.56248 13.164 9.5625H13.086ZM10.9621 10.9621C11.0598 10.8644 11.208 10.7839 11.554 10.7374C11.9163 10.6887 12.402 10.6875 13.125 10.6875C13.848 10.6875 14.3337 10.6887 14.696 10.7374C15.0421 10.7839 15.1902 10.8644 15.2879 10.9621C15.3857 11.0598 15.4661 11.208 15.5126 11.554C15.5613 11.9163 15.5625 12.402 15.5625 13.125C15.5625 13.848 15.5613 14.3337 15.5126 14.696C15.4661 15.0421 15.3857 15.1902 15.2879 15.2879C15.1902 15.3857 15.0421 15.4661 14.696 15.5126C14.3337 15.5613 13.848 15.5625 13.125 15.5625C12.402 15.5625 11.9163 15.5613 11.554 15.5126C11.208 15.4661 11.0598 15.3857 10.9621 15.2879C10.8644 15.1902 10.7839 15.0421 10.7374 14.696C10.6887 14.3337 10.6875 13.848 10.6875 13.125C10.6875 12.402 10.6887 11.9163 10.7374 11.554C10.7839 11.208 10.8644 11.0598 10.9621 10.9621Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M4.836 9.5625H4.914C5.58786 9.56248 6.14978 9.56246 6.59586 9.62244C7.06671 9.68574 7.49181 9.82499 7.83341 10.1666C8.17501 10.5082 8.31427 10.9333 8.37757 11.4041C8.43754 11.8502 8.43752 12.4121 8.4375 13.086V13.164C8.43752 13.8378 8.43754 14.3998 8.37757 14.8459C8.31427 15.3167 8.17501 15.7418 7.83341 16.0834C7.49181 16.425 7.06671 16.5643 6.59586 16.6276C6.14979 16.6875 5.58789 16.6875 4.91405 16.6875H4.83601C4.16217 16.6875 3.60022 16.6875 3.15414 16.6276C2.6833 16.5643 2.2582 16.425 1.91659 16.0834C1.57499 15.7418 1.43574 15.3167 1.37244 14.8459C1.31246 14.3998 1.31248 13.8379 1.3125 13.164V13.086C1.31248 12.4122 1.31246 11.8502 1.37244 11.4041C1.43574 10.9333 1.57499 10.5082 1.91659 10.1666C2.2582 9.82499 2.6833 9.68574 3.15414 9.62244C3.60023 9.56246 4.16214 9.56248 4.836 9.5625ZM3.30405 10.7374C2.95795 10.7839 2.80983 10.8644 2.71209 10.9621C2.61435 11.0598 2.53394 11.208 2.4874 11.554C2.4387 11.9163 2.4375 12.402 2.4375 13.125C2.4375 13.848 2.4387 14.3337 2.4874 14.696C2.53394 15.0421 2.61435 15.1902 2.71209 15.2879C2.80983 15.3857 2.95795 15.4661 3.30405 15.5126C3.66632 15.5613 4.15199 15.5625 4.875 15.5625C5.59801 15.5625 6.08368 15.5613 6.44596 15.5126C6.79205 15.4661 6.94018 15.3857 7.03791 15.2879C7.13565 15.1902 7.21607 15.0421 7.2626 14.696C7.31131 14.3337 7.3125 13.848 7.3125 13.125C7.3125 12.402 7.31131 11.9163 7.2626 11.554C7.21607 11.208 7.13565 11.0598 7.03791 10.9621C6.94018 10.8644 6.79205 10.7839 6.44596 10.7374C6.08368 10.6887 5.59801 10.6875 4.875 10.6875C4.15199 10.6875 3.66632 10.6887 3.30405 10.7374Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M13.086 1.3125C12.4122 1.31248 11.8502 1.31246 11.4041 1.37244C10.9333 1.43574 10.5082 1.57499 10.1666 1.91659C9.82499 2.2582 9.68574 2.6833 9.62244 3.15414C9.56246 3.60023 9.56248 4.16214 9.5625 4.836V4.914C9.56248 5.58786 9.56246 6.14978 9.62244 6.59586C9.68574 7.06671 9.82499 7.49181 10.1666 7.83341C10.5082 8.17501 10.9333 8.31427 11.4041 8.37757C11.8502 8.43754 12.4121 8.43752 13.086 8.4375H13.164C13.8378 8.43752 14.3998 8.43754 14.8459 8.37757C15.3167 8.31427 15.7418 8.17501 16.0834 7.83341C16.425 7.49181 16.5643 7.06671 16.6276 6.59586C16.6875 6.14978 16.6875 5.58787 16.6875 4.91402V4.83601C16.6875 4.16216 16.6875 3.60022 16.6276 3.15414C16.5643 2.6833 16.425 2.2582 16.0834 1.91659C15.7418 1.57499 15.3167 1.43574 14.8459 1.37244C14.3998 1.31246 13.8379 1.31248 13.164 1.3125H13.086ZM10.9621 2.71209C11.0598 2.61435 11.208 2.53394 11.554 2.4874C11.9163 2.4387 12.402 2.4375 13.125 2.4375C13.848 2.4375 14.3337 2.4387 14.696 2.4874C15.0421 2.53394 15.1902 2.61435 15.2879 2.71209C15.3857 2.80983 15.4661 2.95795 15.5126 3.30405C15.5613 3.66632 15.5625 4.15199 15.5625 4.875C15.5625 5.59801 15.5613 6.08368 15.5126 6.44596C15.4661 6.79205 15.3857 6.94018 15.2879 7.03791C15.1902 7.13565 15.0421 7.21607 14.696 7.2626C14.3337 7.31131 13.848 7.3125 13.125 7.3125C12.402 7.3125 11.9163 7.31131 11.554 7.2626C11.208 7.21607 11.0598 7.13565 10.9621 7.03791C10.8644 6.94018 10.7839 6.79205 10.7374 6.44596C10.6887 6.08368 10.6875 5.59801 10.6875 4.875C10.6875 4.15199 10.6887 3.66632 10.7374 3.30405C10.7839 2.95795 10.8644 2.80983 10.9621 2.71209Z"
                          fill=""
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() => setProductStyle("list")}
                      aria-label="button for product list tab"
                      className={`${
                        productStyle === "list"
                          ? "bg-blue border-blue text-white"
                          : "text-dark bg-gray-1 border-gray-3"
                      } flex items-center justify-center w-10.5 h-9 rounded-[5px] border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                    >
                      <svg
                        className="fill-current"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M4.4234 0.899903C3.74955 0.899882 3.18763 0.899864 2.74155 0.959838C2.2707 1.02314 1.8456 1.16239 1.504 1.504C1.16239 1.8456 1.02314 2.2707 0.959838 2.74155C0.899864 3.18763 0.899882 3.74953 0.899903 4.42338V4.5014C0.899882 5.17525 0.899864 5.73718 0.959838 6.18326C1.02314 6.65411 1.16239 7.07921 1.504 7.42081C1.8456 7.76241 2.2707 7.90167 2.74155 7.96497C3.18763 8.02495 3.74953 8.02493 4.42339 8.02491H4.5014C5.17525 8.02493 14.7372 8.02495 15.1833 7.96497C15.6541 7.90167 16.0792 7.76241 16.4208 7.42081C16.7624 7.07921 16.9017 6.65411 16.965 6.18326C17.0249 5.73718 17.0249 5.17527 17.0249 4.50142V4.42341C17.0249 3.74956 17.0249 3.18763 16.965 2.74155C16.9017 2.2707 16.7624 1.8456 16.4208 1.504C16.0792 1.16239 15.6541 1.02314 15.1833 0.959838C14.7372 0.899864 5.17528 0.899882 4.50142 0.899903H4.4234ZM2.29949 2.29949C2.39723 2.20175 2.54535 2.12134 2.89145 2.07481C3.25373 2.0261 3.7394 2.0249 4.4624 2.0249C5.18541 2.0249 14.6711 2.0261 15.0334 2.07481C15.3795 2.12134 15.5276 2.20175 15.6253 2.29949C15.7231 2.39723 15.8035 2.54535 15.85 2.89145C15.8987 3.25373 15.8999 3.7394 15.8999 4.4624C15.8999 5.18541 15.8987 5.67108 15.85 6.03336C15.8035 6.37946 15.7231 6.52758 15.6253 6.62532C15.5276 6.72305 15.3795 6.80347 15.0334 6.85C14.6711 6.89871 5.18541 6.8999 4.4624 6.8999C3.7394 6.8999 3.25373 6.89871 2.89145 6.85C2.54535 6.80347 2.39723 6.72305 2.29949 6.62532C2.20175 6.52758 2.12134 6.37946 2.07481 6.03336C2.0261 5.67108 2.0249 5.18541 2.0249 4.4624C2.0249 3.7394 2.0261 3.25373 2.07481 2.89145C2.12134 2.54535 2.20175 2.39723 2.29949 2.29949Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M4.4234 9.1499H4.5014C5.17526 9.14988 14.7372 9.14986 15.1833 9.20984C15.6541 9.27314 16.0792 9.41239 16.4208 9.754C16.7624 10.0956 16.9017 10.5207 16.965 10.9915C17.0249 11.4376 17.0249 11.9995 17.0249 12.6734V12.7514C17.0249 13.4253 17.0249 13.9872 16.965 14.4333C16.9017 14.9041 16.7624 15.3292 16.4208 15.6708C16.0792 16.0124 15.6541 16.1517 15.1833 16.215C14.7372 16.2749 5.17529 16.2749 4.50145 16.2749H4.42341C3.74957 16.2749 3.18762 16.2749 2.74155 16.215C2.2707 16.1517 1.8456 16.0124 1.504 15.6708C1.16239 15.3292 1.02314 14.9041 0.959838 14.4333C0.899864 13.9872 0.899882 13.4253 0.899903 12.7514V12.6734C0.899882 11.9996 0.899864 11.4376 0.959838 10.9915C1.02314 10.5207 1.16239 10.0956 1.504 9.754C1.8456 9.41239 2.2707 9.27314 2.74155 9.20984C3.18763 9.14986 3.74955 9.14988 4.4234 9.1499ZM2.89145 10.3248C2.54535 10.3713 2.39723 10.4518 2.29949 10.5495C2.20175 10.6472 2.12134 10.7954 2.07481 11.1414C2.0261 11.5037 2.0249 11.9894 2.0249 12.7124C2.0249 13.4354 2.0261 13.9211 2.07481 14.2834C2.12134 14.6295 2.20175 14.7776 2.29949 14.8753C2.39723 14.9731 2.54535 15.0535 2.89145 15.1C3.25373 15.1487 3.7394 15.1499 4.4624 15.1499C5.18541 15.1499 14.6711 15.1487 15.0334 15.1C15.3795 15.0535 15.5276 14.9731 15.6253 14.8753C15.7231 14.7776 15.8035 14.6295 15.85 14.2834C15.8987 13.9211 15.8999 13.4354 15.8999 12.7124C15.8999 11.9894 15.8987 11.5037 15.85 11.1414C15.8035 10.7954 15.7231 10.6472 15.6253 10.5495C15.5276 10.4518 15.3795 10.3713 15.0334 10.3248C14.6711 10.2761 5.18541 10.2749 4.4624 10.2749C3.7394 10.2749 3.25373 10.2761 2.89145 10.3248Z"
                          fill=""
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* <!-- Products Content Start - Fixed Layout --> */}
              <div className="flex flex-col" style={{ minHeight: '970px' }}>
                <div className="flex-1">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
                    </div>
                  ) : !loading && products.length === 0 ? (
                    <div className="text-center py-12">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="mt-4 text-gray-600">
                        Không tìm thấy sản phẩm nào với bộ lọc hiện tại
                      </p>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCategory(null);
                          setSelectedBrand(null);
                          setPriceRange({ min: null, max: null });
                        }}
                        className="mt-4 text-blue-600 hover:text-blue-800 underline"
                      >
                        Xóa tất cả bộ lọc
                      </button>
                    </div>
                  ) : (
                    <ProductGrid products={products} productStyle={productStyle} />
                  )}
                </div>
                
                {/* Pagination - Fixed at bottom */}
                <div className="mt-8 h-[120px] flex items-center justify-center flex-shrink-0">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    hasNext={hasNext}
                    hasPrevious={hasPrevious}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
              {/* <!-- Products Content End --> */}
            </div>
            {/* // <!-- Content End --> */}
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithSidebar;
