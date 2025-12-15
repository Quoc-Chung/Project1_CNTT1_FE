import { Metadata } from "next";
import { mockCustomers, mockProducts } from "../../../../../utils/mockData";
import { CustomerPurchase } from "../../../../../types/Admin";
import { CustomerDetails } from "../../../../../components/server/CustomerDetails";

export const metadata: Metadata = {
  title: "Proshop | Chi tiết khách hàng",
  description: "Xem chi tiết mua hàng của khách hàng",
};

export default function CustomerDetailPage() {
  const customer = mockCustomers[0];

  const purchases: CustomerPurchase[] = [
    {
      date: "2024-09-10",
      orderId: "ORD001",
      totalAmount: 52990000,
      products: [mockProducts[0]],
    },
    {
      date: "2024-08-15",
      orderId: "ORD002",
      totalAmount: 35990000,
      products: [mockProducts[1]],
    },
  ];

  return (
    <main className="w-full">
      <CustomerDetails
        customer={customer}
        purchases={purchases}
      />
    </main>
  );
}
