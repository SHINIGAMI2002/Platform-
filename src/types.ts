export type UserRole = 'customer' | 'merchant' | 'rider';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  address?: string;
  landmark?: string;
  restaurantId?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  isOpen: boolean;
  phone: string;
  address: string;
  locationLandmark: string;
  image: string;
  rating: number;
  reviewCount: number;
  deliveryFee: number;
  estPrepTime: string;
  ownerName: string;
}

export interface MenuItemOptionChoice {
  name: string;
  extraPrice: number;
}

export interface MenuItemOption {
  name: string;
  choices: MenuItemOptionChoice[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  image: string;
  options?: MenuItemOption[];
}

export interface CartItemOption {
  optionName: string;
  choiceName: string;
  extraPrice: number;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
  selectedOptions?: CartItemOption[];
}

export type OrderStatus =
  | 'pending'           // ลูกค้าสั่งแล้ว รอร้านตอบรับ
  | 'preparing'         // ร้านกดรับกำลังทำอาหาร
  | 'ready_for_pickup'  // อาหารเสร็จแล้ว รอไรเดอร์มารับ
  | 'out_for_delivery'  // ไรเดอร์รับของแล้ว กำลังไปส่ง
  | 'delivered'         // ไรเดอร์ส่งถึงมือลูกค้าแล้ว
  | 'cancelled';        // ยกเลิก

export type PaymentMethod = 'promptpay' | 'cod';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
  selectedOptions?: CartItemOption[];
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryLandmark: string;
  restaurantId: string;
  restaurantName: string;
  restaurantPhone: string;
  restaurantLandmark: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'cod_pending';
  promptPayRef?: string;
  status: OrderStatus;
  estimatedMinutes: number;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}
