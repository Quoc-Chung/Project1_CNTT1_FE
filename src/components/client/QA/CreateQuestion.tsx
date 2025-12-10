"use client";
import React, { useState } from "react";
import { QAService } from "@/services/QAService";
import { useAppSelector } from "@/redux/store";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const CreateQuestion = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { isLogin, token } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin || !token) {
      toast.warning("Vui lòng đăng nhập để đặt câu hỏi!");
      router.push("/signin");
      return;
    }

    if (!title.trim()) {
      toast.warning("Vui lòng nhập tiêu đề câu hỏi!");
      return;
    }

    if (!content.trim()) {
      toast.warning("Vui lòng nhập nội dung câu hỏi!");
      return;
    }

    setLoading(true);

    try {
      const response = await QAService.createQuestion(
        {
          title: title.trim(),
          content: content.trim(),
          categoryId,
          tags,
        },
        token
      );

      if (response.status === "SUCCESS") {
        toast.success("Câu hỏi của bạn đã được gửi! Đang chờ duyệt.");

        // Redirect to question list
        router.push("/qa");
      } else {
        toast.error(response.message || "Không thể gửi câu hỏi!");
      }
    } catch (error: any) {
      console.error("Error creating question:", error);
      toast.error("Không thể gửi câu hỏi. Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  if (!isLogin) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800 mb-4 text-lg">
          Vui lòng đăng nhập để đặt câu hỏi
        </p>
        <button
          onClick={() => router.push("/signin")}
          className="px-6 py-3 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors font-semibold"
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-3xl font-bold text-dark mb-6">Đặt câu hỏi mới</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-dark mb-2">
            Danh mục <span className="text-red-500">*</span>
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue"
            required
          >
            <option value={1}>💻 Laptop</option>
            <option value={2}>📱 Điện thoại</option>
            <option value={3}>🖥️ PC & Máy tính bàn</option>
            <option value={4}>⌨️ Phụ kiện</option>
            <option value={5}>🎮 Gaming</option>
            <option value={6}>❓ Khác</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-dark mb-2">
            Tiêu đề câu hỏi <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue"
            placeholder="VD: Laptop nào phù hợp cho lập trình và gaming?"
            required
            maxLength={200}
          />
          <p className="text-xs text-gray-500 mt-1">
            {title.length}/200 ký tự
          </p>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-dark mb-2">
            Nội dung chi tiết <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue resize-none"
            placeholder="Mô tả chi tiết câu hỏi của bạn..."
            required
          />
          <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 font-semibold mb-2">
              💡 Mẹo viết câu hỏi tốt:
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Mô tả rõ ràng vấn đề bạn đang gặp phải</li>
              <li>• Cung cấp thông tin về ngân sách, nhu cầu sử dụng</li>
              <li>• Đề cập các sản phẩm bạn đang cân nhắc (nếu có)</li>
              <li>• Tìm kiếm trước để tránh hỏi câu hỏi trùng lặp</li>
            </ul>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-dark mb-2">
            Tags (Từ khóa)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue"
              placeholder="Nhập tag và nhấn Enter"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Thêm
            </button>
          </div>
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Tags giúp người khác tìm thấy câu hỏi của bạn dễ dàng hơn
          </p>
        </div>

        {/* Preview */}
        {(title || content) && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-dark mb-3">
              Xem trước câu hỏi
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {title && (
                <h4 className="text-xl font-bold text-dark mb-2">{title}</h4>
              )}
              {content && (
                <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
              )}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading || !title.trim() || !content.trim()}
            className="px-8 py-3 bg-blue text-white rounded-lg font-semibold hover:bg-blue-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
              "Gửi câu hỏi"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuestion;
