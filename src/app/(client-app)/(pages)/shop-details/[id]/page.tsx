import React from "react";
import ShopDetails from "@/components/client/ShopDetails";
import { Metadata } from "next";
import { productDetailService, ProductDetailResponse } from "@/services/productDetailService";

interface ShopDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ShopDetailsPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const productData = await productDetailService.getProductDetail(id);
    return {
      title: `${productData.data.name} | Proshop`,
      description: productData.data.description,
    };
  } catch (error) {
    return {
      title: "Chi tiết sản phẩm | Proshop",
      description: "Trang chi tiết sản phẩm Proshop",
    };
  }
}

const ShopDetailsPage = async ({ params }: ShopDetailsPageProps) => {
  console.log('ShopDetailsPage: Starting to render');

  let id: string;
  let productData: ProductDetailResponse | null = null;

  try {
    // Await params
    const resolvedParams = await params;
    id = resolvedParams.id;
    console.log('ShopDetailsPage: Product ID:', id);

    // Validate ID before making API call
    if (!id || id === 'undefined' || id === 'null' || id.trim() === '') {
      console.error('Invalid product ID:', id);
      return (
        <main className="min-h-screen">
          <div className="text-center py-20">
            <p className="text-red-600 text-lg">ID sản phẩm không hợp lệ</p>
            <p className="text-gray-500 mt-2">Vui lòng quay lại trang chủ</p>
          </div>
        </main>
      );
    }

    // Gọi service - service sẽ tự động fallback về mock data nếu API lỗi
    console.log('ShopDetailsPage: Fetching product data...');
    productData = await productDetailService.getProductDetail(id);

    // Debug logging
    console.log('ShopDetailsPage: Product data received:', productData);
    console.log('ShopDetailsPage: Product data.data:', productData?.data);

    // Kiểm tra nếu productData không hợp lệ
    if (!productData || !productData.data) {
      console.error('ShopDetailsPage: Invalid product data received:', productData);
      return (
        <main className="min-h-screen">
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">Không tìm thấy thông tin sản phẩm</p>
            <p className="text-gray-500 mt-2">Vui lòng thử lại sau</p>
          </div>
        </main>
      );
    }

    // Kiểm tra thêm các trường bắt buộc
    if (!productData.data.name) {
      console.warn('ShopDetailsPage: Product name is missing, using fallback');
      productData.data.name = `Sản phẩm ${id}`;
    }

    if (!productData.data.description) {
      productData.data.description = 'Mô tả sản phẩm';
    }

    if (!productData.data.brandName) {
      productData.data.brandName = 'Thương hiệu';
    }

    if (!productData.data.categoryName) {
      productData.data.categoryName = 'Danh mục';
    }

    if (!productData.data.price) {
      productData.data.price = 0;
    }

    console.log('ShopDetailsPage: Product data validated, rendering component');
  } catch (error: any) {
    console.error('ShopDetailsPage: Error fetching product data:', error);
    console.error('ShopDetailsPage: Error stack:', error?.stack);
    // Nếu có lỗi nghiêm trọng, vẫn hiển thị trang với null để component tự xử lý
    productData = null;
  }

  console.log('ShopDetailsPage: About to render ShopDetails with productData:', !!productData);

  return (
    <main className="min-h-screen">
      <ShopDetails productData={productData} />
    </main>
  );
};

export default ShopDetailsPage;
