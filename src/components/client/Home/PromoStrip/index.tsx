"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import Link from "next/link";

// Import Swiper styles
import "swiper/css";

interface PromoItem {
  id: number;
  text: string;
  highlight?: string;
  link: string;
  icon: string;
  bgGradient: string;
  iconBg: string;
}

const promoItems: PromoItem[] = [
  {
    id: 1,
    text: "Giảm giá",
    highlight: "50%",
    link: "/shop-with-sidebar?promo=50off",
    icon: "🎉",
    bgGradient: "from-pink-500 via-red-500 to-pink-600",
    iconBg: "from-yellow-400 via-orange-400 to-pink-400",
  },
  {
    id: 2,
    text: "Mua 1",
    highlight: "Tặng 1",
    link: "/shop-with-sidebar?promo=buy1get1",
    icon: "🎁",
    bgGradient: "from-blue-400 via-cyan-500 to-blue-600",
    iconBg: "from-yellow-300 via-orange-300 to-red-400",
  },
  {
    id: 3,
    text: "Miễn phí vận chuyển",
    highlight: "Toàn quốc",
    link: "/shop-with-sidebar",
    icon: "🚚",
    bgGradient: "from-green-400 via-emerald-500 to-green-600",
    iconBg: "from-orange-300 via-yellow-300 to-blue-300",
  },
];

const PromoStrip = () => {
  return (
    <section className="py-1 sm:py-1 bg-gradient-to-b from-white via-gray-50 to-white border-y border-gray-200/50 w-full overflow-hidden">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="hidden md:flex items-center justify-between gap-4 lg:gap-6">
          {promoItems.map((item) => (
            <Link
              key={item.id}
              href={item.link}
              prefetch={true}
              className="group relative flex-1 flex items-center gap-3 px-5 sm:px-6 py-4 sm:py-5 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden"
            >
              {/* Animated Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} opacity-95 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              {/* Sparkle/Shine Effect */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-10 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-shine"></div>
                <div className="absolute top-0 left-0 w-2 h-2 bg-white rounded-full animate-sparkle-1"></div>
                <div className="absolute top-4 right-8 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-sparkle-2"></div>
                <div className="absolute bottom-6 left-12 w-1 h-1 bg-white rounded-full animate-sparkle-3"></div>
                <div className="absolute top-1/2 right-4 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-sparkle-4"></div>
              </div>

              {/* Decorative Circles */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full blur-xl transform -translate-x-6 translate-y-6 group-hover:scale-150 transition-transform duration-700"></div>

              {/* Icon Container with Glow */}
              <div className="relative z-10 flex-shrink-0">
                <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${item.iconBg} flex items-center justify-center shadow-lg group-hover:shadow-xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12`}>
                  <span className="text-2xl sm:text-3xl transform group-hover:scale-125 transition-transform duration-500">
                    {item.icon}
                  </span>
                  {/* Icon Glow */}
                  <div className="absolute inset-0 bg-white/40 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                </div>
              </div>

              {/* Text Content */}
              <div className="relative z-10 flex-1 min-w-0">
                <div className="text-white">
                  <span className="block text-sm sm:text-base font-bold mb-1 leading-tight group-hover:scale-105 transition-transform duration-300">
                    {item.text}
                  </span>
                  {item.highlight && (
                    <span className="block text-lg sm:text-xl font-black leading-tight drop-shadow-lg group-hover:scale-105 transition-transform duration-300">
                      {item.highlight}
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow Indicator */}
              <div className="relative z-10 flex-shrink-0 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                <svg 
                  className="w-5 h-5 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile Slider */}
        <div className="md:hidden">
          <Swiper
            slidesPerView={1.5}
            spaceBetween={12}
            breakpoints={{
              480: {
                slidesPerView: 2,
              },
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            modules={[Autoplay]}
            className="promo-strip-slider"
          >
            {promoItems.map((item) => (
              <SwiperSlide key={item.id}>
                <Link
                  href={item.link}
                  prefetch={true}
                  className="group relative flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 min-h-[100px] overflow-hidden"
                >
                  {/* Animated Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} opacity-95 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  {/* Sparkle Effect for Mobile */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -inset-10 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-shine"></div>
                    <div className="absolute top-2 right-4 w-1.5 h-1.5 bg-white rounded-full animate-sparkle-1"></div>
                    <div className="absolute bottom-4 left-4 w-1 h-1 bg-yellow-300 rounded-full animate-sparkle-2"></div>
                  </div>

                  {/* Icon */}
                  <div className={`relative z-10 w-12 h-12 rounded-lg bg-gradient-to-br ${item.iconBg} flex items-center justify-center shadow-md transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12`}>
                    <span className="text-2xl transform group-hover:scale-125 transition-transform duration-500">
                      {item.icon}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="relative z-10 text-white text-center">
                    <span className="block text-xs font-bold mb-0.5">{item.text}</span>
                    {item.highlight && (
                      <span className="block text-sm font-black drop-shadow-lg">{item.highlight}</span>
                    )}
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Sparkle Animation Styles */}
      <style jsx global>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(200%) translateY(200%) rotate(45deg);
          }
        }

        @keyframes sparkle-1 {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes sparkle-2 {
          0%, 100% {
            opacity: 0;
            transform: scale(0) translate(0, 0);
          }
          25% {
            opacity: 1;
            transform: scale(1) translate(5px, -5px);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.8) translate(10px, -10px);
          }
        }

        @keyframes sparkle-3 {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          30% {
            opacity: 1;
            transform: scale(1.2);
          }
          60% {
            opacity: 0.7;
            transform: scale(0.9);
          }
        }

        @keyframes sparkle-4 {
          0%, 100% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          40% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
          }
          80% {
            opacity: 0.5;
            transform: scale(0.7) rotate(360deg);
          }
        }

        .animate-shine {
          animation: shine 3s ease-in-out infinite;
        }

        .animate-sparkle-1 {
          animation: sparkle-1 2s ease-in-out infinite;
        }

        .animate-sparkle-2 {
          animation: sparkle-2 2.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        .animate-sparkle-3 {
          animation: sparkle-3 3s ease-in-out infinite;
          animation-delay: 1s;
        }

        .animate-sparkle-4 {
          animation: sparkle-4 2.8s ease-in-out infinite;
          animation-delay: 1.5s;
        }
      `}</style>
    </section>
  );
};

export default PromoStrip;
