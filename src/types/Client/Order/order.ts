export interface OrderItemRequest {
  productId: string;
  skuId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  items: OrderItemRequest[];
  shippingAddress: string;
}

export interface OrderItemResponse {
  productId: string;
  productName: string;
  skuId: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderResponse {
  orderId: string;
  userId: number;
  items?: OrderItemResponse[];
  shippingAddress: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderState {
  orders: OrderResponse[];
  currentOrder: OrderResponse | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}
