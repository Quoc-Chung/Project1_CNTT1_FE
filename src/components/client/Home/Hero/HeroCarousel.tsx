"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import Link from "next/link";

// Import Swiper styles
import "swiper/css/pagination";
import "swiper/css";
import "swiper/css/effect-fade";

import Image from "next/image";

const HeroCarousel = () => {
  return (
    <Swiper
      spaceBetween={0}
      centeredSlides={true}
      autoplay={{
        delay: 4000,
        disableOnInteraction: false,
      }}
      effect="fade"
      fadeEffect={{
        crossFade: true,
      }}
      pagination={{
        clickable: true,
        dynamicBullets: true,
      }}
      modules={[Autoplay, Pagination, EffectFade]}
      className="hero-carousel"
    >
      <SwiperSlide>
        <div className="flex items-center pt-4 sm:pt-0 flex-col-reverse sm:flex-row min-h-[350px] sm:min-h-[380px] lg:min-h-[420px] h-full">
          <div className="max-w-[394px] py-6 sm:py-8 lg:py-12 pl-4 sm:pl-6 lg:pl-10 relative z-10 flex-1">
            {/* Discount Badge with animation */}
            <div className="flex items-center gap-3 mb-5 sm:mb-6 animate-fade-in">
              <div className="relative">
                <span className="block font-bold text-3xl sm:text-4xl lg:text-5xl text-blue drop-shadow-lg">
                  30%
                </span>
                <div className="absolute inset-0 bg-blue-200/30 blur-xl -z-10 animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="block font-bold text-dark text-base sm:text-lg lg:text-xl leading-tight">
                  Giảm
                </span>
                <span className="block font-bold text-dark text-base sm:text-lg lg:text-xl leading-tight">
                  Giá
                </span>
              </div>
            </div>

            {/* Title with hover effect */}
            <h1 className="font-bold text-dark text-xl sm:text-2xl lg:text-3xl mb-3 sm:mb-4 leading-tight">
              <Link 
                href="/shop-with-sidebar" 
                className="hover:text-blue transition-colors duration-300 inline-block"
              >
                Tai nghe không dây chống ồn chủ động
              </Link>
            </h1>

            {/* Description */}
            <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed max-w-[350px]">
              Trải nghiệm âm thanh tuyệt vời với công nghệ chống ồn chủ động và chất lượng âm thanh cao cấp.
            </p>

            {/* CTA Button with enhanced styling */}
            <Link
              href="/shop-with-sidebar"
              className="group inline-flex items-center gap-2 font-semibold text-white text-xs sm:text-sm rounded-md bg-gradient-to-r from-blue-600 to-blue-700 py-1.5 px-6 sm:px-8 shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
            >
              <span className="relative z-10">Mua ngay</span>
              <svg 
                className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
            </Link>
          </div>

          {/* Image with enhanced effects */}
          <div className="relative flex-1 flex items-center justify-center sm:justify-end pr-4 sm:pr-6 lg:pr-10 py-4 sm:py-0">
            <div className="relative w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] lg:w-[280px] lg:h-[280px] group flex-shrink-0 -ml-2 sm:-ml-4 lg:-ml-6" style={{ marginTop: '-46px' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
              <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-500">
                <img
                  src="/images/hero/hero-01.png"
                  alt="Tai nghe không dây chống ồn chủ động"
                  className="w-full h-full object-contain drop-shadow-2xl"
                  style={{ display: 'block' }}
                  onError={(e) => {
                    console.error('Image failed to load, trying fallback');
                    const target = e.currentTarget;
                    if (target.src.includes('hero-01.png')) {
                      target.src = '/images/hero/hero-01.png';
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </SwiperSlide>
      
      <SwiperSlide>
        <div className="flex items-center pt-4 sm:pt-0 flex-col-reverse sm:flex-row min-h-[350px] sm:min-h-[380px] lg:min-h-[420px] h-full">
          <div className="max-w-[394px] py-6 sm:py-8 lg:py-12 pl-4 sm:pl-6 lg:pl-10 relative z-10 flex-1">
            {/* Discount Badge with animation */}
            <div className="flex items-center gap-3 mb-5 sm:mb-6 animate-fade-in">
              <div className="relative">
                <span className="block font-bold text-3xl sm:text-4xl lg:text-5xl text-blue drop-shadow-lg">
                  40%
                </span>
                <div className="absolute inset-0 bg-blue-200/30 blur-xl -z-10 animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="block font-bold text-dark text-base sm:text-lg lg:text-xl leading-tight">
                  Giảm
                </span>
                <span className="block font-bold text-dark text-base sm:text-lg lg:text-xl leading-tight">
                  Giá
                </span>
              </div>
            </div>

            {/* Title with hover effect */}
            <h1 className="font-bold text-dark text-xl sm:text-2xl lg:text-3xl mb-3 sm:mb-4 leading-tight">
              <Link 
                href="/shop-with-sidebar" 
                className="hover:text-blue transition-colors duration-300 inline-block"
              >
                Bộ sưu tập Laptop Gaming cao cấp
              </Link>
            </h1>

            {/* Description */}
            <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed max-w-[350px]">
              Hiệu năng mạnh mẽ với card đồ họa RTX và bộ xử lý Intel Core i9 thế hệ mới nhất.
            </p>

            {/* CTA Button with enhanced styling */}
            <Link
              href="/shop-with-sidebar"
              className="group inline-flex items-center gap-2 font-semibold text-white text-xs sm:text-sm rounded-md bg-gradient-to-r from-blue-600 to-blue-700 py-1.5 px-6 sm:px-8 shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
            >
              <span className="relative z-10">Mua ngay</span>
              <svg 
                className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
            </Link>
          </div>

          {/* Image with enhanced effects */}
          <div className="relative flex-1 flex items-center justify-center sm:justify-end pr-4 sm:pr-6 lg:pr-10 py-4 sm:py-0">
            <div className="relative w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] lg:w-[280px] lg:h-[280px] group flex-shrink-0 -ml-2 sm:-ml-4 lg:-ml-6" style={{ marginTop: '-26px' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
              <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-500">
                <img
                  src="/images/hero/hero-01.png"
                  alt="Laptop Gaming cao cấp"
                  className="w-full h-full object-contain drop-shadow-2xl"
                  style={{ display: 'block' }}
                  onError={(e) => {
                    console.error('Image failed to load:', e.currentTarget.src);
                    e.currentTarget.src = '/images/hero/hero-01.png';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  );
};

export default HeroCarousel;
