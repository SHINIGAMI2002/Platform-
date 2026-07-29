import { Restaurant, MenuItem, Order, OrderStatus } from '../types';

export async function fetchRestaurants(): Promise<Restaurant[]> {
  const res = await fetch('/api/restaurants');
  const json = await res.json();
  return json.data || [];
}

export async function toggleRestaurantStatus(id: string): Promise<Restaurant> {
  const res = await fetch(`/api/restaurants/${id}/toggle`, { method: 'PUT' });
  const json = await res.json();
  return json.data;
}

export async function fetchMenuItems(restaurantId?: string): Promise<MenuItem[]> {
  const url = restaurantId ? `/api/menu-items?restaurantId=${restaurantId}` : '/api/menu-items';
  const res = await fetch(url);
  const json = await res.json();
  return json.data || [];
}

export async function toggleMenuItemAvailability(id: string): Promise<MenuItem> {
  const res = await fetch(`/api/menu-items/${id}/availability`, { method: 'PATCH' });
  const json = await res.json();
  return json.data;
}

export async function createMenuItem(item: Partial<MenuItem>): Promise<MenuItem> {
  const res = await fetch('/api/menu-items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  const json = await res.json();
  return json.data;
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  const res = await fetch(`/api/menu-items/${id}`, { method: 'DELETE' });
  const json = await res.json();
  return json.success;
}

export async function fetchOrders(params?: {
  restaurantId?: string;
  riderId?: string;
  customerId?: string;
  status?: string;
}): Promise<Order[]> {
  const query = new URLSearchParams(params as any).toString();
  const url = query ? `/api/orders?${query}` : '/api/orders';
  const res = await fetch(url);
  const json = await res.json();
  return json.data || [];
}

export async function createOrder(orderData: any): Promise<Order> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || 'ไม่สามารถสร้างคำสั่งซื้อได้');
  }
  return json.data;
}

export async function updateOrderStatus(
  orderId: string,
  payload: {
    status?: OrderStatus;
    estimatedMinutes?: number;
    riderId?: string;
    riderName?: string;
    riderPhone?: string;
    cancelReason?: string;
  }
): Promise<Order> {
  const res = await fetch(`/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  return json.data;
}
