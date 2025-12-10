import React from "react";
import { Metadata } from "next";
import QuestionList from "@/components/client/QA/QuestionList";
import Breadcrumb from "@/components/client/Common/Breadcrumb";

export const metadata: Metadata = {
  title: "Hỏi đáp | NextCommerce",
  description: "Hỏi đáp về sản phẩm, công nghệ và mua sắm",
};

const QAPage = () => {
  return (
    <main className="min-h-screen">
      <Breadcrumb title="Hỏi đáp" pages={["qa"]} />

      <section className="overflow-hidden relative pb-12 pt-4 lg:pt-12 xl:pt-16">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <QuestionList />
        </div>
      </section>
    </main>
  );
};

export default QAPage;
