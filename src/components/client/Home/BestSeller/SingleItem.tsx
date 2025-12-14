"use client";
import React, { useState, useEffect } from "react";
import { Product } from "@/types/Client/Product/ProductItem";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "../../../../redux/store";
import { addProductToCartAction } from "../../../../redux/Client/CartOrder/Action";
import { toast } from "react-toastify";
import { ProductService } from "@/services/ProductService";


const SingleItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const productId = item.originalId || item.id;

  // Reset image state khi item thay đổi
  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [item.id, item.imgs?.previews?.[0], item.imgs?.thumbnails?.[0]]);

  // Kiểm tra URL ảnh có hợp lệ không
  const isValidImageUrl = (url: string): boolean => {
    if (!url || url.trim() === "" || url === "undefined" || url === "null") {
      return false;
    }
    // Loại bỏ các URL mẫu hoặc không hợp lệ
    if (url.includes("example.com") || url.includes("placeholder") || url.includes("dummy")) {
      return false;
    }
    return true;
  };

  // Lấy URL ảnh với fallback
  const getImageUrl = () => {
    if (imageError) {
      return "/images/products/product-1-bg-1.png";
    }
    const imageUrl = item.imgs?.previews?.[0] || item.imgs?.thumbnails?.[0] || "";
    if (!isValidImageUrl(imageUrl)) {
      return "/images/products/product-1-bg-1.png";
    }
    return imageUrl.trim();
  };

  // Kiểm tra xem URL có phải external URL không
  const isExternalUrl = (url: string): boolean => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  // Validate productId
  if (!productId || productId === 'undefined' || productId === 'null') {
    console.error('Invalid product ID:', productId, item);
    return null;
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Kiểm tra đăng nhập
    if (!user || !token) {
      toast.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!", {
        autoClose: 2000,
        position: "top-right"
      });
      router.push('/signin');
      return;
    }

    // Kiểm tra nếu đang thêm vào giỏ hàng
    if (isAddingToCart) {
      return;
    }

    setIsAddingToCart(true);

    try {
      // Fetch SKU đầu tiên của sản phẩm
      const skuResponse = await ProductService.getSKUsByProductId(String(productId));

      if (!skuResponse.data || skuResponse.data.length === 0) {
        toast.error("Sản phẩm này hiện không có phiên bản nào khả dụng!");
        setIsAddingToCart(false);
        return;
      }

      // Lấy SKU đầu tiên
      const firstSKU = skuResponse.data[0];

      // Kiểm tra tồn kho
      if (firstSKU.stock < 1) {
        toast.error("Sản phẩm này đã hết hàng!");
        setIsAddingToCart(false);
        return;
      }

      // Thêm sản phẩm vào giỏ hàng với số lượng mặc định là 1
      dispatch(
        addProductToCartAction(
          {
            productId: String(productId),
            skuId: firstSKU.id,
            quantity: 1
          },
          token,
          (res) => {
            toast.success(`Đã thêm sản phẩm "${item.title}" vào giỏ hàng!`, {
              autoClose: 1500,
              position: "top-right"
            });
            setIsAddingToCart(false);
          },
          (err) => {
            if (err === "Token hết hạn") {
              // Clear token và redirect về trang đăng nhập
              dispatch({ type: "LOGOUT" });
              toast.warning("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!", {
                autoClose: 3000,
                position: "top-right"
              });
              router.push('/signin');
            } else {
              toast.error("Thêm sản phẩm thất bại: " + err);
            }
            setIsAddingToCart(false);
          }
        )
      );
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast.error("Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!");
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="group">
      <div className="relative overflow-hidden rounded-lg bg-[#F6F7FB] min-h-[403px] flex flex-col">
        {/* Ảnh sản phẩm - đưa lên trên cùng */}
        <div className="flex justify-center items-center pt-7.5 pb-4 px-4 flex-shrink-0">
          <div className="relative w-full h-[280px] flex items-center justify-center bg-white rounded-lg overflow-hidden" style={{ minHeight: '280px', maxHeight: '280px' }}>
            {imageLoading && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            )}
            <Image
              src={getImageUrl()}
              alt={item.title || "Sản phẩm"}
              fill
              className={`object-contain transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              style={{
                objectFit: 'contain',
                width: '100%',
                height: '100%',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={isExternalUrl(getImageUrl())}
              onLoad={() => {
                setImageLoading(false);
                setImageError(false);
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                setImageError(true);
                setImageLoading(false);
                // Chỉ set fallback nếu chưa phải là fallback image
                if (!target.src.includes("/images/products/product-1-bg-1.png")) {
                  target.src = "/images/products/product-1-bg-1.png";
                }
              }}
            />
          </div>
        </div>

        {/* Thông tin sản phẩm - đưa xuống dưới */}
        <div className="text-center px-4 pb-7.5 flex-1 flex flex-col justify-end">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z" fill="currentColor" />
                </svg>
              ))}
            </div>

            <p className="text-custom-sm">({item.reviews})</p>
          </div>

          <h3 className="font-medium text-dark ease-out duration-200 hover:text-blue mb-1.5">
            <Link href={`/shop-details/${String(productId)}`} prefetch={true} scroll={true}> {item.title} </Link>
          </h3>

          <span className="flex items-center justify-center gap-2 font-medium text-lg">
            <span className="text-dark">{item.discountedPrice.toLocaleString('vi-VN')}₫</span>
            {item.price !== item.discountedPrice && (
              <span className="text-dark-4 line-through">{item.price.toLocaleString('vi-VN')}₫</span>
            )}
          </span>
        </div>

        <div className="absolute right-0 bottom-0 translate-x-full u-w-full flex flex-col gap-2 p-5.5 ease-linear duration-300 group-hover:translate-x-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openModal(item);
            }}
            aria-label="button for quick view"
            id="bestOne"
            className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-dark bg-white hover:text-white hover:bg-blue"
          >
            <svg
              className="fill-current"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.99992 5.49996C6.61921 5.49996 5.49992 6.61925 5.49992 7.99996C5.49992 9.38067 6.61921 10.5 7.99992 10.5C9.38063 10.5 10.4999 9.38067 10.4999 7.99996C10.4999 6.61925 9.38063 5.49996 7.99992 5.49996ZM6.49992 7.99996C6.49992 7.17153 7.17149 6.49996 7.99992 6.49996C8.82835 6.49996 9.49992 7.17153 9.49992 7.99996C9.49992 8.82839 8.82835 9.49996 7.99992 9.49996C7.17149 9.49996 6.49992 8.82839 6.49992 7.99996Z"
                fill=""
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.99992 2.16663C4.9905 2.16663 2.96345 3.96942 1.78696 5.49787L1.76575 5.52543C1.49968 5.87098 1.25463 6.18924 1.08838 6.56556C0.910348 6.96854 0.833252 7.40775 0.833252 7.99996C0.833252 8.59217 0.910348 9.03138 1.08838 9.43436C1.25463 9.81068 1.49968 10.1289 1.76575 10.4745L1.78696 10.5021C2.96345 12.0305 4.9905 13.8333 7.99992 13.8333C11.0093 13.8333 13.0364 12.0305 14.2129 10.5021L14.2341 10.4745C14.5002 10.1289 14.7452 9.81069 14.9115 9.43436C15.0895 9.03138 15.1666 8.59217 15.1666 7.99996C15.1666 7.40775 15.0895 6.96854 14.9115 6.56556C14.7452 6.18923 14.5002 5.87097 14.2341 5.52541L14.2129 5.49787C13.0364 3.96942 11.0093 2.16663 7.99992 2.16663ZM2.5794 6.10783C3.66568 4.69657 5.43349 3.16663 7.99992 3.16663C10.5663 3.16663 12.3342 4.69657 13.4204 6.10783C13.7128 6.48769 13.8841 6.71466 13.9967 6.96966C14.102 7.20797 14.1666 7.49925 14.1666 7.99996C14.1666 8.50067 14.102 8.79195 13.9967 9.03026C13.8841 9.28526 13.7128 9.51223 13.4204 9.89209C12.3342 11.3033 10.5663 12.8333 7.99992 12.8333C5.43349 12.8333 3.66568 11.3033 2.5794 9.89209C2.28701 9.51223 2.11574 9.28525 2.00309 9.03026C1.89781 8.79195 1.83325 8.50067 1.83325 7.99996C1.83325 7.49925 1.89781 7.20797 2.00309 6.96966C2.11574 6.71466 2.28701 6.48769 2.5794 6.10783Z"
                fill=""
              />
            </svg>
          </button>

          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            aria-label="button for add to cart"
            id="addCartOne"
            className={`flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-dark bg-white hover:text-white hover:bg-blue ${isAddingToCart ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            title={isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
          >
            <svg
              className="fill-current"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1.4915 1.52567C1.22953 1.43835 0.94637 1.57993 0.859046 1.8419C0.771722 2.10387 0.913302 2.38703 1.17527 2.47436L1.35188 2.53322C1.80282 2.68354 2.10095 2.78371 2.32058 2.88589C2.52856 2.98264 2.61848 3.0605 2.67609 3.14043C2.7337 3.22037 2.77914 3.33029 2.80516 3.55819C2.83263 3.79886 2.83339 4.11337 2.83339 4.5887L2.83339 6.36993C2.83337 7.28166 2.83336 8.01654 2.91107 8.59451C2.99175 9.19459 3.16434 9.69984 3.56562 10.1011C3.9669 10.5024 4.47215 10.675 5.07222 10.7557C5.6502 10.8334 6.38507 10.8334 7.29679 10.8333H12.6667C12.9429 10.8333 13.1667 10.6095 13.1667 10.3333C13.1667 10.0572 12.9429 9.83335 12.6667 9.83335H7.33339C6.37644 9.83335 5.70903 9.83228 5.20547 9.76458C4.71628 9.69881 4.45724 9.57852 4.27273 9.39401C4.20826 9.32954 4.15164 9.25598 4.10244 9.16668H10.7057C11.0046 9.1667 11.2675 9.16671 11.4858 9.14315C11.7221 9.11764 11.951 9.06096 12.1664 8.91894C12.3818 8.77692 12.524 8.58882 12.6406 8.3817C12.7482 8.19036 12.8518 7.94869 12.9695 7.67396L13.2807 6.94778C13.537 6.34978 13.7515 5.84948 13.8588 5.44258C13.9708 5.01809 13.9999 4.57488 13.7358 4.17428C13.4716 3.77367 13.0528 3.62588 12.6185 3.56159C12.2022 3.49996 11.6579 3.49999 11.0073 3.50001L3.80456 3.50001C3.80273 3.48135 3.80078 3.46293 3.7987 3.44476C3.7618 3.12155 3.6814 2.82497 3.48733 2.55572C3.29327 2.28647 3.03734 2.11641 2.74238 1.9792C2.46489 1.85011 2.11201 1.73249 1.69443 1.59331L1.4915 1.52567ZM3.83339 4.50001C3.83339 4.52018 3.83339 4.54048 3.83339 4.56094L3.83339 6.33335C3.83339 7.11467 3.8341 7.70297 3.87121 8.16668H10.6813C11.0119 8.16668 11.2202 8.16601 11.3785 8.14892C11.5246 8.13314 11.5808 8.10724 11.6159 8.0841C11.651 8.06097 11.6969 8.01951 11.769 7.89139C11.847 7.7527 11.9298 7.56142 12.06 7.25756L12.3457 6.59089C12.622 5.94609 12.8057 5.51422 12.8919 5.18751C12.9756 4.87003 12.9332 4.77367 12.9009 4.72477C12.8687 4.67586 12.7968 4.5989 12.472 4.55081C12.1378 4.50133 11.6685 4.50001 10.967 4.50001H3.83339Z"
                fill=""
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.50005 13C3.50005 13.8284 4.17163 14.5 5.00005 14.5C5.82848 14.5 6.50005 13.8284 6.50005 13C6.50005 12.1716 5.82848 11.5 5.00005 11.5C4.17163 11.5 3.50005 12.1716 3.50005 13ZM5.00005 13.5C4.72391 13.5 4.50005 13.2762 4.50005 13C4.50005 12.7239 4.72391 12.5 5.00005 12.5C5.2762 12.5 5.50005 12.7239 5.50005 13C5.50005 13.2762 5.2762 13.5 5.00005 13.5Z"
                fill=""
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.0001 14.5001C10.1716 14.5001 9.50005 13.8285 9.50005 13.0001C9.50005 12.1716 10.1716 11.5001 11.0001 11.5001C11.8285 11.5001 12.5001 12.1716 12.5001 13.0001C12.5001 13.8285 11.8285 14.5001 11.0001 14.5001ZM10.5001 13.0001C10.5001 13.2762 10.7239 13.5001 11.0001 13.5001C11.2762 13.5001 11.5001 13.2762 11.5001 13.0001C11.5001 12.7239 11.2762 12.5001 11.0001 12.5001C10.7239 12.5001 10.5001 12.7239 10.5001 13.0001Z"
                fill=""
              />
            </svg>
          </button>

          <button
            onClick={() => {
            }}
            aria-label="button for add to fav"
            id="addFavOne"
            className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-dark bg-white hover:text-white hover:bg-blue"
          >
            <svg
              className="fill-current"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.74949 2.94946C2.6435 3.45502 1.83325 4.65749 1.83325 6.0914C1.83325 7.55633 2.43273 8.68549 3.29211 9.65318C4.0004 10.4507 4.85781 11.1118 5.694 11.7564C5.89261 11.9095 6.09002 12.0617 6.28395 12.2146C6.63464 12.491 6.94747 12.7337 7.24899 12.9099C7.55068 13.0862 7.79352 13.1667 7.99992 13.1667C8.20632 13.1667 8.44916 13.0862 8.75085 12.9099C9.05237 12.7337 9.3652 12.491 9.71589 12.2146C9.90982 12.0617 10.1072 11.9095 10.3058 11.7564C11.142 11.1118 11.9994 10.4507 12.7077 9.65318C13.5671 8.68549 14.1666 7.55633 14.1666 6.0914C14.1666 4.65749 13.3563 3.45502 12.2503 2.94946C11.1759 2.45832 9.73214 2.58839 8.36016 4.01382C8.2659 4.11175 8.13584 4.16709 7.99992 4.16709C7.864 4.16709 7.73393 4.11175 7.63967 4.01382C6.26769 2.58839 4.82396 2.45832 3.74949 2.94946ZM7.99992 2.97255C6.45855 1.5935 4.73256 1.40058 3.33376 2.03998C1.85639 2.71528 0.833252 4.28336 0.833252 6.0914C0.833252 7.86842 1.57358 9.22404 2.5444 10.3172C3.32183 11.1926 4.2734 11.9253 5.1138 12.5724C5.30431 12.7191 5.48911 12.8614 5.66486 12.9999C6.00636 13.2691 6.37295 13.5562 6.74447 13.7733C7.11582 13.9903 7.53965 14.1667 7.99992 14.1667C8.46018 14.1667 8.88401 13.9903 9.25537 13.7733C9.62689 13.5562 9.99348 13.2691 10.335 12.9999C10.5107 12.8614 10.6955 12.7191 10.886 12.5724C11.7264 11.9253 12.678 11.1926 13.4554 10.3172C14.4263 9.22404 15.1666 7.86842 15.1666 6.0914C15.1666 4.28336 14.1434 2.71528 12.6661 2.03998C11.2673 1.40058 9.54129 1.5935 7.99992 2.97255Z"
                fill=""
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleItem;
