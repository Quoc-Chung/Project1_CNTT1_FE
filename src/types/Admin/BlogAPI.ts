import { BlogPost } from "../Client/Blog/BlogPost";

export interface CreateBlogRequest {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: File | null;
  category: string;
  readTime: string;
}

export interface UpdateBlogRequest {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: File | null;
  category: string;
  readTime: string;
}

export interface BlogApiResponse {
  status: {
    code: string;
    message: string;
    label: string;
  };
  data: BlogPost;
  error: null | string;
}

