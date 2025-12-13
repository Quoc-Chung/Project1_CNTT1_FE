import { Metadata } from "next";
import { InventoryManagement } from "../../../../../components/server/InventoryManagement";

export const metadata: Metadata = {
  title: "NextCommerce | Quản lý kho",
  description: "Quản lý kho hàng trong bảng điều khiển Admin NextCommerce",
};

export default function InventoryPage() {
  return (
    <main className="w-full">
      <InventoryManagement />
    </main>
  );
}
