"use client";
import React from "react";
import HeroCarousel from "./HeroCarousel";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="pb-1 lg:pb-1 pt-57.5 sm:pt-45 lg:pt-30 xl:pt-51.5 bg-gradient-to-br from-[#E5EAF4] via-[#F0F4F8] to-[#E5EAF4]">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap gap-5 items-stretch">
          {/* Main Hero Carousel */}
          <div className="xl:max-w-[750px] xl:flex-[1.92] w-full flex">
            <div className="relative z-1 rounded-2xl bg-white overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group w-full flex flex-col" style={{ height: 'calc(100% - 40px)' }}>
              {/* Background decorative image with overlay */}
              <div className="absolute right-0 bottom-0 -z-1 opacity-100 transition-opacity duration-500" style={{ transform: 'translate(-20px, -30px)' }}>
                <Image
                  src="/images/hero/hero-01.png"
                  alt="hero bg shapes"
                  width={300}
                  height={300}
                  priority={true}
                  className="object-contain"
                  style={{ opacity: 1 }}
                />
              </div>
              
              {/* Gradient overlay for better text readability - giảm độ mờ tối đa */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/40 to-transparent z-0 pointer-events-none"></div>
              
              <div className="relative z-10 flex-1 flex flex-col">
                <HeroCarousel />
              </div>
            </div>
          </div>

          {/* Side Banners */}
          <div className="xl:max-w-[400px] xl:flex-1 w-full flex">
            <div className="flex flex-col sm:flex-row xl:flex-col gap-5 w-full" style={{ height: 'calc(100% - 40px)' }}>
              {/* PC Banner */}
              <Link 
                href="/shop-with-sidebar" 
                className="group w-full relative rounded-2xl bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-5 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex-1 flex flex-col justify-between"
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl group-hover:bg-blue-300/30 transition-all duration-500"></div>
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-200/20 rounded-full blur-xl group-hover:bg-purple-300/30 transition-all duration-500"></div>
                
                <div className="relative z-10 flex items-center gap-4 sm:gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="mb-2">
                      <span className="inline-block px-2 py-0.5 bg-red-500/10 text-red-600 text-xs font-semibold rounded-full">
                        Khuyến mãi đặc biệt
                      </span>
                    </div>
                    <h2 className="font-bold text-dark text-base sm:text-lg mb-2 sm:mb-3 leading-tight group-hover:text-blue transition-colors duration-300">
                      PC Hiệu năng cực cao
                    </h2>

                    <div className="space-y-1">
                      <p className="font-medium text-gray-500 text-xs uppercase tracking-wide">
                        Ưu đãi có thời hạn
                      </p>
                      <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
                        <span className="font-bold text-lg sm:text-xl text-red-600">
                          19.999.000₫
                        </span>
                        <span className="font-medium text-sm sm:text-base text-gray-400 line-through">
                          23.000.000₫
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="inline-block px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                          Tiết kiệm 13%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 relative">
                    <div className="relative w-20 h-24 sm:w-24 sm:h-28 group-hover:scale-110 transition-transform duration-500">
                      <Image
                        src="/images/anhnenmoi/ThayIP14.png"
                        alt="PC Gaming hiệu năng cao"
                        fill
                        className="object-contain drop-shadow-2xl"
                        loading="lazy"
                        sizes="(max-width: 640px) 80px, 96px"
                      />
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                  </div>
                </div>
              </Link>

              {/* Headphone Banner */}
              <Link 
                href="/shop-with-sidebar" 
                className="group w-full relative rounded-2xl bg-gradient-to-br from-orange-50 via-white to-yellow-50 p-4 sm:p-5 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex-1 flex flex-col justify-between"
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-yellow-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-200/20 rounded-full blur-2xl group-hover:bg-orange-300/30 transition-all duration-500"></div>
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-yellow-200/20 rounded-full blur-xl group-hover:bg-yellow-300/30 transition-all duration-500"></div>
                
                <div className="relative z-10 flex items-center gap-4 sm:gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="mb-2">
                      <span className="inline-block px-2 py-0.5 bg-red-500/10 text-red-600 text-xs font-semibold rounded-full">
                        Khuyến mãi đặc biệt
                      </span>
                    </div>
                    <h2 className="font-bold text-dark text-base sm:text-lg mb-2 sm:mb-3 leading-tight group-hover:text-orange-600 transition-colors duration-300">
                      Tai nghe không dây
                    </h2>

                    <div className="space-y-1">
                      <p className="font-medium text-gray-500 text-xs uppercase tracking-wide">
                        Ưu đãi có thời hạn
                      </p>
                      <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
                        <span className="font-bold text-lg sm:text-xl text-red-600">
                          16.999.000₫
                        </span>
                        <span className="font-medium text-sm sm:text-base text-gray-400 line-through">
                          24.000.000₫
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="inline-block px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                          Tiết kiệm 30%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 relative">
                    <div className="relative w-20 h-24 sm:w-24 sm:h-28 group-hover:scale-110 transition-transform duration-500">
                      <Image
                        src="/images/hero/hero-01.png"
                        alt="Tai nghe không dây"
                        fill
                        className="object-contain drop-shadow-2xl"
                        loading="lazy"
                        sizes="(max-width: 640px) 80px, 96px"
                      />
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-orange-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
