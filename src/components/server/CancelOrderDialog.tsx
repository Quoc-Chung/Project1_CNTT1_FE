"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { OrderService } from "@/services/OrderService";
import { toast } from "react-toastify";

interface CancelOrderDialogProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderCancelled: () => void;
}

export const CancelOrderDialog: React.FC<CancelOrderDialogProps> = ({
  orderId,
  isOpen,
  onClose,
  onOrderCancelled,
}) => {
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setReason("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderId) {
      toast.error("Không tìm thấy mã đơn hàng");
      return;
    }

    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      setLoading(true);
      // Gửi status CANCELLED lên server (không gửi reason)
      await OrderService.updateOrderStatus(orderId, "CANCELLED");
      toast.success("Đã từ chối đơn hàng thành công!");
      onOrderCancelled();
      onClose();
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      toast.error(error.message || "Không thể từ chối đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-3 rounded-t-lg flex justify-between items-center">
          <h2 className="text-lg font-semibold">Từ Chối Đơn Hàng</h2>
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
              Mã đơn hàng
            </label>
            <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 font-mono">
              {orderId || "N/A"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Lý do từ chối <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none"
              rows={4}
              placeholder="Nhập lý do từ chối đơn hàng..."
              required
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Lý do này chỉ để tham khảo, không được gửi lên server
            </p>
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
              className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Từ chối đơn hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

