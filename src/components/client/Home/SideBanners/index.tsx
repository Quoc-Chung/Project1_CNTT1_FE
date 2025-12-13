"use client";

import Image from "next/image";
import Link from "next/link";

interface SideBanner {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  link: string;
  position: "left" | "right";
  bgGradient: string;
}

const sideBanners: SideBanner[] = [
  {
    id: 1,
    image: "/images/promo/promo-01.png",
    title: "Laptop Gaming",
    subtitle: "Hiệu năng mạnh mẽ",
    link: "/shop-with-sidebar?category=laptop",
    position: "left",
    bgGradient: "bg-gradient-to-br from-white via-gray-50 to-white",
  },
  {
    id: 2,
    image: "/images/promo/promo-02.png",
    title: "Smartphone Flagship",
    subtitle: "Công nghệ tiên tiến",
    link: "/shop-with-sidebar?category=phone",
    position: "right",
    bgGradient: "bg-gradient-to-br from-white via-gray-50 to-white",
  },
];

interface SideBannersProps {
  position?: "left" | "right" | "all";
}

const SideBanners = ({ position = "all" }: SideBannersProps) => {
  const bannersToShow = position === "all" 
    ? sideBanners 
    : sideBanners.filter(b => b.position === position);

  return (
    <div className="h-full flex flex-col gap-6 sm:gap-8">
      {bannersToShow.map((banner) => (
            <Link
              key={banner.id}
              href={banner.link}
              prefetch={true}
              className="group relative block w-full max-w-[400px] xl:max-w-[450px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border-2 border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-white"
            >
                <div className={`relative h-[400px] sm:h-[500px] lg:h-[600px] xl:h-[650px] ${banner.bgGradient} overflow-hidden`}>
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className="object-cover opacity-40 group-hover:opacity-50 group-hover:scale-110 transition-all duration-700"
                    sizes="(max-width: 768px) 100vw, 450px"
                  />
                </div>

                {/* Decorative Pattern Overlay */}
                <div className="absolute inset-0 z-5 opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 400 600" preserveAspectRatio="none">
                    <defs>
                      <pattern id={`pattern-${banner.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="20" cy="20" r="2" fill="gray" opacity="0.3"/>
                        <circle cx="0" cy="0" r="1.5" fill="gray" opacity="0.2"/>
                        <circle cx="40" cy="40" r="1.5" fill="gray" opacity="0.2"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#pattern-${banner.id})`} />
                  </svg>
                </div>

                {/* Geometric Shapes */}
                <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 xl:w-48 xl:h-48 bg-gray-200/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute bottom-20 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-gray-300/20 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2 group-hover:scale-125 transition-transform duration-700"></div>
                
                {/* Diagonal Lines Decoration */}
                <div className="absolute inset-0 z-5">
                  <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-10 left-10 w-1 h-32 bg-gray-300/30 transform rotate-45 origin-top"></div>
                    <div className="absolute top-20 left-20 w-1 h-24 bg-gray-300/20 transform rotate-45 origin-top"></div>
                    <div className="absolute bottom-20 right-10 w-1 h-40 bg-gray-300/25 transform -rotate-45 origin-bottom"></div>
                    <div className="absolute bottom-10 right-20 w-1 h-32 bg-gray-300/15 transform -rotate-45 origin-bottom"></div>
                  </div>
                </div>

                {/* Overlay gradient - Light overlay instead of dark */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-transparent z-10"></div>

                {/* Content */}
                <div className="relative z-20 h-full flex flex-col justify-end p-8 sm:p-10 lg:p-12 text-gray-900">
                  {/* Badge/Tag */}
                  <div className="absolute top-6 left-6 sm:top-8 sm:left-8 bg-gray-900 backdrop-blur-sm px-4 py-2 rounded-full transform transition-all duration-300 group-hover:scale-110 group-hover:bg-gray-800">
                    <span className="text-xs sm:text-sm font-bold text-white">HOT DEAL</span>
                  </div>
                  <div className="transform transition-all duration-500 group-hover:translate-y-0 translate-y-2 space-y-3 sm:space-y-4">
                    {/* Main Title */}
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-3 group-hover:text-gray-700 transition-colors duration-300 leading-tight text-gray-900">
                      {banner.title}
                    </h3>                   
                    {/* Subtitle */}
                    <p className="text-base sm:text-lg lg:text-xl xl:text-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-300 font-medium mb-4 text-gray-800">
                      {banner.subtitle}
                    </p>
                    {/* Additional Description */}
                    <p className="text-sm sm:text-base lg:text-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300 max-w-[280px] sm:max-w-[320px] text-gray-700">
                      {banner.position === "left" 
                        ? "Khám phá bộ sưu tập laptop gaming với hiệu năng vượt trội, thiết kế đẳng cấp"
                        : "Trải nghiệm công nghệ tiên tiến với những chiếc smartphone flagship hàng đầu"}
                    </p>

                    {/* CTA Button */}
                    <div className="pt-4">
                      <span className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 px-6 py-3 rounded-full font-semibold text-sm sm:text-base text-white transition-all duration-300 group-hover:gap-4 group-hover:px-8">
                        Xem ngay
                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </div>
                  </div>
                  {/* Icon/Badge - Larger */}
                  <div className="absolute top-6 right-6 sm:top-8 sm:right-8 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-100 backdrop-blur-md rounded-full flex items-center justify-center transform transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 border-2 border-gray-200">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                  {/* Bottom Decorative Element */}
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </div>
              </div>
            </Link>
      ))}
    </div>
  );
};

export default SideBanners;
