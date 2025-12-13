"use client";
import React, { useState, useEffect } from "react";
import { Plus, Eye, Power, PowerOff, Trash2, Search, Calendar, Edit } from "lucide-react";
import { SaleService, SaleResponse } from "@/services/SaleService";
import { formatDate, formatPrice } from "@/utils/helpers";
import { toast } from "react-toastify";
import { SaleDetailDialog } from "./SaleDetailDialog";
import { CreateSaleDialog } from "./CreateSaleDialog";

export const SaleManagement: React.FC = () => {
  const [sales, setSales] = useState<SaleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const salesPerPage = 10;

  // Filter states
  const [searchCode, setSearchCode] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [applyScopeFilter, setApplyScopeFilter] = useState<string>("");

  // Dialog states
  const [selectedSale, setSelectedSale] = useState<SaleResponse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch sales
  const fetchSales = async (useActiveApi: boolean = false) => {
    try {
      setLoading(true);
      
      // Nếu useActiveApi = true, thử gọi API lấy sale đang hoạt động
      // Nếu fail do CORS hoặc 500, fallback sang getAllSales và filter ở client
      if (useActiveApi) {
        try {
          const data = await SaleService.getActiveSales();
          setSales(data);
          return;
        } catch (activeError: any) {
          // Nếu lỗi CORS hoặc 500, thử gọi getAllSales không filter và filter ở client
          console.warn('Failed to fetch active sales, trying to fetch all and filter client-side:', activeError);
          try {
            const allData = await SaleService.getAllSales();
            // Lọc ở client side: lấy sale có isActive = true hoặc status = 'ACTIVE'
            const activeData = allData.filter(s => s.isActive === true || s.status === 'ACTIVE');
            setSales(activeData);
            return;
          } catch (fallbackError: any) {
            console.error('Failed to fetch all sales as fallback:', fallbackError);
            toast.error('Không thể tải danh sách sale. Vui lòng thử lại sau.');
            setSales([]);
            return;
          }
        }
      }
      
      // Nếu không, sử dụng filter như bình thường
      const allData = await SaleService.getAllSales();
      
      // Filter ở client side
      let filteredData = allData;
      
      if (statusFilter) {
        filteredData = filteredData.filter(s => s.status === statusFilter);
      }
      if (searchCode) {
        filteredData = filteredData.filter(s => s.code.toLowerCase().includes(searchCode.toLowerCase()));
      }
      if (applyScopeFilter) {
        filteredData = filteredData.filter(s => s.applyScope === applyScopeFilter);
      }
      if (fromDate) {
        filteredData = filteredData.filter(s => new Date(s.startDate) >= new Date(fromDate));
      }
      if (toDate) {
        filteredData = filteredData.filter(s => new Date(s.endDate) <= new Date(toDate));
      }
      
      setSales(filteredData);
    } catch (error: any) {
      console.error('Error fetching sales:', error);
      toast.error(error.message || 'Không thể tải danh sách sale');
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Khi mới load trang, tự động lấy sale đang hoạt động
    fetchSales(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    // Khi search, không dùng API active nữa, dùng filter
    fetchSales(false);
  };

  // Handle view detail
  const handleViewDetail = (sale: SaleResponse) => {
    setSelectedSale(sale);
    setIsDialogOpen(true);
  };

  // Handle toggle active status
  const handleToggleActive = async (sale: SaleResponse) => {
    try {
      // TODO: Gọi API để toggle active status
      toast.success(`Đã ${sale.isActive ? 'tắt' : 'bật'} sale ${sale.code}`);
      fetchSales(false);
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật trạng thái sale');
    }
  };

  // Handle delete
  const handleDelete = async (sale: SaleResponse) => {
    if (!confirm(`Bạn có chắc muốn xóa sale ${sale.code}?`)) {
      return;
    }
    
    try {
      await SaleService.deleteSale(sale.id);
      toast.success(`Đã xóa sale ${sale.code}`);
      fetchSales(false);
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa sale');
    }
  };

  // Pagination
  const totalPages = Math.ceil(sales.length / salesPerPage);
  const startIndex = (currentPage - 1) * salesPerPage;
  const currentSales = sales.slice(startIndex, startIndex + salesPerPage);

  // Format discount display
  const formatDiscount = (sale: SaleResponse): string => {
    if (sale.saleType === 'FIXED_AMOUNT') {
      return formatPrice(sale.saleValue);
    } else if (sale.saleType === 'PERCENTAGE') {
      return `${sale.saleValue}%`;
    }
    return 'N/A';
  };

  // Format time range
  const formatTimeRange = (sale: SaleResponse): string => {
    const start = formatDate(sale.startDate);
    const end = formatDate(sale.endDate);
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

  // Get apply scope badge
  const getApplyScopeBadge = (scope: string) => {
    const scopeMap: { [key: string]: { color: string, text: string } } = {
      'ALL_PRODUCTS': { color: 'bg-purple-100 text-purple-800', text: 'Tất cả sản phẩm' },
      'SPECIFIC_PRODUCTS': { color: 'bg-orange-100 text-orange-800', text: 'Sản phẩm cụ thể' },
      'CATEGORY': { color: 'bg-indigo-100 text-indigo-800', text: 'Theo danh mục' },
      'BRAND': { color: 'bg-pink-100 text-pink-800', text: 'Theo thương hiệu' },
    };
    return scopeMap[scope] || { color: 'bg-gray-100 text-gray-800', text: scope };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách sale...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản Lý Sale</h2>
        <button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 text-sm transition-colors"
        >
          <Plus size={18} />
          <span>Tạo Sale</span>
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
              setCurrentPage(1);
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
                setCurrentPage(1);
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
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Apply Scope Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            value={applyScopeFilter}
            onChange={(e) => {
              setApplyScopeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Tất cả phạm vi</option>
            <option value="ALL_PRODUCTS">ALL_PRODUCTS</option>
            <option value="SPECIFIC_PRODUCTS">SPECIFIC_PRODUCTS</option>
            <option value="CATEGORY">CATEGORY</option>
            <option value="BRAND">BRAND</option>
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
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Apply Scope</th>
                <th className="px-6 py-3 text-center text-sm font-bold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                  <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">{sale.code}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{sale.name}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-red-600">{formatDiscount(sale)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatTimeRange(sale)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(sale.status).color}`}>
                      {getStatusBadge(sale.status).text}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getApplyScopeBadge(sale.applyScope).color}`}>
                      {getApplyScopeBadge(sale.applyScope).text}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleViewDetail(sale)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(sale)}
                        className={`${sale.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} transition-colors`}
                        title={sale.isActive ? 'Tắt hoạt động' : 'Bật hoạt động'}
                      >
                        {sale.isActive ? <PowerOff size={18} /> : <Power size={18} />}
                      </button>
                      <button
                        onClick={() => handleDelete(sale)}
                        className="text-gray-600 hover:text-red-600 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentSales.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-6 text-sm">
                    Không có sale nào
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
            <span>Tổng {sales.length} sale</span>
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

      {/* Sale Detail Dialog */}
      <SaleDetailDialog
        sale={selectedSale}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedSale(null);
        }}
        onSaleUpdated={fetchSales}
      />

      {/* Create Sale Dialog */}
      <CreateSaleDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSaleCreated={() => {
          fetchSales(false); // Refresh list after creating
        }}
      />
    </div>
  );
};

