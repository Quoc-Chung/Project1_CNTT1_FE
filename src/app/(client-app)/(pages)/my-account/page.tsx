
import React from "react";
import ProtectedRoute from "../../../../components/client/Auth/ProtectedRoute";
import { Metadata } from "next";
import UserDashboard from "../../../../components/client/MyAccount";

export const metadata: Metadata = {
  title: "Tài khoản của tôi | Proshop",
  description: "Trang tài khoản cá nhân Proshop",
};

const MyAccountPage = () => {
  return (
    <ProtectedRoute>
      <main>
        <UserDashboard />
      </main>
    </ProtectedRoute>
  );
};

export default MyAccountPage;
