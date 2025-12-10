import React from "react";
import { Metadata } from "next";
import QuestionDetail from "@/components/client/QA/QuestionDetail";
import Breadcrumb from "@/components/client/Common/Breadcrumb";

interface QuestionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: QuestionDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Câu hỏi #${id} | NextCommerce`,
    description: "Chi tiết câu hỏi và câu trả lời",
  };
}

const QuestionDetailPage = async ({ params }: QuestionDetailPageProps) => {
  const { id } = await params;

  return (
    <main className="min-h-screen">
      <Breadcrumb title="Chi tiết câu hỏi" pages={["qa", "detail"]} />

      <section className="overflow-hidden relative pb-12 pt-4 lg:pt-12 xl:pt-16">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <QuestionDetail questionId={Number(id)} />
        </div>
      </section>
    </main>
  );
};

export default QuestionDetailPage;
