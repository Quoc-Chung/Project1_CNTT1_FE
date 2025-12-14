"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { OrderService } from "@/services/OrderService";
import { toast } from "react-toastify";

interface UpdateOrderStatusDialogProps {
  orderId: string | null;
  currentStatus: string;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: () => void;
}

const ORDER_STATUSES = [
  { value: "COMPLETED", label: "Đã hoàn thành" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "SHIPPING", label: "Đang giao hàng" },
  { value: "DELIVERED", label: "Đã giao hàng" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "RETURNED", label: "Đã trả hàng" },
];

export const UpdateOrderStatusDialog: React.FC<UpdateOrderStatusDialogProps> = ({
  orderId,
  currentStatus,
  isOpen,
  onClose,
  onStatusUpdated,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      // Đảm bảo currentStatus luôn là uppercase để match với API
      const normalizedStatus = String(currentStatus).toUpperCase();
      setSelectedStatus(normalizedStatus);
    }
  }, [isOpen, currentStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderId) {
      toast.error("Không tìm thấy mã đơn hàng");
      return;
    }

    // Normalize cả hai status để so sánh
    const normalizedSelected = String(selectedStatus).toUpperCase();
    const normalizedCurrent = String(currentStatus).toUpperCase();
    
    if (normalizedSelected === normalizedCurrent) {
      toast.info("Trạng thái không thay đổi");
      return;
    }

    try {
      setLoading(true);
      // Đảm bảo gửi status đúng format (uppercase) đến API
      const updatedOrder = await OrderService.updateOrderStatus(orderId, normalizedSelected);
      
      // Log để debug
      console.log('Order status updated:', {
        orderId,
        oldStatus: normalizedCurrent,
        newStatus: normalizedSelected,
        apiResponse: updatedOrder.status
      });
      
      toast.success("Cập nhật trạng thái đơn hàng thành công!");
      
      // Đợi một chút trước khi refresh để đảm bảo API đã cập nhật xong
      setTimeout(() => {
        onStatusUpdated();
        onClose();
      }, 300);
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast.error(error.message || "Không thể cập nhật trạng thái đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3 rounded-t-lg flex justify-between items-center">
          <h2 className="text-lg font-semibold">Duyệt Đơn Hàng</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-1 hover:bg-white/10 rounded"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Trạng thái hiện tại
            </label>
            <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
              {ORDER_STATUSES.find(s => s.value === currentStatus)?.label || currentStatus}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Cập nhật trạng thái <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              required
              disabled={loading}
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700 font-medium"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

