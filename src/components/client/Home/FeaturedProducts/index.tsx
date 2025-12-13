"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import shopData from "@/components/client/Shop/shopData";

const FeaturedProducts = () => {
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);

  // Lấy 8 sản phẩm đầu tiên
  const featuredProducts = shopData.slice(0, 8);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-dark mb-4">
            Sản Phẩm Nổi Bật
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Những sản phẩm công nghệ được yêu thích nhất với giá ưu đãi
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onHoverStart={() => setHoveredId(product.id)}
              onHoverEnd={() => setHoveredId(null)}
              className="group relative"
            >
              <Link href={`/shop-details/${String(product.id)}`} prefetch={true} scroll={true}>
                <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
                  <div className="relative w-full h-[250px] sm:h-[280px] bg-gray-100 overflow-hidden">
                    {index < 4 && (
                      <div className="absolute top-4 right-4 z-10 bg-red-500 text-white font-bold text-sm sm:text-base px-3 py-1 rounded-md shadow-lg">
                        -{20 + index * 5}%
                      </div>
                    )}

                    <Image
                      src={product.imgs.previews[0]}
                      alt={product.title}
                      fill
                      className={`object-contain transition-transform duration-500 ${
                        hoveredId === product.id ? "scale-110" : "scale-100"
                      }`}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />

                    <div
                      className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
                        hoveredId === product.id ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={hoveredId === product.id ? { scale: 1 } : { scale: 0 }}
                        className="bg-white text-blue-600 font-semibold px-6 py-1.5 rounded-md shadow-lg hover:bg-blue-600 hover:text-white transition-colors duration-200"
                      >
                        Xem chi tiết
                      </motion.button>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold text-base sm:text-lg text-dark mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                      {product.title}
                    </h3>

                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-4 h-4 fill-yellow-400"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                      <span className="text-sm text-gray-500 ml-1">({product.reviews})</span>
                    </div>

                    {/* Price */}
                    <div className="mt-auto flex items-center gap-3">
                      <span className="font-bold text-lg sm:text-xl text-blue-600">
                        {product.discountedPrice.toLocaleString('vi-VN')}₫
                      </span>
                      <span className="text-gray-400 line-through text-sm sm:text-base">
                        {product.price.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link
            href="/shop-with-sidebar"
            prefetch={true}
            className="inline-flex items-center gap-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 px-8 py-1.5 rounded-md shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Xem tất cả sản phẩm
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
