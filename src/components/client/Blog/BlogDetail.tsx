"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "../Common/Breadcrumb";
import { BlogPost } from "@/types/Client/Blog/BlogPost";
import { getBlogPostById, getRelatedPosts, incrementBlogView } from "@/services/BlogService";

interface BlogDetailProps {
  blogId: string;
}

const BlogDetail: React.FC<BlogDetailProps> = ({ blogId }) => {
  const router = useRouter();
  
  // Load data ngay lập tức, không đợi useEffect
  const id = parseInt(blogId);
  const foundBlog = getBlogPostById(id);
  const relatedPosts = foundBlog ? getRelatedPosts(foundBlog.category, id, 3) : [];
  
  // State để track view count
  const [viewCount, setViewCount] = React.useState<number>(foundBlog?.views || 0);
  
  // Redirect ngay nếu không tìm thấy blog
  React.useEffect(() => {
    if (!foundBlog) {
      router.replace("/blog");
    }
  }, [foundBlog, router]);

  // Tăng view count khi component mount (người dùng vào trang)
  React.useEffect(() => {
    if (!foundBlog) return;
    
    // Kiểm tra xem đã view bài này trong session này chưa (dùng sessionStorage để tránh tăng nhiều lần khi refresh)
    const viewedKey = `blog_viewed_${id}`;
    const hasViewed = typeof window !== 'undefined' && sessionStorage.getItem(viewedKey);
    
    if (!hasViewed) {
      // Tăng view count
      const newViews = incrementBlogView(id);
      setViewCount(newViews);
      
      // Đánh dấu đã view trong session này (lưu vào sessionStorage)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(viewedKey, 'true');
      }
    } else {
      // Nếu đã view rồi, chỉ load view count từ storage
      const updatedPost = getBlogPostById(id);
      if (updatedPost) {
        setViewCount(updatedPost.views);
      }
    }
  }, [id, foundBlog]);

  const blog = foundBlog ? { ...foundBlog, views: viewCount } : undefined;
  const loading = !foundBlog;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(blog?.title || "")}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Đã sao chép link!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <>
      <Breadcrumb title={blog.title} pages={["Blog"]} />

      <article className="bg-white">
        {/* Hero Image - Có margin */}
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 pt-8">
          <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-xl shadow-lg">
            <Image
              src={blog.image}
              alt={blog.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Category Badge */}
            <div className="absolute top-6 left-6">
              <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                {blog.category}
              </span>
            </div>

            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
              <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold mb-4 max-w-4xl">
                {blog.title}
              </h1>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {blog.author.charAt(0)}
                  </div>
                  <span>{blog.author}</span>
                </div>
                <span>•</span>
                <span>{formatDate(blog.date)}</span>
                <span>•</span>
                <span>{blog.readTime}</span>
                <span>•</span>
                <span>{blog.views.toLocaleString()} lượt xem</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-8 xl:px-0 py-12">
          {/* Social Share Buttons */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
            <span className="text-gray-600 font-medium">Chia sẻ:</span>
            <button
              onClick={shareOnFacebook}
              className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
            <button
              onClick={shareOnTwitter}
              className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a91da] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Twitter
            </button>
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Link
            </button>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none [&_img]:mx-auto [&_img]:my-8 [&_img]:rounded-xl [&_img]:shadow-lg [&_img]:max-w-full [&_img]:h-auto">
            <div className="text-gray-700 leading-relaxed text-base md:text-lg">
              {blog.content.split('\n\n').map((paragraph, index) => {
                // Kiểm tra nếu là heading (bắt đầu bằng số hoặc chữ in hoa)
                const isHeading = /^[A-Z0-9]/.test(paragraph.trim()) && paragraph.length < 100;
                const isConclusion = paragraph.includes('Kết luận:');
                
                if (isConclusion) {
                  return (
                    <div key={index} className="my-8 p-6 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg">
                      <p className="font-semibold text-lg text-dark mb-2">Kết luận</p>
                      <p className="text-gray-700">{paragraph.replace('Kết luận:', '').trim()}</p>
                    </div>
                  );
                }
                
                if (isHeading && index > 0) {
                  return (
                    <h2 key={index} className="text-2xl font-bold text-dark mt-12 mb-6 first:mt-0">
                      {paragraph}
                    </h2>
                  );
                }
                
                return (
                  <p key={index} className="mb-6 leading-8">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Author Card */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                {blog.author.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-xl text-dark mb-1">{blog.author}</h3>
                <p className="text-gray-600 mb-3">Chuyên gia đánh giá công nghệ</p>
                <p className="text-gray-600 text-sm">
                  Tác giả chuyên về đánh giá hiệu năng phần cứng máy tính, gaming gear và công nghệ mới nhất.
                </p>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-12 border-t border-gray-200">
              <h2 className="text-2xl md:text-3xl font-bold text-dark mb-8">Bài viết liên quan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.id}`}
                    className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative w-full h-40 bg-gray-100 overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-lg text-dark mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>{formatDate(post.date)}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back to Blog */}
          <div className="mt-12 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại Blog
            </Link>
          </div>
        </div>
      </article>
    </>
  );
};

export default BlogDetail;

