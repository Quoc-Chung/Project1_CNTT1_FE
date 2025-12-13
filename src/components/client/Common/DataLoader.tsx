"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchBrandsAction } from "@/redux/Client/Brand/Action";
import { fetchCategoriesAction } from "@/redux/Client/Category/Action";

const CACHE_DURATION = 5 * 60 * 1000;
const DataLoader = () => {
  const dispatch = useAppDispatch();
  const { brands, lastFetched: brandsLastFetched } = useAppSelector((state) => state.brand);
  const { categories, lastFetched: categoriesLastFetched } = useAppSelector((state) => state.category);

  useEffect(() => {
    // Chỉ load trên client side
    if (typeof window === 'undefined') return;

    // Đợi một chút để đảm bảo Redux đã hydrate xong
    const timer = setTimeout(() => {
      const now = Date.now();
      const shouldFetchBrands = brands.length === 0 || 
        !brandsLastFetched || (now - brandsLastFetched) > CACHE_DURATION;
      
      const shouldFetchCategories = categories.length === 0 || 
        !categoriesLastFetched || (now - categoriesLastFetched) > CACHE_DURATION;

      if (shouldFetchBrands) {
        dispatch(fetchBrandsAction(
          undefined,
          (error) => console.error("Failed to fetch brands:", error)
        ));
      }
      
      if (shouldFetchCategories) {
        dispatch(fetchCategoriesAction(
          undefined,
          (error) => console.error("Failed to fetch categories:", error)
        ));
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [brandsLastFetched, categoriesLastFetched, dispatch]); 
  // Loại bỏ brands.length và categories.length khỏi dependencies
  // Chỉ trigger khi lastFetched thay đổi (khi cache hết hạn) hoặc khi dispatch thay đổi
  return null;
};

export default DataLoader;

