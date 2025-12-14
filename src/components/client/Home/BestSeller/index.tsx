"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductItem from "@/components/client/Common/ProductItem";
import { ProductService } from "@/services/ProductService";
import { BestSellerProduct } from "@/types/Admin/ProductAPI";
import { Product } from "@/types/Client/Product/ProductItem";

const BestSeller = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        const apiProducts = await ProductService.getBestSellers(6);

        // Map API products to Product format
        const mappedProducts: Product[] = apiProducts.map((apiProduct: BestSellerProduct) => {
          // Xử lý URL ảnh - đảm bảo không null/undefined và là string hợp lệ
          let imageUrl = apiProduct.imageUrl || "";
          if (imageUrl && typeof imageUrl === 'string') {
            // Loại bỏ khoảng trắng và kiểm tra URL hợp lệ
            imageUrl = imageUrl.trim();
            // Loại bỏ các URL mẫu hoặc không hợp lệ
            if (imageUrl === "null" ||
              imageUrl === "undefined" ||
              imageUrl === "" ||
              imageUrl.includes("example.com") ||
              imageUrl.includes("placeholder") ||
              imageUrl.includes("dummy")) {
              imageUrl = "";
            }
          } else {
            imageUrl = "";
          }

          return {
            id: apiProduct.id,
            originalId: apiProduct.id,
            title: apiProduct.name || "Sản phẩm",
            price: apiProduct.price || 0,
            discountedPrice: apiProduct.price || 0, // Best sellers không có discount, dùng giá gốc
            reviews: Math.floor(Math.random() * 20) + 1, // Random reviews for now
            imgs: {
              thumbnails: imageUrl ? [imageUrl] : [],
              previews: imageUrl ? [imageUrl] : [],
            },
          };
        });

        setProducts(mappedProducts);
      } catch (error) {
        console.error("Error fetching best sellers:", error);
        // Nếu có lỗi, set products rỗng để không hiển thị gì
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  return (
    <section className="overflow-hidden py-6 bg-white">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- section title --> */}
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              <Image
                src="/images/icons/icon-07.svg"
                alt="icon"
                width={17}
                height={17}
              />
              Tháng này
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              Sản phẩm bán chạy
            </h2>
          </div>

          <Link
            href="/shop-with-sidebar"
            className="inline-flex font-medium text-custom-sm py-2.5 px-7 rounded-md border-gray-3 border bg-gray-1 text-dark ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent"
          >
            Tất cả
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7.5 gap-y-9">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-[270px] mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7.5 gap-y-9">
            {/* <!-- Best Sellers item --> */}
            {products.map((item, key) => (
              <ProductItem item={item} key={key} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Không có sản phẩm bán chạy nào</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSeller;
