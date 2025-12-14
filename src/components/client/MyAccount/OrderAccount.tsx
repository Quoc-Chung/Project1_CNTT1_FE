"use client";
import Image from "next/image";
import React, { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { getAllOrdersAction, getOrderByIdAction } from "@/redux/Client/Order/Action";
import { OrderResponse } from "@/types/Client/Order/order";
import { toast } from "react-toastify";
import ReviewDialog from "@/components/client/Reviews/ReviewDialog";

const OrderAccount = () => {
  const dispatch = useAppDispatch();
  const { orders, loading, error } = useAppSelector((state) => state.order);
  const { token } = useAppSelector((state) => state.auth);
  
  // State để lưu chi tiết đơn hàng đã fetch
  const [orderDetails, setOrderDetails] = useState<{ [key: string]: OrderResponse }>({});
  // Ref để track các order đang được fetch để tránh fetch nhiều lần
  const fetchingOrders = React.useRef<Set<string>>(new Set());
  
  // State cho dialog đánh giá
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedProductName, setSelectedProductName] = useState<string>("");

  // Fetch danh sách đơn hàng khi component mount
  useEffect(() => {
    if (token) {
      dispatch(
        getAllOrdersAction(
          token,
          () => {
            console.log("Đã tải danh sách đơn hàng thành công");
          },
          (error) => {
            toast.error(error || "Không thể tải danh sách đơn hàng");
          }
        )
      );
    }
  }, [dispatch, token]);

  const orderIds = useMemo(() => orders.map(o => o.orderId).join(','), [orders]);
  const orderDetailsKeys = useMemo(() => Object.keys(orderDetails).join(','), [orderDetails]);
  
  const ordersToFetch = useMemo(() => {
    return orders.filter(
      (order) =>
        (!order.items || order.items.length === 0) &&
        !orderDetails[order.orderId] &&
        !fetchingOrders.current.has(order.orderId)
    );
  }, [orderIds, orderDetailsKeys, orders, orderDetails]);

  // Fetch chi tiết đơn hàng khi cần thiết
  useEffect(() => {
    if (!token || ordersToFetch.length === 0) return;

    // Chỉ fetch các order mới, không fetch lại các order đã có
    ordersToFetch.forEach((order) => {
      fetchingOrders.current.add(order.orderId);
      
      dispatch(
        getOrderByIdAction(
          order.orderId,
          token,
          (res) => {
            if (res.data) {
              setOrderDetails((prev) => ({
                ...prev,
                [order.orderId]: res.data,
              }));
            }
            fetchingOrders.current.delete(order.orderId);
          },
          (error) => {
            console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
            fetchingOrders.current.delete(order.orderId);
          }
        )
      );
    });
  }, [ordersToFetch, token, dispatch]); // Chỉ trigger khi có order mới cần fetch

  // Hàm format giá tiền VNĐ
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' VNĐ';
  };

  // Hàm format ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Hàm format giờ
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Hàm lấy màu sắc và icon cho trạng thái đơn hàng
  const getStatusConfig = (status: string) => {
    const upperStatus = status.toUpperCase();
    switch(upperStatus) {
      case "DELIVERED":
      case "COMPLETED":
        return { 
          bg: "bg-gradient-to-r from-green-500 to-emerald-600", 
          text: "text-white", 
          dot: "bg-green-500",
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
          label: "Đã giao hàng"
        };
      case "PROCESSING":
      case "CONFIRMED":
        return { 
          bg: "bg-gradient-to-r from-yellow-500 to-orange-500", 
          text: "text-white", 
          dot: "bg-yellow-500",
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          ),
          label: "Đang xử lý"
        };
      case "SHIPPED":
        return { 
          bg: "bg-gradient-to-r from-blue-500 to-cyan-500", 
          text: "text-white", 
          dot: "bg-blue-500",
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
          ),
          label: "Đã gửi hàng"
        };
      case "PENDING":
        return { 
          bg: "bg-gradient-to-r from-orange-500 to-red-500", 
          text: "text-white", 
          dot: "bg-orange-500",
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          ),
          label: "Chờ xử lý"
        };
      case "CANCELLED":
      case "CANCELED":
        return { 
          bg: "bg-gradient-to-r from-red-500 to-pink-500", 
          text: "text-white", 
          dot: "bg-red-500",
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ),
          label: "Đã hủy"
        };
      default:
        return { 
          bg: "bg-gradient-to-r from-gray-500 to-gray-600", 
          text: "text-white", 
          dot: "bg-gray-500",
          icon: null,
          label: status
        };
    }
  };

  // Lấy order với chi tiết đầy đủ (items)
  const getOrderWithDetails = (order: OrderResponse): OrderResponse => {
    return orderDetails[order.orderId] || order;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">Lịch sử đơn hàng</h2>
          <p className="text-xs text-gray-600">Xem và theo dõi tất cả đơn hàng của bạn</p>
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">Lịch sử đơn hàng</h2>
          <p className="text-xs text-gray-600">Xem và theo dõi tất cả đơn hàng của bạn</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 text-sm font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">Lịch sử đơn hàng</h2>
          <p className="text-xs text-gray-600">Xem và theo dõi tất cả đơn hàng của bạn</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-gray-600 text-sm font-semibold">Bạn chưa có đơn hàng nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">Lịch sử đơn hàng</h2>
        <p className="text-xs text-gray-600">Xem và theo dõi tất cả đơn hàng của bạn</p>
      </div>
      
      <div 
        className="max-h-[calc(100vh-250px)] overflow-y-auto pr-2 space-y-4 order-list-scroll"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9'
        }}
      >
        {orders.map((order) => {
          const orderWithDetails = getOrderWithDetails(order);
          const statusConfig = getStatusConfig(order.status);
          const orderItems = orderWithDetails.items || [];
          
          return (
            <div key={order.orderId} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-blue-300">
              {/* Header với thông tin đơn hàng */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-2">
                      <h3 className="font-bold text-base text-gray-900">#{order.orderId.substring(0, 8)}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} flex items-center gap-1 shadow-sm`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">Ngày đặt: {formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Giờ: {formatTime(order.createdAt)}</span>
                      </div>
                    </div>
                    {order.shippingAddress && (
                      <div className="mt-2 flex items-start gap-1.5 text-xs text-gray-600">
                        <svg className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">{order.shippingAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Danh sách sản phẩm */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <h4 className="font-bold text-sm text-gray-900">
                    Sản phẩm ({orderItems.length > 0 ? orderItems.length : 'Đang tải...'})
                  </h4>
                </div>
                
                {orderItems.length > 0 ? (
                  <div className="space-y-2">
                    {orderItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-sm">
                      <div className="flex-shrink-0">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                      </div>
                      
                      <div className="flex-grow min-w-0">
                          <h5 className="font-semibold text-xs text-gray-900 mb-0.5 truncate">{item.productName}</h5>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <span>Giá: <span className="text-blue-600 font-semibold">{formatPrice(item.productPrice)}</span></span>
                            <span>x{item.quantity}</span>
                          </div>
                          <p className="text-blue-600 font-semibold text-xs mt-0.5">
                            Tổng: {formatPrice(item.subtotal)}
                          </p>
                      </div>
                      
                      {/* Nút đánh giá - chỉ hiển thị khi đơn hàng đã giao */}
                      {(order.status.toUpperCase() === "DELIVERED" || order.status.toUpperCase() === "COMPLETED") && (
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => {
                              setSelectedProductId(item.productId);
                              setSelectedProductName(item.productName);
                              setReviewDialogOpen(true);
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Đánh giá
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                ) : (
                  <div className="flex justify-center items-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              
              {/* Footer với tổng tiền */}
              <div className="px-4 py-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-t border-blue-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-700 font-semibold text-sm">Tổng cộng</p>
                  </div>
                  <p className="font-bold text-lg sm:text-xl text-blue-600">{formatPrice(order.totalAmount)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Review Dialog */}
      <ReviewDialog
        isOpen={reviewDialogOpen}
        onClose={() => {
          setReviewDialogOpen(false);
          setSelectedProductId("");
          setSelectedProductName("");
        }}
        productId={selectedProductId}
        productName={selectedProductName}
      />
    </div>
  );
};

export default OrderAccount;