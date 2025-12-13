"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

interface BannerSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  discount?: string;
  link: string;
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    image: "/images/hero/hero-01.png",
    title: "Siêu giảm giá",
    subtitle: "Giảm giá lên đến 50% cho tất cả sản phẩm công nghệ",
    discount: "50% OFF",
    link: "/shop-with-sidebar?promo=summer",
  },
  {
    id: 2,
    image: "/banner/gaming1.png",
    title: "Công nghệ mới nhất 2025",
    subtitle: "Khám phá những sản phẩm công nghệ tiên tiến nhất",
    discount: "30% OFF",
    link: "/shop-with-sidebar?category=laptop",
  },
  {
    id: 3,
    image: "/images/hero/hero-03.png",
    title: "Ưu đãi độc quyền",
    subtitle: "Những ưu đãi đặc biệt chỉ dành riêng cho bạn",
    discount: "25% OFF",
    link: "/shop-with-sidebar?category=phone",
  },
];

const MainBannerCarousel = () => {
  return (
    <div className="relative w-full">
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        effect="fade"
        fadeEffect={{
          crossFade: true,
        }}
        modules={[Autoplay, Pagination, EffectFade]}
        className="main-banner-swiper rounded-2xl overflow-hidden"
        style={{
          height: "auto",
          minHeight: "400px",
        }}
      >
        {bannerSlides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <Link href={slide.link} prefetch={true}>
              <div className="relative w-full h-[400px] lg:h-[500px] xl:h-[600px] overflow-hidden group cursor-pointer">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1170px"
                    priority={index === 0}
                  />
                  {/* Overlay mờ */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/30 group-hover:from-black/50 group-hover:via-black/30 group-hover:to-black/20 transition-all duration-500"></div>
                </div>

                {/* Content với Framer Motion */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative z-10 h-full flex flex-col justify-center items-start px-6 sm:px-10 lg:px-16 text-white"
                >
                  {/* Discount Badge */}
                  {slide.discount && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="mb-4 sm:mb-6 inline-block bg-white/95 backdrop-blur-sm text-blue-600 font-bold text-xl sm:text-2xl lg:text-3xl px-5 sm:px-7 py-1 sm:py-1.5 rounded-md shadow-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-1"
                    >
                      {slide.discount}
                    </motion.div>
                  )}

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 max-w-2xl leading-tight"
                  >
                    {slide.title}
                  </motion.h2>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-base sm:text-lg lg:text-xl xl:text-2xl max-w-2xl opacity-95 mb-6 sm:mb-8 leading-relaxed"
                  >
                    {slide.subtitle}
                  </motion.p>

                  {/* CTA Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-blue-600 font-semibold px-8 sm:px-10 py-1.5 sm:py-2 rounded-md shadow-xl transform transition-all duration-300 hover:shadow-2xl text-base sm:text-lg"
                  >
                    Xem ngay →
                  </motion.button>
                </motion.div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default MainBannerCarousel;
