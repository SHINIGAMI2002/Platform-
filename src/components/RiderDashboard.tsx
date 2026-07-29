import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import {
  Bike,
  MapPin,
  PhoneCall,
  Store,
  Building,
  CheckCircle2,
  DollarSign,
  Package,
  Navigation,
  Clock,
  Coins,
  ShieldCheck,
  Power,
} from 'lucide-react';
import { updateOrderStatus } from '../lib/api';

interface RiderDashboardProps {
  orders: Order[];
  onDataChanged: () => void;
}

export const RiderDashboard: React.FC<RiderDashboardProps> = ({ orders, onDataChanged }) => {
  const [riderInfo] = useState({
    id: 'rider-1',
    name: 'พี่ชัย ไรเดอร์หนองโคก',
    phone: '084-999-3322',
    vehicle: 'เวฟ 110i สีส้ม (ขก-8891)',
  });

  const [isRiderOnline, setIsRiderOnline] = useState<boolean>(true);

  // Available jobs ready to pick up
  const availableJobs = orders.filter((o) => o.status === 'ready_for_pickup' && !o.riderId);

  // Active jobs being delivered by current rider
  const myActiveJobs = orders.filter((o) => o.riderId === riderInfo.id && o.status === 'out_for_delivery');

  // Completed jobs by current rider
  const myCompletedJobs = orders.filter((o) => o.riderId === riderInfo.id && o.status === 'delivered');

  // Calculate earnings
  const totalEarnings = myCompletedJobs.reduce((sum, o) => sum + o.deliveryFee, 0);

  // Claim Delivery Job
  const handleClaimJob = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, {
        status: 'out_for_delivery',
        riderId: riderInfo.id,
        riderName: riderInfo.name,
        riderPhone: riderInfo.phone,
      });
      onDataChanged();
    } catch (err) {
      alert('ไม่สามารถรับงานนี้ได้');
    }
  };

  // Complete Delivery
  const handleCompleteDelivery = async (orderId: string) => {
    if (!confirm('ยืนยันส่งอาหารให้ลูกค้าถึงมือเรียบร้อยแล้วใช่หรือไม่?')) return;
    try {
      await updateOrderStatus(orderId, {
        status: 'delivered',
      });
      onDataChanged();
    } catch (err) {
      alert('ไม่สามารถอัปเดตสถานะจัดส่งได้');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Top Rider Header */}
      <div className="bg-slate-950 border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              <Bike className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-lg text-white">{riderInfo.name}</h1>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                  ไรเดอร์ประจำตำบล
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>📱 {riderInfo.phone}</span> • <span>🛵 {riderInfo.vehicle}</span>
              </p>
            </div>
          </div>

          {/* Duty Status Switch */}
          <div className="flex items-center space-x-3 bg-slate-900 p-2 rounded-2xl border border-slate-800">
            <button
              onClick={() => setIsRiderOnline(!isRiderOnline)}
              className={`px-4 py-2 rounded-xl text-xs font-black shadow transition flex items-center gap-1.5 ${
                isRiderOnline
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
              }`}
            >
              <Power className="w-4 h-4" />
              {isRiderOnline ? '🟢 พร้อมรับงาน (Online)' : '🔴 พักผ่อน (Offline)'}
            </button>
          </div>
        </div>
      </div>

      {/* Rider Earnings Bar */}
      <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-slate-900 border-b border-blue-800/40 py-4">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
            <p className="text-[11px] text-slate-400 font-bold">งานพร้อมรับส่งในตำบล</p>
            <p className="text-xl font-black text-amber-400">{availableJobs.length} งาน</p>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
            <p className="text-[11px] text-slate-400 font-bold">งานกำลังวิ่งส่งอยู่</p>
            <p className="text-xl font-black text-blue-400">{myActiveJobs.length} งาน</p>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
            <p className="text-[11px] text-slate-400 font-bold">ส่งสำเร็จวันนี้</p>
            <p className="text-xl font-black text-emerald-400">{myCompletedJobs.length} รอบ</p>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
            <p className="text-[11px] text-slate-400 font-bold">รายได้ค่ารอบรวมวันนี้</p>
            <p className="text-xl font-black text-yellow-400">฿{totalEarnings} บาท</p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* 1. MY ACTIVE JOBS SECTION */}
        {myActiveJobs.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-400 animate-spin" />
              <span>ออร์เดอร์ที่คุณกำลังวิ่งส่งอยู่ ({myActiveJobs.length} งาน)</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {myActiveJobs.map((order) => (
                <div
                  key={order.id}
                  className="bg-slate-800 rounded-3xl border-2 border-blue-500 shadow-2xl overflow-hidden space-y-4 p-5"
                >
                  <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                    <div>
                      <span className="text-xs text-blue-400 font-mono font-bold">#{order.orderNumber}</span>
                      <h3 className="text-base font-extrabold text-white">
                        ส่งให้: คุณ{order.customerName}
                      </h3>
                    </div>
                    <span className="px-3 py-1 bg-blue-500 text-slate-950 text-xs font-black rounded-full animate-pulse">
                      🛵 กำลังไปส่ง
                    </span>
                  </div>

                  {/* Pickup & Delivery Points */}
                  <div className="space-y-3">
                    {/* Pickup Point */}
                    <div className="p-3 bg-slate-900 rounded-2xl border border-slate-700 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-amber-400">
                        <Store className="w-4 h-4 shrink-0" />
                        <span>จุดรับอาหาร (ร้านค้า): {order.restaurantName}</span>
                      </div>
                      <p className="text-slate-300">พิกัดร้าน: {order.restaurantLandmark}</p>
                      <p className="text-slate-400">โทรหาแม่ค้า: {order.restaurantPhone}</p>
                    </div>

                    {/* Delivery Point with Local Landmark */}
                    <div className="p-3 bg-amber-950/40 rounded-2xl border border-amber-500/40 space-y-1.5 text-xs text-amber-100">
                      <div className="flex items-center justify-between font-bold text-amber-300">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                          จุดส่งอาหาร (บ้านลูกค้า)
                        </span>
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1"
                        >
                          <PhoneCall className="w-3 h-3" /> โทรหาลูกค้า
                        </a>
                      </div>
                      <p className="text-white font-semibold">ที่อยู่: {order.deliveryAddress}</p>

                      {/* Landmark Callout */}
                      <div className="p-2.5 bg-amber-900/60 border border-amber-400/60 rounded-xl text-xs text-amber-200">
                        <p className="font-extrabold text-amber-300 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                          จุดสังเกตเด่นท้องถิ่น:
                        </p>
                        <p className="mt-0.5 text-white font-bold">{order.deliveryLandmark}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="p-3 bg-slate-900 rounded-2xl border border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-slate-400">รูปแบบชำระเงิน:</p>
                      <p className="font-extrabold text-sm text-white">
                        {order.paymentMethod === 'promptpay' ? (
                          <span className="text-emerald-400">✅ โอนแล้ว (ไม่ต้องเก็บเงิน)</span>
                        ) : (
                          <span className="text-amber-400">💵 COD เก็บเงินสด: ฿{order.totalAmount} บาท</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400">ค่ารอบไรเดอร์:</p>
                      <p className="font-black text-sm text-yellow-400">+฿{order.deliveryFee} บาท</p>
                    </div>
                  </div>

                  {/* Complete Button */}
                  <button
                    onClick={() => handleCompleteDelivery(order.id)}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-sm shadow-xl transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" /> ส่งสำเร็จเรียบร้อยแล้ว! (รับค่ารอบ)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. AVAILABLE JOBS POOL */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              <span>รายการออร์เดอร์พร้อมส่ง (รอไรเดอร์รับงาน)</span>
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-2.5 py-0.5 rounded-full">
                {availableJobs.length} งาน
              </span>
            </h2>
          </div>

          {!isRiderOnline ? (
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 text-center text-slate-400">
              <p className="text-sm font-semibold">คุณอยู่ในสถานะพักผ่อน (Offline) กรุณากดปุ่มเปิดระบบพร้อมรับงานเพื่อกดรับวิ่งส่งออร์เดอร์</p>
            </div>
          ) : availableJobs.length === 0 ? (
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 text-center text-slate-400">
              <p className="text-sm font-semibold">ขณะนี้ยังไม่มีออร์เดอร์ใหม่ที่รอไรเดอร์รับงาน</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableJobs.map((order) => (
                <div
                  key={order.id}
                  className="bg-slate-800 rounded-3xl border border-slate-700 shadow-lg overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                      <span className="text-xs text-amber-400 font-mono font-bold">#{order.orderNumber}</span>
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full">
                        ค่ารอบ ฿{order.deliveryFee} บาท
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {/* Pickup */}
                      <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700">
                        <p className="font-bold text-slate-300">ร้านค้า: {order.restaurantName}</p>
                        <p className="text-slate-400">พิกัด: {order.restaurantLandmark}</p>
                      </div>

                      {/* Delivery */}
                      <div className="p-2.5 bg-amber-950/30 rounded-xl border border-amber-500/30 space-y-1">
                        <p className="font-bold text-amber-200">
                          จัดส่ง: คุณ{order.customerName} ({order.deliveryAddress})
                        </p>
                        <p className="text-amber-300 font-bold">
                          📍 จุดสังเกตเด่น: {order.deliveryLandmark}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-slate-400">
                        ชำระโดย:{' '}
                        <strong className="text-white">
                          {order.paymentMethod === 'promptpay' ? 'โอนแล้ว' : `COD (${order.totalAmount}฿)`}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 border-t border-slate-700">
                    <button
                      onClick={() => handleClaimJob(order.id)}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-black rounded-xl text-xs shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <Bike className="w-4 h-4" /> กดรับงานส่งออร์เดอร์นี้
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
