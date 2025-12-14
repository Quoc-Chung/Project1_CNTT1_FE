import Home from "@/components/client/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proshop | Trang chủ",
  description: "Trang chủ Proshop - Mua sắm trực tuyến",
};

export default function HomePageClient() {
  return (
    <>
      <Home />
    </>
  );
}
