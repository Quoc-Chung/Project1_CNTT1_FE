"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ScrollAd {
  id: number;
  title: string;
  subtitle: string;
  discount: string;
  description: string;
  image: string;
  link: string;
  position: "left" | "right";
  bgGradient: string;
  textColor: string;
  icon: string;
}

const scrollAds: ScrollAd[] = [
  {
    id: 1,
    title: "Laptop & PC",
    subtitle: "Máy tính & Phụ kiện",
    discount: "40%",
    description: "Laptop gaming, PC workstation, bàn phím cơ, chuột gaming, màn hình 4K. Hiệu năng mạnh mẽ, thiết kế chuyên nghiệp cho công việc và giải trí",
    image: "/images/anhnenmoi/MayTinhHP.png",
    link: "/shop-with-sidebar?category=laptop",
    position: "left",
    bgGradient: "from-white via-gray-50 to-white",
    textColor: "text-gray-900",
    icon: "💻",
  },
  {
    id: 2,
    title: "Premium Audio",
    subtitle: "Tai nghe cao cấp",
    discount: "35%",
    description: "Tai nghe không dây chống ồn chủ động, âm thanh Hi-Fi, pin 30 giờ. Thiết kế ergonomic, thoải mái cả ngày",
    image: "/images/anhnenmoi/ThayHinhTaiNghe.png",
    link: "/shop-with-sidebar?category=peripherals",
    position: "right",
    bgGradient: "from-white via-gray-50 to-white",
    textColor: "text-gray-900",
    icon: "🎧",
  },
];

const ScrollAds = () => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Chỉ hiển thị ở trang home
  if (pathname !== "/") {
    return null;
  }

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280); // xl breakpoint
    };
    
    if (typeof window !== "undefined") {
      checkMobile();
      window.addEventListener("resize", checkMobile);
      
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || isMobile) return;

    const handleScroll = () => {
      // Hiển thị khi scroll xuống hơn 500px
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsVisible(scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  // Ẩn banner trên mobile
  if (isMobile || !isVisible) {
    return null;
  }

  return (
    <>
      {scrollAds.map((ad) => (
        <div
          key={ad.id}
          className={`fixed ${ad.position === "left" ? "left-8" : "right-8"} top-[55%] -translate-y-1/2 z-50 hidden xl:block transition-all duration-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{
            top: 'max(55%, 350px)',
            animation: isVisible ? "bounce-vertical 3s ease-in-out infinite" : "none",
          }}
        >
          <Link
            href={ad.link}
            className="group relative block w-32 h-96 rounded-2xl overflow-hidden shadow-lg border-2 border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-500 transform hover:scale-105 bg-white"
          >
            {/* Background - White with subtle pattern */}
            <div className={`absolute inset-0 bg-gradient-to-br ${ad.bgGradient} transition-opacity duration-500`}></div>
            
            {/* Sparkle Effects - Gray tones */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -inset-10 bg-gradient-to-r from-transparent via-gray-200/20 to-transparent transform -skew-x-12 animate-shine"></div>
              <div className="absolute top-4 left-2 w-2 h-2 bg-gray-400 rounded-full animate-sparkle-1"></div>
              <div className="absolute top-12 right-4 w-1.5 h-1.5 bg-gray-500 rounded-full animate-sparkle-2"></div>
              <div className="absolute bottom-20 left-4 w-1 h-1 bg-gray-400 rounded-full animate-sparkle-3"></div>
              <div className="absolute top-1/3 right-2 w-1.5 h-1.5 bg-gray-500 rounded-full animate-sparkle-4"></div>
              <div className="absolute bottom-12 right-2 w-1 h-1 bg-gray-400 rounded-full animate-sparkle-1" style={{ animationDelay: '0.8s' }}></div>
            </div>

            {/* Decorative Pattern - Subtle gray */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-24 h-24 bg-gray-400 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-gray-400 rounded-full blur-xl"></div>
            </div>
            
            {/* Border accent */}
            <div className="absolute inset-0 border-2 border-gray-100 rounded-2xl opacity-50"></div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-between p-3 sm:p-4">
              {/* Top Section - Icon & Discount Badge */}
              <div className="text-center w-full flex-shrink-0">
                <div className="mb-1.5">
                  <div className="relative inline-block">
                    <span className="text-2xl sm:text-3xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                      {ad.icon}
                    </span>
                    <div className="absolute inset-0 bg-gray-200/50 blur-lg -z-10 animate-pulse"></div>
                  </div>
                </div>
                <div className="relative mb-1">
                  <span className={`block text-3xl sm:text-3xl font-black ${ad.textColor} drop-shadow-sm`}>
                    {ad.discount}
                  </span>
                  <div className="absolute inset-0 bg-gray-200/50 blur-lg -z-10 animate-pulse"></div>
                </div>
                <span className={`block text-[9px] font-bold ${ad.textColor} uppercase tracking-wider mb-1`}>
                  OFF
                </span>
                <h3 className={`text-[10px] font-bold ${ad.textColor} mb-0.5 leading-tight`}>
                  {ad.title}
                </h3>
                <p className={`text-[9px] ${ad.textColor} opacity-80 leading-tight mb-1`}>
                  {ad.subtitle}
                </p>
              </div>

              {/* Middle Section - Image - Tăng kích thước và ưu tiên */}
              <div className="relative w-28 h-36 sm:w-28 sm:h-40 flex-shrink-0 my-2 transform group-hover:scale-110 transition-transform duration-500">
                <Image
                  src={ad.image}
                  alt={ad.title}
                  fill
                  className="object-contain drop-shadow-2xl"
                  sizes="112px"
                  loading="lazy"
                  priority={false}
                />
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gray-200/50 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              </div>

              {/* Bottom Section - Description Text */}
              <div className="text-center w-full flex-shrink-0">
                <p className={`text-[8px] sm:text-[9px] ${ad.textColor} opacity-85 leading-tight line-clamp-3 font-medium`}>
                  {ad.description}
                </p>
              </div>
            </div>

            {/* Shine Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </Link>
        </div>
      ))}

      <style jsx global>{`
        @keyframes bounce-vertical {
          0%, 100% {
            transform: translateY(-50%) translateY(0);
          }
          50% {
            transform: translateY(-50%) translateY(-15px);
          }
        }

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
    </>
  );
};

export default ScrollAds;

