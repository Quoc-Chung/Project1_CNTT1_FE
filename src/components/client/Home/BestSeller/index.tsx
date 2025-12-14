"use client";

import React, { useEffect, useState } from "react";
import SingleItem from "./SingleItem";
import Image from "next/image";
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
          return {
            id: apiProduct.id,
            originalId: apiProduct.id,
            title: apiProduct.name,
            price: apiProduct.price,
            discountedPrice: apiProduct.price, // Best sellers không có discount, dùng giá gốc
            reviews: Math.floor(Math.random() * 20) + 1, // Random reviews for now
            imgs: {
              thumbnails: apiProduct.imageUrl ? [apiProduct.imageUrl] : [],
              previews: apiProduct.imageUrl ? [apiProduct.imageUrl] : [],
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

  if (loading) {
    return (
      <section className="overflow-hidden py-6 bg-gray-50">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="mb-10 flex items-center justify-between">
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
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-[403px]"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Không hiển thị gì nếu không có sản phẩm
  }

  return (
    <section className="overflow-hidden py-6 bg-gray-50">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- section title --> */}
        <div className="mb-10 flex items-center justify-between">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">
          {/* <!-- Best Sellers item --> */}
          {products.map((item, key) => (
            <SingleItem item={item} key={key} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
