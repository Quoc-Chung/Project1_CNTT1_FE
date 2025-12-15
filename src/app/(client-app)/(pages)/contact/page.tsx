import Contact from "@/components/client/Contact";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Liên hệ | Proshop",
  description: "Trang liên hệ Proshop",
};

const ContactPage = () => {
  return (
    <main>
      <Contact />
    </main>
  );
};

export default ContactPage;
