export type Product = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  id: number | string; // Support both number and string ID
  originalId?: string; // Store original string ID from API
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

