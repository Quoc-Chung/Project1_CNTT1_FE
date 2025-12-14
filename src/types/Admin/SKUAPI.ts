export interface SKUSpecs {
  [key: string]: string | number | boolean | null;
}

export interface SKU {
  id: string;
  productId: string;
  skuCode: string | null;
  specs: SKUSpecs | null;
  price: number;
  discountPrice: number | null;
  salePrice: number | null;
  saleId: string | null;
  stock: number;
  barcode: string | null;
  isActive: boolean;
}

export interface SKUCreateRequest {
  productId: string;
  skuCode: string;
  specs: SKUSpecs;
  price: number;
  discountPrice?: number | null;
  stock: number;
  barcode?: string | null;
  isActive: boolean;
}

export interface SKUUpdateRequest {
  price?: number;
  discountPrice?: number | null;
  stock?: number;
  isActive?: boolean;
}

export interface SKUApiResponse {
  status: {
    code: string;
    message: string;
    label?: string;
  };
  data: SKU | SKU[] | null;
  extraData?: any;
}

export interface Product {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

