import FAQ from "@/components/client/FAQ";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Hỏi đáp | Proshop Nextjs E-commerce template",
  description: "Cộng đồng hỏi đáp về sản phẩm công nghệ",
};

const FAQPage = () => {
  return (
    <main>
      <FAQ />
    </main>
  );
};

export default FAQPage;

