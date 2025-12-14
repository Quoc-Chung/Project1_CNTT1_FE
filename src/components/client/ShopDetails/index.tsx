"use client";
import React, { useState, useEffect, useMemo } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import { ProductDetailResponse } from "@/services/productDetailService";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch, useAppSelector } from "../../../redux/store";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { addProductToCartAction } from "../../../redux/Client/CartOrder/Action";
import { useOptimizedHydration } from "../../../hooks/useOptimizedHydration";
import { ProductService } from "@/services/ProductService";
import { SKU } from "@/types/Client/Product/Product";

interface ShopDetailsProps {
  productData: ProductDetailResponse | null;
}

const ShopDetails = ({ productData }: ShopDetailsProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [skus, setSkus] = useState<SKU[]>([]);
  const [selectedSKU, setSelectedSKU] = useState<SKU | null>(null);
  const [loadingSKUs, setLoadingSKUs] = useState(false);
  const isHydrated = useOptimizedHydration(30); // Sử dụng hook tối ưu hóa
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { isLogin, user } = useSelector((state: RootState) => state.auth);
  const token = useAppSelector((state) => state.auth.token);

  // Lấy product với fallback
  const product = productData?.data;

  // Fetch SKUs khi component mount
  useEffect(() => {
    const fetchSKUs = async () => {
      if (!product?.id) return;

      setLoadingSKUs(true);
      try {
        const response = await ProductService.getSKUsByProductId(product.id);
        setSkus(response.data);
        // Tự động chọn SKU đầu tiên nếu có
        if (response.data.length > 0) {
          setSelectedSKU(response.data[0]);
        }
      } catch (error) {
        console.error("Error fetching SKUs:", error);
        toast.error("Không thể tải thông tin SKU");
      } finally {
        setLoadingSKUs(false);
      }
    };

    fetchSKUs();
  }, [product?.id]);

  // Helper functions - được định nghĩa trước hooks
  const getDetailedSpecs = (prod: typeof product) => {
    if (!prod) return {};
    
    // Nếu có specs từ API, ưu tiên dùng specs đó
    if (prod.specs && prod.specs !== null && Object.keys(prod.specs).length > 0) {
      return prod.specs;
    }

    // Lấy categoryName để xác định loại sản phẩm
    const categoryName = prod.categoryName?.toLowerCase() || '';
    
    // Thông số kỹ thuật cho Máy tính/Laptop
    if (categoryName.includes('laptop') || categoryName.includes('máy tính') || categoryName.includes('laptop')) {
      return {
        "Bộ xử lý": "AMD Ryzen 7 6800H (8 nhân, 16 luồng)",
        "Card đồ họa": "NVIDIA GeForce RTX 4060 (8GB GDDR6)",
        "RAM": "16GB DDR5 4800MHz",
        "Ổ cứng": "512GB NVMe PCIe 4.0 SSD",
        "Màn hình": "15.6 inch Full HD (1920 x 1080) IPS 144Hz",
        "Pin": "90Wh - 6-8 giờ (Văn phòng), 2-3 giờ (Gaming)",
        "Kích thước": "354 x 251 x 22.4 mm",
        "Trọng lượng": "2.2 kg",
        "Hệ điều hành": "Windows 11 Home",
        "Bảo hành": "24 tháng",
        "Công nghệ GPU": "DLSS 3.0, Ray Tracing, NVIDIA Reflex",
        "Kết nối": "USB-C (Thunderbolt 4), USB-A, HDMI 2.1, Wi-Fi 6E, Bluetooth 5.2",
        "Tản nhiệt": "Dual Fan + 5 Heat Pipes, Liquid Metal",
        "Bàn phím": "RGB Backlit, N-key rollover",
      };
    }

    // Thông số kỹ thuật cho Bàn phím
    if (categoryName.includes('bàn phím') || categoryName.includes('keyboard') || categoryName.includes('phím')) {
      return {
        "Loại switch": "Mechanical (Cherry MX Red)",
        "Bố cục": "Full-size (104 phím)",
        "Kết nối": "USB-C có dây + Bluetooth 5.0",
        "Đèn LED": "RGB per-key, 16.8 triệu màu",
        "Phím tắt đa phương tiện": "Có (Volume, Play/Pause, Next/Previous)",
        "Kích thước": "442 x 132 x 36 mm",
        "Trọng lượng": "1.2 kg",
        "Tương thích": "Windows, macOS, Linux, Android, iOS",
        "Bảo hành": "24 tháng",
        "Tốc độ phản hồi": "1ms (USB), 2.4ms (Bluetooth)",
        "Độ bền phím": "50 triệu lần nhấn",
        "Chống nước": "IPX4 (Chống nước nhẹ)",
        "Phần mềm": "iCUE (Corsair) / MSI Dragon Center",
      };
    }

    // Thông số kỹ thuật cho Tai nghe
    if (categoryName.includes('tai nghe') || categoryName.includes('headset') || categoryName.includes('headphone')) {
      return {
        "Loại": "Tai nghe chơi game có dây/USB",
        "Driver": "50mm Neodymium",
        "Tần số đáp ứng": "20Hz - 20kHz",
        "Trở kháng": "32 Ohm",
        "Độ nhạy": "111 dB SPL/mW",
        "Microphone": "Có, có thể gập lại",
        "Kết nối": "USB-A 3.5mm jack",
        "Điều khiển": "Nút điều chỉnh âm lượng trên dây",
        "Kích thước": "190 x 185 x 85 mm",
        "Trọng lượng": "350g",
        "Bảo hành": "24 tháng",
        "Tính năng": "7.1 Surround Sound, RGB Lighting",
        "Dây cáp": "2m, có thể tháo rời",
        "Tương thích": "PC, PS4, PS5, Xbox, Nintendo Switch",
      };
    }

    // Thông số kỹ thuật cho Chuột
    if (categoryName.includes('chuột') || categoryName.includes('mouse')) {
      return {
        "Loại cảm biến": "Optical (PixArt PMW3360)",
        "Độ phân giải": "12,000 DPI (có thể điều chỉnh)",
        "Tốc độ theo dõi": "250 IPS",
        "Gia tốc": "50G",
        "Tần số phản hồi": "1000Hz (1ms)",
        "Số nút": "8 nút có thể lập trình",
        "Kết nối": "USB-A có dây",
        "Đèn LED": "RGB 16.8 triệu màu",
        "Kích thước": "126 x 66 x 38 mm",
        "Trọng lượng": "85g",
        "Bảo hành": "24 tháng",
        "Độ bền click": "50 triệu lần nhấn",
        "Bề mặt làm việc": "Tương thích mọi bề mặt",
        "Phần mềm": "Logitech G HUB / Razer Synapse",
      };
    }

    // Thông số kỹ thuật cho RAM
    if (categoryName.includes('ram') || categoryName.includes('memory')) {
      return {
        "Dung lượng": "16GB (2x8GB)",
        "Loại": "DDR5",
        "Tốc độ": "4800MHz (có thể OC lên 6000MHz)",
        "Độ trễ": "CL40 (CAS Latency 40)",
        "Điện áp": "1.1V (JEDEC), 1.35V (XMP)",
        "Kích thước": "133.35 x 40 mm",
        "Trọng lượng": "45g/cây",
        "Bảo hành": "Trọn đời",
        "Tản nhiệt": "Heatspreader nhôm, RGB",
        "Tương thích": "Intel 12th/13th Gen, AMD Ryzen 7000",
        "XMP Profile": "XMP 3.0 (2 profiles)",
        "Độ bền": "Kiểm tra chất lượng nghiêm ngặt",
      };
    }

    // Mặc định: Thông số chung nếu không khớp với loại nào
    return {
      "Thương hiệu": prod.brandName || "Không xác định",
      "Danh mục": prod.categoryName || "Không xác định",
      "Mô tả": prod.description || "Sản phẩm chất lượng cao",
      "Bảo hành": "12 tháng",
      "Xuất xứ": "Việt Nam",
      "Trạng thái": "Mới 100%",
    };
  };

  // Tạo danh sách thông số kỹ thuật gộp lại theo từng loại sản phẩm
  const getMergedSpecs = (specs: { [key: string]: string }, categoryName?: string) => {
    const category = categoryName?.toLowerCase() || '';
    
    let displayKeys: string[] = [];

    // Xác định các trường cần hiển thị dựa trên loại sản phẩm
    if (category.includes('laptop') || category.includes('máy tính')) {
      displayKeys = [
        "Bộ xử lý",
        "Card đồ họa",
        "RAM",
        "Ổ cứng",
        "Màn hình",
        "Pin",
        "Kích thước",
        "Trọng lượng",
        "Hệ điều hành",
        "Bảo hành",
        "Công nghệ GPU",
        "Kết nối",
      ];
    } else if (category.includes('bàn phím') || category.includes('keyboard') || category.includes('phím')) {
      displayKeys = [
        "Loại switch",
        "Bố cục",
        "Kết nối",
        "Đèn LED",
        "Phím tắt đa phương tiện",
        "Kích thước",
        "Trọng lượng",
        "Tương thích",
        "Bảo hành",
        "Tốc độ phản hồi",
        "Độ bền phím",
        "Chống nước",
      ];
    } else if (category.includes('tai nghe') || category.includes('headset') || category.includes('headphone')) {
      displayKeys = [
        "Loại",
        "Driver",
        "Tần số đáp ứng",
        "Trở kháng",
        "Độ nhạy",
        "Microphone",
        "Kết nối",
        "Điều khiển",
        "Kích thước",
        "Trọng lượng",
        "Bảo hành",
        "Tính năng",
        "Dây cáp",
        "Tương thích",
      ];
    } else if (category.includes('chuột') || category.includes('mouse')) {
      displayKeys = [
        "Loại cảm biến",
        "Độ phân giải",
        "Tốc độ theo dõi",
        "Gia tốc",
        "Tần số phản hồi",
        "Số nút",
        "Kết nối",
        "Đèn LED",
        "Kích thước",
        "Trọng lượng",
        "Bảo hành",
        "Độ bền click",
        "Bề mặt làm việc",
        "Phần mềm",
      ];
    } else if (category.includes('ram') || category.includes('memory')) {
      displayKeys = [
        "Dung lượng",
        "Loại",
        "Tốc độ",
        "Độ trễ",
        "Điện áp",
        "Kích thước",
        "Trọng lượng",
        "Bảo hành",
        "Tản nhiệt",
        "Tương thích",
        "XMP Profile",
        "Độ bền",
      ];
    } else {
      // Mặc định: hiển thị tất cả các trường có sẵn
      displayKeys = Object.keys(specs);
    }

    const merged: { [key: string]: string } = {};

    // Lấy các trường theo thứ tự đã định
    displayKeys.forEach(key => {
      if (specs[key]) {
        merged[key] = specs[key];
      }
    });

    return merged;
  };

  const detailedSpecs = useMemo(() => {
    if (!product) return {};
    return getDetailedSpecs(product);
  }, [product?.id]);

  const mergedSpecs = useMemo(() => {
    return getMergedSpecs(detailedSpecs, product?.categoryName);
  }, [detailedSpecs, product?.categoryName]);

  if (!productData || !productData.data) {
    console.warn('ShopDetails: No product data available', { productData });
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Không tìm thấy thông tin sản phẩm</p>
        <p className="text-sm text-gray-400 mt-2">Vui lòng thử lại sau hoặc quay lại trang chủ</p>
      </div>
    );
  }

  if (!product) {
    console.error('ShopDetails: Product is null or undefined', { productData });
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Dữ liệu sản phẩm không hợp lệ</p>
      </div>
    );
  }

  const getImageUrl = (url: string | undefined | null) => {
    if (!url || url.trim() === '') return "/images/products/product-1-bg-1.png";

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/images/')) {
      return url;
    }

    if (!url.startsWith('/')) {
      return `/${url}`;
    }

    return url;
  };

  const getAllImages = () => {
    const images: string[] = [];
    
    // Chỉ lấy ảnh từ API, không thêm ảnh mock
    if (product.thumbnailUrl && product.thumbnailUrl.trim() !== '') {
      images.push(product.thumbnailUrl);
    }
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach(img => {
        if (img && img.trim() !== '' && !images.includes(img)) {
          images.push(img);
        }
      });
    }
    
    // Trả về tất cả ảnh từ API, không giới hạn số lượng
    return images;
  };

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isHydrated) {
      toast.info("Đang tải dữ liệu, vui lòng đợi...", {
        autoClose: 1500,
        position: "top-right"
      });
      return;
    }

    if (!isLogin) {
      const currentUrl = window.location.pathname + window.location.search;
      localStorage.setItem('redirectAfterLogin', currentUrl);

      toast.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!", {
        autoClose: 2000,
        position: "top-right"
      });
      router.push('/signin');
      return;
    }

    if (!productData) {
      toast.error("Không tìm thấy thông tin sản phẩm!");
      return;
    }

    if (!selectedSKU) {
      toast.error("Vui lòng chọn phiên bản sản phẩm!");
      return;
    }

    if (selectedSKU.stock < quantity) {
      toast.error(`Chỉ còn ${selectedSKU.stock} sản phẩm trong kho!`);
      return;
    }

    dispatch(
      addProductToCartAction(
        {
          productId: productData.data.id,
          skuId: selectedSKU.id,
          quantity
        },
        token || "",
        (res) => {
          toast.success(`Đã thêm ${quantity} sản phẩm "${productData.data.name}" vào giỏ hàng!`, {
            autoClose: 1500,
            position: "top-right"
          });
        },
        (err) => {
          if (err === "Token hết hạn") {
            dispatch({ type: "LOGOUT" });
            toast.warning("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!", {
              autoClose: 3000,
              position: "top-right"
            });
            router.push('/signin');
          } else {
            toast.error("Thêm sản phẩm thất bại: " + err);
          }
        }
      )
    );
  };

  console.log('ShopDetails: Component rendering');
  console.log('ShopDetails: productData:', productData);
  console.log('ShopDetails: product:', product);
  console.log('ShopDetails: product?.name:', product?.name);

  // Early return nếu không có productData hoặc product
  if (!productData || !productData.data || !product) {
    console.warn('ShopDetails: Missing product data, showing fallback');
    return (
      <div className="min-h-screen">
        <Breadcrumb title="Chi tiết sản phẩm" pages={["shop details"]} />
        <div className="text-center py-20">
          <p className="text-gray-600 text-lg">Không tìm thấy thông tin sản phẩm</p>
          <p className="text-sm text-gray-400 mt-2">Vui lòng thử lại sau hoặc quay lại trang chủ</p>
        </div>
      </div>
    );
  }

  // Đảm bảo product có đầy đủ thông tin
  const safeProduct = {
    id: product.id || 'unknown',
    name: product.name || 'Sản phẩm không tên',
    description: product.description || 'Không có mô tả',
    brandName: product.brandName || 'Thương hiệu',
    categoryName: product.categoryName || 'Danh mục',
    price: product.price || 0,
    thumbnailUrl: product.thumbnailUrl || '/images/products/product-1-1.png',
    images: product.images || [],
    specs: product.specs || null,
  };

  console.log('ShopDetails: Rendering with safeProduct:', safeProduct);

  return (
    <>
      <Breadcrumb title={safeProduct.name} pages={["shop details"]} />

      {safeProduct.name ? (
        <>
          <section className="overflow-hidden relative pb-12 pt-4 lg:pt-12 xl:pt-16">
            <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
              <div className="flex flex-col lg:flex-row gap-5 xl:gap-12">
                {/* Cột trái: Ảnh và Price/Action */}
                <div className="lg:max-w-[570px] w-full">
                  {/* Div riêng cho ảnh sản phẩm */}
                  <div className="lg:min-h-[512px] rounded-lg shadow-1 bg-gray-2 p-4 sm:p-7.5 relative flex items-center justify-center mb-5">
                    <div className="w-full">
                      <Image
                        src={selectedImage || getImageUrl(safeProduct.thumbnailUrl)}
                        alt={safeProduct.name}
                        width={570}
                        height={512}
                        className="object-contain w-full h-full"
                        style={{ width: "auto", height: "auto" }}
                        unoptimized={(selectedImage || safeProduct.thumbnailUrl)?.startsWith('http://') || (selectedImage || safeProduct.thumbnailUrl)?.startsWith('https://')}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/products/product-1-bg-1.png";
                        }}
                        priority
                        sizes="(max-width: 768px) 100vw, 570px"
                      />
                      
                      {/* Thumbnail Gallery - 4 ảnh nhỏ dưới ảnh chính */}
                      {(() => {
                        const allImages = getAllImages();
                        
                        if (allImages.length > 0) {
                          return (
                            <div className="mt-4 flex gap-2 justify-center">
                              {allImages.map((imgUrl, index) => {
                                const imageUrl = getImageUrl(imgUrl);
                                const isSelected = selectedImage === imageUrl || (!selectedImage && index === 0);
                                
                                return (
                                  <button
                                    key={index}
                                    onClick={() => setSelectedImage(imageUrl)}
                                    className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                      isSelected 
                                        ? 'border-blue-500 shadow-lg scale-105' 
                                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                                    }`}
                                    aria-label={`Xem ảnh ${index + 1}`}
                                  >
                                    <Image
                                      src={imageUrl}
                                      alt={`${safeProduct.name} - Ảnh ${index + 1}`}
                                      fill
                                      className="object-cover"
                                      unoptimized={imageUrl.startsWith('http://') || imageUrl.startsWith('https://')}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "/images/products/product-1-bg-1.png";
                                      }}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>

                  {/* Div riêng cho Price, Rating và Action Buttons */}
                  <div>
                    {/* Price and Rating */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-3xl font-bold text-blue">
                          {selectedSKU
                            ? `${selectedSKU.price.toLocaleString('vi-VN')} VNĐ`
                            : safeProduct.price > 0
                              ? `${safeProduct.price.toLocaleString('vi-VN')} VNĐ`
                              : 'Liên hệ'
                          }
                        </h3>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="w-4 h-4 text-yellow-400" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z" fill="currentColor" />
                            </svg>
                          ))}
                          <span className="text-sm text-gray-600 ml-1">(5 reviews)</span>
                        </div>
                      </div>
                      {selectedSKU && selectedSKU.stock > 0 && (
                        <div className="text-sm text-green-600">
                          Còn {selectedSKU.stock} sản phẩm
                        </div>
                      )}
                      {selectedSKU && selectedSKU.stock === 0 && (
                        <div className="text-sm text-red-600 font-medium">
                          Hết hàng
                        </div>
                      )}
                    </div>

                    {/* SKU Selection */}
                    {skus.length > 0 && (
                      <div className="bg-white shadow-1 rounded-lg p-4 mb-5">
                        <h4 className="font-semibold text-lg text-dark mb-3">
                          Chọn phiên bản sản phẩm
                        </h4>
                        {loadingSKUs ? (
                          <div className="text-center py-4">
                            <span className="text-gray-500">Đang tải...</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {skus.map((sku) => (
                              <button
                                key={sku.id}
                                type="button"
                                onClick={() => setSelectedSKU(sku)}
                                disabled={!sku.isActive || sku.stock === 0}
                                className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                                  selectedSKU?.id === sku.id
                                    ? 'border-blue bg-blue-50'
                                    : 'border-gray-300 hover:border-blue-300'
                                } ${
                                  !sku.isActive || sku.stock === 0
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold text-dark">
                                    {sku.skuCode}
                                  </span>
                                  <span className="font-bold text-blue">
                                    {sku.price.toLocaleString('vi-VN')} VNĐ
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                                  {Object.entries(sku.specs).map(([key, value]) => (
                                    <span key={key} className="bg-gray-100 px-2 py-1 rounded">
                                      {key}: {value}
                                    </span>
                                  ))}
                                </div>
                                <div className="mt-2 flex items-center justify-between text-sm">
                                  <span className={sku.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                                    {sku.stock > 0 ? `Còn ${sku.stock} sp` : 'Hết hàng'}
                                  </span>
                                  {!sku.isActive && (
                                    <span className="text-red-600">Ngừng kinh doanh</span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <form onSubmit={handleAddToCart}>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center rounded-md border border-gray-300">
                          <button
                            type="button"
                            aria-label="button for remove product"
                            className="flex items-center justify-center w-10 h-10 ease-out duration-200 hover:text-blue"
                            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                          >
                            <svg className="fill-current w-4 h-4" viewBox="0 0 20 20">
                              <path d="M3.33301 10.0001C3.33301 9.53984 3.7061 9.16675 4.16634 9.16675H15.833C16.2932 9.16675 16.6663 9.53984 16.6663 10.0001C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10.0001Z" />
                            </svg>
                          </button>
                          <span className="flex items-center justify-center w-12 h-10 border-x border-gray-300 text-sm font-medium">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity(quantity + 1)}
                            aria-label="button for add product"
                            className="flex items-center justify-center w-10 h-10 ease-out duration-200 hover:text-blue"
                          >
                            <svg className="fill-current w-4 h-4" viewBox="0 0 20 20">
                              <path d="M3.33301 10C3.33301 9.5398 3.7061 9.16671 4.16634 9.16671H15.833C16.2932 9.16671 16.6663 9.5398 16.6663 10C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10Z" />
                              <path d="M9.99967 16.6667C9.53944 16.6667 9.16634 16.2936 9.16634 15.8334L9.16634 4.16671C9.16634 3.70647 9.53944 3.33337 9.99967 3.33337C10.4599 3.33337 10.833 3.70647 10.833 4.16671L10.833 15.8334C10.833 16.2936 10.4599 16.6667 9.99967 16.6667Z" />
                            </svg>
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={!selectedSKU || selectedSKU.stock === 0 || !selectedSKU.isActive}
                          className="flex-1 bg-blue text-white py-2.5 px-6 rounded-md font-medium hover:bg-blue-dark transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {!selectedSKU
                            ? 'Chọn phiên bản'
                            : selectedSKU.stock === 0
                              ? 'Hết hàng'
                              : !selectedSKU.isActive
                                ? 'Ngừng kinh doanh'
                                : 'Thêm vào giỏ hàng'
                          }
                        </button>

                        <button
                          type="button"
                          className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M5.62436 4.42423C3.96537 5.18256 2.75 6.98626 2.75 9.13713C2.75 11.3345 3.64922 13.0283 4.93829 14.4798C6.00072 15.6761 7.28684 16.6677 8.54113 17.6346C8.83904 17.8643 9.13515 18.0926 9.42605 18.3219C9.95208 18.7366 10.4213 19.1006 10.8736 19.3649C11.3261 19.6293 11.6904 19.75 12 19.75C12.3096 19.75 12.6739 19.6293 13.1264 19.3649C13.5787 19.1006 14.0479 18.7366 14.574 18.3219C14.8649 18.0926 15.161 17.8643 15.4589 17.6346C16.7132 16.6677 17.9993 15.6761 19.0617 14.4798C20.3508 13.0283 21.25 11.3345 21.25 9.13713C21.25 6.98626 20.0346 5.18256 18.3756 4.42423C16.7639 3.68751 14.5983 3.88261 12.5404 6.02077C12.399 6.16766 12.2039 6.25067 12 6.25067C11.7961 6.25067 11.601 6.16766 11.4596 6.02077C9.40166 3.88261 7.23607 3.68751 5.62436 4.42423ZM12 4.45885C9.68795 2.39027 7.09896 2.1009 5.00076 3.05999C2.78471 4.07296 1.25 6.42506 1.25 9.13713C1.25 11.8027 2.3605 13.8361 3.81672 15.4758C4.98287 16.789 6.41022 17.888 7.67083 18.8586C7.95659 19.0786 8.23378 19.2921 8.49742 19.4999C9.00965 19.9037 9.55954 20.3343 10.1168 20.66C10.6739 20.9855 11.3096 21.25 12 21.25C12.6904 21.25 13.3261 20.9855 13.8832 20.66C14.4405 20.3343 14.9903 19.9037 15.5026 19.4999C15.7662 19.2921 16.0434 19.0786 16.3292 18.8586C17.5898 17.888 19.0171 16.789 20.1833 15.4758C21.6395 13.8361 22.75 11.8027 22.75 9.13713C22.75 6.42506 21.2153 4.07296 18.9992 3.05999C16.901 2.1009 14.3121 2.39027 12 4.45885Z" />
                          </svg>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Product content */}
                <div className="max-w-[539px] w-full">
                  {/* Product Header */}
                  <div className="mb-4">
                    <h2 className="font-bold text-2xl sm:text-3xl text-dark mb-2">
                      {safeProduct.name}
                    </h2>
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-gray-600 text-sm bg-gray-100 px-2 py-1 rounded">{safeProduct.brandName}</span>
                      <span className="text-gray-600 text-sm bg-gray-100 px-2 py-1 rounded">{safeProduct.categoryName}</span>
                      {isHydrated && isLogin && (
                        <span className="text-green-600 text-sm bg-green-100 px-2 py-1 rounded flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Đã đăng nhập
                        </span>
                      )}
                      {isHydrated && !isLogin && (
                        <span className="text-orange-600 text-sm bg-orange-100 px-2 py-1 rounded flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Chưa đăng nhập
                        </span>
                      )}
                    </div>
                  </div>


                  {/* Product Description */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-lg text-dark mb-2">Mô tả sản phẩm</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{safeProduct.description}</p>
                  </div>

                  {/* Technical Specifications - Gộp lại thành 1 bảng (Thu nhỏ) */}
                  {Object.keys(mergedSpecs).length > 0 && (
                    <div className="mb-6">
                      <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-xl border-2 border-amber-400 shadow-xl hover:shadow-2xl ring-2 ring-amber-200 ring-opacity-50 transition-all duration-300 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 px-4 py-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                          </svg>
                          <h5 className="font-bold text-white text-lg">
                            Thông số kỹ thuật
                          </h5>
                        </div>
                        <div className="p-4">
                          <div className="space-y-1.5">
                            {Object.entries(mergedSpecs).map(([key, value]) => (
                              <div
                                key={key}
                                className="flex items-start gap-4 py-1.5 px-3 rounded-lg transition-all bg-white/60 hover:bg-white/80 border border-amber-200"
                              >
                                <span className="font-semibold text-sm whitespace-nowrap flex-shrink-0 w-[180px] text-amber-900">
                                  {key}:
                                </span>
                                <span className="text-sm font-medium flex-1 break-words text-amber-800">
                                  {value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}



                </div>
              </div>


            </div>
          </section>

        </>
      ) : null}
    </>
  );
};

export default ShopDetails;