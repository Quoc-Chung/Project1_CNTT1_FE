import React from "react";
import Cart from "@/components/client/Cart";
import ProtectedRoute from "../../../../components/client/Auth/ProtectedRoute";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giỏ hàng | Proshop",
  description: "Trang giỏ hàng Proshop",
};

const CartPage = () => {
  return (
    <ProtectedRoute>
      <Cart />
    </ProtectedRoute>
  );
};

export default CartPage;
