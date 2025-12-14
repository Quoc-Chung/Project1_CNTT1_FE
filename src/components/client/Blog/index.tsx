"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Link from "next/link";
import { BlogPost } from "@/types/Client/Blog/BlogPost";

import { getAllBlogPosts } from "@/services/BlogService";

const Blog = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Lấy dữ liệu từ service
  const blogPosts: BlogPost[] = getAllBlogPosts();
  
  // Prefetch blog detail page khi hover
  const handleBlogHover = (postId: number | string) => {
    router.prefetch(`/blog/${postId}`);
  };

  const categories = ["all", "CPU", "GPU", "RAM", "Storage", "Build", "Comparison"];

  const filteredPosts = selectedCategory === "all" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <>
      <Breadcrumb title={"Blog"} pages={["Blog"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex-1 text-center md:text-left">
                <h1 className="font-semibold text-3xl md:text-4xl text-dark mb-4">
                  Blog Công Nghệ
                </h1>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto md:mx-0">
                  Khám phá thế giới công nghệ với những bài đánh giá chi tiết, hướng dẫn chọn lựa và so sánh hiệu năng của các sản phẩm máy tính hàng đầu
                </p>
              </div>
              <div className="flex justify-center md:justify-end">
                <Link
                  href="/blog/create"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-md font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Tạo Blog
                </Link>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-10 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-lg border transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-dark border-gray-3 hover:border-blue-600 hover:text-blue-600"
                }`}
              >
                {category === "all" ? "Tất cả" : category}
              </button>
            ))}
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
                onMouseEnter={() => handleBlogHover(post.id)}
              >
                {/* Image */}
                <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.views} lượt xem</span>
                  </div>

                  <h2 className="font-semibold text-xl text-dark mb-3 group-hover:text-blue-600 transition-none line-clamp-2">
                    <Link 
                      href={`/blog/${post.id}`} 
                      prefetch={true}
                      scroll={false}
                      className="block"
                    >
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        {post.author.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-600">{post.author}</span>
                    </div>
                    <Link
                      href={`/blog/${post.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-none"
                      prefetch={true}
                      scroll={false}
                    >
                      Đọc thêm →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Empty State */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Không tìm thấy bài viết nào trong danh mục này</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Blog;

