"use client"
import React, { useState, useEffect } from "react";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { Order } from "@/types/Admin";
import { formatPrice, formatDate, getStatusBadge } from '../../utils/helpers';
import { OrderService, AdminOrderResponse } from '@/services/OrderService';
import { OrderDetailDialog } from './OrderDetailDialog';
import { UpdateOrderStatusDialog } from './UpdateOrderStatusDialog';
import { CancelOrderDialog } from './CancelOrderDialog';
import { toast } from "react-toastify";

interface OrderManagementProps {
  orders?: Order[]; // Optional để có thể fetch từ API
}

export const OrderManagement: React.FC<OrderManagementProps> = ({ orders: initialOrders }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders || []);
  const [loading, setLoading] = useState(!initialOrders);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    totalRevenue: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>("");
  const ordersPerPage = 5;

  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const currentOrders = orders.slice(startIndex, startIndex + ordersPerPage);

  // Fetch orders from API if not provided
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const apiOrders = await OrderService.getAllOrdersForAdmin();

        // Map API response to Order format
        const mappedOrders: Order[] = apiOrders.map((apiOrder: AdminOrderResponse) => ({
          id: apiOrder.orderId,
          customerId: String(apiOrder.userId),
          customerName: `User ${apiOrder.userId}`, // Có thể fetch thêm thông tin user sau
          products: [], // API không trả về products, có thể fetch chi tiết sau
          totalAmount: apiOrder.totalAmount,
          status: mapStatusToOrderStatus(apiOrder.status),
          orderDate: apiOrder.createdAt,
          paymentMethod: 'cash', // Default, có thể fetch từ API sau
          shippingAddress: apiOrder.shippingAddress,
          apiStatus: apiOrder.status.toUpperCase(), // Đảm bảo status luôn uppercase và lưu status gốc từ API
        } as Order & { apiStatus: string }));

        setOrders(mappedOrders);

        // Tính toán thống kê đơn hàng
        // So sánh ngày theo timezone Việt Nam (GMT+7)
        const now = new Date();
        // Format ngày hiện tại theo timezone Việt Nam: YYYY-MM-DD
        const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }); // en-CA gives YYYY-MM-DD format

        const todayOrders = mappedOrders.filter(order => {
          if (!order.orderDate) return false;
          const orderDate = new Date(order.orderDate);
          // Format ngày đơn hàng theo timezone Việt Nam: YYYY-MM-DD
          const orderDateStr = orderDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });

          // So sánh chuỗi ngày
          return orderDateStr === todayStr;
        });

        const completedOrders = mappedOrders.filter(order => {
          const status = (order as any).apiStatus || order.status.toUpperCase();
          return status === 'COMPLETED' || status === 'DELIVERED';
        });

        const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const todayRevenue = todayOrders
          .filter(order => {
            const status = (order as any).apiStatus || order.status.toUpperCase();
            return status === 'COMPLETED' || status === 'DELIVERED';
          })
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        setOrderStats({
          total: mappedOrders.length,
          totalRevenue: totalRevenue,
          todayOrders: todayOrders.length,
          todayRevenue: todayRevenue,
        });
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        toast.error(error.message || 'Không thể tải danh sách đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Map API status to Order status format
  const mapStatusToOrderStatus = (status: string): Order['status'] => {
    const statusMap: { [key: string]: Order['status'] } = {
      'PENDING': 'pending',
      'PROCESSING': 'processing',
      'CONFIRMED': 'processing',
      'SHIPPING': 'shipped',
      'SHIPPED': 'shipped',
      'DELIVERED': 'delivered',
      'COMPLETED': 'delivered',
      'CANCELLED': 'cancelled',
      'RETURNED': 'cancelled',
    };
    return statusMap[status.toUpperCase()] || 'pending';
  };

  // Map Order status back to API status format
  const mapOrderStatusToApiStatus = (order: Order): string => {
    // Tìm order trong danh sách để lấy status gốc từ API
    const apiOrder = orders.find(o => o.id === order.id);
    if (apiOrder) {
      // Lưu status gốc từ API response
      return (apiOrder as any).apiStatus || order.status.toUpperCase();
    }
    return order.status.toUpperCase();
  };

  // Handle view order detail
  const handleViewOrderDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsDialogOpen(true);
  };

  // Handle approve order (update status)
  const handleApproveOrder = (orderId: string, currentStatus: string) => {
    // Đảm bảo currentStatus luôn là uppercase để match với API
    const normalizedStatus = String(currentStatus).toUpperCase();
    setSelectedOrderId(orderId);
    setSelectedOrderStatus(normalizedStatus);
    setIsUpdateStatusDialogOpen(true);
  };

  // Handle cancel order
  const handleCancelOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsCancelDialogOpen(true);
  };

  // Handle order updated (refresh list)
  const handleOrderUpdated = async () => {
    try {
      // Đợi một chút để đảm bảo API đã cập nhật xong
      await new Promise(resolve => setTimeout(resolve, 500));

      const apiOrders = await OrderService.getAllOrdersForAdmin();
      const mappedOrders: Order[] = apiOrders.map((apiOrder: AdminOrderResponse) => ({
        id: apiOrder.orderId,
        customerId: String(apiOrder.userId),
        customerName: `User ${apiOrder.userId}`,
        products: [],
        totalAmount: apiOrder.totalAmount,
        status: mapStatusToOrderStatus(apiOrder.status),
        orderDate: apiOrder.createdAt,
        paymentMethod: 'cash',
        shippingAddress: apiOrder.shippingAddress,
        apiStatus: apiOrder.status.toUpperCase(), // Đảm bảo status luôn uppercase và lưu status gốc từ API
      } as Order & { apiStatus: string }));

      setOrders(mappedOrders);

      // Cập nhật lại thống kê
      // So sánh ngày theo timezone Việt Nam (GMT+7)
      const now = new Date();
      // Format ngày hiện tại theo timezone Việt Nam: YYYY-MM-DD
      const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }); // en-CA gives YYYY-MM-DD format

      const todayOrders = mappedOrders.filter(order => {
        if (!order.orderDate) return false;
        const orderDate = new Date(order.orderDate);
        // Format ngày đơn hàng theo timezone Việt Nam: YYYY-MM-DD
        const orderDateStr = orderDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });

        // So sánh chuỗi ngày
        return orderDateStr === todayStr;
      });

      const completedOrders = mappedOrders.filter(order => {
        const status = (order as any).apiStatus || order.status.toUpperCase();
        return status === 'COMPLETED' || status === 'DELIVERED';
      });

      const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const todayRevenue = todayOrders
        .filter(order => {
          const status = (order as any).apiStatus || order.status.toUpperCase();
          return status === 'COMPLETED' || status === 'DELIVERED';
        })
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      setOrderStats({
        total: mappedOrders.length,
        totalRevenue: totalRevenue,
        todayOrders: todayOrders.length,
        todayRevenue: todayRevenue,
      });
    } catch (error: any) {
      console.error('Error refreshing orders:', error);
      toast.error('Không thể làm mới danh sách đơn hàng');
    }
  };

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages || 1);
  }, [currentPage, totalPages]);

  const renderPagination = () => {
    return Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i + 1}
        onClick={() => setCurrentPage(i + 1)}
        className={`px-2.5 py-1.5 min-w-[36px] rounded-lg text-sm font-semibold transition-all duration-200 ${currentPage === i + 1
          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50 scale-105"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md"
          }`}
      >
        {i + 1}
      </button>
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản Lý Đơn Hàng</h2>
        <div className="flex space-x-3">
          <select className="px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="PROCESSING">Đang xử lý</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="SHIPPING">Đang giao hàng</option>
            <option value="DELIVERED">Đã giao hàng</option>
            <option value="COMPLETED">Đã hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="RETURNED">Đã trả hàng</option>
          </select>
        </div>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Tổng đơn hàng</p>
              <p className="text-3xl font-bold">{orderStats.total}</p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Tổng doanh thu</p>
              <p className="text-2xl font-bold">{formatPrice(orderStats.totalRevenue)}</p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Đơn hôm nay</p>
              <p className="text-3xl font-bold">{orderStats.todayOrders}</p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">Doanh thu hôm nay</p>
              <p className="text-2xl font-bold">{formatPrice(orderStats.todayRevenue)}</p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Thống kê trạng thái */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* PROCESSING - Đang xử lý */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
          <p className="text-lg font-bold text-blue-900">{orders.filter(o => ((o as any).apiStatus || o.status.toUpperCase()) === 'PROCESSING').length}</p>
          <p className="text-xs text-blue-600">Đang xử lý</p>
        </div>
        {/* CONFIRMED - Đã xác nhận */}
        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 text-center">
          <p className="text-lg font-bold text-indigo-900">{orders.filter(o => ((o as any).apiStatus || o.status.toUpperCase()) === 'CONFIRMED').length}</p>
          <p className="text-xs text-indigo-600">Đã xác nhận</p>
        </div>
        {/* CANCELLED - Đã hủy */}
        <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-center">
          <p className="text-lg font-bold text-red-900">{orders.filter(o => ((o as any).apiStatus || o.status.toUpperCase()) === 'CANCELLED').length}</p>
          <p className="text-xs text-red-600">Đã hủy</p>
        </div>
        {/* PENDING - Chờ xử lý */}
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-center">
          <p className="text-lg font-bold text-yellow-900">{orders.filter(o => ((o as any).apiStatus || o.status.toUpperCase()) === 'PENDING').length}</p>
          <p className="text-xs text-yellow-600">Chờ xử lý</p>
        </div>
        {/* SHIPPING - Đang giao hàng */}
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-center">
          <p className="text-lg font-bold text-purple-900">{orders.filter(o => ((o as any).apiStatus || o.status.toUpperCase()) === 'SHIPPING').length}</p>
          <p className="text-xs text-purple-600">Đang giao hàng</p>
        </div>
        {/* DELIVERED - Đã giao hàng */}
        <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
          <p className="text-lg font-bold text-green-900">{orders.filter(o => ((o as any).apiStatus || o.status.toUpperCase()) === 'DELIVERED').length}</p>
          <p className="text-xs text-green-600">Đã giao hàng</p>
        </div>
        {/* RETURNED - Đã trả hàng */}
        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 text-center">
          <p className="text-lg font-bold text-orange-900">{orders.filter(o => ((o as any).apiStatus || o.status.toUpperCase()) === 'RETURNED').length}</p>
          <p className="text-xs text-orange-600">Đã trả hàng</p>
        </div>
        {/* COMPLETED - Đã hoàn thành */}
        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-center">
          <p className="text-lg font-bold text-emerald-900">{orders.filter(o => ((o as any).apiStatus || o.status.toUpperCase()) === 'COMPLETED').length}</p>
          <p className="text-xs text-emerald-600">Đã hoàn thành</p>
        </div>
      </div>

      {/* Bảng + pagination */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[535px]">
        {/* Table scroll */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Mã đơn hàng</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Khách hàng</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Tổng tiền</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Trạng thái</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Ngày đặt</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                  <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-semibold text-gray-900">{order.customerName}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-red-600">{formatPrice(order.totalAmount)}</td>
                  <td className="px-6 py-4 text-sm">
                    {(() => {
                      // Luôn sử dụng apiStatus từ API (đã được normalize thành uppercase)
                      const apiStatus = (order as any).apiStatus ? String((order as any).apiStatus).toUpperCase() : order.status.toUpperCase();
                      const badge = getStatusBadge(apiStatus);
                      return (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badge.color}`}>
                          {badge.text}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.orderDate)}</td>
                  <td className="px-6 py-4">
                    {(() => {
                      // Luôn sử dụng apiStatus từ API (đã được normalize thành uppercase)
                      const apiStatus = (order as any).apiStatus ? String((order as any).apiStatus).toUpperCase() : order.status.toUpperCase();
                      const finalStatuses = ['DELIVERED', 'COMPLETED', 'CANCELLED', 'RETURNED'];
                      const canEdit = !finalStatuses.includes(apiStatus);

                      return (
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleViewOrderDetail(order.id)}
                            className="px-2 py-1.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors flex items-center space-x-1 border border-blue-200"
                            title="Xem chi tiết"
                          >
                            <Eye size={14} />
                            <span>Xem</span>
                          </button>
                          {/* Chỉ hiển thị nút Duyệt khi đơn hàng chưa ở trạng thái cuối cùng */}
                          {canEdit && (
                            <button
                              onClick={() => handleApproveOrder(order.id, apiStatus)}
                              className="px-2 py-1.5 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors flex items-center space-x-1 border border-green-200 font-medium"
                              title="Duyệt đơn"
                            >
                              <CheckCircle size={14} />
                              <span>Duyệt</span>
                            </button>
                          )}
                          {/* Chỉ hiển thị nút Từ chối khi đơn hàng chưa ở trạng thái cuối cùng */}
                          {canEdit && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="px-2 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors flex items-center space-x-1 border border-red-200 font-medium"
                              title="Từ chối đơn hàng"
                            >
                              <XCircle size={14} />
                              <span>Từ chối</span>
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                </tr>
              ))}
              {currentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-6 text-sm">
                    Không có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination luôn đứng yên */}
        <div className="px-6 py-4 -mt-2 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 flex justify-between items-center shadow-sm">
          <p className="text-sm font-medium text-gray-700">
            <span className="font-semibold text-gray-900">Trang {currentPage}/{totalPages || 1}</span>
            <span className="mx-2 text-gray-400">•</span>
            <span>Tổng {orders.length} đơn hàng</span>
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded-lg text-sm font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none"
            >
              Trước
            </button>
            <div className="flex items-center space-x-1.5">
              {renderPagination()}
            </div>
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

      {/* Order Detail Dialog */}
      <OrderDetailDialog
        orderId={selectedOrderId}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedOrderId(null);
        }}
        onOrderUpdated={handleOrderUpdated}
      />

      {/* Update Order Status Dialog */}
      <UpdateOrderStatusDialog
        orderId={selectedOrderId}
        currentStatus={selectedOrderStatus}
        isOpen={isUpdateStatusDialogOpen}
        onClose={() => {
          setIsUpdateStatusDialogOpen(false);
          setSelectedOrderId(null);
          setSelectedOrderStatus("");
        }}
        onStatusUpdated={handleOrderUpdated}
      />

      {/* Cancel Order Dialog */}
      <CancelOrderDialog
        orderId={selectedOrderId}
        isOpen={isCancelDialogOpen}
        onClose={() => {
          setIsCancelDialogOpen(false);
          setSelectedOrderId(null);
        }}
        onOrderCancelled={handleOrderUpdated}
      />
    </div>
  );
};
