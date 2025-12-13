"use client"
import React from "react";
import { User } from "lucide-react";
import Image from "next/image";
import { Customer, CustomerPurchase } from "../../types/Admin";
import { formatDate, formatPrice } from "../../utils/helpers";

interface CustomerDetailsProps {
  customer: Customer;
  purchases: CustomerPurchase[];
}

export const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  customer,
  purchases,
}) => {
  return (
    <div className="space-y-8 p-6 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          className="group flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-all duration-300"
        >
          <span className="group-hover:-translate-x-1 transition-transform duration-200">
            ←
          </span>
          <span>Quay lại</span>
        </button>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Chi Tiết Khách Hàng
        </h2>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6 flex flex-col md:flex-row items-start md:items-center justify-between space-y-6 md:space-y-0 md:space-x-8 relative overflow-hidden transition-all duration-500 hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 animate-pulse-slow" />
        <div className="flex items-center space-x-5 relative z-10 group">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
            <User size={36} className="text-white" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
              {customer.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{customer.id}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 flex-1 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-800">Email:</span>
            <span className="text-gray-600">{customer.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-800">SĐT:</span>
            <span className="text-gray-600">{customer.phone}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-800">Địa chỉ:</span>
            <span className="text-gray-600">{customer.address}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-800">Ngày đăng ký:</span>
            <span className="text-gray-600">
              {formatDate(customer.createdAt)}
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0 relative z-10">
          <div className="text-2xl font-bold text-green-600 tracking-tight">
            {formatPrice(customer.totalSpent)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {customer.totalOrders} đơn hàng
          </div>
        </div>
      </div>

      {/* Purchase history */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden p-5">
        <div className="pb-4 border-b border-gray-200/50 mb-5">
          <h3 className="text-xl font-semibold text-black tracking-tight">
            Lịch Sử Mua Hàng
          </h3>
        </div>

        {purchases.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            Khách hàng chưa có đơn hàng nào
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto">
            {purchases.map((purchase) => (
              <div
                key={purchase.orderId}
                className="border border-gray-200/50 rounded-xl p-4 space-y-3 hover:shadow-md transition-all duration-300"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-black text-sm">
                      #{purchase.orderId}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(purchase.date)}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-blue-600">
                    {formatPrice(purchase.totalAmount)}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {purchase.products.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center space-x-3 bg-gray-50 p-2 rounded-lg"
                    >
                      <Image
                        src={p.thumbnailUrl}
                        alt={p.name}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover"
                        style={{ width: "auto", height: "auto" }}
                      />
                      <div className="flex-1 text-xs">
                        <h5 className="font-semibold text-black">{p.name}</h5>
                        <p className="text-gray-500">
                          {p.brandName} • {p.categoryName}
                        </p>
                        <p className="text-blue-600 font-semibold">
                          {formatPrice(p.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
