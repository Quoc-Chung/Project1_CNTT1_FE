"use client";
import React, { useState } from "react";
import { X, Power, PowerOff } from "lucide-react";
import { Customer } from "@/types/Admin";
import { formatDate, formatPrice } from "@/utils/helpers";
import { toast } from "react-toastify";

interface CustomerDetailDialogProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onCustomerUpdated?: () => void;
}

export const CustomerDetailDialog: React.FC<CustomerDetailDialogProps> = ({
  customer,
  isOpen,
  onClose,
  onCustomerUpdated,
}) => {
  const [processing, setProcessing] = useState(false);

  const handleToggleStatus = async () => {
    if (!customer) return;
    
    try {
      setProcessing(true);
      const newStatus = !customer.isActive;
      
      // TODO: Gọi API để bật/tắt hoạt động user
      // await UserService.updateUserStatus(customer.id, newStatus);
      
      toast.success(
        newStatus 
          ? `Đã bật hoạt động cho khách hàng ${customer.name}` 
          : `Đã tắt hoạt động cho khách hàng ${customer.name}`
      );
      
      onCustomerUpdated?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Không thể cập nhật trạng thái khách hàng");
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Chi Tiết Khách Hàng</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Tên khách hàng</p>
                <p className="text-lg font-bold text-gray-900">{customer.name}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Mã khách hàng</p>
                <p className="text-lg font-mono font-bold text-gray-900">{customer.id}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Email</p>
                <p className="text-base font-medium text-gray-900">{customer.email}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">SĐT</p>
                <p className="text-base font-medium text-gray-900">{customer.phone}</p>
              </div>
              {customer.address && (
                <div className="col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Địa chỉ</p>
                  <p className="text-base font-medium text-gray-900">{customer.address}</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Ngày đăng ký</p>
                <p className="text-base font-medium text-gray-900">{formatDate(customer.createdAt)}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4 border-2 border-red-200">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Tổng chi tiêu</p>
                <p className="text-2xl font-bold text-red-600">{formatPrice(customer.totalSpent)}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Tổng đơn hàng</p>
                <p className="text-xl font-bold text-blue-600">{customer.totalOrders} đơn hàng</p>
              </div>
              <div className="col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Trạng thái</p>
                <span
                  className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                    customer.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {customer.isActive ? "Hoạt động" : "Không hoạt động"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with action buttons */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Thoát
          </button>
          
          <div className="flex items-center space-x-3">
            {customer.isActive ? (
              <button
                onClick={handleToggleStatus}
                disabled={processing}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PowerOff size={18} />
                <span>Tắt hoạt động</span>
              </button>
            ) : (
              <button
                onClick={handleToggleStatus}
                disabled={processing}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Power size={18} />
                <span>Bật hoạt động</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

