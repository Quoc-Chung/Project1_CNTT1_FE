"use client";
import React, { useState, useEffect } from "react";
import { X, CheckCircle, XCircle } from "lucide-react";
import { OrderService, AdminOrderDetailResponse } from "@/services/OrderService";
import { formatPrice, formatDate, getStatusBadge } from "@/utils/helpers";
import { toast } from "react-toastify";

interface OrderDetailDialogProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated?: () => void;
}

export const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({
  orderId,
  isOpen,
  onClose,
  onOrderUpdated,
}) => {
  const [orderDetail, setOrderDetail] = useState<AdminOrderDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetail();
    } else {
      setOrderDetail(null);
    }
  }, [isOpen, orderId]);

  const fetchOrderDetail = async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      const detail = await OrderService.getOrderDetailForAdmin(orderId);
      setOrderDetail(detail);
    } catch (error: any) {
      console.error("Error fetching order detail:", error);
      toast.error(error.message || "Không thể tải chi tiết đơn hàng");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrder = async () => {
    if (!orderId) return;
    
    try {
      setProcessing(true);
      // TODO: Gọi API duyệt đơn hàng
      toast.success(`Đã duyệt đơn hàng ${orderId}`);
      onOrderUpdated?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Không thể duyệt đơn hàng");
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectOrder = async () => {
    if (!orderId) return;
    
    try {
      setProcessing(true);
      // TODO: Gọi API từ chối đơn hàng
      toast.success(`Đã từ chối đơn hàng ${orderId}`);
      onOrderUpdated?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Không thể từ chối đơn hàng");
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Đang tải chi tiết đơn hàng...</p>
              </div>
            </div>
          ) : orderDetail ? (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Mã đơn hàng</p>
                  <p className="text-lg font-mono font-bold text-gray-900 break-all">{orderDetail.orderId}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Trạng thái</p>
                  <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusBadge(orderDetail.status.toLowerCase()).color} shadow-sm`}>
                    {getStatusBadge(orderDetail.status.toLowerCase()).text}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Ngày đặt</p>
                  <p className="text-base font-semibold text-gray-900">{formatDate(orderDetail.createdAt)}</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4 border-2 border-red-200">
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Tổng tiền</p>
                  <p className="text-2xl font-bold text-red-600">{formatPrice(orderDetail.totalAmount)}</p>
                </div>
                <div className="col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Địa chỉ giao hàng</p>
                  <p className="text-base font-medium text-gray-900 leading-relaxed">{orderDetail.shippingAddress}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <div className="flex items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Sản phẩm</h3>
                  <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                    {orderDetail.items.length} {orderDetail.items.length === 1 ? 'sản phẩm' : 'sản phẩm'}
                  </span>
                </div>
                <div className="border-2 border-gray-300 rounded-lg overflow-x-auto shadow-sm">
                  <table className="w-full min-w-full table-auto border-collapse">
                    <thead className="bg-gray-50 border-b-2 border-gray-300">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 whitespace-nowrap border-r border-gray-300">Sản phẩm</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 whitespace-nowrap border-r border-gray-300">SKU</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 whitespace-nowrap border-r border-gray-300">Đơn giá</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 whitespace-nowrap border-r border-gray-300">Số lượng</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 whitespace-nowrap">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                      {orderDetail.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 border-b border-gray-300">
                          <td className="px-4 py-3 min-w-[200px] border-r border-gray-300">
                            <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                            <p className="text-xs text-gray-500">ID: {item.productId}</p>
                          </td>
                          <td className="px-4 py-3 min-w-[180px] border-r border-gray-300">
                            <p className="text-sm text-gray-600 font-mono break-all">{item.skuId}</p>
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap border-r border-gray-300">
                            <p className="text-sm font-medium text-gray-900">{formatPrice(item.productPrice)}</p>
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap border-r border-gray-300">
                            <p className="text-sm text-gray-900">{item.quantity}</p>
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <p className="text-sm font-semibold text-gray-900">{formatPrice(item.subtotal)}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-right text-sm font-semibold text-gray-900 whitespace-nowrap border-r border-gray-300">
                          Tổng cộng:
                        </td>
                        <td className="px-4 py-3 text-right text-lg font-bold text-red-600 whitespace-nowrap">
                          {formatPrice(orderDetail.totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Không tìm thấy thông tin đơn hàng
            </div>
          )}
        </div>

        {/* Footer with action buttons */}
        {orderDetail && orderDetail.status === 'PENDING' && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleRejectOrder}
              disabled={processing}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle size={18} />
              <span>Từ chối đơn hàng</span>
            </button>
            <button
              onClick={handleApproveOrder}
              disabled={processing}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle size={18} />
              <span>Duyệt đơn</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

