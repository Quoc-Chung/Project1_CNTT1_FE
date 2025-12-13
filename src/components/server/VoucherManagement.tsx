"use client";
import React, { useState, useEffect } from "react";
import { Plus, Eye, Power, PowerOff, Trash2, Search, Calendar } from "lucide-react";
import { VoucherService, VoucherResponse } from "@/services/VoucherService";
import { formatDate, formatPrice } from "@/utils/helpers";
import { toast } from "react-toastify";
import { VoucherDetailDialog } from "./VoucherDetailDialog";
import { CreateVoucherDialog } from "./CreateVoucherDialog";

export const VoucherManagement: React.FC = () => {
  const [allVouchers, setAllVouchers] = useState<VoucherResponse[]>([]); // Tất cả voucher từ backend
  const [filteredVouchers, setFilteredVouchers] = useState<VoucherResponse[]>([]); // Voucher sau khi filter
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const vouchersPerPage = 10;

  // Filter states
  const [searchCode, setSearchCode] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [userScopeFilter, setUserScopeFilter] = useState<string>("");

  // Dialog states
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherResponse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch tất cả voucher từ backend (không filter)
  const fetchAllVouchers = async () => {
    try {
      setLoading(true);
      const data = await VoucherService.getAllVouchers();
      setAllVouchers(data);
      setFilteredVouchers(data); // Ban đầu hiển thị tất cả
    } catch (error: any) {
      console.error('Error fetching vouchers:', error);
      toast.error(error.message || 'Không thể tải danh sách voucher');
      setAllVouchers([]);
      setFilteredVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  // Áp dụng filter cho dữ liệu đã fetch từ backend
  const applyFilters = () => {
    let filtered = [...allVouchers];

    // Filter theo code (tìm kiếm)
    if (searchCode.trim()) {
      const searchLower = searchCode.toLowerCase().trim();
      filtered = filtered.filter(v => 
        v.code.toLowerCase().includes(searchLower) ||
        v.name.toLowerCase().includes(searchLower)
      );
    }

    // Filter theo status
    if (statusFilter) {
      filtered = filtered.filter(v => v.status === statusFilter);
    }

    // Filter theo userScope
    if (userScopeFilter) {
      filtered = filtered.filter(v => v.userScope === userScopeFilter);
    }

    // Filter theo fromDate (startDate >= fromDate)
    if (fromDate) {
      filtered = filtered.filter(v => {
        const voucherStartDate = new Date(v.startDate);
        const filterFromDate = new Date(fromDate);
        return voucherStartDate >= filterFromDate;
      });
    }

    // Filter theo toDate (endDate <= toDate)
    if (toDate) {
      filtered = filtered.filter(v => {
        const voucherEndDate = new Date(v.endDate);
        const filterToDate = new Date(toDate);
        // Set time to end of day for toDate
        filterToDate.setHours(23, 59, 59, 999);
        return voucherEndDate <= filterToDate;
      });
    }

    setFilteredVouchers(filtered);
    setCurrentPage(1); // Reset về trang đầu khi filter
  };

  useEffect(() => {
    // Khi mới load trang, tự động lấy tất cả voucher
    fetchAllVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Áp dụng filter khi các filter thay đổi
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchCode, statusFilter, fromDate, toDate, userScopeFilter, allVouchers]);

  // Handle search
  const handleSearch = () => {
    applyFilters();
  };

  // Handle view detail
  const handleViewDetail = (voucher: VoucherResponse) => {
    setSelectedVoucher(voucher);
    setIsDialogOpen(true);
  };

  // Handle toggle active status
  const handleToggleActive = async (voucher: VoucherResponse) => {
    try {
      // TODO: Gọi API để toggle active status
      toast.success(`Đã ${voucher.isActive ? 'tắt' : 'bật'} voucher ${voucher.code}`);
      fetchAllVouchers(); // Refresh lại tất cả voucher từ backend
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật trạng thái voucher');
    }
  };

  // Handle delete/expire
  const handleDelete = async (voucher: VoucherResponse) => {
    if (!confirm(`Bạn có chắc muốn xóa/hết hiệu lực voucher ${voucher.code}?`)) {
      return;
    }
    
    try {
      // TODO: Gọi API để xóa/hết hiệu lực voucher
      toast.success(`Đã xóa/hết hiệu lực voucher ${voucher.code}`);
      fetchAllVouchers(); // Refresh lại tất cả voucher từ backend
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa voucher');
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredVouchers.length / vouchersPerPage);
  const startIndex = (currentPage - 1) * vouchersPerPage;
  const currentVouchers = filteredVouchers.slice(startIndex, startIndex + vouchersPerPage);

  // Format discount display
  const formatDiscount = (voucher: VoucherResponse): string => {
    if (voucher.discountType === 'FIXED_AMOUNT') {
      return formatPrice(voucher.discountValue);
    } else if (voucher.discountType === 'PERCENTAGE') {
      return `${voucher.discountValue}%`;
    }
    return 'N/A';
  };

  // Format time range
  const formatTimeRange = (voucher: VoucherResponse): string => {
    const start = formatDate(voucher.startDate);
    const end = formatDate(voucher.endDate);
    return `${start} - ${end}`;
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { color: string, text: string } } = {
      'ACTIVE': { color: 'bg-green-100 text-green-800', text: 'Đang hoạt động' },
      'SCHEDULED': { color: 'bg-blue-100 text-blue-800', text: 'Đã lên lịch' },
      'EXPIRED': { color: 'bg-red-100 text-red-800', text: 'Hết hạn' },
    };
    return statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: status };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách voucher...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản Lý Voucher</h2>
        <button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 text-sm transition-colors"
        >
          <Plus size={18} />
          <span>Tạo Voucher</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search by Code */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo Code..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Status Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>

          {/* From Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
              }}
            />
          </div>

          {/* To Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
              }}
            />
          </div>

          {/* User Scope Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            value={userScopeFilter}
            onChange={(e) => {
              setUserScopeFilter(e.target.value);
            }}
          >
            <option value="">Tất cả User Scope</option>
            <option value="ALL_USERS">ALL_USERS</option>
          </select>
        </div>

        {/* Search Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Code</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Name</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Discount</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Time</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Quantity</th>
                <th className="px-6 py-3 text-center text-sm font-bold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentVouchers.map((voucher) => (
                <tr key={voucher.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                  <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">{voucher.code}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{voucher.name}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-red-600">{formatDiscount(voucher)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatTimeRange(voucher)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(voucher.status).color}`}>
                      {getStatusBadge(voucher.status).text}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {voucher.remainingQuantity} / {voucher.totalQuantity}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleViewDetail(voucher)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(voucher)}
                        className={`${voucher.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} transition-colors`}
                        title={voucher.isActive ? 'Tắt hoạt động' : 'Bật hoạt động'}
                      >
                        {voucher.isActive ? <PowerOff size={18} /> : <Power size={18} />}
                      </button>
                      <button
                        onClick={() => handleDelete(voucher)}
                        className="text-gray-600 hover:text-red-600 transition-colors"
                        title="Xóa/Hết hiệu lực"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentVouchers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-6 text-sm">
                    Không có voucher nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 -mt-2 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 flex justify-between items-center shadow-sm">
          <p className="text-sm font-medium text-gray-700">
            <span className="font-semibold text-gray-900">Trang {currentPage}/{totalPages || 1}</span>
            <span className="mx-2 text-gray-400">•</span>
            <span>Hiển thị {filteredVouchers.length} / {allVouchers.length} voucher</span>
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded-lg text-sm font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-2.5 py-1.5 min-w-[36px] rounded-lg text-sm font-semibold transition-all duration-200 ${
                  currentPage === i + 1
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50 scale-105"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 rounded-lg text-sm font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Voucher Detail Dialog */}
      <VoucherDetailDialog
        voucher={selectedVoucher}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedVoucher(null);
        }}
        onVoucherUpdated={fetchAllVouchers}
      />

      {/* Create Voucher Dialog */}
      <CreateVoucherDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onVoucherCreated={() => {
          fetchAllVouchers(); // Refresh list after creating
        }}
      />
    </div>
  );
};

