export type OrderStatus = 'pending' | 'approved' | 'rejected';

export interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  _id: string;
  referenceCode: string; // e.g. ORD-XXXXXX or RF-2048
  customerId: string;
  customerName: string;
  customerPhone?: string;
  storeId: string;
  items: OrderItem[];
  totalPrice: number;
  deliveryAddress: string;
  paymentMethod: 'cash_on_delivery';
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}
