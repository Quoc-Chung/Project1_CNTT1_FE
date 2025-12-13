"use client"
import React, { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { Order } from "@/types/Admin";
import { formatPrice, formatDate, getStatusBadge }  from '../../utils/helpers';
import { OrderService, AdminOrderResponse } from '@/services/OrderService';
import { OrderDetailDialog } from './OrderDetailDialog';
import { toast } from "react-toastify";

interface OrderManagementProps {
  orders?: Order[]; // Optional để có thể fetch từ API
}

export const OrderManagement: React.FC<OrderManagementProps> = ({ orders: initialOrders }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders || []);
  const [loading, setLoading] = useState(!initialOrders);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const ordersPerPage = 5;

  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const currentOrders = orders.slice(startIndex, startIndex + ordersPerPage);

  // Fetch orders from API if not provided
  useEffect(() => {
    if (!initialOrders) {
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
          }));
          
          setOrders(mappedOrders);
        } catch (error: any) {
          console.error('Error fetching orders:', error);
          toast.error(error.message || 'Không thể tải danh sách đơn hàng');
        } finally {
          setLoading(false);
        }
      };
      
      fetchOrders();
    }
  }, [initialOrders]);

  // Map API status to Order status format
  const mapStatusToOrderStatus = (status: string): Order['status'] => {
    const statusMap: { [key: string]: Order['status'] } = {
      'PENDING': 'pending',
      'PROCESSING': 'processing',
      'SHIPPED': 'shipped',
      'DELIVERED': 'delivered',
      'CANCELLED': 'cancelled',
    };
    return statusMap[status.toUpperCase()] || 'pending';
  };

  // Handle view order detail
  const handleViewOrderDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsDialogOpen(true);
  };

  // Handle order updated (refresh list)
  const handleOrderUpdated = async () => {
    if (!initialOrders) {
      try {
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
        }));
        setOrders(mappedOrders);
      } catch (error: any) {
        console.error('Error refreshing orders:', error);
      }
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
        className={`px-2.5 py-1.5 min-w-[36px] rounded-lg text-sm font-semibold transition-all duration-200 ${
          currentPage === i + 1
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
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="shipped">Đã gửi</option>
            <option value="delivered">Đã giao</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Thống kê trạng thái */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
          <p className="text-lg font-bold text-blue-900">{orders.filter(o => o.status === 'pending').length}</p>
          <p className="text-sm text-blue-600">Chờ xử lý</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
          <p className="text-lg font-bold text-yellow-900">{orders.filter(o => o.status === 'processing').length}</p>
          <p className="text-sm text-yellow-600">Đang xử lý</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
          <p className="text-lg font-bold text-purple-900">{orders.filter(o => o.status === 'shipped').length}</p>
          <p className="text-sm text-purple-600">Đã gửi</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
          <p className="text-lg font-bold text-green-900">{orders.filter(o => o.status === 'delivered').length}</p>
          <p className="text-sm text-green-600">Đã giao</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
          <p className="text-lg font-bold text-red-900">{orders.filter(o => o.status === 'cancelled').length}</p>
          <p className="text-sm text-red-600">Đã hủy</p>
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
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(order.status).color}`}>
                      {getStatusBadge(order.status).text}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.orderDate)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <button 
                        onClick={() => handleViewOrderDetail(order.id)}
                        className="text-blue-600 hover:text-blue-900 transition-colors" 
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
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
    </div>
  );
};
