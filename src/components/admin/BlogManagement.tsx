"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BlogPost } from "../../types/Client/Blog/BlogPost";
import { getAllBlogPosts, deleteBlog, updateBlog } from "../../services/BlogService";
import { toast } from "react-toastify";
import { Search, Pencil, Trash2, Eye } from "lucide-react";
import Image from "next/image";
import BlogDetailDialog from "./BlogDetailDialog";

const ITEMS_PER_PAGE = 8;

const BlogManagement = () => {
  const router = useRouter();
  
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [viewingBlogId, setViewingBlogId] = useState<number | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState<boolean>(false);

  // Load blogs on mount
  useEffect(() => {
    loadBlogs();
  }, []);

  // Filter blogs when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBlogs(blogs);
      setCurrentPage(1);
    } else {
      const filtered = blogs.filter((blog) =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBlogs(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, blogs]);

  // Ensure current page is always in range
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredBlogs, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE));
  const startIndex = filteredBlogs.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, filteredBlogs.length);
  const displayStart = filteredBlogs.length === 0 ? 0 : startIndex + 1;
  const displayEnd = filteredBlogs.length === 0 ? 0 : endIndex;
  const paginatedBlogs = filteredBlogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const loadBlogs = () => {
    try {
      setLoading(true);
      const data = getAllBlogPosts();
      setBlogs(data);
      setFilteredBlogs(data);
    } catch (error) {
      toast.error("Không thể tải danh sách blog!", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditBlog = (blogId: number) => {
    router.push(`/admin-app/blogs/edit/${blogId}`);
  };

  const handleDeleteBlog = async (blogId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa blog này không?")) {
      return;
    }

    try {
      setDeletingId(blogId);
      await deleteBlog(blogId);
      toast.success("Xóa blog thành công!", {
        position: "top-right",
        autoClose: 2000,
      });
      loadBlogs(); // Reload danh sách
    } catch (error: any) {
      toast.error(`Xóa blog thất bại: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewBlog = (blogId: number) => {
    setViewingBlogId(blogId);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setViewingBlogId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Quản Lý Blog
        </h2>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-300">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề, tóm tắt, tác giả, danh mục..."
              className="pl-10 pr-4 py-2 w-full border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Blog List */}
      {filteredBlogs.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-md border border-gray-300 text-center">
          <p className="text-gray-600 text-lg">
            {searchTerm ? "Không tìm thấy blog nào" : "Chưa có blog nào"}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-md border border-gray-300 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Ảnh
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Tiêu đề
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Tác giả
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Danh mục
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Lượt xem
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Ngày đăng
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedBlogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={blog.image}
                            alt={blog.title}
                            fill
                            className="object-cover"
                            unoptimized={blog.image.startsWith('blob:')}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {blog.title}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate mt-1">
                          {blog.excerpt}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{blog.author}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {blog.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{blog.views}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{blog.date}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewBlog(blog.id)}
                            className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                            title="Xem blog"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEditBlog(blog.id)}
                            className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(blog.id)}
                            disabled={deletingId === blog.id}
                            className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-md border border-gray-300">
              <div className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{displayStart}</span> đến{" "}
                <span className="font-medium">{displayEnd}</span> trong tổng số{" "}
                <span className="font-medium">{filteredBlogs.length}</span> blog
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 border rounded-md text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Blog Detail Dialog */}
      <BlogDetailDialog
        blogId={viewingBlogId}
        isOpen={isDetailDialogOpen}
        onClose={handleCloseDetailDialog}
      />
    </div>
  );
};

export default BlogManagement;

