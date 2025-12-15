import React from "react";
import ShopWithSidebar from "@/components/client/ShopWithSidebar";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Cửa hàng | Proshop",
  description: "Trang cửa hàng Proshop - Xem tất cả sản phẩm",
};

const ShopWithSidebarPage = () => {
  return (
    <main>
      <ShopWithSidebar />
    </main>
  );
};

export default ShopWithSidebarPage;
