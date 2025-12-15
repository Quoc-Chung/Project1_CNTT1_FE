import { Metadata } from "next";
import { OrderManagement } from "../../../../components/server/OrderManagement";

export const metadata: Metadata = {
  title: "Proshop | Quản lý đơn hàng",
  description: "Quản lý đơn hàng khách hàng Proshop",
};

export default function OrdersPage() {
  return (
    <main className="w-full">
      <OrderManagement />
    </main>
  );
}
