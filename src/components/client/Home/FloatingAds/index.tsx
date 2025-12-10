"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface FloatingAd {
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
}

const floatingAds: FloatingAd[] = [
  {
    id: 1,
    title: "Siêu Sale",
    subtitle: "Giảm đến 50%",
    discount: "50%",
    description: "Laptop Gaming hiệu năng cao với card RTX mạnh mẽ",
    image: "/images/anhnenmoi/ThayHinhMayChay.png",
    link: "/shop-with-sidebar?category=laptop",
    position: "left",
    bgGradient: "from-blue-500 via-blue-600 to-indigo-600",
    textColor: "text-white",
  },
  {
    id: 2,
    title: "Flash Sale",
    subtitle: "Ưu đãi đặc biệt",
    discount: "30%",
    description: "Smartphone flagship công nghệ tiên tiến nhất",
    image: "/images/anhnenmoi/ThayIP14.png",
    link: "/shop-with-sidebar?category=phone",
    position: "right",
    bgGradient: "from-orange-500 via-red-500 to-pink-500",
    textColor: "text-white",
  },
];

const FloatingAds = () => {
  const pathname = usePathname();
  const [visibleAds, setVisibleAds] = useState<Set<number>>(new Set([1, 2]));
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

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
      // Ẩn khi scroll xuống hơn 500px
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsVisible(scrollY <= 500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  const handleClose = (adId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVisibleAds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(adId);
      return newSet;
    });
  };

  // Ẩn banner trên mobile hoặc khi scroll xuống
  if (isMobile || !isVisible) {
    return null;
  }

  return (
    <>
      {floatingAds
        .filter((ad) => visibleAds.has(ad.id))
        .map((ad) => (
          <div
            key={ad.id}
            className={`fixed ${ad.position === "left" ? "left-8" : "right-8"} top-[45%] -translate-y-1/2 z-50 hidden xl:block transition-all duration-500 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 pointer-events-none"
            } animate-bounce-vertical`}
            style={{
              top: 'max(45%, 200px)',
            }}
          >
            <Link
              href={ad.link}
              className="group relative block w-32 h-[219px] rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${ad.bgGradient} opacity-95 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              {/* Decorative Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-white rounded-full blur-xl"></div>
              </div>

              {/* Close Button */}
              <button
                className="absolute top-2 right-2 z-20 w-6 h-6 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100"
                onClick={(e) => handleClose(ad.id, e)}
                aria-label="Đóng quảng cáo"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-between p-3">
                {/* Top Section - Discount Badge */}
                <div className="text-center w-full flex-shrink-0">
                  <div className="relative mb-1">
                    <span className={`block text-2xl font-black ${ad.textColor} drop-shadow-lg`}>
                      {ad.discount}
                    </span>
                    <div className="absolute inset-0 bg-white/30 blur-lg -z-10 animate-pulse"></div>
                  </div>
                  <span className={`block text-[10px] font-bold ${ad.textColor} uppercase tracking-wider mb-1`}>
                    OFF
                  </span>
                  <h3 className={`text-[10px] font-bold ${ad.textColor} leading-tight`}>
                    {ad.title}
                  </h3>
                </div>

                {/* Middle Section - Image - Tăng kích thước và ưu tiên */}
                <div className="relative w-24 h-28 flex-shrink-0 my-2 transform group-hover:scale-110 transition-transform duration-500">
                  <Image
                    src={ad.image}
                    alt={ad.title}
                    fill
                    className="object-contain drop-shadow-2xl"
                    sizes="96px"
                    loading="lazy"
                    priority={false}
                  />
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-white/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                </div>

                {/* Bottom Section - Text */}
                <div className="text-center w-full flex-shrink-0">
                  <p className={`text-[9px] ${ad.textColor} opacity-95 leading-tight mb-0.5 font-medium`}>
                    {ad.subtitle}
                  </p>
                  <p className={`text-[8px] ${ad.textColor} opacity-80 leading-tight line-clamp-2`}>
                    {ad.description}
                  </p>
                </div>
              </div>

              {/* Shine Effect on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
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
        
        .animate-bounce-vertical {
          animation: bounce-vertical 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default FloatingAds;

