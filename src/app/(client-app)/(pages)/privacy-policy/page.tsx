import { Metadata } from "next";
import PrivacyPolicy from "@/components/client/PrivacyPolicy";

export const metadata: Metadata = {
  title: "Chính sách bảo mật | Proshop",
  description: "Chính sách bảo mật thông tin của Proshop",
};

const PrivacyPolicyPage = () => {
  return (
    <main>
      <PrivacyPolicy />
    </main>
  );
};

export default PrivacyPolicyPage;

