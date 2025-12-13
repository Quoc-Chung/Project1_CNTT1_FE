// TRANG HIỂN THỊ SẢN  PHẨM NHANH 
"use client";
import React, { useEffect, useState } from "react";

import { useModalContext } from "@/app/context/QuickViewModalContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { formatPrice } from "@/utils/helpers";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { addProductToCartAction } from "../../../redux/Client/CartOrder/Action";
import { toast } from "react-toastify";
import { ProductService } from "@/services/ProductService";

const QuickViewModal = () => {
  const { isModalOpen, closeModal, product } = useModalContext();
  const { openPreviewModal } = usePreviewSlider();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const [activePreview, setActivePreview] = useState(0);

  // Reset activePreview when product changes
  useEffect(() => {
    if (product) {
      setActivePreview(0);
    }
  }, [product]);

  // Calculate discount percentage
  const discountPercentage = product && product.price > 0 && product.discountedPrice > 0 && product.discountedPrice !== product.price
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  // Get product images
  const productImages = product?.imgs?.previews || [];
  const currentImage = productImages[activePreview] || productImages[0] || "/images/products/product-1.jpg";

  // Calculate rating (assuming 5 stars max, based on reviews)
  // Default to 4.5 if no reviews, or calculate based on review count
  const rating = product?.reviews 
    ? Math.min(5, Math.max(1, Math.round((product.reviews / 10) * 10) / 10)) 
    : 4.5;

  const handlePreviewSlider = () => {
    openPreviewModal();
  };

  const productId = product?.originalId || product?.id;

  const handleAddToCart = async () => {
    // Kiểm tra đăng nhập
    if (!user || !token) {
      toast.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!", {
        autoClose: 2000,
        position: "top-right"
      });
      closeModal();
      router.push('/signin');
      return;
    }

    // Kiểm tra nếu đang thêm vào giỏ hàng
    if (isAddingToCart || !productId) {
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
      if (firstSKU.stock < quantity) {
        toast.error(`Sản phẩm này chỉ còn ${firstSKU.stock} sản phẩm trong kho!`);
        setIsAddingToCart(false);
        return;
      }

      // Thêm sản phẩm vào giỏ hàng với số lượng đã chọn
      dispatch(
        addProductToCartAction(
          {
            productId: String(productId),
            skuId: firstSKU.id,
            quantity: quantity
          },
          token,
          (res) => {
            toast.success(`Đã thêm ${quantity} sản phẩm "${product?.title}" vào giỏ hàng!`, {
              autoClose: 1500,
              position: "top-right"
            });
            setIsAddingToCart(false);
            setQuantity(1);
            closeModal();
          },
          (err) => {
            if (err === "Token hết hạn") {
              // Clear token và redirect về trang đăng nhập
              dispatch({ type: "LOGOUT" });
              toast.warning("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!", {
                autoClose: 3000,
                position: "top-right"
              });
              closeModal();
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest(".modal-content")) {
        closeModal();
      }
    }

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      setQuantity(1);
    };
  }, [isModalOpen, closeModal]);

  // Don't render if modal is closed or no product
  if (!isModalOpen || !product) {
    return null;
  }

  return (
    <div
      className="z-99999 fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen sm:py-20 xl:py-25 2xl:py-[230px] bg-dark/70 sm:px-8 px-4 py-5"
    >
      <div className="flex items-center justify-center ">
        <div className="w-full max-w-[1100px] rounded-xl shadow-3 bg-white p-7.5 relative modal-content">
          <button
            onClick={() => closeModal()}
            aria-label="button for close modal"
            className="absolute top-0 right-0 sm:top-6 sm:right-6 flex items-center justify-center w-10 h-10 rounded-full ease-in duration-150 bg-meta text-body hover:text-dark"
          >
            <svg
              className="fill-current"
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.3108 13L19.2291 8.08167C19.5866 7.72417 19.5866 7.12833 19.2291 6.77083C19.0543 6.59895 18.8189 6.50262 18.5737 6.50262C18.3285 6.50262 18.0932 6.59895 17.9183 6.77083L13 11.6892L8.08164 6.77083C7.90679 6.59895 7.67142 6.50262 7.42623 6.50262C7.18104 6.50262 6.94566 6.59895 6.77081 6.77083C6.41331 7.12833 6.41331 7.72417 6.77081 8.08167L11.6891 13L6.77081 17.9183C6.41331 18.2758 6.41331 18.8717 6.77081 19.2292C7.12831 19.5867 7.72414 19.5867 8.08164 19.2292L13 14.3108L17.9183 19.2292C18.2758 19.5867 18.8716 19.5867 19.2291 19.2292C19.5866 18.8717 19.5866 18.2758 19.2291 17.9183L14.3108 13Z"
                fill=""
              />
            </svg>
          </button>

          <div className="flex flex-wrap items-center gap-12.5">
            <div className="max-w-[526px] w-full">
              <div className="flex gap-5">
                <div className="flex flex-col gap-5">
                  {productImages.length > 0 ? (
                    productImages.map((img, key) => (
                      <button
                        onClick={() => setActivePreview(key)}
                        key={key}
                        className={`flex items-center justify-center w-20 h-20 overflow-hidden rounded-lg bg-gray-1 ease-out duration-200 hover:border-2 hover:border-blue ${
                          activePreview === key && "border-2 border-blue"
                        }`}
                      >
                        <Image
                          src={img || ""}
                          alt="thumbnail"
                          width={61}
                          height={61}
                          className="aspect-square object-contain"
                          style={{ width: "auto", height: "auto" }}
                          unoptimized
                        />
                      </button>
                    ))
                  ) : null}
                </div>

                <div className="relative z-1 overflow-hidden flex items-center justify-center w-full sm:min-h-[508px] bg-gray-1 rounded-lg border border-gray-3">
                  <div>
                    <button
                      onClick={handlePreviewSlider}
                      aria-label="button for zoom"
                      className="gallery__Image w-10 h-10 rounded-[5px] bg-white shadow-1 flex items-center justify-center ease-out duration-200 text-dark hover:text-blue absolute top-4 lg:top-8 right-4 lg:right-8 z-50"
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M9.11493 1.14581L9.16665 1.14581C9.54634 1.14581 9.85415 1.45362 9.85415 1.83331C9.85415 2.21301 9.54634 2.52081 9.16665 2.52081C7.41873 2.52081 6.17695 2.52227 5.23492 2.64893C4.31268 2.77292 3.78133 3.00545 3.39339 3.39339C3.00545 3.78133 2.77292 4.31268 2.64893 5.23492C2.52227 6.17695 2.52081 7.41873 2.52081 9.16665C2.52081 9.54634 2.21301 9.85415 1.83331 9.85415C1.45362 9.85415 1.14581 9.54634 1.14581 9.16665L1.14581 9.11493C1.1458 7.43032 1.14579 6.09599 1.28619 5.05171C1.43068 3.97699 1.73512 3.10712 2.42112 2.42112C3.10712 1.73512 3.97699 1.43068 5.05171 1.28619C6.09599 1.14579 7.43032 1.1458 9.11493 1.14581ZM16.765 2.64893C15.823 2.52227 14.5812 2.52081 12.8333 2.52081C12.4536 2.52081 12.1458 2.21301 12.1458 1.83331C12.1458 1.45362 12.4536 1.14581 12.8333 1.14581L12.885 1.14581C14.5696 1.1458 15.904 1.14579 16.9483 1.28619C18.023 1.43068 18.8928 1.73512 19.5788 2.42112C20.2648 3.10712 20.5693 3.97699 20.7138 5.05171C20.8542 6.09599 20.8542 7.43032 20.8541 9.11494V9.16665C20.8541 9.54634 20.5463 9.85415 20.1666 9.85415C19.787 9.85415 19.4791 9.54634 19.4791 9.16665C19.4791 7.41873 19.4777 6.17695 19.351 5.23492C19.227 4.31268 18.9945 3.78133 18.6066 3.39339C18.2186 3.00545 17.6873 2.77292 16.765 2.64893ZM1.83331 12.1458C2.21301 12.1458 2.52081 12.4536 2.52081 12.8333C2.52081 14.5812 2.52227 15.823 2.64893 16.765C2.77292 17.6873 3.00545 18.2186 3.39339 18.6066C3.78133 18.9945 4.31268 19.227 5.23492 19.351C6.17695 19.4777 7.41873 19.4791 9.16665 19.4791C9.54634 19.4791 9.85415 19.787 9.85415 20.1666C9.85415 20.5463 9.54634 20.8541 9.16665 20.8541H9.11494C7.43032 20.8542 6.09599 20.8542 5.05171 20.7138C3.97699 20.5693 3.10712 20.2648 2.42112 19.5788C1.73512 18.8928 1.43068 18.023 1.28619 16.9483C1.14579 15.904 1.1458 14.5696 1.14581 12.885L1.14581 12.8333C1.14581 12.4536 1.45362 12.1458 1.83331 12.1458ZM20.1666 12.1458C20.5463 12.1458 20.8541 12.4536 20.8541 12.8333V12.885C20.8542 14.5696 20.8542 15.904 20.7138 16.9483C20.5693 18.023 20.2648 18.8928 19.5788 19.5788C18.8928 20.2648 18.023 20.5693 16.9483 20.7138C15.904 20.8542 14.5696 20.8542 12.885 20.8541H12.8333C12.4536 20.8541 12.1458 20.5463 12.1458 20.1666C12.1458 19.787 12.4536 19.4791 12.8333 19.4791C14.5812 19.4791 15.823 19.4777 16.765 19.351C17.6873 19.227 18.2186 18.9945 18.6066 18.6066C18.9945 18.2186 19.227 17.6873 19.351 16.765C19.4777 15.823 19.4791 14.5812 19.4791 12.8333C19.4791 12.4536 19.787 12.1458 20.1666 12.1458Z"
                          fill=""
                        />
                      </svg>
                    </button>

                    <Image
                      src={currentImage}
                      alt={product?.title || "products-details"}
                      width={400}
                      height={400}
                      className="object-contain"
                      style={{ width: "auto", height: "auto" }}
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-[445px] w-full">
              {discountPercentage > 0 && (
                <span className="inline-block text-custom-xs font-medium text-white py-1 px-3 bg-green mb-6.5">
                  SALE {discountPercentage}% OFF
                </span>
              )}

              <h3 className="font-semibold text-xl xl:text-heading-5 text-dark mb-4">
                {product?.title || "Sản phẩm"}
              </h3>

              <div className="flex flex-wrap items-center gap-5 mb-6">
                <div className="flex items-center gap-1.5">
                  {/* <!-- stars --> */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={i < rating ? "text-yellow-400" : "fill-gray-4"}
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z"
                          fill="currentColor"
                        />
                      </svg>
                    ))}
                  </div>

                  <span>
                    <span className="font-medium text-dark"> {rating.toFixed(1)} Rating </span>
                    <span className="text-dark-2"> ({product?.reviews || 0} reviews) </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_375_9221)">
                      <path
                        d="M10 0.5625C4.78125 0.5625 0.5625 4.78125 0.5625 10C0.5625 15.2188 4.78125 19.4688 10 19.4688C15.2188 19.4688 19.4688 15.2188 19.4688 10C19.4688 4.78125 15.2188 0.5625 10 0.5625ZM10 18.0625C5.5625 18.0625 1.96875 14.4375 1.96875 10C1.96875 5.5625 5.5625 1.96875 10 1.96875C14.4375 1.96875 18.0625 5.59375 18.0625 10.0312C18.0625 14.4375 14.4375 18.0625 10 18.0625Z"
                        fill="#22AD5C"
                      />
                      <path
                        d="M12.6875 7.09374L8.9688 10.7187L7.2813 9.06249C7.00005 8.78124 6.56255 8.81249 6.2813 9.06249C6.00005 9.34374 6.0313 9.78124 6.2813 10.0625L8.2813 12C8.4688 12.1875 8.7188 12.2812 8.9688 12.2812C9.2188 12.2812 9.4688 12.1875 9.6563 12L13.6875 8.12499C13.9688 7.84374 13.9688 7.40624 13.6875 7.12499C13.4063 6.84374 12.9688 6.84374 12.6875 7.09374Z"
                        fill="#22AD5C"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_375_9221">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>

                  <span className="font-medium text-dark"> In Stock </span>
                </div>
              </div>

              {product?.title && (
                <p className="text-dark-2">
                  {product.title}
                </p>
              )}

              <div className="flex flex-wrap justify-between gap-5 mt-6 mb-7.5">
                <div>
                  <h4 className="font-semibold text-lg text-dark mb-3.5">
                    Price
                  </h4>

                  {product && product.price > 0 ? (
                    <span className="flex items-center gap-2">
                      {product.discountedPrice > 0 && product.discountedPrice !== product.price ? (
                        <>
                          <span className="font-semibold text-dark text-xl xl:text-heading-4">
                            {formatPrice(product.discountedPrice)}
                          </span>
                          <span className="font-medium text-dark-4 text-lg xl:text-2xl line-through">
                            {formatPrice(product.price)}
                          </span>
                        </>
                      ) : (
                        <span className="font-semibold text-dark text-xl xl:text-heading-4">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="font-semibold text-dark text-xl xl:text-heading-4">
                      Liên hệ
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-lg text-dark mb-3.5">
                    Quantity
                  </h4>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                      aria-label="button for remove product"
                      className="flex items-center justify-center w-10 h-10 rounded-[5px] bg-gray-2 text-dark ease-out duration-200 hover:text-blue"
                      disabled={quantity < 0 && true}
                    >
                      <svg
                        className="fill-current"
                        width="16"
                        height="2"
                        viewBox="0 0 16 2"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M-8.548e-08 0.977778C-3.82707e-08 0.437766 0.437766 3.82707e-08 0.977778 8.548e-08L15.0222 1.31328e-06C15.5622 1.36049e-06 16 0.437767 16 0.977779C16 1.51779 15.5622 1.95556 15.0222 1.95556L0.977778 1.95556C0.437766 1.95556 -1.32689e-07 1.51779 -8.548e-08 0.977778Z"
                          fill=""
                        />
                      </svg>
                    </button>

                    <span
                      className="flex items-center justify-center w-20 h-10 rounded-[5px] border border-gray-4 bg-white font-medium text-dark"
                      x-text="quantity"
                    >
                      {quantity}
                    </span>

                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      aria-label="button for add product"
                      className="flex items-center justify-center w-10 h-10 rounded-[5px] bg-gray-2 text-dark ease-out duration-200 hover:text-blue"
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
                          d="M8.08889 0C8.6289 2.36047e-08 9.06667 0.437766 9.06667 0.977778L9.06667 15.0222C9.06667 15.5622 8.6289 16 8.08889 16C7.54888 16 7.11111 15.5622 7.11111 15.0222L7.11111 0.977778C7.11111 0.437766 7.54888 -2.36047e-08 8.08889 0Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M0 7.91111C4.72093e-08 7.3711 0.437766 6.93333 0.977778 6.93333L15.0222 6.93333C15.5622 6.93333 16 7.3711 16 7.91111C16 8.45112 15.5622 8.88889 15.0222 8.88889L0.977778 8.88889C0.437766 8.88889 -4.72093e-08 8.45112 0 7.91111Z"
                          fill=""
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  disabled={quantity === 0 || isAddingToCart}
                  onClick={handleAddToCart}
                  className={`inline-flex font-medium text-white bg-blue py-1.5 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark ${
                    (quantity === 0 || isAddingToCart) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
