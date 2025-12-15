import { Metadata } from "next";
import TermsOfService from "@/components/client/TermsOfService";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng | Proshop",
  description: "Điều khoản và điều kiện sử dụng dịch vụ Proshop",
};

const TermsOfServicePage = () => {
  return (
    <main>
      <TermsOfService />
    </main>
  );
};

export default TermsOfServicePage;

