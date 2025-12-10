export interface Tag {
  id: number;
  name: string;
  slug: string;
  usageCount: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
  displayOrder: number;
}

export interface Review {
  id: number;
  type: string;
  title: string;
  content: string;
  userId: number;
  userName: string;
  userAvatar: string;
  productId: number;
  productName: string | null;
  rating: number | null;
  category: Category;
  likeCount: number;
  viewCount: number;
  answerCount: number;
  createdAt: string;
  tags: Tag[];
}

export interface ReviewData {
  content: Review[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export interface ReviewResponse {
  success: boolean;
  message: string;
  data: ReviewData;
  timestamp: string;
}
