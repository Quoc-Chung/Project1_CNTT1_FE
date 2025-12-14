"use client";
import React, { useState } from "react";
import CreateReview from "./CreateReview";
import ReviewList from "./ReviewList";

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName?: string;
}

const ReviewDialog: React.FC<ReviewDialogProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
}) => {
  const [refreshReviews, setRefreshReviews] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Đánh giá sản phẩm
            </h2>
            {productName && (
              <p className="text-sm text-gray-600 mt-1">{productName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-full"
            aria-label="Đóng"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Create Review Form */}
          <CreateReview
            productId={productId}
            onReviewCreated={() => {
              setRefreshReviews((prev) => prev + 1);
            }}
          />

          {/* Reviews List */}
          <ReviewList
            productId={productId}
            limit={10}
            key={refreshReviews}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewDialog;

