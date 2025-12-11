"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { useCallback, useRef, useEffect, useState } from "react";
import { Category } from "@/types/Client/Category/Category";
import Image from "next/image";
import { CategoryService } from "@/services/CategoryService";

// Import Swiper styles
import "swiper/css/navigation";
import "swiper/css";
import SingleItem from "./SingleItem";

const Categories = () => {
  const sliderRef = useRef<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current?.swiper) return;
    sliderRef.current.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current?.swiper) return;
    sliderRef.current.swiper.slideNext();
  }, []);

  // Fetch categories from API using CategoryService
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CategoryService.getAllCategories();
      console.log('📦 All categories from API:', data);
      // Filter only root categories (rootCategory: true)
      const rootCategories = data.filter(category => category.rootCategory === true);
      console.log('✅ Root categories filtered:', rootCategories);
      console.log('🖼️ Root categories with imageUrl:', rootCategories.map(cat => ({
        name: cat.displayName,
        imageUrl: cat.imageUrl,
        hasImage: !!cat.imageUrl,
        imageUrlType: typeof cat.imageUrl
      })));
      setCategories(rootCategories);
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      setError(err.message);
      // Fallback to static data if API fails
      setCategories([
        {
          id: "1",
          name: "Televisions",
          slug: "televisions",
          parentId: null,
          parentName: null,
          parentSlug: null,
          childrenCount: 0,
          hasChildren: false,
          children: null,
          hierarchyLevel: 1,
          categoryType: "ROOT",
          productCount: null,
          isActive: null,
          imageUrl: "/images/categories/categories-01.png",
          displayName: "Televisions",
          fullPath: "Televisions",
          rootCategory: true,
          leafCategory: true
        },
        {
          id: "2",
          name: "Laptop & PC",
          slug: "laptop-pc",
          parentId: null,
          parentName: null,
          parentSlug: null,
          childrenCount: 0,
          hasChildren: false,
          children: null,
          hierarchyLevel: 1,
          categoryType: "ROOT",
          productCount: null,
          isActive: null,
          imageUrl: "/images/categories/categories-02.png",
          displayName: "Laptop & PC",
          fullPath: "Laptop & PC",
          rootCategory: true,
          leafCategory: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <section className="overflow-hidden py-6 bg-white">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 border-b border-gray-3 pb-6">
        <div className="swiper categories-carousel common-carousel">
          {/* <!-- section title --> */}
          <div className="mb-10 flex items-center justify-between">
            <div>
              <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_834_7356)">
                    <path
                      d="M3.94024 13.4474C2.6523 12.1595 2.00832 11.5155 1.7687 10.68C1.52908 9.84449 1.73387 8.9571 2.14343 7.18231L2.37962 6.15883C2.72419 4.66569 2.89648 3.91912 3.40771 3.40789C3.91894 2.89666 4.66551 2.72437 6.15865 2.3798L7.18213 2.14361C8.95692 1.73405 9.84431 1.52927 10.6798 1.76889C11.5153 2.00851 12.1593 2.65248 13.4472 3.94042L14.9719 5.46512C17.2128 7.70594 18.3332 8.82635 18.3332 10.2186C18.3332 11.6109 17.2128 12.7313 14.9719 14.9721C12.7311 17.2129 11.6107 18.3334 10.2184 18.3334C8.82617 18.3334 7.70576 17.2129 5.46494 14.9721L3.94024 13.4474Z"
                      stroke="#3C50E0"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="7.17245"
                      cy="7.39917"
                      r="1.66667"
                      transform="rotate(-45 7.17245 7.39917)"
                      stroke="#3C50E0"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M9.61837 15.4164L15.4342 9.6004"
                      stroke="#3C50E0"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_834_7356">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                Danh mục
              </span>
              <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
                Danh sách loại sản phẩm
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={handlePrev} className="swiper-button-prev">
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
                    d="M15.4881 4.43057C15.8026 4.70014 15.839 5.17361 15.5694 5.48811L9.98781 12L15.5694 18.5119C15.839 18.8264 15.8026 19.2999 15.4881 19.5695C15.1736 19.839 14.7001 19.8026 14.4306 19.4881L8.43056 12.4881C8.18981 12.2072 8.18981 11.7928 8.43056 11.5119L14.4306 4.51192C14.7001 4.19743 15.1736 4.161 15.4881 4.43057Z"
                    fill=""
                  />
                </svg>
              </button>

              <button onClick={handleNext} className="swiper-button-next">
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
                    d="M8.51192 4.43057C8.82641 4.161 9.29989 4.19743 9.56946 4.51192L15.5695 11.5119C15.8102 11.7928 15.8102 12.2072 15.5695 12.4881L9.56946 19.4881C9.29989 19.8026 8.82641 19.839 8.51192 19.5695C8.19743 19.2999 8.161 18.8264 8.43057 18.5119L14.0122 12L8.43057 5.48811C8.161 5.17361 8.19743 4.70014 8.51192 4.43057Z"
                    fill=""
                  />
                </svg>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Đang tải danh mục...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="text-red-600 text-lg font-medium mb-4">
                Lỗi tải danh mục: {error}
              </div>
              <button 
                onClick={fetchCategories}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600">Không có danh mục nào</p>
            </div>
          ) : (
            <Swiper
              ref={sliderRef}
              slidesPerView={4}
              breakpoints={{
                0: {
                  slidesPerView: 2,
                },
                768: {
                  slidesPerView: 3,
                },
                1000: {
                  slidesPerView: 4,
                },
              }}
            >
              {categories.map((item, key) => (
                <SwiperSlide key={item.id}>
                  <SingleItem item={item} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>
    </section>
  );
};

export default Categories;
