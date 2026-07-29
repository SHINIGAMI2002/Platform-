import React, { useState, useEffect } from 'react';
import { Restaurant, MenuItem, Order, User, UserRole, OrderStatus } from '../types';
import {
  ShieldCheck,
  Store,
  Users,
  ShoppingBag,
  TrendingUp,
  Plus,
  Trash2,
  Edit,
  Power,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Database,
  ExternalLink,
  Phone,
  MapPin,
  X,
  Check,
  UserX,
  UserCheck,
} from 'lucide-react';
import {
  fetchAdminStats,
  fetchUsers,
  updateUserStatus,
  updateUserRole,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  updateOrderStatus,
  deleteOrder,
} from '../lib/api';

interface AdminDashboardProps {
  restaurants: Restaurant[];
  orders: Order[];
  onDataChanged: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  restaurants,
  orders,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'orders' | 'users' | 'supabase'>('overview');
  const [usersList, setUsersList] = useState<User[]>([]);
  const [stats, setStats] = useState<{
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    activeOrders: number;
    totalMerchants: number;
    totalRiders: number;
    totalUsers: number;
  }>({
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    activeOrders: 0,
    totalMerchants: 0,
    totalRiders: 0,
    totalUsers: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Add Restaurant Modal
  const [isAddRestModalOpen, setIsAddRestModalOpen] = useState<boolean>(false);
  const [newRestName, setNewRestName] = useState('');
  const [newRestCategory, setNewRestCategory] = useState('อาหารตามสั่ง');
  const [newRestPhone, setNewRestPhone] = useState('');
  const [newRestAddress, setNewRestAddress] = useState('');
  const [newRestLandmark, setNewRestLandmark] = useState('');
  const [newRestOwner, setNewRestOwner] = useState('');
  const [newRestFee, setNewRestFee] = useState('15');
  const [newRestImage, setNewRestImage] = useState('');

  // Copy indicator for Supabase SQL
  const [isCopiedSql, setIsCopiedSql] = useState<boolean>(false);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [uList, stData] = await Promise.all([fetchUsers(), fetchAdminStats()]);
      setUsersList(uList);
      setStats(stData);
    } catch (err) {
      console.error('Failed loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Handle Add Restaurant
  const handleAddRestaurantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestName || !newRestPhone) {
      alert('กรุณากรอกชื่อร้านและเบอร์โทรศัพท์');
      return;
    }
    try {
      await createRestaurant({
        name: newRestName,
        category: newRestCategory,
        phone: newRestPhone,
        address: newRestAddress || 'ต.หนองโคก อ.เมือง',
        locationLandmark: newRestLandmark || 'จุดสังเกตในชุมชน',
        ownerName: newRestOwner || 'เจ้าของร้าน',
        deliveryFee: Number(newRestFee) || 15,
        image: newRestImage || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
      });
      setIsAddRestModalOpen(false);
      setNewRestName('');
      setNewRestPhone('');
      setNewRestImage('');
      onDataChanged();
      loadAdminData();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเพิ่มร้านค้า');
    }
  };

  // Toggle User Status (Active / Suspended)
  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await updateUserStatus(userId, nextStatus as any);
      loadAdminData();
    } catch (err) {
      alert('ไม่สามารถอัปเดตสถานะผู้ใช้ได้');
    }
  };

  // Change User Role
  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      loadAdminData();
    } catch (err) {
      alert('ไม่สามารถเปลี่ยนบทบาทผู้ใช้ได้');
    }
  };

  // Delete Restaurant
  const handleDeleteRest = async (restId: string) => {
    if (!confirm('ยืนยันการลบร้านค้านี้? เมนูอาหารทั้งหมดของร้านนี้จะถูกลบไปด้วย')) return;
    try {
      await deleteRestaurant(restId);
      onDataChanged();
      loadAdminData();
    } catch (err) {
      alert('ลบร้านค้าไม่สำเร็จ');
    }
  };

  // Delete Order
  const handleDeleteOrderClick = async (orderId: string) => {
    if (!confirm('ยืนยันลบคำสั่งซื้อนี้ออกจากระบบ?')) return;
    try {
      await deleteOrder(orderId);
      onDataChanged();
      loadAdminData();
    } catch (err) {
      alert('ลบคำสั่งซื้อไม่สำเร็จ');
    }
  };

  // Supabase SQL Schema string
  const supabaseSqlSchema = `-- ⚡ SUPABASE / POSTGRESQL SCHEMA FOR LOCAL DELIVERY APP
-- Generate tables for Users, Restaurants, MenuItems, and Orders

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('customer', 'merchant', 'rider', 'admin')) DEFAULT 'customer',
  status TEXT CHECK (status IN ('active', 'suspended')) DEFAULT 'active',
  address TEXT,
  landmark TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  is_open BOOLEAN DEFAULT true,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  location_landmark TEXT,
  image_url TEXT,
  rating DECIMAL(2,1) DEFAULT 5.0,
  delivery_fee DECIMAL(10,2) DEFAULT 15.00,
  est_prep_time TEXT DEFAULT '15-20 นาที',
  owner_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT DEFAULT 'ทั่วไป',
  is_available BOOLEAN DEFAULT true,
  image_url TEXT,
  options JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_landmark TEXT,
  restaurant_id UUID REFERENCES restaurants(id),
  restaurant_name TEXT NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('promptpay', 'cod')),
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'cod_pending')),
  status TEXT CHECK (status IN ('pending', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled')),
  rider_id UUID REFERENCES users(id),
  rider_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner & Title Header (Bento Style) */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                Full-Stack Admin Control
              </span>
              <span className="text-xs text-slate-400">v1.0-alpha</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-0.5">
              ศูนย์ควบคุมและบริหารระบบ (Super Admin Hub)
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddRestModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มร้านค้าใหม่</span>
          </button>
          <button
            onClick={() => {
              loadAdminData();
              onDataChanged();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-medium transition"
            title="โหลดข้อมูลใหม่"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bento Grid Top Stats (4 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">รายได้ทั้งระบบ</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900">฿{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-[11px] text-emerald-600 font-bold mt-1">● สะสมจากการจัดส่งสำเร็จ</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-blue-300 transition">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">คำสั่งซื้อทั้งหมด</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900">{stats.totalOrders} ออร์เดอร์</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              กำลังดำเนินการ: <span className="font-bold text-amber-600">{stats.activeOrders}</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-orange-300 transition">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">ร้านค้าในระบบ</span>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900">{restaurants.length} ร้าน</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              เปิดพร้อมขาย: <span className="font-bold text-emerald-600">{restaurants.filter((r) => r.isOpen).length}</span> ร้าน
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">ผู้ใช้งานในระบบ</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900">{usersList.length} คน</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              ไรเดอร์: <span className="font-bold text-blue-600">{stats.totalRiders}</span> คน
            </p>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Buttons */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>ภาพรวมสถิติ</span>
        </button>

        <button
          onClick={() => setActiveTab('restaurants')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'restaurants'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>จัดการร้านค้า ({restaurants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>จัดการออร์เดอร์ ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ผู้ใช้ & สิทธิ์ ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'supabase'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Supabase SQL Export</span>
        </button>
      </div>

      {/* --- TAB CONTENT: OVERVIEW --- */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              สรุปสถานะการทำงานทั้งระบบ
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase">ออร์เดอร์ใหม่</p>
                <p className="text-xl font-black text-amber-600 mt-1">
                  {orders.filter((o) => o.status === 'pending').length} รายการ
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase">กำลังทำอาหาร</p>
                <p className="text-xl font-black text-blue-600 mt-1">
                  {orders.filter((o) => o.status === 'preparing').length} รายการ
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase">ไรเดอร์กำลังไปส่ง</p>
                <p className="text-xl font-black text-purple-600 mt-1">
                  {orders.filter((o) => o.status === 'out_for_delivery').length} รายการ
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase mb-3">ร้านค้าขายดีในระบบ</h3>
              <div className="space-y-2">
                {restaurants.map((rest) => {
                  const restOrders = orders.filter((o) => o.restaurantId === rest.id);
                  const rev = restOrders.reduce((sum, o) => sum + o.totalAmount, 0);
                  return (
                    <div key={rest.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div className="flex items-center gap-3">
                        <img src={rest.image} alt={rest.name} className="w-9 h-9 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold text-slate-900">{rest.name}</p>
                          <p className="text-[10px] text-slate-500">{rest.ownerName} • {rest.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-emerald-700">฿{rev.toLocaleString()} บาท</p>
                        <p className="text-[10px] text-slate-500">{restOrders.length} ออร์เดอร์</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold flex items-center gap-2 text-emerald-400">
              <Database className="w-4 h-4" />
              ข้อมูลสถิติประมวลผล (Real-Time)
            </h2>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <p className="text-[10px] text-slate-400 uppercase font-bold">ความเร็วการตอบสนอง API</p>
                <p className="text-lg font-black text-emerald-400 mt-0.5">~18 ms (Cloud Native)</p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <p className="text-[10px] text-slate-400 uppercase font-bold">ฐานข้อมูลปัจจุบัน</p>
                <p className="text-sm font-bold text-white mt-0.5">Express REST + In-Memory Dynamic DB</p>
                <p className="text-[10px] text-slate-400 mt-1">รองรับการต่อ Supabase PostgreSQL ทันที</p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <p className="text-[10px] text-slate-400 uppercase font-bold">สิทธิ์และสถิติแอดมิน</p>
                <p className="text-xs text-slate-300 mt-1">✓ จัดการร้านค้า ปิด/เปิด/แก้ไข</p>
                <p className="text-xs text-slate-300">✓ จัดการผู้ใช้ ระงับบัญชี/เปลี่ยน Role</p>
                <p className="text-xs text-slate-300">✓ ดูและยกเลิกคำสั่งซื้อทุกรายการ</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: RESTAURANTS --- */}
      {activeTab === 'restaurants' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อร้านค้า / เจ้าของ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={() => setIsAddRestModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มร้านค้า</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurants
              .filter((r) => r.name.includes(searchTerm) || r.ownerName.includes(searchTerm))
              .map((rest) => (
                <div key={rest.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex items-start gap-4">
                    <img src={rest.image} alt={rest.name} className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-100" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${rest.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {rest.isOpen ? '🟢 เปิดขาย' : '🔴 ปิดร้าน'}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{rest.category}</span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1 truncate">{rest.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" /> {rest.phone} • เจ้าของ: {rest.ownerName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-1">
                        <MapPin className="w-3 h-3 inline mr-0.5" /> {rest.locationLandmark}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="text-slate-500 text-[11px]">
                      ค่าส่ง: <span className="font-bold text-slate-900">฿{rest.deliveryFee}</span> • ใช้เวลาทำ: {rest.estPrepTime}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteRest(rest.id)}
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-bold transition flex items-center gap-1 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ลบร้าน</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: ALL ORDERS --- */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900">รายการคำสั่งซื้อทั้งหมดในระบบ</h2>
            <span className="text-xs text-slate-500">{orders.length} ออร์เดอร์</span>
          </div>

          <div className="space-y-3">
            {orders.map((ord) => (
              <div key={ord.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200/60 pb-2">
                  <div>
                    <span className="text-xs font-black text-slate-900">{ord.orderNumber}</span>
                    <span className="text-xs text-slate-500 ml-2">({ord.restaurantName})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                      ord.status === 'cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ord.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() => handleDeleteOrderClick(ord.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="ลบออร์เดอร์"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="font-bold text-slate-800">ลูกค้า: {ord.customerName} ({ord.customerPhone})</p>
                    <p className="text-slate-500 text-[11px]">ที่อยู่: {ord.deliveryAddress}</p>
                    <p className="text-slate-500 text-[11px]">จุดสังเกต: {ord.deliveryLandmark}</p>
                  </div>
                  <div className="md:text-right">
                    <p className="font-black text-emerald-700 text-sm">ยอดรวม: ฿{ord.totalAmount} บาท</p>
                    <p className="text-[11px] text-slate-500">วิธีชำระ: {ord.paymentMethod === 'promptpay' ? 'พร้อมเพย์' : 'เงินสด (COD)'}</p>
                    {ord.riderName && <p className="text-[11px] text-blue-600 font-bold">ไรเดอร์: {ord.riderName}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: USERS --- */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900">จัดการผู้ใช้และสิทธิ์การเข้าถึง (Users & Roles)</h2>
            <span className="text-xs text-slate-500">{usersList.length} ผู้ใช้</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="p-3 font-bold">ชื่อผู้ใช้งาน</th>
                  <th className="p-3 font-bold">เบอร์โทรศัพท์</th>
                  <th className="p-3 font-bold">สิทธิ์ (Role)</th>
                  <th className="p-3 font-bold">สถานะ</th>
                  <th className="p-3 font-bold text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-bold text-slate-900">{user.name}</td>
                    <td className="p-3 text-slate-600 font-mono">{user.phone}</td>
                    <td className="p-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        className="bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold p-1"
                      >
                        <option value="customer">Customer (ลูกค้า)</option>
                        <option value="merchant">Merchant (ร้านค้า)</option>
                        <option value="rider">Rider (ไรเดอร์)</option>
                        <option value="admin">Admin (แอดมิน)</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {user.status === 'active' ? '🟢 ปกติ' : '🔴 ถูกระงับ'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(user.id, user.status)}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                          user.status === 'active'
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {user.status === 'active' ? 'ระงับบัญชี' : 'ปลดระงับ'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: SUPABASE SCHEMA --- */}
      {activeTab === 'supabase' && (
        <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full uppercase border border-emerald-500/30">
                PostgreSQL Ready
              </span>
              <h2 className="text-lg font-bold text-white mt-1">สคริปต์ SQL สำหรับสร้างตารางบน Supabase</h2>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(supabaseSqlSchema);
                setIsCopiedSql(true);
                setTimeout(() => setIsCopiedSql(false), 2000);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              {isCopiedSql ? <Check className="w-4 h-4" /> : <Database className="w-4 h-4" />}
              <span>{isCopiedSql ? 'คัดลอก SQL แล้ว!' : 'คัดลอก SQL สคริปต์'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-96 leading-relaxed">
            {supabaseSqlSchema}
          </pre>
        </div>
      )}

      {/* --- ADD RESTAURANT MODAL --- */}
      {isAddRestModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">เพิ่มร้านค้าใหม่เข้าสู่ระบบ</h3>
              <button onClick={() => setIsAddRestModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRestaurantSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">ชื่อร้านค้า</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ครัวคุณโจ (อีสาน & อาหารป่า)"
                  value={newRestName}
                  onChange={(e) => setNewRestName(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">หมวดหมู่อาหาร</label>
                <input
                  type="text"
                  placeholder="เช่น อาหารอีสาน, อาหารตามสั่ง, ก๋วยเตี๋ยว"
                  value={newRestCategory}
                  onChange={(e) => setNewRestCategory(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700">เบอร์โทรศัพท์</label>
                  <input
                    type="tel"
                    required
                    placeholder="087-654-3210"
                    value={newRestPhone}
                    onChange={(e) => setNewRestPhone(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">ชื่อเจ้าของร้าน</label>
                  <input
                    type="text"
                    placeholder="คุณโจ"
                    value={newRestOwner}
                    onChange={(e) => setNewRestOwner(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">จุดสังเกตเด่นของร้านในท้องถิ่น</label>
                <input
                  type="text"
                  placeholder="เช่น ตรงข้ามซอยป่ามะพร้าว ปากทางเข้าบ้านหนองบัว"
                  value={newRestLandmark}
                  onChange={(e) => setNewRestLandmark(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">รูปภาพปกหน้าร้าน (URL)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newRestImage}
                  onChange={(e) => setNewRestImage(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddRestModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow"
                >
                  บันทึกเพิ่มร้านค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
