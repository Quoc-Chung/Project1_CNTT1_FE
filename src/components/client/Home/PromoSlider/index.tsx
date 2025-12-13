"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

interface PromoSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  discount?: string;
  link: string;
  bgColor?: string;
}

const promoSlides: PromoSlide[] = [
  {
    id: 1,
    image: "/images/hero/hero-01.png",
    title: "Siêu khuyến mãi mùa hè",
    subtitle: "Giảm giá lên đến 50% cho tất cả sản phẩm công nghệ",
    discount: "50% OFF",
    link: "/shop-with-sidebar?promo=summer",
    bgColor: "bg-gradient-to-r from-blue-500 to-purple-600",
  },
  {
    id: 2,
    image: "/images/hero/hero-02.png",
    title: "Laptop gaming mới nhất",
    subtitle: "Hiệu năng vượt trội, giá tốt nhất thị trường",
    discount: "30% OFF",
    link: "/shop-with-sidebar?category=laptop",
    bgColor: "bg-gradient-to-r from-orange-500 to-red-600",
  },
  {
    id: 3,
    image: "/images/hero/hero-03.png",
    title: "Điện thoại flagship",
    subtitle: "Camera chuyên nghiệp, pin trâu cả ngày",
    discount: "25% OFF",
    link: "/shop-with-sidebar?category=phone",
    bgColor: "bg-gradient-to-r from-green-500 to-blue-600",
  },
];

const PromoSlider = () => {
  return (
    <section className="py-3 sm:py-4 lg:py-6">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative">
          <Swiper
            spaceBetween={30}
            centeredSlides={true}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            effect="fade"
            modules={[Autoplay, Pagination, EffectFade]}
            className="promo-slider rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            style={{
              height: "auto",
              minHeight: "300px",
            }}
          >
            {promoSlides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <Link href={slide.link} prefetch={true}>
                  <div
                    className={`relative w-full h-[250px] sm:h-[350px] lg:h-[450px] ${slide.bgColor || "bg-gray-200"} rounded-2xl overflow-hidden group`}
                  >
                    {/* Background Image with overlay */}
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1170px"
                        priority={slide.id === 1}
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col justify-center items-start px-6 sm:px-10 lg:px-16 text-white">
                      {/* Discount Badge */}
                      {slide.discount && (
                        <div className="mb-4 sm:mb-6 inline-block bg-white/90 backdrop-blur-sm text-blue-600 font-bold text-xl sm:text-2xl lg:text-3xl px-4 sm:px-6 py-1 sm:py-1.5 rounded-md transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-2">
                          {slide.discount}
                        </div>
                      )}

                      {/* Title */}
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 transform transition-all duration-500 group-hover:translate-x-2">
                        {slide.title}
                      </h2>

                      {/* Subtitle */}
                      <p className="text-sm sm:text-base lg:text-lg xl:text-xl max-w-md opacity-90 transform transition-all duration-500 delay-100 group-hover:translate-x-2">
                        {slide.subtitle}
                      </p>

                      {/* CTA Button */}
                      <button className="mt-6 sm:mt-8 bg-white text-blue-600 font-semibold px-6 sm:px-8 py-1 sm:py-1.5 rounded-md shadow-lg transform transition-all duration-300 hover:scale-110 hover:shadow-xl">
                        Xem ngay →
                      </button>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default PromoSlider;
