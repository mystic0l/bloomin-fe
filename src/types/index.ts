export interface Shop {
  id: string;
  userId: string;
  name: string;
  type: string;
  address: string;
  language: 'english' | 'hindi';
  serviceType: 'takeout' | 'delivery';
  upiId?: string;
  upiQrUrl?: string;
  isActive: boolean;
  createdAt: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  flavor: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  phone: string;
  defaultAddress?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  shopId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: 'cash_on_delivery' | 'upi_on_delivery';
  status: 'pending' | 'accepted' | 'ready' | 'completed' | 'cancelled';
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productFlavor: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type UserRole = 'shopkeeper' | 'customer' | null;
