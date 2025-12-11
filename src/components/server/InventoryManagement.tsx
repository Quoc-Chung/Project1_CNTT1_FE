"use client"
import React, { useState } from "react";
import { Plus, AlertCircle, MoreHorizontal } from "lucide-react";
import { Product } from "@/types/Admin";
import { formatDate, getStockStatus } from '../../utils/helpers';
import Image from "next/image";
import { mockProducts } from "../../utils/mockData";



export const InventoryManagement = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts); 

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const totalPages = Math.ceil(products.length / pageSize);

  const paginatedProducts = products.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Quản Lý Kho Hàng
        </h2>
        <div className="flex space-x-3">
          <button className="bg-green-600 hover:bg-green-700 text-white px-2.5 py-1.5 rounded-lg flex items-center space-x-2 text-sm">
            <Plus size={18} />
            <span>Nhập kho</span>
          </button>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-2.5 py-1.5 rounded-lg flex items-center space-x-2 text-sm">
            <AlertCircle size={18} />
            <span>Cảnh báo tồn kho</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[640px]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                  Tồn kho
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                  Đã bán
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                  Cập nhật
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock || 0);
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Image
                          src={product.thumbnailUrl}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover mr-3"
                        />
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {product.brandName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                        {product.categoryName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-base font-bold ${stockStatus.color}`}
                      >
                        {product.stock || 0}
                      </span>
                      <span className="text-xs text-gray-600 ml-1">sp</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {product.soldCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${stockStatus.badgeColor}`}
                      >
                        {stockStatus.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(product.updatedAt || product.createdAt || "")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Nhập kho"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          className={`transition-colors ${
                            product.isActive
                              ? "text-orange-600 hover:text-orange-900"
                              : "text-green-600 hover:text-green-900"
                          }`}
                          
                          title={product.isActive ? "Ngừng bán" : "Kích hoạt"}
                        >
                          <AlertCircle size={16} />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center px-6 py-4 -mt-2 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 text-sm shadow-sm">
          <p className="text-sm font-medium text-gray-700">
            <span className="font-semibold text-gray-900">Trang {currentPage}/{totalPages}</span>
            <span className="mx-2 text-gray-400">•</span>
            <span>Hiển thị {paginatedProducts.length} / {products.length} sản phẩm</span>
          </p>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded-lg text-sm font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none"
            >
              Trước
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-2.5 py-1.5 min-w-[36px] rounded-lg text-sm font-semibold transition-all duration-200 ${
                    currentPage === page
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50 scale-105"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 rounded-lg text-sm font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
