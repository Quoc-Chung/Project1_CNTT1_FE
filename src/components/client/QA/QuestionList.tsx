"use client";
import React, { useState, useEffect } from "react";
import { QAService } from "@/services/QAService";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { toast } from "react-toastify";

interface Question {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  title: string;
  content: string;
  category?: {
    id: number;
    name: string;
    slug: string;
    icon?: string;
  };
  likeCount: number;
  viewCount: number;
  answerCount: number;
  status: string;
  isVerified: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: Array<{
    id: number;
    name: string;
    usageCount?: number;
  }>;
}

const QuestionList = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [hotQuestions, setHotQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const router = useRouter();
  const { isLogin, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    fetchQuestions();
    fetchHotQuestions();
  }, [currentPage, selectedCategory]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;

      if (selectedCategory) {
        response = await QAService.getQuestionsByCategory(
          selectedCategory,
          currentPage,
          20,
          token
        );
      } else {
        response = await QAService.getAllQuestions(currentPage, 20, token);
      }

      if (response.status === "SUCCESS" && response.data) {
        setQuestions(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      } else {
        setQuestions([]);
        setTotalPages(0);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Không thể tải danh sách câu hỏi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHotQuestions = async () => {
    try {
      const response = await QAService.getHotQuestions(5, token);

      if (response.status === "SUCCESS" && response.data) {
        setHotQuestions(response.data);
      }
    } catch (err) {
      console.error("Error fetching hot questions:", err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchKeyword.trim()) {
      fetchQuestions();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await QAService.searchQuestions(
        searchKeyword.trim(),
        0,
        20,
        token
      );

      if (response.status === "SUCCESS" && response.data) {
        setQuestions(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setCurrentPage(0);
      }
    } catch (err) {
      console.error("Error searching questions:", err);
      setError("Không thể tìm kiếm. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = () => {
    if (!isLogin) {
      toast.warning("Vui lòng đăng nhập để đặt câu hỏi!");
      router.push("/signin");
      return;
    }

    router.push("/qa/create");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading && questions.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
        <p className="mt-4 text-gray-600">Đang tải câu hỏi...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-dark">Hỏi đáp</h1>
            <button
              onClick={handleCreateQuestion}
              className="px-6 py-3 bg-blue text-white rounded-lg font-semibold hover:bg-blue-dark transition-colors"
            >
              Đặt câu hỏi
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm kiếm câu hỏi..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>
        </div>

        {/* Filter */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-600">Lọc:</span>
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedCategory === null
                ? "bg-blue text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setSelectedCategory(1)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedCategory === 1
                ? "bg-blue text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            💻 Laptop
          </button>
          <button
            onClick={() => setSelectedCategory(2)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedCategory === 2
                ? "bg-blue text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📱 Điện thoại
          </button>
        </div>

        {error && (
          <div className="py-12 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!error && questions.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-600">Chưa có câu hỏi nào.</p>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {questions.map((question) => (
            <Link
              key={question.id}
              href={`/qa/${question.id}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={question.userAvatar || "/images/user/user-default.png"}
                    alt={question.userName}
                    fill
                    className="object-cover"
                    unoptimized={question.userAvatar?.startsWith("http")}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/user/user-default.png";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg text-dark hover:text-blue">
                      {question.title}
                    </h3>
                    {question.isVerified && (
                      <span className="text-green-600 text-xs bg-green-100 px-2 py-0.5 rounded">
                        ✓ Đã xác minh
                      </span>
                    )}
                    {question.isFeatured && (
                      <span className="text-orange-600 text-xs bg-orange-100 px-2 py-0.5 rounded">
                        ⭐ Nổi bật
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="font-medium">{question.userName}</span>
                    <span>•</span>
                    <span>{formatDate(question.createdAt)}</span>
                    {question.category && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          {question.category.icon && (
                            <span>{question.category.icon}</span>
                          )}
                          {question.category.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <p className="text-gray-700 text-sm leading-relaxed mb-3 line-clamp-2">
                {question.content}
              </p>

              {/* Tags */}
              {question.tags && question.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {question.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-600 pt-3 border-t border-gray-200">
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
                  <span>
                    {question.answerCount} câu trả lời
                  </span>
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
                  <span>{question.viewCount} lượt xem</span>
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
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>{question.likeCount} thích</span>
                </div>
              </div>
            </Link>
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

      {/* Sidebar */}
      <div className="lg:w-80 space-y-6">
        {/* Hot Questions */}
        {hotQuestions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
              <span>🔥</span>
              Câu hỏi HOT
            </h2>
            <div className="space-y-3">
              {hotQuestions.map((question) => (
                <Link
                  key={question.id}
                  href={`/qa/${question.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold text-sm text-dark hover:text-blue mb-2 line-clamp-2">
                    {question.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span>{question.viewCount} lượt xem</span>
                    <span>•</span>
                    <span>{question.answerCount} câu trả lời</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h2 className="text-lg font-bold text-dark mb-3">
            💡 Mẹo đặt câu hỏi tốt
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue mt-0.5">•</span>
              <span>Tiêu đề rõ ràng, ngắn gọn</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue mt-0.5">•</span>
              <span>Mô tả chi tiết vấn đề</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue mt-0.5">•</span>
              <span>Sử dụng tags phù hợp</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue mt-0.5">•</span>
              <span>Tìm kiếm trước khi hỏi</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QuestionList;
