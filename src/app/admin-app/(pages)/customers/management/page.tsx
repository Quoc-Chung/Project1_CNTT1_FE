import { Metadata } from "next";
import { CustomerManagement } from "../../../../../components/server/CustomerManagement";
import { mockCustomers } from "../../../../../utils/mockData";


export const metadata: Metadata = {
  title: "NextCommerce | Quản lý khách hàng",
  description: "Quản lý thông tin khách hàng trong bảng điều khiển Admin NextCommerce",
};

export default function CustomerManagementPage() {
  return (
    <main className="w-full">
      <CustomerManagement
        customers={mockCustomers}
        
      />
    </main>
  );
}
