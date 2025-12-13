import { Metadata } from "next";
import { SaleManagement } from "@/components/server/SaleManagement";

export const metadata: Metadata = {
  title: "Quản Lý Sale | Admin Panel",
  description: "Quản lý các chương trình sale và khuyến mãi",
};

export default function SalesPage() {
  return <SaleManagement />;
}

