import Signin from "@/components/client/Auth/Signin";
import React from "react";
import { Metadata } from "next";
import VarifierOTp from "../../../../components/client/Auth/VerifyOtp";
export const metadata: Metadata = {
  title: "Xác thực OTP | Proshop",
  description: "Trang xác thực OTP Proshop",
};

/* /verifyotp */
const VerifyOTP = () => {
  return (
    <main>
      <VarifierOTp />
    </main>
  );
};

export default VerifyOTP;
