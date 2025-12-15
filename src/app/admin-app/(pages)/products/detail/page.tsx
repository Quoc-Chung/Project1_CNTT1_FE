"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProductDetailPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Chi tiết sản phẩm | Proshop";
    router.replace("/admin-app/products/management");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600 text-sm">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}

