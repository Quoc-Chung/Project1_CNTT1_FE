import { Metadata } from "next";
import { CustomerManagement } from "../../../../../components/server/CustomerManagement";

export const metadata: Metadata = {
  title: "Proshop | Quản lý khách hàng",
  description: "Quản lý thông tin khách hàng trong bảng điều khiển Admin Proshop",
};

export default function CustomerManagementPage() {
  return (
    <main className="w-full">
      <CustomerManagement />
    </main>
  );
}
