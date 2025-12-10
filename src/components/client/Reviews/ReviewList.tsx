"use client";
import React, { useState, useEffect } from "react";
import { Review } from "@/types/Client/Review/Review";
import { ReviewService } from "@/services/ReviewService";
import Image from "next/image";

interface ReviewListProps {
  productId?: number | string;
  limit?: number;
  showAll?: boolean; // Thêm option để hiển thị tất cả reviews
}

const ReviewList = ({ productId, limit = 10, showAll = false }: ReviewListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        let response;
        // Nếu showAll = true hoặc không có productId, lấy tất cả reviews
        if (showAll || !productId) {
          response = await ReviewService.getAllReviews(currentPage, limit);
        } else {
          // Nếu có productId, filter theo productId (productId phải là string UUID)
          response = await ReviewService.getReviewsByProductId(
            String(productId),
            currentPage,
            limit
          );
        }

        // Response format: { status: "SUCCESS", data: { content: [], totalPages: ... } }
        if (response.status === "SUCCESS" && response.data) {
          setReviews(response.data.content || []);
          setTotalPages(response.data.totalPages || 0);
        } else {
          setReviews([]);
          setTotalPages(0);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Không thể tải đánh giá. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId, currentPage, limit, showAll]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating: number | null) => {
    if (rating === null) return null;

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${
              i < rating ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
        <p className="mt-4 text-gray-600">Đang tải đánh giá...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">Chưa có đánh giá nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-dark mb-6">
        Đánh giá & Câu hỏi ({reviews.length})
      </h3>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={review.userAvatar || "/images/user/user-default.png"}
                  alt={review.userName}
                  fill
                  className="object-cover"
                  unoptimized={review.userAvatar?.startsWith("http")}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/user/user-default.png";
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-lg text-dark">
                    {review.userName}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                {renderStars(review.rating)}
              </div>
            </div>

            {/* Category & Type */}
            <div className="flex items-center gap-2 mb-3">
              {review.category && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  <span>{review.category.icon}</span>
                  <span>{review.category.name}</span>
                </span>
              )}
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                {review.type}
              </span>
            </div>

            {/* Title */}
            {review.title && (
              <h5 className="font-semibold text-base text-dark mb-2">
                {review.title}
              </h5>
            )}

            {/* Content */}
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              {review.content}
            </p>

            {/* Tags */}
            {review.tags && review.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {review.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Footer Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-600 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>{review.likeCount} thích</span>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span>{review.viewCount} lượt xem</span>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span>{review.answerCount} câu trả lời</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Trước
          </button>
          <span className="text-sm text-gray-600">
            Trang {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
            }
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
