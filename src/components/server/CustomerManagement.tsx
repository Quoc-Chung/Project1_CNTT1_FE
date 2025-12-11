"use client"
import React, { useState } from "react";
import { Search, Plus, Edit, Eye, User, MoreHorizontal } from "lucide-react";
import { Customer } from "../../types/Admin";
import { formatDate, formatPrice } from "../../utils/helpers";
import { useRouter } from "next/navigation";

interface CustomerManagementProps {
  customers: Customer[];
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({
  customers
}) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
   const router = useRouter();

  const goToCustomerDetail = () => {
    router.push("/admin-app/customers/detail"); 
  };
 
  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const current = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Quản Lý Khách Hàng
        </h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg flex items-center space-x-2 text-sm">
          <Plus size={20} />
          <span>Thêm Khách Hàng</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng..."
            className="pl-10 pr-4 py-3 w-full border rounded-lg text-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[530px]">
        <div className="overflow-y-auto flex-1">
          <table className="w-full min-w-full">
            <thead>
              <tr className="bg-gray-50 sticky top-0 border-b border-gray-200 z-10">
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Khách hàng
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Liên hệ
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Tổng đơn
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Tổng chi tiêu
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Đơn gần nhất
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {current.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                        <div className="text-xs text-gray-600">{c.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{c.email}</div>
                    <div className="text-sm text-gray-600">{c.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{c.totalOrders}</td>
                  <td className="px-6 py-4 text-sm font-bold text-red-600">
                    {formatPrice(c.totalSpent)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {c.lastOrderDate ? formatDate(c.lastOrderDate) : "Chưa có"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        c.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {c.isActive ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex">


                    <button
                      className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      onClick={goToCustomerDetail}
                    >
                      <Eye size={16} />
                    </button>

                    <button className="ml-3 text-green-600 hover:text-green-800">
                      <Edit size={16} />
                    </button>
                    <button className="ml-3 text-gray-500 hover:text-gray-700">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 -mt-2 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 flex justify-between items-center shadow-sm">
          <p className="text-sm font-medium text-gray-700">
            <span className="font-semibold text-gray-900">Trang {currentPage}/{totalPages || 1}</span>
          </p>
          <div className="flex items-center space-x-2">
            <button
              className="px-2.5 py-1.5 rounded-lg text-sm font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </button>
            <button 
              className="px-2.5 py-1.5 rounded-lg text-sm font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
