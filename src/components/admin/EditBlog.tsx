"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { UpdateBlogRequest } from "../../types/Admin/BlogAPI";
import { getBlogPostById, updateBlog } from "../../services/BlogService";
import { BlogPost } from "../../types/Client/Blog/BlogPost";
import { toast } from "react-toastify";

const EditBlog = () => {
  const router = useRouter();
  const params = useParams();
  const blogId = params?.id ? parseInt(params.id as string) : null;
  
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [blog, setBlog] = useState<BlogPost | null>(null);

  // Form states
  const [formData, setFormData] = useState<UpdateBlogRequest>({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    date: new Date().toISOString().split('T')[0],
    image: null,
    category: "CPU",
    readTime: "5 phút"
  });

  const [formErrors, setFormErrors] = useState<{
    title?: string;
    excerpt?: string;
    content?: string;
    author?: string;
    category?: string;
  }>({});

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const categories = ["CPU", "GPU", "RAM", "Storage", "Build", "Comparison"];

  useEffect(() => {
    if (!blogId) {
      toast.error("Blog ID không hợp lệ", {
        position: "top-right",
        autoClose: 3000,
      });
      router.push("/admin-app/blogs/management");
      return;
    }

    loadBlog();
  }, [blogId]);

  const loadBlog = () => {
    try {
      setLoading(true);
      const blogData = getBlogPostById(blogId!);
      
      if (!blogData) {
        toast.error("Không tìm thấy blog", {
          position: "top-right",
          autoClose: 3000,
        });
        router.push("/admin-app/blogs/management");
        return;
      }

      setBlog(blogData);
      setFormData({
        title: blogData.title,
        excerpt: blogData.excerpt,
        content: blogData.content,
        author: blogData.author,
        date: blogData.date,
        image: null,
        category: blogData.category,
        readTime: blogData.readTime
      });
      setImagePreview(blogData.image);
    } catch (error) {
      toast.error("Không thể tải thông tin blog", {
        position: "top-right",
        autoClose: 3000,
      });
      router.push("/admin-app/blogs/management");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: {
      title?: string;
      excerpt?: string;
      content?: string;
      author?: string;
      category?: string;
    } = {};

    if (!formData.title.trim()) {
      errors.title = "Tiêu đề không được để trống";
    }

    if (!formData.excerpt.trim()) {
      errors.excerpt = "Tóm tắt không được để trống";
    }

    if (!formData.content.trim()) {
      errors.content = "Nội dung không được để trống";
    }

    if (!formData.author.trim()) {
      errors.author = "Tác giả không được để trống";
    }

    if (!formData.category) {
      errors.category = "Vui lòng chọn danh mục";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFormErrors(prev => ({ ...prev, image: "Vui lòng chọn file ảnh" }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, image: "Kích thước ảnh không được vượt quá 5MB" }));
        return;
      }

      setFormData({ ...formData, image: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!blogId) {
      return;
    }

    try {
      setUpdating(true);

      await updateBlog(blogId, formData);
      
      toast.success("Cập nhật blog thành công!", {
        position: "top-right",
        autoClose: 2000,
      });
      
      // Redirect to blog management
      router.push("/admin-app/blogs/management");
    } catch (error: any) {
      let errorMessage = "Cập nhật blog thất bại!";
      
      if (error.message) {
        errorMessage += ` ${error.message}`;
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin-app/blogs/management");
  };

  // Calculate read time based on content length
  const calculateReadTime = (content: string): string => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} phút`;
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setFormData({ 
      ...formData, 
      content,
      readTime: calculateReadTime(content)
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-4 group"
          >
            <svg
              className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Quay lại
          </button>
          <h1 className="text-center text-3xl font-bold">Chỉnh Sửa Blog</h1>
          <p className="text-gray-600 mt-2 text-center">
            Cập nhật thông tin bài viết blog
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Thông tin cơ bản
              </h2>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-2.5 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm ${
                    formErrors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Nhập tiêu đề bài viết"
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>
                )}
              </div>

              {/* Excerpt */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tóm tắt <span className="text-red-500">*</span>
                </label>
                <textarea
                  className={`w-full px-2.5 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm ${
                    formErrors.excerpt ? "border-red-500" : "border-gray-300"
                  }`}
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  placeholder="Nhập tóm tắt ngắn gọn về bài viết"
                />
                {formErrors.excerpt && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.excerpt}
                  </p>
                )}
              </div>

              {/* Author and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Author */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tác giả <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full px-2.5 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm ${
                      formErrors.author ? "border-red-500" : "border-gray-300"
                    }`}
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    placeholder="Nhập tên tác giả"
                  />
                  {formErrors.author && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.author}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full px-2.5 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm ${
                      formErrors.category ? "border-red-500" : "border-gray-300"
                    }`}
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.category}
                    </p>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="mb-4 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày đăng
                </label>
                <input
                  type="date"
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>

              {/* Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ảnh đại diện
                </label>
                <div className="mt-1 flex items-center">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-2 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click để chọn ảnh</span> hoặc kéo thả
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-xs h-48 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Nội dung bài viết
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <textarea
                  className={`w-full px-2.5 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm ${
                    formErrors.content ? "border-red-500" : "border-gray-300"
                  }`}
                  rows={15}
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="Nhập nội dung bài viết..."
                />
                {formErrors.content && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.content}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  Thời gian đọc ước tính: <span className="font-semibold">{formData.readTime}</span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                disabled={updating}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={updating}
              >
                {updating ? "Đang cập nhật..." : "Cập nhật Blog"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBlog;

