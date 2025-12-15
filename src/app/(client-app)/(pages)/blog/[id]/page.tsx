import BlogDetail from "@/components/client/Blog/BlogDetail";
import { Metadata } from "next";

interface BlogDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Chi tiết Blog | Proshop",
    description: "Đọc bài viết chi tiết về công nghệ và sản phẩm máy tính",
  };
}

const BlogDetailPage = async ({ params }: BlogDetailPageProps) => {
  const { id } = await params;
  return <BlogDetail blogId={id} />;
};

export default BlogDetailPage;

