// ===========================
// Product API Types
// ===========================

export interface ProductSpec {
  [key: string]: string; 
  CPU?: string;
  Display?: string;
  RAM?: string;
  SSD?: string;
  Size?: string;
  Panel?: string;
  Resolution?: string;
  "Refresh Rate"?: string;
  Socket?: string;
  Chipset?: string;
  "Form Factor"?: string;
  Type?: string;
  Speed?: string;
  Bus?: string;
  Memory?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  brandName: string;
  categoryName: string;
  specs: ProductSpec;
  price: number | null;
  thumbnailUrl: string | null;
  images?: string[];
}

export interface ApiStatus {
  code: string;
  message: string;
  label: string;
}

export interface ProductListResponse {
  status: ApiStatus;
  data: {
    content: Product[];
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
    current_page: number;
    total_elements: number;
  };
  extraData: null;
}

export interface ProductDetailResponse {
  status: ApiStatus;
  data: Product;
  extraData: null;
}

export interface ProductCreateRequest {
  name: string;
  description: string;
  brandId: string;
  categoryId: string;
  specs: ProductSpec;
  imageUrls: string[];
}

export interface BestSellerProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  totalSold: number;
}

export interface BestSellersResponse {
  status: ApiStatus;
  data: BestSellerProduct[];
  extraData: null;
}

