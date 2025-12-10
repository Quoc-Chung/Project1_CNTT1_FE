"use client";
import React, { useState, useEffect } from "react";
import { QAService } from "@/services/QAService";
import Image from "next/image";
import { useAppSelector } from "@/redux/store";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface QuestionDetailProps {
  questionId: number;
}

interface Answer {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  content: string;
  likeCount: number;
  dislikeCount: number;
  isBestAnswer: boolean;
  isVerified: boolean;
  isFromShop: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  answers: Answer[];
  answerCount: number;
  viewCount: number;
  likeCount: number;
  tags?: Array<{
    id: number;
    name: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const QuestionDetail = ({ questionId }: QuestionDetailProps) => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answerContent, setAnswerContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { isLogin, token, user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    fetchQuestionDetail();
  }, [questionId]);

  const fetchQuestionDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await QAService.getQuestionById(questionId, token);

      if (response.status === "SUCCESS" && response.data) {
        setQuestion(response.data);
      } else {
        setError("Không tìm thấy câu hỏi");
      }
    } catch (err) {
      console.error("Error fetching question detail:", err);
      setError("Không thể tải chi tiết câu hỏi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleLikeQuestion = async () => {
    if (!isLogin || !token) {
      toast.warning("Vui lòng đăng nhập để thích câu hỏi!");
      return;
    }

    try {
      await QAService.likeQuestion(questionId, token);
      toast.success("Đã thích câu hỏi!");
      fetchQuestionDetail(); // Refresh
    } catch (err) {
      console.error("Error liking question:", err);
      toast.error("Không thể thích câu hỏi!");
    }
  };

  const handleLikeAnswer = async (answerId: number) => {
    if (!isLogin || !token) {
      toast.warning("Vui lòng đăng nhập!");
      return;
    }

    try {
      await QAService.likeAnswer(answerId, token);
      toast.success("Đã thích câu trả lời!");
      fetchQuestionDetail();
    } catch (err) {
      console.error("Error liking answer:", err);
      toast.error("Không thể thích câu trả lời!");
    }
  };

  const handleDislikeAnswer = async (answerId: number) => {
    if (!isLogin || !token) {
      toast.warning("Vui lòng đăng nhập!");
      return;
    }

    try {
      await QAService.dislikeAnswer(answerId, token);
      toast.success("Đã dislike câu trả lời!");
      fetchQuestionDetail();
    } catch (err) {
      console.error("Error disliking answer:", err);
      toast.error("Không thể dislike câu trả lời!");
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin || !token) {
      toast.warning("Vui lòng đăng nhập để trả lời!");
      router.push("/signin");
      return;
    }

    if (!answerContent.trim()) {
      toast.warning("Vui lòng nhập nội dung câu trả lời!");
      return;
    }

    setSubmitting(true);

    try {
      await QAService.createAnswer(
        {
          questionId,
          content: answerContent.trim(),
        },
        token
      );

      toast.success("Câu trả lời của bạn đã được gửi!");
      setAnswerContent("");
      fetchQuestionDetail(); // Refresh
    } catch (err: any) {
      console.error("Error submitting answer:", err);
      toast.error("Không thể gửi câu trả lời. Vui lòng thử lại sau!");
    } finally {
      setSubmitting(false);
    }
  };

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

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
        <p className="mt-4 text-gray-600">Đang tải câu hỏi...</p>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600">{error || "Không tìm thấy câu hỏi"}</p>
        <button
          onClick={() => router.push("/qa")}
          className="mt-4 px-6 py-2 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Content */}
      <div className="flex-1">
        {/* Question */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* Category */}
          {question.category && (
            <div className="mb-3">
              <span className="inline-flex items-center gap-1 text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded">
                {question.category.icon && <span>{question.category.icon}</span>}
                <span>{question.category.name}</span>
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold text-dark mb-4">{question.title}</h1>

          {/* Author Info */}
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
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
            <div>
              <p className="font-semibold text-dark">{question.userName}</p>
              <p className="text-sm text-gray-600">{formatDate(question.createdAt)}</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose max-w-none mb-4">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {question.content}
            </p>
          </div>

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
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

          {/* Stats & Actions */}
          <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleLikeQuestion}
              className="flex items-center gap-2 text-gray-600 hover:text-blue transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{question.likeCount} thích</span>
            </button>
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{question.answerCount} câu trả lời</span>
            </div>
          </div>
        </div>

        {/* Answers */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-dark mb-4">
            {question.answerCount} câu trả lời
          </h2>

          <div className="space-y-4">
            {question.answers && question.answers.length > 0 ? (
              question.answers.map((answer) => (
                <div
                  key={answer.id}
                  className={`bg-white rounded-lg shadow-md p-6 ${
                    answer.isBestAnswer ? "border-2 border-green-500" : ""
                  }`}
                >
                  {/* Best Answer Badge */}
                  {answer.isBestAnswer && (
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 text-sm bg-green-100 text-green-800 px-3 py-1 rounded">
                        ✓ Câu trả lời hay nhất
                      </span>
                    </div>
                  )}

                  {/* Author */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={answer.userAvatar || "/images/user/user-default.png"}
                        alt={answer.userName}
                        fill
                        className="object-cover"
                        unoptimized={answer.userAvatar?.startsWith("http")}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/user/user-default.png";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-dark">{answer.userName}</p>
                        {answer.isVerified && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            ✓ Đã xác minh
                          </span>
                        )}
                        {answer.isFromShop && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                            🏪 Cửa hàng
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{formatDate(answer.createdAt)}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">
                    {answer.content}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleLikeAnswer(answer.id)}
                      className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
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
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        />
                      </svg>
                      <span>{answer.likeCount}</span>
                    </button>
                    <button
                      onClick={() => handleDislikeAnswer(answer.id)}
                      className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
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
                          d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                        />
                      </svg>
                      <span>{answer.dislikeCount}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600">Chưa có câu trả lời nào. Hãy là người đầu tiên trả lời!</p>
              </div>
            )}
          </div>
        </div>

        {/* Answer Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-dark mb-4">Câu trả lời của bạn</h3>

          {isLogin ? (
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <textarea
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue resize-none"
                placeholder="Viết câu trả lời của bạn..."
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !answerContent.trim()}
                  className="px-6 py-3 bg-blue text-white rounded-lg font-semibold hover:bg-blue-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? (
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
                    "Gửi câu trả lời"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-800 mb-3">
                Vui lòng đăng nhập để trả lời câu hỏi
              </p>
              <button
                onClick={() => router.push("/signin")}
                className="px-6 py-2 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors"
              >
                Đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:w-80">
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
          <h3 className="text-lg font-bold text-dark mb-4">Thông tin</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Câu hỏi:</span>
              <span className="font-semibold">{question.answerCount} trả lời</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Lượt xem:</span>
              <span className="font-semibold">{question.viewCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Lượt thích:</span>
              <span className="font-semibold">{question.likeCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Đã hỏi:</span>
              <span className="font-semibold">{formatDate(question.createdAt)}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => router.push("/qa")}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
