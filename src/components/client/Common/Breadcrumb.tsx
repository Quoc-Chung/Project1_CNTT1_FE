import Link from "next/link";
import React from "react";

const Breadcrumb = ({ title, pages }) => {
  return (
    <div 
      className="overflow-hidden pt-[280px] sm:pt-[150px] lg:pt-[150px] xl:pt-[150px]"
      style={{
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1), 0 1px 3px rgba(147, 51, 234, 0.1)'
      }}
    >
      <div className="relative">
        {/* Gradient border top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg"></div>
        
        {/* Decorative gradient line with glow effect */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50"></div>
        
        <div className="bg-white border-t-2 border-blue-100 shadow-sm">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 py-5 xl:py-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h1 className="font-semibold text-dark text-xl sm:text-2xl xl:text-custom-2 line-clamp-2 flex-1 min-w-0">
         
              </h1>

              <ul className="flex items-center gap-2 flex-shrink-0">
                <li className="text-custom-sm hover:text-blue whitespace-nowrap transition-colors duration-200">
                  <Link href="/" prefetch={true} className="hover:underline font-medium">Trang chủ /</Link>
                </li>

                {pages.length > 0 &&
                  pages.map((page, key) => (
                    <li className={`text-custom-sm last:text-blue capitalize transition-colors duration-200 ${key === pages.length - 1 ? 'truncate max-w-[200px] sm:max-w-none font-medium' : 'whitespace-nowrap hover:text-blue'}`} key={key}>
                      {key > 0 && <span className="mx-1 text-gray-400 font-medium">/</span>}
                      {key === pages.length - 1 ? (
                        <span className="text-blue-600 font-semibold">{page}</span>
                      ) : (
                        <span className="text-gray-600 hover:text-blue cursor-default">{page}</span>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
