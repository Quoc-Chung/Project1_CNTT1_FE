"use client";

import { Geist, Geist_Mono } from "next/font/google";
import dynamic from "next/dynamic";
import Sidebar from "../../components/server/Sidebar";
import AdminRoute from "../../components/client/Auth/AdminRoute";
import "../css/globals.css"
import ReduxProvider from "../../utils/Provider/ReduxProvider";
import "react-toastify/dist/ReactToastify.css";

const ToastContainer = dynamic(() => import("react-toastify").then(mod => ({ default: mod.ToastContainer })), {
  ssr: false,
});
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <AdminRoute>
            <div className="flex min-h-screen bg-gray-100">
              {/* Sidebar cố định */}
              <Sidebar />
              {/* Nội dung page */}
              <main className="flex-1 min-w-0 overflow-hidden">
                <div className="p-6 h-screen overflow-y-auto custom-scrollbar w-full">{children}</div>
              </main>
            </div>
            
            <style jsx global>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(to bottom, #2563eb, #7c3aed);
              }
            `}</style>
            {/* ToastContainer for notifications */}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </AdminRoute>
        </ReduxProvider>
      </body>
    </html>
  );
}
