import React from "react";
import Error from "@/components/client/Error";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Lỗi | Proshop",
  description: "Trang lỗi Proshop",
};

const ErrorPage = () => {
  return (
    <main>
      <Error />
    </main>
  );
};

export default ErrorPage;
