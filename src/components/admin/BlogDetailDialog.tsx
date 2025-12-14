"use client";

import React, { useEffect } from "react";
import { BlogPost } from "../../types/Client/Blog/BlogPost";
import { getBlogPostById } from "../../services/BlogService";
import { X } from "lucide-react";
import Image from "next/image";

interface BlogDetailDialogProps {
  blogId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const BlogDetailDialog: React.FC<BlogDetailDialogProps> = ({
  blogId,
  isOpen,
  onClose,
}) => {
  const [blog, setBlog] = React.useState<BlogPost | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  useEffect(() => {
    if (isOpen && blogId) {
      loadBlog();
    } else {
      setBlog(null);
    }
  }, [isOpen, blogId]);

  const loadBlog = () => {
    if (!blogId) return;
    
    try {
      setLoading(true);
      const blogData = getBlogPostById(blogId);
      setBlog(blogData || null);
    } catch (error) {
      console.error("Error loading blog:", error);
      setBlog(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">Chi Tiết Blog</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : blog ? (
            <div className="space-y-6">
              {/* Image */}
              <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  unoptimized={blog.image.startsWith('blob:')}
                />
              </div>

              {/* Title */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {blog.title}
                </h1>
                
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">{blog.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(blog.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{blog.views} lượt xem</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{blog.readTime}</span>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {blog.category}
                  </span>
                </div>
              </div>

              {/* Excerpt */}
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-600">
                <p className="text-gray-700 text-lg italic">{blog.excerpt}</p>
              </div>

              {/* Content */}
              <div className="prose max-w-none">
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {blog.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Không tìm thấy blog</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailDialog;

