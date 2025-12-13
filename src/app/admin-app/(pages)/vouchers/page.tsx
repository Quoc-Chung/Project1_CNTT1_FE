import { Metadata } from "next";
import { VoucherManagement } from "../../../../components/server/VoucherManagement";

export const metadata: Metadata = {
  title: "NextCommerce | Quản lý voucher",
  description: "Quản lý voucher và khuyến mãi trong bảng điều khiển Admin NextCommerce",
};

export default function VouchersPage() {
  return (
    <main className="w-full">
      <VoucherManagement />
    </main>
  );
}

