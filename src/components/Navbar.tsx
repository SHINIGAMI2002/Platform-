import React from 'react';
import { ShoppingBag, Store, Bike, BookOpen, MapPin, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'customer' | 'merchant' | 'rider' | 'guide';
  setActiveTab: (tab: 'customer' | 'merchant' | 'rider' | 'guide') => void;
  cartCount: number;
  activeOrderCount: number;
  pendingMerchantOrders: number;
  availableRiderJobs: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  activeOrderCount,
  pendingMerchantOrders,
  availableRiderJobs,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Village Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('customer')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-orange-500/20">
              <Bike className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                  หนองโคก Express
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full">
                  ระบบชุมชน
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-orange-400" />
                ตำบลหนองโคก • ส่งถึงบ้านไร้หลง
              </p>
            </div>
          </div>

          {/* Tab Navigation Switches */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {/* Customer Portal Button */}
            <button
              onClick={() => setActiveTab('customer')}
              className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'customer'
                  ? 'bg-orange-500 text-slate-950 font-semibold shadow-md shadow-orange-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden md:inline">ลูกค้า</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
              {cartCount === 0 && activeOrderCount > 0 && (
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              )}
            </button>

            {/* Merchant Dashboard Button */}
            <button
              onClick={() => setActiveTab('merchant')}
              className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'merchant'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Store className="w-4 h-4" />
              <span className="hidden md:inline">ร้านค้า</span>
              {pendingMerchantOrders > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                  {pendingMerchantOrders} รอรับ
                </span>
              )}
            </button>

            {/* Rider Dashboard Button */}
            <button
              onClick={() => setActiveTab('rider')}
              className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'rider'
                  ? 'bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span className="hidden md:inline">ไรเดอร์</span>
              {availableRiderJobs > 0 && (
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {availableRiderJobs} งาน
                </span>
              )}
            </button>

            {/* Tech Guide & DB Schema Button */}
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'guide'
                  ? 'bg-slate-700 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-amber-200 hover:bg-slate-800'
              }`}
              title="ดูคู่มือสถาปัตยกรรม DB Schema และวิธีติดตั้ง"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="hidden lg:inline text-xs">คู่มือเทคนิค & DB</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
