import React from "react";
import { Metadata } from "next";
import CreateQuestion from "@/components/client/QA/CreateQuestion";
import Breadcrumb from "@/components/client/Common/Breadcrumb";

export const metadata: Metadata = {
  title: "Đặt câu hỏi | NextCommerce",
  description: "Đặt câu hỏi cho cộng đồng",
};

const CreateQuestionPage = () => {
  return (
    <main className="min-h-screen">
      <Breadcrumb title="Đặt câu hỏi" pages={["qa", "create"]} />

      <section className="overflow-hidden relative pb-12 pt-4 lg:pt-12 xl:pt-16">
        <div className="max-w-[900px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <CreateQuestion />
        </div>
      </section>
    </main>
  );
};

export default CreateQuestionPage;
