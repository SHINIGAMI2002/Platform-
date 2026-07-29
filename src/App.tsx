import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { CustomerPortal } from './components/CustomerPortal';
import { MerchantDashboard } from './components/MerchantDashboard';
import { RiderDashboard } from './components/RiderDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Restaurant, MenuItem, Order } from './types';
import { fetchRestaurants, fetchMenuItems, fetchOrders } from './lib/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<'customer' | 'merchant' | 'rider' | 'admin'>('customer');
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load all data from Express REST API
  const loadData = useCallback(async () => {
    try {
      const [restData, menuData, orderData] = await Promise.all([
        fetchRestaurants(),
        fetchMenuItems(),
        fetchOrders(),
      ]);
      setRestaurants(restData);
      setMenuItems(menuData);
      setOrders(orderData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Poll every 5 seconds for real-time order state sync across Customer, Merchant, and Rider views
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handle order creation
  const handleOrderCreated = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  // Badge calculations
  const pendingMerchantOrders = orders.filter((o) => o.status === 'pending').length;
  const availableRiderJobs = orders.filter((o) => o.status === 'ready_for_pickup' && !o.riderId).length;
  const activeCustomerOrders = orders.filter((o) =>
    ['pending', 'preparing', 'ready_for_pickup', 'out_for_delivery'].includes(o.status)
  ).length;

  if (isLoading && restaurants.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-extrabold text-orange-400">กำลังโหลดระบบ ชุมชนส่งไว (Local Delivery)...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* Top Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={0}
        activeOrderCount={activeCustomerOrders}
        pendingMerchantOrders={pendingMerchantOrders}
        availableRiderJobs={availableRiderJobs}
      />

      {/* Main Active Tab Content */}
      <main>
        {activeTab === 'customer' && (
          <CustomerPortal
            restaurants={restaurants}
            menuItems={menuItems}
            orders={orders}
            onOrderCreated={handleOrderCreated}
            activeOrderCount={activeCustomerOrders}
          />
        )}

        {activeTab === 'merchant' && (
          <MerchantDashboard
            restaurants={restaurants}
            menuItems={menuItems}
            orders={orders}
            onDataChanged={loadData}
          />
        )}

        {activeTab === 'rider' && (
          <RiderDashboard
            orders={orders}
            onDataChanged={loadData}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            restaurants={restaurants}
            orders={orders}
            onDataChanged={loadData}
          />
        )}
      </main>
    </div>
  );
}
