import { Metadata } from "next";
import { OrderManagement } from "../../../../components/server/OrderManagement";

export const metadata: Metadata = {
  title: "NextCommerce | Quản lý đơn hàng",
  description: "Quản lý đơn hàng khách hàng NextCommerce",
};

export default function OrdersPage() {
  return (
    <main className="w-full">
      <OrderManagement />
    </main>
  );
}
