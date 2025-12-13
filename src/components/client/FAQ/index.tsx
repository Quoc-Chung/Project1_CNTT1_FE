"use client";
import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import { toast } from "react-toastify";

interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
  likes: number;
  avatar?: string;
}

interface Question {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  image?: string;
  category: string;
  comments: Comment[];
  views: number;
}

const FAQ = () => {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      title: "Laptop nào phù hợp cho học tập và làm việc văn phòng?",
      content: "Mình đang tìm mua laptop để học đại học và làm việc văn phòng (Word, Excel, PowerPoint, duyệt web). Ngân sách khoảng 15-20 triệu. Các bạn có thể tư vấn giúp mình không? Mình cần pin tốt và màn hình không quá nhỏ.",
      author: "Nguyễn Văn Dũng",
      date: "2024-01-15",
      image: "/images/hoi_dap/laptopvanphong.png",
      category: "Laptop",
      views: 245,
      comments: [
        {
          id: 1,
          author: "Trần Thị Bình",
          content: "Mình recommend Dell Inspiron 15 với CPU Intel i5 gen 12, RAM 8GB (có thể nâng cấp), SSD 256GB. Pin khoảng 8-10 tiếng, màn hình 15.6 inch Full HD. Giá khoảng 17-18 triệu. Rất phù hợp cho học tập và văn phòng.",
          date: "2024-01-15",
          likes: 12
        },
        {
          id: 2,
          author: "Lê Văn Trường Sơn",
          content: "HP Pavilion 15 cũng là lựa chọn tốt trong tầm giá này. Có cả phiên bản AMD Ryzen 5 và Intel i5, mình nghĩ AMD sẽ tiết kiệm điện hơn. Nên chọn phiên bản có SSD để máy chạy nhanh hơn.",
          date: "2024-01-16",
          likes: 8
        }
      ]
    },
    {
      id: 2,
      title: "PC build giá 30 triệu cho gaming, nên chọn GPU nào?",
      content: "Mình muốn build PC gaming giá khoảng 30 triệu. Đã có màn hình và phụ kiện. Các bạn tư vấn giúp mình nên chọn GPU nào giữa RTX 4060 và RX 7600? Và cấu hình tổng thể như thế nào?",
      author: "Phạm Thị Dương",
      date: "2024-01-12",
      image: "/images/hoi_dap/build_pc.png",
      category: "PC Build",
      views: 389,
      comments: [
        {
          id: 1,
          author: "Hoàng Văn Khánh",
          content: "Với ngân sách 30 triệu, mình suggest: CPU Ryzen 5 7600 (7 triệu), GPU RTX 4060 8GB (9 triệu), RAM DDR5-5600 16GB (4 triệu), SSD NVMe 1TB (3.5 triệu), Mainboard B650 (5 triệu), PSU 650W (2.5 triệu), Case (1.5 triệu). RTX 4060 có DLSS 3.0 tốt hơn RX 7600, nên chọn RTX 4060.",
          date: "2024-01-12",
          likes: 25
        },
        {
          id: 2,
          author: "Đỗ Thị Hòa",
          content: "Nếu bạn chơi game ở 1080p thì RTX 4060 và RX 7600 tương đương nhau. Nhưng nếu chơi 1440p hoặc muốn dùng DLSS thì RTX 4060 tốt hơn. RX 7600 thì rẻ hơn khoảng 1-2 triệu.",
          date: "2024-01-13",
          likes: 15
        }
      ]
    },
    {
      id: 3,
      title: "RAM DDR5 có đáng nâng cấp từ DDR4 không?",
      content: "Mình đang dùng PC với RAM DDR4-3200 16GB. Có nên nâng cấp lên DDR5 không? Hiệu năng có cải thiện nhiều không? Mainboard hiện tại của mình chỉ support DDR4.",
      author: "Lê Văn Trường Sơn",
      date: "2024-01-10",
      category: "RAM",
      views: 156,
      comments: [
        {
          id: 1,
          author: "Trần Thị Bình",
          content: "Nếu mainboard chỉ support DDR4 thì không thể nâng cấp DDR5 được, phải đổi mainboard và CPU (nếu CPU cũ không support DDR5). Với các tác vụ thông thường, DDR5 chỉ nhanh hơn DDR4 khoảng 5-10%, không đáng để đổi cả mainboard và CPU.",
          date: "2024-01-10",
          likes: 20
        }
      ]
    }
  ]);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Chung",
    image: null as File | null
  });

  const [showForm, setShowForm] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const categories = ["Chung", "Laptop", "PC Build", "CPU", "GPU", "RAM", "Storage", "Khác"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error("Vui lòng điền đầy đủ tiêu đề và nội dung!", {
        autoClose: 2000,
        position: "top-right"
      });
      return;
    }

    const newQuestion: Question = {
      id: questions.length + 1,
      title: formData.title,
      content: formData.content,
      author: "Người dùng",
      date: new Date().toISOString().split('T')[0],
      image: imagePreview || undefined,
      category: formData.category,
      views: 0,
      comments: []
    };

    setQuestions([newQuestion, ...questions]);
    setFormData({ title: "", content: "", category: "Chung", image: null });
    setImagePreview(null);
    setShowForm(false);
    
    toast.success("Đã đăng câu hỏi thành công!", {
      autoClose: 2000,
      position: "top-right"
    });
  };

  return (
    <>
      <Breadcrumb title={"Hỏi đáp"} pages={["Hỏi đáp"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-semibold text-3xl md:text-4xl text-dark mb-4">
              Cộng đồng Hỏi đáp
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
              Đặt câu hỏi và nhận tư vấn từ cộng đồng về sản phẩm công nghệ
            </p>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-8 py-1.5 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              {showForm ? "Ẩn form" : "Đặt câu hỏi"}
            </button>
          </div>

          {/* Question Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-md p-8 mb-10">
              <h2 className="text-2xl font-semibold text-dark mb-6">Đặt câu hỏi mới</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-dark font-medium mb-2">Tiêu đề câu hỏi *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-3 rounded-lg focus:outline-none focus:border-blue-600"
                    placeholder="Nhập tiêu đề câu hỏi..."
                  />
                </div>

                <div>
                  <label className="block text-dark font-medium mb-2">Danh mục</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-3 rounded-lg focus:outline-none focus:border-blue-600"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-dark font-medium mb-2">Nội dung câu hỏi *</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-3 rounded-lg focus:outline-none focus:border-blue-600 resize-none"
                    placeholder="Mô tả chi tiết câu hỏi của bạn..."
                  />
                </div>

                <div>
                  <label className="block text-dark font-medium mb-2">Ảnh đính kèm (tùy chọn)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 border border-gray-3 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                  {imagePreview && (
                    <div className="mt-4 relative w-full h-48 rounded-lg overflow-hidden">
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-8 py-1.5 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Đăng câu hỏi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ title: "", content: "", category: "Chung", image: null });
                      setImagePreview(null);
                    }}
                    className="bg-gray-200 text-dark px-8 py-1.5 rounded-md hover:bg-gray-300 transition-colors font-medium"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-6">
            {questions.map((question) => (
              <div key={question.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Question Header */}
                <div className="p-6 border-b border-gray-3">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                          {question.category}
                        </span>
                        <span className="text-sm text-gray-600">
                          {question.views} lượt xem
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold text-dark mb-2">
                        {question.title}
                      </h2>
                    </div>
                  </div>

                  {question.image && (
                    <div className="relative w-full h-80 md:h-96 rounded-lg overflow-hidden mb-4">
                      <Image
                        src={question.image}
                        alt={question.title}
                        fill
                        className="object-contain bg-gray-100"
                      />
                    </div>
                  )}

                  <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
                    {question.content}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        {question.author.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-dark">{question.author}</p>
                        <p className="text-sm text-gray-600">{question.date}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="p-6 bg-gray-50">
                  <h3 className="font-semibold text-lg text-dark mb-4">
                    Câu trả lời ({question.comments.length})
                  </h3>

                  {question.comments.length > 0 ? (
                    <div className="space-y-4">
                      {question.comments.map((comment) => (
                        <div key={comment.id} className="bg-white rounded-lg p-4 border border-gray-3">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-sm">
                              {comment.author.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-dark">{comment.author}</p>
                                <span className="text-xs text-gray-500">{comment.date}</span>
                              </div>
                              <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-3">
                            <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 14.5L3 9.5H7V1.5H9V9.5H13L8 14.5Z" fill="currentColor"/>
                              </svg>
                              <span className="text-sm">Thích ({comment.likes})</span>
                            </button>
                            <button className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                              Trả lời
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4">
                      Chưa có câu trả lời nào. Hãy là người đầu tiên trả lời!
                    </p>
                  )}

                  {/* Add Comment */}
                  <div className="mt-6 pt-4 border-t border-gray-3">
                    <textarea
                      placeholder="Viết câu trả lời của bạn..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-3 rounded-lg focus:outline-none focus:border-blue-600 resize-none mb-3"
                    />
                    <button className="bg-blue-600 text-white px-6 py-1 rounded-md hover:bg-blue-700 transition-colors font-medium">
                      Gửi câu trả lời
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQ;

