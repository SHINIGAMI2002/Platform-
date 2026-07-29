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

export async function deleteOrder(id: string): Promise<boolean> {
  const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
  const json = await res.json();
  return json.success;
}

export async function createRestaurant(data: Partial<Restaurant>): Promise<Restaurant> {
  const res = await fetch('/api/restaurants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  return json.data;
}

export async function updateRestaurant(id: string, data: Partial<Restaurant>): Promise<Restaurant> {
  const res = await fetch(`/api/restaurants/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  return json.data;
}

export async function deleteRestaurant(id: string): Promise<boolean> {
  const res = await fetch(`/api/restaurants/${id}`, { method: 'DELETE' });
  const json = await res.json();
  return json.success;
}

export async function fetchUsers(): Promise<any[]> {
  const res = await fetch('/api/admin/users');
  const json = await res.json();
  return json.data || [];
}

export async function updateUserStatus(id: string, status: 'active' | 'suspended'): Promise<any> {
  const res = await fetch(`/api/admin/users/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  return json.data;
}

export async function updateUserRole(id: string, role: string): Promise<any> {
  const res = await fetch(`/api/admin/users/${id}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  const json = await res.json();
  return json.data;
}

export async function fetchAdminStats(): Promise<{
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  activeOrders: number;
  totalMerchants: number;
  totalRiders: number;
  totalUsers: number;
}> {
  const res = await fetch('/api/admin/stats');
  const json = await res.json();
  return json.data;
}
