import React, { useState } from 'react';
import { Restaurant, MenuItem, Order, OrderStatus } from '../types';
import {
  Store,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  Power,
  ChefHat,
  PackageCheck,
  AlertTriangle,
  Phone,
  Building,
  MapPin,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';
import {
  toggleRestaurantStatus,
  toggleMenuItemAvailability,
  createMenuItem,
  deleteMenuItem,
  updateOrderStatus,
} from '../lib/api';

interface MerchantDashboardProps {
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  orders: Order[];
  onDataChanged: () => void;
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({
  restaurants,
  menuItems,
  orders,
  onDataChanged,
}) => {
  // Active selected store being managed
  const [activeRestaurantId, setActiveRestaurantId] = useState<string>(restaurants[0]?.id || 'rest-1');
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');

  // Prep time selector for accepting order
  const [prepTimes, setPrepTimes] = useState<Record<string, number>>({});

  // New Menu Item Form Modal
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemDesc, setNewItemDesc] = useState<string>('');
  const [newItemPrice, setNewItemPrice] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<string>('จานเดียว');
  const [newItemImage, setNewItemImage] = useState<string>('');
  const [isSubmittingItem, setIsSubmittingItem] = useState<boolean>(false);

  const activeStore = restaurants.find((r) => r.id === activeRestaurantId) || restaurants[0];
  const storeMenuItems = menuItems.filter((i) => i.restaurantId === activeRestaurantId);
  const storeOrders = orders.filter((o) => o.restaurantId === activeRestaurantId);

  // Filter orders by category
  const pendingOrders = storeOrders.filter((o) => o.status === 'pending');
  const preparingOrders = storeOrders.filter((o) => o.status === 'preparing');
  const readyOrders = storeOrders.filter((o) => o.status === 'ready_for_pickup' || o.status === 'out_for_delivery');
  const completedOrders = storeOrders.filter((o) => o.status === 'delivered' || o.status === 'cancelled');

  // Toggle Store Open / Closed Status
  const handleToggleStoreOpen = async () => {
    if (!activeStore) return;
    try {
      await toggleRestaurantStatus(activeStore.id);
      onDataChanged();
    } catch (err) {
      alert('ไม่สามารถอัปเดตสถานะร้านค้าได้');
    }
  };

  // Toggle Item Stock (Available / Sold Out)
  const handleToggleStock = async (itemId: string) => {
    try {
      await toggleMenuItemAvailability(itemId);
      onDataChanged();
    } catch (err) {
      alert('ไม่สามารถอัปเดตสถานะเมนูได้');
    }
  };

  // Accept Order
  const handleAcceptOrder = async (orderId: string) => {
    const minutes = prepTimes[orderId] || 15;
    try {
      await updateOrderStatus(orderId, {
        status: 'preparing',
        estimatedMinutes: minutes,
      });
      onDataChanged();
    } catch (err) {
      alert('ไม่สามารถรับออร์เดอร์ได้');
    }
  };

  // Reject / Cancel Order
  const handleRejectOrder = async (orderId: string) => {
    const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธออร์เดอร์ (เช่น วัตถุดิบหมด, คิวยาว):');
    if (!reason) return;
    try {
      await updateOrderStatus(orderId, {
        status: 'cancelled',
        cancelReason: reason,
      });
      onDataChanged();
    } catch (err) {
      alert('ไม่สามารถปฏิเสธออร์เดอร์ได้');
    }
  };

  // Mark Order Ready For Pickup
  const handleMarkReadyForPickup = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, {
        status: 'ready_for_pickup',
      });
      onDataChanged();
    } catch (err) {
      alert('ไม่สามารถอัปเดตสถานะได้');
    }
  };

  // Add New Menu Item
  const handleCreateMenuItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) {
      alert('กรุณากรอกชื่อเมนูและราคาให้ครบถ้วน');
      return;
    }

    try {
      setIsSubmittingItem(true);
      await createMenuItem({
        restaurantId: activeStore.id,
        name: newItemName,
        description: newItemDesc,
        price: Number(newItemPrice),
        category: newItemCategory,
        image:
          newItemImage ||
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
      });

      onDataChanged();
      setIsAddMenuModalOpen(false);
      setNewItemName('');
      setNewItemDesc('');
      setNewItemPrice('');
      setNewItemImage('');
    } catch (err) {
      alert('ไม่สามารถเพิ่มเมนูได้');
    } finally {
      setIsSubmittingItem(false);
    }
  };

  // Delete Menu Item
  const handleDeleteMenuItem = async (itemId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเมนูนี้?')) return;
    try {
      await deleteMenuItem(itemId);
      onDataChanged();
    } catch (err) {
      alert('ไม่สามารถลบเมนูได้');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Top Merchant Selector Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">แผงควบคุมร้านค้าประจำตำบล</p>
              <div className="flex items-center space-x-2">
                <select
                  value={activeRestaurantId}
                  onChange={(e) => setActiveRestaurantId(e.target.value)}
                  className="bg-slate-800 text-white font-extrabold text-lg border border-slate-700 rounded-xl px-3 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (เจ้าของ: {r.ownerName})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Open / Closed Toggle Switch */}
          {activeStore && (
            <div className="flex items-center space-x-3 bg-slate-800 p-2 rounded-2xl border border-slate-700">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-300">สถานะเปิด-ปิดร้าน</p>
                <p className={`text-xs font-extrabold ${activeStore.isOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {activeStore.isOpen ? '🟢 พร้อมรับออร์เดอร์' : '🔴 ปิดร้านชั่วคราว'}
                </p>
              </div>
              <button
                onClick={handleToggleStoreOpen}
                className={`px-4 py-2 rounded-xl text-xs font-black shadow transition flex items-center gap-1.5 ${
                  activeStore.isOpen
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                }`}
              >
                <Power className="w-4 h-4" />
                {activeStore.isOpen ? 'กดเพื่อปิดร้าน' : 'กดเพื่อเปิดร้าน'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-4">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 px-4 font-extrabold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>การจัดการออร์เดอร์</span>
            {pendingOrders.length > 0 && (
              <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                {pendingOrders.length} ใหม่
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`py-3.5 px-4 font-extrabold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'menu'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>จัดการเมนูอาหาร ({storeMenuItems.length} รายการ)</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'orders' ? (
          /* --- ORDERS MANAGEMENT TAB --- */
          <div className="space-y-8">
            {/* 1. Pending Orders Section (รอดำเนินการ) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-3 h-3 bg-amber-500 rounded-full animate-ping" />
                  <span>1. ออร์เดอร์เข้าใหม่ (รอร้านกดรับ)</span>
                  <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">
                    {pendingOrders.length} รายการ
                  </span>
                </h2>
              </div>

              {pendingOrders.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
                  <ChefHat className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold">ยังไม่มีออร์เดอร์ใหม่ที่รอการตอบรับ</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border-2 border-amber-300 shadow-lg overflow-hidden flex flex-col justify-between"
                    >
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div>
                            <span className="text-xs text-slate-400 font-mono">#{order.orderNumber}</span>
                            <h3 className="font-extrabold text-slate-900 text-base">
                              ลูกค้า: คุณ{order.customerName}
                            </h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {order.customerPhone}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-500">วิธีชำระ</span>
                            <p className="text-xs font-black text-blue-600">
                              {order.paymentMethod === 'promptpay' ? 'โอน QR PromptPay' : 'เก็บปลายทาง COD'}
                            </p>
                          </div>
                        </div>

                        {/* Customer Address & Landmark */}
                        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-slate-800 space-y-1">
                          <p className="font-semibold text-amber-900">📍 สถานที่ส่ง:</p>
                          <p>{order.deliveryAddress}</p>
                          <p className="font-bold text-orange-900 bg-amber-100/80 p-1.5 rounded-lg border border-amber-300/80 mt-1">
                            จุดสังเกตเด่น: {order.deliveryLandmark}
                          </p>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-1 text-xs divide-y divide-slate-100">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="pt-1.5 flex justify-between items-center">
                              <div>
                                <span className="font-bold text-slate-900">{item.name}</span>
                                <span className="text-xs font-bold text-orange-600 ml-1">x{item.quantity}</span>
                                {item.selectedOptions && (
                                  <p className="text-[11px] text-slate-500">
                                    {item.selectedOptions.map((o) => `${o.optionName}: ${o.choiceName}`).join(', ')}
                                  </p>
                                )}
                                {item.note && <p className="text-[11px] text-amber-700 italic">"{item.note}"</p>}
                              </div>
                              <span className="font-bold text-slate-800">฿{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-extrabold text-slate-900">
                          <span>ราคารวมค่าอาหาร:</span>
                          <span className="text-orange-600">฿{order.subtotal} บาท</span>
                        </div>

                        {/* Select Prep Time */}
                        <div className="pt-2">
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            ประมาณเวลาทำอาหาร (นาที):
                          </label>
                          <div className="flex space-x-2">
                            {[10, 15, 20, 30].map((m) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setPrepTimes((prev) => ({ ...prev, [order.id]: m }))}
                                className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition ${
                                  (prepTimes[order.id] || 15) === m
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-slate-50 text-slate-700 border-slate-200'
                                }`}
                              >
                                {m} นาที
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Accept / Reject Buttons */}
                      <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleRejectOrder(order.id)}
                          className="py-2.5 px-3 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-4 h-4" /> ปฏิเสธออร์เดอร์
                        </button>
                        <button
                          onClick={() => handleAcceptOrder(order.id)}
                          className="py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs shadow transition flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" /> กดรับออร์เดอร์
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Preparing Orders Section (กำลังทำอาหาร) */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-blue-600" />
                <span>2. กำลังปรุงอาหารในครัว</span>
                <span className="text-xs bg-blue-100 text-blue-900 font-bold px-2.5 py-0.5 rounded-full">
                  {preparingOrders.length} รายการ
                </span>
              </h2>

              {preparingOrders.length === 0 ? (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                  ไม่มีรายการที่กำลังปรุงอยู่ในครัว
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {preparingOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl border border-blue-200 shadow p-5 space-y-3">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                        <div>
                          <p className="font-extrabold text-sm text-slate-900">
                            #{order.orderNumber} - คุณ{order.customerName}
                          </p>
                          <p className="text-xs text-blue-600 font-bold">
                            ⏱️ เวลาที่ตั้งไว้: {order.estimatedMinutes} นาที
                          </p>
                        </div>
                        <span className="px-2.5 py-1 text-xs bg-blue-100 text-blue-800 font-bold rounded-full">
                          กำลังทำ
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        {order.items.map((i, idx) => (
                          <div key={idx} className="flex justify-between font-semibold">
                            <span>
                              {i.name} x{i.quantity}
                            </span>
                            <span>฿{i.price * i.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleMarkReadyForPickup(order.id)}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow transition flex items-center justify-center gap-1.5"
                      >
                        <PackageCheck className="w-4 h-4" /> ทำอาหารเสร็จแล้ว! แจ้งไรเดอร์มารับ
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Ready & Out for Delivery Section */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-emerald-600" />
                <span>3. อาหารเสร็จแล้ว / ไรเดอร์กำลังนำส่ง</span>
                <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full">
                  {readyOrders.length} รายการ
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {readyOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-4 text-xs space-y-2">
                    <div className="flex justify-between font-bold">
                      <span>#{order.orderNumber} - {order.customerName}</span>
                      <span className="text-emerald-600">
                        {order.status === 'ready_for_pickup' ? 'รอไรเดอร์มารับ' : `🛵 ${order.riderName} กำลังส่ง`}
                      </span>
                    </div>
                    <p className="text-slate-500">
                      รวมค่าอาหาร: ฿{order.subtotal} บาท ({order.paymentMethod === 'promptpay' ? 'โอนแล้ว' : 'เก็บปลายทาง'})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* --- MENU MANAGEMENT TAB --- */
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  รายการเมนูอาหารของ {activeStore.name}
                </h2>
                <p className="text-xs text-slate-500">
                  คุณสามารถเพิ่มเมนู แก้ไขราคา หรือเปิด-ปิดสถานะสินค้าหมดชั่วคราวได้จากหน้านี้
                </p>
              </div>

              <button
                onClick={() => setIsAddMenuModalOpen(true)}
                className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> เพิ่มรายการอาหารใหม่
              </button>
            </div>

            {/* Menu Items Table / Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {storeMenuItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border p-4 shadow-sm flex flex-col justify-between ${
                    item.isAvailable ? 'border-slate-200' : 'border-rose-200 bg-rose-50/30'
                  }`}
                >
                  <div className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 truncate mt-1">{item.name}</h3>
                      <p className="text-xs font-black text-orange-600">฿{item.price} บาท</p>
                    </div>
                  </div>

                  {/* Stock Toggle & Delete */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleToggleStock(item.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                        item.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {item.isAvailable ? '🟢 พร้อมขาย' : '🔴 สินค้าหมดวันนี้'}
                    </button>

                    <button
                      onClick={() => handleDeleteMenuItem(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="ลบเมนูนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- ADD MENU ITEM MODAL --- */}
      {isAddMenuModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">เพิ่มรายการเมนูใหม่</h3>
              <button
                onClick={() => setIsAddMenuModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMenuItemSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">ชื่อเมนูอาหาร</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ข้าวผัดกะเพราหมูกรอบ"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">หมวดหมู่</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                >
                  <option value="จานเดียว">จานเดียว</option>
                  <option value="กับข้าว">กับข้าว</option>
                  <option value="ก๋วยเตี๋ยว">ก๋วยเตี๋ยว</option>
                  <option value="ส้มตำ">ส้มตำ / อาหารอีสาน</option>
                  <option value="เครื่องดื่ม">เครื่องดื่ม</option>
                  <option value="ทานเล่น">ทานเล่น</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">ราคา (บาท)</label>
                <input
                  type="number"
                  required
                  placeholder="50"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">รายละเอียดเมนู</label>
                <textarea
                  rows={2}
                  placeholder="เช่น ผัดพริกแห้งเข้มข้น หอมใบกะเพราบ้าน"
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">รูปภาพอาหาร (อัปโหลดรูปจากเครื่อง หรือ ใส่ URL)</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 py-2 px-3 bg-amber-50 border border-dashed border-amber-300 rounded-xl text-amber-800 text-xs font-bold hover:bg-amber-100 transition">
                      <Plus className="w-4 h-4" />
                      <span>เลือกไฟล์รูปจากมือถือ / คอมพิวเตอร์</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setNewItemImage(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    placeholder="หรือวาง URL รูปภาพ (https://...)"
                    value={newItemImage}
                    onChange={(e) => setNewItemImage(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                  />

                  {newItemImage && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm mt-1">
                      <img src={newItemImage} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewItemImage('')}
                        className="absolute top-1 right-1 bg-slate-900/80 text-white rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddMenuModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingItem}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black rounded-xl text-xs shadow"
                >
                  {isSubmittingItem ? 'กำลังบันทึก...' : 'บันทึกเมนูใหม่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
