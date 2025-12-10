"use client";
import React, { useState } from "react";
import { ReviewService } from "@/services/ReviewService";
import { useAppSelector } from "@/redux/store";
import { toast } from "react-toastify";

interface CreateReviewProps {
  productId: string;
  onReviewCreated?: () => void;
}

const CreateReview = ({ productId, onReviewCreated }: CreateReviewProps) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const { isLogin, token } = useAppSelector((state) => state.auth);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      // Giới hạn 5 ảnh
      if (images.length + files.length > 5) {
        toast.warning("Chỉ được tải lên tối đa 5 ảnh!");
        return;
      }

      // Kiểm tra kích thước file (max 5MB)
      const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast.warning("Kích thước ảnh không được vượt quá 5MB!");
        return;
      }

      setImages([...images, ...files]);

      // Create preview URLs
      const previews = files.map(file => URL.createObjectURL(file));
      setPreviewImages([...previewImages, ...previews]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);

    // Revoke URL to free memory
    URL.revokeObjectURL(previewImages[index]);

    setImages(newImages);
    setPreviewImages(newPreviews);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin || !token) {
      toast.warning("Vui lòng đăng nhập để đánh giá sản phẩm!");
      return;
    }

    if (!content.trim()) {
      toast.warning("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    setLoading(true);

    try {
      const reviewData = {
        productId,
        rating,
        content: content.trim(),
        tags: tags.length > 0 ? tags : undefined,
      };

      // Nếu có ảnh, gọi API multipart
      if (images.length > 0) {
        await ReviewService.createReviewWithImages(reviewData, images, token);
      } else {
        // Không có ảnh, gọi API JSON
        await ReviewService.createReview(reviewData, token);
      }

      toast.success("Đánh giá của bạn đã được gửi! Đang chờ duyệt.");

      // Reset form
      setRating(5);
      setContent("");
      setImages([]);
      setTags([]);
      setPreviewImages([]);

      // Callback để refresh danh sách reviews
      if (onReviewCreated) {
        onReviewCreated();
      }
    } catch (error: any) {
      console.error("Error creating review:", error);
      toast.error("Không thể gửi đánh giá. Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  if (!isLogin) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-800">
          Vui lòng đăng nhập để đánh giá sản phẩm
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-dark mb-4">Viết đánh giá của bạn</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-dark mb-2">
            Đánh giá sao
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <svg
                  className={`w-8 h-8 ${
                    star <= rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-dark mb-2">
            Nội dung đánh giá <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue resize-none"
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
            required
          />
        </div>

        {/* Images Upload */}
        <div>
          <label className="block text-sm font-semibold text-dark mb-2">
            Thêm ảnh (Tối đa 5 ảnh, mỗi ảnh tối đa 5MB)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif"
            multiple
            onChange={handleImageChange}
            className="hidden"
            id="image-upload"
            disabled={images.length >= 5}
          />
          <label
            htmlFor="image-upload"
            className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
              images.length >= 5 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm">Chọn ảnh</span>
          </label>

          {/* Image Previews */}
          {previewImages.length > 0 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {previewImages.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-dark mb-2">
            Tags
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue"
              placeholder="Nhập tag và nhấn Enter"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Thêm
            </button>
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="px-6 py-3 bg-blue text-white rounded-lg font-semibold hover:bg-blue-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Đang gửi...
              </span>
            ) : (
              "Gửi đánh giá"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateReview;
