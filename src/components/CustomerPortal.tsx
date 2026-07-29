import React, { useState } from 'react';
import { Restaurant, MenuItem, CartItem, Order, OrderStatus, CartItemOption } from '../types';
import {
  Search,
  MapPin,
  Clock,
  Star,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Truck,
  ChevronRight,
  Sparkles,
  PhoneCall,
  Info,
  Building,
  Check,
  X,
  Store,
  Bike,
  History,
  Calendar,
  Receipt,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { createOrder } from '../lib/api';

interface CustomerPortalProps {
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  orders: Order[];
  onOrderCreated: (order: Order) => void;
  activeOrderCount: number;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  restaurants,
  menuItems,
  orders,
  onOrderCreated,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [itemNote, setItemNote] = useState<string>('');
  const [selectedOptionChoices, setSelectedOptionChoices] = useState<Record<string, string>>({});

  // Checkout Form State
  const [customerName, setCustomerName] = useState<string>('สมชาย รักบ้านเกิด');
  const [customerPhone, setCustomerPhone] = useState<string>('082-111-2233');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('บ้านเลขที่ 99/2 หมู่ 2 อ.บึงบูรพ์');
  const [deliveryLandmark, setDeliveryLandmark] = useState<string>(
    'บ้านปูนสองชั้นหลังสีฟ้า มีต้นมะม่วงใหญ่หน้าบ้าน ใกล้ศาลากลางหมู่บ้าน'
  );
  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'cod'>('promptpay');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  
  // Tracking view
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);

  // Navigation & Order History State
  const [mainTab, setMainTab] = useState<'browse' | 'history'>('browse');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Date formatter helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Reorder helper
  const handleReorder = (order: Order) => {
    const targetRest = restaurants.find((r) => r.id === order.restaurantId);
    if (!targetRest) {
      alert('ไม่พบข้อมูลร้านค้านี้ในระบบ');
      return;
    }
    if (!targetRest.isOpen) {
      alert('ร้านค้านี้ปิดให้บริการชั่วคราวในขณะนี้');
      return;
    }

    const newCartItems: CartItem[] = order.items.map((item, idx) => ({
      id: `cart-reorder-${Date.now()}-${idx}`,
      menuItemId: item.menuItemId,
      restaurantId: order.restaurantId,
      restaurantName: order.restaurantName,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      note: item.note,
      selectedOptions: item.selectedOptions,
    }));

    setSelectedRestaurant(targetRest);
    setCart(newCartItems);
    setMainTab('browse');
    setIsCartOpen(true);
  };

  // Filter history orders
  const filteredHistoryOrders = orders.filter((order) => {
    if (historyFilter === 'active') {
      return ['pending', 'preparing', 'ready_for_pickup', 'out_for_delivery'].includes(order.status);
    }
    if (historyFilter === 'delivered') {
      return order.status === 'delivered';
    }
    if (historyFilter === 'cancelled') {
      return order.status === 'cancelled';
    }
    return true;
  });

  // Categories list
  const categories = ['ทั้งหมด', 'อาหารตามสั่ง', 'ก๋วยเตี๋ยว', 'อาหารอีสาน', 'เครื่องดื่ม'];

  // Filter restaurants
  const filteredRestaurants = restaurants.filter((r) => {
    const matchesCategory = selectedCategory === 'ทั้งหมด' || r.category === selectedCategory;
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.locationLandmark.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Items for selected restaurant
  const currentRestaurantMenuItems = selectedRestaurant
    ? menuItems.filter((item) => item.restaurantId === selectedRestaurant.id)
    : [];

  // Add item to cart
  const handleOpenItemModal = (item: MenuItem) => {
    if (!item.isAvailable) return;
    setSelectedItemForModal(item);
    setItemNote('');
    // set default options
    const defaults: Record<string, string> = {};
    if (item.options) {
      item.options.forEach((opt) => {
        if (opt.choices.length > 0) {
          defaults[opt.name] = opt.choices[0].name;
        }
      });
    }
    setSelectedOptionChoices(defaults);
  };

  const handleAddToCartFromModal = () => {
    if (!selectedItemForModal || !selectedRestaurant) return;

    // Check if cart has items from another restaurant
    if (cart.length > 0 && cart[0].restaurantId !== selectedRestaurant.id) {
      if (!confirm('คุณมีรายการจากร้านอื่นอยู่ในตะกร้า ต้องการเริ่มตะกร้าใหม่สำหรับร้านนี้หรือไม่?')) {
        return;
      }
      setCart([]);
    }

    // Prepare option details
    const selectedOptionsList: CartItemOption[] = [];
    if (selectedItemForModal.options) {
      selectedItemForModal.options.forEach((opt) => {
        const choiceName = selectedOptionChoices[opt.name];
        if (choiceName) {
          const choiceObj = opt.choices.find((c) => c.name === choiceName);
          selectedOptionsList.push({
            optionName: opt.name,
            choiceName,
            extraPrice: choiceObj ? choiceObj.extraPrice : 0,
          });
        }
      });
    }

    const extraTotal = selectedOptionsList.reduce((sum, opt) => sum + opt.extraPrice, 0);
    const unitPrice = selectedItemForModal.price + extraTotal;

    const newCartItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      menuItemId: selectedItemForModal.id,
      restaurantId: selectedRestaurant.id,
      restaurantName: selectedRestaurant.name,
      name: selectedItemForModal.name,
      price: unitPrice,
      quantity: 1,
      note: itemNote.trim() || undefined,
      selectedOptions: selectedOptionsList.length > 0 ? selectedOptionsList : undefined,
    };

    setCart((prev) => [...prev, newCartItem]);
    setSelectedItemForModal(null);
  };

  // Cart helper functions
  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currentDeliveryFee = selectedRestaurant ? selectedRestaurant.deliveryFee : 15;
  const cartTotal = cart.length > 0 ? cartSubtotal + currentDeliveryFee : 0;

  // Submit Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !selectedRestaurant) return;

    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim() || !deliveryLandmark.trim()) {
      alert('กรุณากรอกข้อมูลชื่อ เบอร์โทร ที่อยู่ และจุดสังเกตเด่นในท้องถิ่นให้ครบถ้วน');
      return;
    }

    try {
      setIsSubmittingOrder(true);
      const newOrder = await createOrder({
        customerId: 'cust-demo',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        deliveryLandmark: deliveryLandmark.trim(),
        restaurantId: selectedRestaurant.id,
        items: cart.map((c) => ({
          menuItemId: c.menuItemId,
          name: c.name,
          price: c.price,
          quantity: c.quantity,
          note: c.note,
          selectedOptions: c.selectedOptions,
        })),
        paymentMethod,
      });

      onOrderCreated(newOrder);
      setCart([]);
      setIsCartOpen(false);
      setActiveTrackingOrderId(newOrder.id);
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Order status badge helper
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full flex items-center gap-1">⏰ รอร้านค้าตอบรับ</span>;
      case 'preparing':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">🍳 ร้านกำลังทำอาหาร</span>;
      case 'ready_for_pickup':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full flex items-center gap-1">📦 อาหารเสร็จแล้ว รอไรเดอร์</span>;
      case 'out_for_delivery':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-orange-100 text-orange-800 rounded-full flex items-center gap-1 animate-pulse">🛵 ไรเดอร์กำลังไปส่ง</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">✅ จัดส่งสำเร็จแล้ว</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-rose-100 text-rose-800 rounded-full flex items-center gap-1">❌ ยกเลิกแล้ว</span>;
    }
  };

  const activeOrderToTrack = orders.find((o) => o.id === activeTrackingOrderId) || orders[0];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Banner / Active Order Tracker Bar */}
      {orders.length > 0 && (
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Truck className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <p className="text-xs font-medium text-orange-100">สถานะออร์เดอร์ล่าสุดของคุณ</p>
                <p className="text-sm font-bold flex items-center gap-2">
                  #{orders[0].orderNumber} ({orders[0].restaurantName})
                  {getStatusBadge(orders[0].status)}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTrackingOrderId(orders[0].id)}
              className="px-3 py-1.5 bg-slate-900/40 hover:bg-slate-900/60 rounded-lg text-xs font-medium backdrop-blur-sm transition flex items-center gap-1 border border-white/20"
            >
              ติดตามสถานะออร์เดอร์
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Customer Sub-Navigation Tabs */}
        {!activeTrackingOrderId && (
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-4 mb-6">
            <button
              onClick={() => {
                setMainTab('browse');
                setSelectedRestaurant(null);
              }}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                mainTab === 'browse'
                  ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>สั่งอาหาร / เลือกร้านค้า</span>
            </button>

            <button
              onClick={() => {
                setMainTab('history');
                setSelectedRestaurant(null);
              }}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                mainTab === 'history'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <History className="w-4 h-4 text-amber-400" />
              <span>ประวัติการสั่งซื้อ</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  mainTab === 'history' ? 'bg-amber-400 text-slate-950 font-extrabold' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {orders.length}
              </span>
            </button>
          </div>
        )}

        {/* If Customer is viewing an active order tracking screen */}
        {activeTrackingOrderId && activeOrderToTrack ? (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-8">
            <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <button
                  onClick={() => setActiveTrackingOrderId(null)}
                  className="text-xs text-orange-400 hover:underline flex items-center gap-1 mb-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> กลับไปหน้ารายชื่อร้านค้า
                </button>
                <h2 className="text-xl font-extrabold flex items-center gap-2">
                  <span>ติดตามออร์เดอร์</span>
                  <span className="text-orange-400">#{activeOrderToTrack.orderNumber}</span>
                </h2>
              </div>
              <div>{getStatusBadge(activeOrderToTrack.status)}</div>
            </div>

            <div className="p-6 space-y-6">
              {/* Stepper Timeline */}
              <div className="relative">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-100">
                  <div
                    style={{
                      width:
                        activeOrderToTrack.status === 'pending'
                          ? '20%'
                          : activeOrderToTrack.status === 'preparing'
                          ? '40%'
                          : activeOrderToTrack.status === 'ready_for_pickup'
                          ? '60%'
                          : activeOrderToTrack.status === 'out_for_delivery'
                          ? '85%'
                          : activeOrderToTrack.status === 'delivered'
                          ? '100%'
                          : '0%',
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                  ></div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      ['pending', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered'].includes(
                        activeOrderToTrack.status
                      )
                        ? 'bg-amber-50 border-amber-300 font-bold text-amber-900'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    1. รอรับออร์เดอร์
                  </div>
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      ['preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered'].includes(
                        activeOrderToTrack.status
                      )
                        ? 'bg-amber-50 border-amber-300 font-bold text-amber-900'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    2. กำลังปรุงอาหาร
                  </div>
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      ['out_for_delivery', 'delivered'].includes(activeOrderToTrack.status)
                        ? 'bg-amber-50 border-amber-300 font-bold text-amber-900'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    3. ไรเดอร์กำลังไปส่ง
                  </div>
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      activeOrderToTrack.status === 'delivered'
                        ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    4. สำเร็จแล้ว
                  </div>
                </div>
              </div>

              {/* Rider details if assigned */}
              {activeOrderToTrack.riderName && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                      🛵
                    </div>
                    <div>
                      <p className="text-xs text-orange-800 font-medium">ไรเดอร์ผู้ส่งออร์เดอร์นี้</p>
                      <p className="text-sm font-bold text-slate-900">{activeOrderToTrack.riderName}</p>
                      <p className="text-xs text-slate-600">เบอร์โทร: {activeOrderToTrack.riderPhone}</p>
                    </div>
                  </div>
                  <a
                    href={`tel:${activeOrderToTrack.riderPhone}`}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> โทรหาไรเดอร์
                  </a>
                </div>
              )}

              {/* Address & Landmark Callout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Store className="w-4 h-4 text-orange-500" />
                    ร้านค้าต้นทาง
                  </div>
                  <p className="text-sm font-semibold">{activeOrderToTrack.restaurantName}</p>
                  <p className="text-xs text-slate-600">{activeOrderToTrack.restaurantLandmark}</p>
                </div>

                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    สถานที่จัดส่ง (บ้านลูกค้า)
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    คุณ{activeOrderToTrack.customerName} ({activeOrderToTrack.customerPhone})
                  </p>
                  <p className="text-xs text-slate-700">{activeOrderToTrack.deliveryAddress}</p>
                  <div className="p-2 bg-amber-100/80 border border-amber-300/80 rounded-lg text-xs font-medium text-amber-950 flex items-start gap-1.5">
                    <Building className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-orange-900">จุดสังเกตเด่นท้องถิ่น:</strong>{' '}
                      {activeOrderToTrack.deliveryLandmark}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 border-b border-slate-200">
                  รายการอาหารที่สั่ง ({activeOrderToTrack.items.length} รายการ)
                </div>
                <div className="divide-y divide-slate-100">
                  {activeOrderToTrack.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-sm">
                      <div>
                        <span className="font-semibold text-slate-900">{item.name}</span>
                        <span className="text-xs text-slate-500 ml-2">x{item.quantity}</span>
                        {item.selectedOptions && (
                          <p className="text-xs text-orange-600">
                            {item.selectedOptions.map((o) => `${o.optionName}: ${o.choiceName}`).join(', ')}
                          </p>
                        )}
                        {item.note && <p className="text-xs text-amber-700 italic">"{item.note}"</p>}
                      </div>
                      <span className="font-bold text-slate-800">฿{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 p-4 border-t border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>รวมค่าอาหาร:</span>
                    <span>฿{activeOrderToTrack.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>ค่าจัดส่งในตำบล:</span>
                    <span>฿{activeOrderToTrack.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                    <span>ยอดรวมสุทธิ ({activeOrderToTrack.paymentMethod === 'promptpay' ? 'โอน QR Code' : 'เก็บเงินปลายทาง COD'}):</span>
                    <span className="text-orange-600 text-base">฿{activeOrderToTrack.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : mainTab === 'history' ? (
          /* --- ORDER HISTORY VIEW --- */
          <div className="space-y-6">
            {/* Order History Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold mb-2">
                  <History className="w-3.5 h-3.5 text-amber-400" /> ประวัติรายการสั่งซื้อทั้งหมด
                </div>
                <h1 className="text-2xl font-black">ประวัติการสั่งซื้อของคุณ</h1>
                <p className="text-xs text-slate-300 mt-1">
                  ตรวจสอบย้อนหลัง รายละเอียดราคา รายการอาหาร เวลาจัดส่ง และสั่งซื้อซ้ำได้ทันที
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <Receipt className="w-6 h-6 text-orange-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400">คำสั่งซื้อรวมทั้งหมด</p>
                  <p className="text-lg font-black text-amber-400">{orders.length} ออร์เดอร์</p>
                </div>
              </div>
            </div>

            {/* History Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setHistoryFilter('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    historyFilter === 'all'
                      ? 'bg-slate-900 text-white shadow'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  ทั้งหมด ({orders.length})
                </button>
                <button
                  onClick={() => setHistoryFilter('active')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    historyFilter === 'active'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  กำลังดำเนินการ ({orders.filter(o => ['pending','preparing','ready_for_pickup','out_for_delivery'].includes(o.status)).length})
                </button>
                <button
                  onClick={() => setHistoryFilter('delivered')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    historyFilter === 'delivered'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  จัดส่งสำเร็จ ({orders.filter(o => o.status === 'delivered').length})
                </button>
                <button
                  onClick={() => setHistoryFilter('cancelled')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    historyFilter === 'cancelled'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  ยกเลิกแล้ว ({orders.filter(o => o.status === 'cancelled').length})
                </button>
              </div>
            </div>

            {/* Orders List */}
            {filteredHistoryOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <History className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">ไม่พบประวัติการสั่งซื้อในหมวดหมู่นี้</h3>
                  <p className="text-xs text-slate-500 mt-1">คุณยังไม่มีรายการสั่งซื้อในหมวดนี้ หรือยังไม่ได้เริ่มสั่งซื้อ</p>
                </div>
                <button
                  onClick={() => setMainTab('browse')}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-bold rounded-xl shadow transition"
                >
                  ไปเลือกร้านอาหารเลย
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHistoryOrders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  const isActiveOrder = ['pending', 'preparing', 'ready_for_pickup', 'out_for_delivery'].includes(order.status);

                  return (
                    <div
                      key={order.id}
                      className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                        isActiveOrder
                          ? 'border-amber-400 shadow-md ring-1 ring-amber-400/30'
                          : 'border-slate-200 shadow-sm hover:border-slate-300'
                      }`}
                    >
                      {/* Card Main Info Bar */}
                      <div className="p-4 sm:p-5 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl border border-orange-100">
                              <Store className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-extrabold text-slate-900 text-base">{order.restaurantName}</span>
                                <span className="text-xs font-bold text-slate-400">#{order.orderNumber}</span>
                              </div>
                              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>เวลาสั่งซื้อ: {formatDate(order.createdAt)}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {getStatusBadge(order.status)}
                          </div>
                        </div>

                        {/* Items preview */}
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                          <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                            <span>รายการอาหารที่สั่ง ({order.items.length} รายการ):</span>
                            <span className="text-orange-600 font-extrabold text-sm">฿{order.totalAmount} บาท</span>
                          </div>
                          <ul className="divide-y divide-slate-200/60 text-xs">
                            {order.items.map((item, idx) => (
                              <li key={idx} className="py-1.5 flex items-start justify-between">
                                <div className="flex-1 pr-2">
                                  <span className="font-semibold text-slate-800">{item.name}</span>
                                  <span className="text-slate-500 ml-1.5">x{item.quantity}</span>
                                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                                    <p className="text-[11px] text-orange-600 font-medium">
                                      {item.selectedOptions.map((opt) => `${opt.optionName}: ${opt.choiceName}`).join(', ')}
                                    </p>
                                  )}
                                  {item.note && (
                                    <p className="text-[11px] text-amber-700 italic">"{item.note}"</p>
                                  )}
                                </div>
                                <span className="font-bold text-slate-700">฿{item.price * item.quantity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Action Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                              {order.paymentMethod === 'promptpay' ? '💳 โอน PromptPay' : '💵 เก็บเงินปลายทาง (COD)'}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span>ส่งที่: {order.deliveryAddress}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            {isActiveOrder && (
                              <button
                                onClick={() => setActiveTrackingOrderId(order.id)}
                                className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow flex items-center gap-1 transition"
                              >
                                <Truck className="w-3.5 h-3.5" /> ติดตามสถานะสด
                              </button>
                            )}

                            <button
                              onClick={() => handleReorder(order)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1 transition"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> สั่งซื้อซ้ำ
                            </button>

                            <button
                              onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg flex items-center gap-1 transition"
                            >
                              {isExpanded ? (
                                <>ซ่อน <ChevronUp className="w-3.5 h-3.5" /></>
                              ) : (
                                <>รายละเอียด <ChevronDown className="w-3.5 h-3.5" /></>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Details Drawer inside Card */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-slate-200 space-y-3 bg-slate-50/80 -mx-4 -mb-4 p-4 rounded-b-2xl text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Destination & Landmark */}
                              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                                <p className="font-bold text-slate-800 flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-orange-500" /> สถานที่จัดส่ง
                                </p>
                                <p className="text-slate-900 font-semibold">{order.customerName} ({order.customerPhone})</p>
                                <p className="text-slate-600">{order.deliveryAddress}</p>
                                <p className="text-amber-800 font-medium bg-amber-50 p-1.5 rounded border border-amber-200 mt-1">
                                  📍 จุดสังเกต: {order.deliveryLandmark}
                                </p>
                              </div>

                              {/* Payment & Delivery Summary */}
                              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                                <p className="font-bold text-slate-800 flex items-center gap-1">
                                  <FileText className="w-3.5 h-3.5 text-orange-500" /> สรุปค่าใช้จ่าย
                                </p>
                                <div className="flex justify-between text-slate-600 pt-1">
                                  <span>ค่าอาหาร:</span>
                                  <span>฿{order.subtotal}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                  <span>ค่าจัดส่งในตำบล:</span>
                                  <span>฿{order.deliveryFee}</span>
                                </div>
                                <div className="flex justify-between font-extrabold text-slate-900 text-sm pt-1 border-t border-slate-100">
                                  <span>ยอดรวมสุทธิ:</span>
                                  <span className="text-orange-600">฿{order.totalAmount}</span>
                                </div>
                                {order.riderName && (
                                  <div className="p-1.5 bg-emerald-50 text-emerald-900 rounded border border-emerald-200 mt-1 flex items-center gap-1">
                                    <Bike className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>ไรเดอร์ผู้จัดส่ง: <strong>{order.riderName}</strong> ({order.riderPhone})</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : selectedRestaurant ? (
          /* --- Restaurant Detail & Menu View --- */
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => setSelectedRestaurant(null)}
              className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-700 hover:text-orange-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>เลือกร้านค้าอื่น</span>
            </button>

            {/* Restaurant Cover Banner */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
              <div className="relative h-48 sm:h-64 bg-slate-800">
                <img
                  src={selectedRestaurant.image}
                  alt={selectedRestaurant.name}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="px-2.5 py-1 text-xs font-bold bg-orange-500 text-slate-950 rounded-md">
                        {selectedRestaurant.category}
                      </span>
                      <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">{selectedRestaurant.name}</h1>
                    </div>
                    <div>
                      {selectedRestaurant.isOpen ? (
                        <span className="px-3 py-1 text-xs font-bold bg-emerald-500 text-slate-950 rounded-full border border-emerald-300">
                          🟢 ร้านเปิดอยู่ พร้อมรับออร์เดอร์
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-bold bg-rose-500 text-white rounded-full border border-rose-300">
                          🔴 ร้านปิดบริการชั่วคราว
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Restaurant info strip */}
              <div className="p-4 bg-slate-900 text-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>
                    <strong className="text-white">พิกัดร้าน:</strong> {selectedRestaurant.locationLandmark}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong className="text-white">เวลาทำอาหารคร่าวๆ:</strong> {selectedRestaurant.estPrepTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>
                    <strong className="text-white">ค่าส่งเริ่มต้น:</strong> ฿{selectedRestaurant.deliveryFee} บาท
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Header */}
            <div className="flex items-center justify-between pt-2">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>เมนูอาหารทั้งหมด</span>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                  {currentRestaurantMenuItems.length} รายการ
                </span>
              </h2>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentRestaurantMenuItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                    item.isAvailable
                      ? 'border-slate-200 hover:border-orange-300 hover:shadow-lg'
                      : 'border-slate-200 opacity-60 bg-slate-50'
                  }`}
                >
                  <div className="p-4 flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{item.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{item.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-base font-extrabold text-orange-600">฿{item.price}</span>
                        {!item.isAvailable && (
                          <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-md">
                            สินค้าหมดวันนี้
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                      disabled={!item.isAvailable || !selectedRestaurant.isOpen}
                      onClick={() => handleOpenItemModal(item)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        !selectedRestaurant.isOpen
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : item.isAvailable
                          ? 'bg-slate-900 hover:bg-orange-600 text-white shadow-sm'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {!selectedRestaurant.isOpen ? (
                        'ร้านปิดให้บริการ'
                      ) : item.isAvailable ? (
                        <>
                          <Plus className="w-4 h-4" /> เลือกใส่ตะกร้า
                        </>
                      ) : (
                        'เมนูนี้หมดชั่วคราว'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* --- Restaurant List View --- */
          <div className="space-y-6">
            {/* Search & Intro Hero */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                <Bike className="w-80 h-80 text-orange-400" />
              </div>
              <div className="max-w-2xl relative z-10 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> สั่งอาหารง่ายๆ ส่งตรงถึงหน้าบ้านในตำบล
                </div>
                <h1 className="text-2xl sm:text-4xl font-black leading-tight">
                  อยากกินอะไรในตำบลวันนี้? <br />
                  <span className="text-amber-400">ไรเดอร์ประจำชุมชนพร้อมซิ่งส่ง!</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300">
                  รวมร้านอร่อยใกล้บ้าน ป้าเกศ ก๋วยเตี๋ยวยายสมบูรณ์ ส้มตำยายคำ ไม่ต้องง้อแอพใหญ่ ค่าส่งเริ่มต้นเพียง 15 บาท
                </p>

                {/* Search Bar */}
                <div className="pt-2">
                  <div className="relative">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อร้าน หรือ จุดสังเกต (เช่น ข้างวัด, ปากทาง...)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Restaurant Cards Grid */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-orange-500" />
                ร้านค้าในตำบลหนองโคก ({filteredRestaurants.length} ร้าน)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    onClick={() => setSelectedRestaurant(restaurant)}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-orange-300 transition cursor-pointer overflow-hidden flex flex-col sm:flex-row"
                  >
                    {/* Thumbnail */}
                    <div className="sm:w-48 h-48 sm:h-auto relative shrink-0">
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        {restaurant.isOpen ? (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500 text-slate-950 rounded-full border border-emerald-300 shadow">
                            เปิดอยู่
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full shadow">
                            ปิดชั่วคราว
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                            {restaurant.category}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {restaurant.rating} ({restaurant.reviewCount})
                          </span>
                        </div>

                        <h3 className="text-lg font-extrabold text-slate-900 mt-1">{restaurant.name}</h3>

                        <p className="text-xs text-slate-600 flex items-start gap-1.5 mt-2">
                          <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                          <span>
                            <strong>จุดสังเกตร้าน:</strong> {restaurant.locationLandmark}
                          </span>
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {restaurant.estPrepTime}
                        </span>
                        <span className="font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                          ค่าส่ง ฿{restaurant.deliveryFee}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating View Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-30">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-slate-700 transition"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500 text-slate-950 font-bold flex items-center justify-center">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-300 font-medium">ตะกร้าสินค้า ({cart[0]?.restaurantName})</p>
                <p className="text-sm font-extrabold text-white">฿{cartTotal} บาท</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-orange-400">
              ดูรายการ & ชำระเงิน <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* --- Item Customization Modal --- */}
      {selectedItemForModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="relative h-40 bg-slate-800">
              <img
                src={selectedItemForModal.image}
                alt={selectedItemForModal.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedItemForModal(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/60 text-white flex items-center justify-center backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedItemForModal.name}</h3>
                <p className="text-xs text-slate-500">{selectedItemForModal.description}</p>
                <p className="text-lg font-black text-orange-600 mt-1">฿{selectedItemForModal.price}</p>
              </div>

              {/* Options */}
              {selectedItemForModal.options &&
                selectedItemForModal.options.map((opt, i) => (
                  <div key={i} className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-700">{opt.name}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {opt.choices.map((choice, ci) => (
                        <button
                          key={ci}
                          type="button"
                          onClick={() =>
                            setSelectedOptionChoices((prev) => ({
                              ...prev,
                              [opt.name]: choice.name,
                            }))
                          }
                          className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition ${
                            selectedOptionChoices[opt.name] === choice.name
                              ? 'bg-orange-500 text-slate-950 border-orange-500 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {choice.name}{' '}
                          {choice.extraPrice > 0 && <span className="text-[10px] text-slate-600">+฿{choice.extraPrice}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

              {/* Special Instructions Note */}
              <div className="pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700">หมายเหตุถึงแม่ค้า (เช่น ไม่ใส่ผัก, เผ็ดน้อย)</label>
                <input
                  type="text"
                  placeholder="เช่น ไม่ใส่ผักโรย, ไข่ดาวขอสุกๆ"
                  value={itemNote}
                  onChange={(e) => setItemNote(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={handleAddToCartFromModal}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-sm rounded-xl shadow transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> เพิ่มลงตะกร้า
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CART & CHECKOUT DRAWER --- */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto flex flex-col justify-between shadow-2xl">
            {/* Drawer Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-orange-400" />
                <span className="font-bold text-base">ตะกร้าสินค้า & ชำระเงิน</span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-5 flex-1 space-y-6 overflow-y-auto">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900">
                <p className="font-bold">📍 สั่งจากร้าน: {cart[0]?.restaurantName}</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  จัดส่งโดยทีมไรเดอร์ประจำตำบลหนองโคก
                </p>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">รายการอาหารในตะกร้า</h4>
                {cart.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex-1 pr-3">
                      <p className="text-sm font-bold text-slate-900">{item.name}</p>
                      {item.selectedOptions && (
                        <p className="text-xs text-orange-600">
                          {item.selectedOptions.map((o) => `${o.optionName}: ${o.choiceName}`).join(', ')}
                        </p>
                      )}
                      {item.note && <p className="text-xs text-slate-500 italic">"{item.note}"</p>}
                      <p className="text-xs font-bold text-slate-700 mt-1">฿{item.price} บาท / จาน</p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded-lg border border-slate-200">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 text-slate-600 hover:text-red-600"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold px-1">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 text-slate-600 hover:text-green-600"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* --- Delivery Address & Landmark Form --- */}
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-500" /> ข้อมูลสถานที่จัดส่งในท้องถิ่น
                </h4>

                <div>
                  <label className="text-xs font-semibold text-slate-700">ชื่อผู้รับ</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">เบอร์โทรศัพท์ติดต่อ</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">ที่อยู่บ้านเลขที่ / หมู่บ้าน</label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Local Landmark Highlight Field */}
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1.5">
                  <label className="text-xs font-bold text-amber-950 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-orange-600" />
                    จุดสังเกตเด่นๆ ในท้องถิ่น (สำคัญมากเพื่อไรเดอร์หาบ้านเจอ)
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="เช่น บ้านหลังสีฟ้า ใกล้ศาลากลาง มีต้นมะม่วงใหญ่หน้าบ้าน, ตรงข้ามตู้บุญเติม"
                    value={deliveryLandmark}
                    onChange={(e) => setDeliveryLandmark(e.target.value)}
                    className="w-full p-2 bg-white border border-amber-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* --- Payment Options --- */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-700">ช่องทางการชำระเงิน</label>

                  <div className="grid grid-cols-2 gap-2">
                    {/* PromptPay */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('promptpay')}
                      className={`p-3 rounded-xl border text-left transition flex items-center space-x-2 ${
                        paymentMethod === 'promptpay'
                          ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <QrCode className="w-5 h-5 text-blue-600 shrink-0" />
                      <div className="text-xs">
                        <p className="font-bold">โอน PromptPay QR</p>
                        <p className="text-[10px] text-slate-500">สแกนจ่ายทันที</p>
                      </div>
                    </button>

                    {/* COD */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3 rounded-xl border text-left transition flex items-center space-x-2 ${
                        paymentMethod === 'cod'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="text-xs">
                        <p className="font-bold">เก็บเงินปลายทาง COD</p>
                        <p className="text-[10px] text-slate-500">จ่ายเงินสดเมื่อถึงบ้าน</p>
                      </div>
                    </button>
                  </div>

                  {/* QR Code Preview Box */}
                  {paymentMethod === 'promptpay' && (
                    <div className="p-4 bg-slate-900 text-white rounded-2xl text-center space-y-2 border border-slate-800">
                      <p className="text-xs font-bold text-amber-400">สแกนจ่ายผ่าน QR Code PromptPay ชุมชน</p>
                      <div className="w-36 h-36 bg-white p-2 rounded-xl mx-auto shadow flex items-center justify-center">
                        {/* Sample QR code SVG */}
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PROMPTPAY-COMMUNITY-${cartTotal}`}
                          alt="PromptPay QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-xs text-slate-300">
                        บัญชี: <strong className="text-white">กองทุนบริการขนส่งชุมชนหนองโคก</strong>
                      </p>
                      <p className="text-sm font-extrabold text-orange-400">ยอดชำระ: ฿{cartTotal} บาท</p>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Footer Total & Submit */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-3">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>ค่าอาหารรวม:</span>
                  <span>฿{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ค่าส่งในตำบล:</span>
                  <span>฿{currentDeliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>ยอดชำระสุทธิ:</span>
                  <span className="text-orange-600 text-base">฿{cartTotal} บาท</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmittingOrder || cart.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                {isSubmittingOrder ? (
                  <span>กำลังส่งคำสั่งซื้อ...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> ยืนยันการสั่งซื้อ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
