import React, { useEffect, useState } from 'react';
import { Server, Database, Code, Terminal, CheckCircle2, Copy, Check, ShieldCheck, Sparkles, Cpu } from 'lucide-react';

export const TechGuideView: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [schemaData, setSchemaData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/system/schema')
      .then((res) => res.json())
      .then((json) => setSchemaData(json.architecture))
      .catch(() => {});
  }, []);

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sampleOrderCode = `// โค้ดตัวอย่าง: ระบบสร้างคำสั่งซื้อ (Create Order Endpoint)
app.post('/api/orders', async (req, res) => {
  const { customerName, customerPhone, deliveryAddress, deliveryLandmark, restaurantId, items, paymentMethod } = req.body;

  // 1. ตรวจสอบความถูกต้องของข้อมูล
  if (!customerName || !deliveryAddress || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  // 2. คำนวณราคารวมและค่าจัดส่งในท้องถิ่น
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 15; // ค่ารอบเริ่มต้นสำหรับตำบล
  const totalAmount = subtotal + deliveryFee;

  // 3. สร้างคำสั่งซื้อใหม่ลงในฐานข้อมูล
  const newOrder = await db.orders.create({
    data: {
      orderNumber: \`ORD-\${Date.now()}\`,
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryLandmark, // จุดสังเกตเด่นท้องถิ่น
      restaurantId,
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod,
      status: 'pending' // สถานะเริ่มต้น: รอร้านค้าตอบรับ
    }
  });

  return res.json({ success: true, data: newOrder });
});`;

  const sampleStatusUpdateCode = `// โค้ดตัวอย่าง: ระบบอัปเดตสถานะออร์เดอร์ (Update Status Endpoint)
app.patch('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, estimatedMinutes, riderId } = req.body;

  // สถานะที่อนุญาต: pending -> preparing -> ready_for_pickup -> out_for_delivery -> delivered
  const updatedOrder = await db.orders.update({
    where: { id },
    data: {
      status,
      ...(estimatedMinutes && { estimatedMinutes }),
      ...(riderId && { riderId }),
      updatedAt: new Date()
    }
  });

  // ส่งการแจ้งเตือน Real-time ให้ลูกค้า/ไรเดอร์ ผ่าน WebSocket หรือ Server-Sent Events (SSE)
  notifyOrderUpdate(updatedOrder);

  return res.json({ success: true, data: updatedOrder });
});`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> เอกสารสถาปัตยกรรมระบบ & คู่มือการติดตั้ง
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            สถาปัตยกรรม Local Food Delivery Platform
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
            สรุปการออกแบบเทคโนโลยี ฐานข้อมูล (Database Schema) และคู่มือการติดตั้งทีละขั้นตอนสำหรับนักพัฒนาและผู้เริ่มต้น
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* SECTION 1: TECH STACK RECOMMENDATION */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            <Server className="w-5 h-5 text-amber-400" />
            1. คำแนะนำเทคโนโลยีสำหรับ Server เล็กประหยัดงบ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md">
                Backend API
              </span>
              <h3 className="font-extrabold text-white text-base">Node.js + Express / Fastify</h3>
              <p className="text-xs text-slate-400">
                น้ำหนักเบา กิน RAM น้อยมาก (ประมาณ 50-100MB) รองรับการประมวลผลคำสั่งซื้อแบบบอดี้ JSON ได้อย่างรวดเร็ว
              </p>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                Database
              </span>
              <h3 className="font-extrabold text-white text-base">SQLite หรือ PostgreSQL / MongoDB</h3>
              <p className="text-xs text-slate-400">
                สำหรับชุมชนเล็กๆ SQLite ในไฟล์เดียว (ผ่าน Prisma/Drizzle ORM) ประหยัดสุดโดยไม่ต้องซื้อ DB Server แยก
              </p>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md">
                Hosting Server
              </span>
              <h3 className="font-extrabold text-white text-base">Cloud Run / VPS $5/เดือน</h3>
              <p className="text-xs text-slate-400">
                รันบน VPS เล็กๆ (RAM 1GB) เช่น DigitalOcean / Hetzner หรือ Google Cloud Run Scale to Zero ค่าใช้จ่ายแทบเป็น 0 บาท
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: DATABASE SCHEMA */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            2. การออกแบบโครงสร้างฐานข้อมูล (Database Schema Design)
          </h2>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Users Schema */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2">
                <p className="font-extrabold text-amber-400 border-b border-slate-800 pb-1.5">
                  1. Users (ตารางผู้ใช้งาน)
                </p>
                <ul className="text-slate-300 space-y-1 font-mono text-[11px]">
                  <li>• id: String (Primary Key)</li>
                  <li>• name: String</li>
                  <li>• phone: String (Unique)</li>
                  <li>• role: Enum ('customer', 'merchant', 'rider')</li>
                  <li>• address: Text</li>
                  <li>• landmark: Text (จุดสังเกตเด่น)</li>
                </ul>
              </div>

              {/* Restaurants Schema */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2">
                <p className="font-extrabold text-orange-400 border-b border-slate-800 pb-1.5">
                  2. Restaurants (ตารางร้านค้า)
                </p>
                <ul className="text-slate-300 space-y-1 font-mono text-[11px]">
                  <li>• id: String (Primary Key)</li>
                  <li>• name: String</li>
                  <li>• category: String</li>
                  <li>• isOpen: Boolean (สถานะเปิด/ปิด)</li>
                  <li>• locationLandmark: Text (พิกัดร้าน)</li>
                  <li>• deliveryFee: Decimal</li>
                  <li>• ownerId: Foreign Key &rarr; Users.id</li>
                </ul>
              </div>

              {/* MenuItems Schema */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2">
                <p className="font-extrabold text-blue-400 border-b border-slate-800 pb-1.5">
                  3. MenuItems (ตารางเมนูอาหาร)
                </p>
                <ul className="text-slate-300 space-y-1 font-mono text-[11px]">
                  <li>• id: String (Primary Key)</li>
                  <li>• restaurantId: FK &rarr; Restaurants.id</li>
                  <li>• name: String</li>
                  <li>• price: Decimal</li>
                  <li>• isAvailable: Boolean (พร้อมขาย/หมด)</li>
                  <li>• options: JSON (ท็อปปิ้ง/ความเผ็ด)</li>
                </ul>
              </div>

              {/* Orders Schema */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2 lg:col-span-2">
                <p className="font-extrabold text-emerald-400 border-b border-slate-800 pb-1.5">
                  4. Orders (ตารางคำสั่งซื้อหลัก)
                </p>
                <ul className="text-slate-300 space-y-1 font-mono text-[11px]">
                  <li>• id: String (Primary Key)</li>
                  <li>• orderNumber: String (Unique)</li>
                  <li>• customerName / customerPhone: String</li>
                  <li>• deliveryAddress: Text</li>
                  <li>• deliveryLandmark: Text (จุดสังเกตเด่นท้องถิ่น)</li>
                  <li>• restaurantId: FK &rarr; Restaurants.id</li>
                  <li>• totalAmount: Decimal</li>
                  <li>• paymentMethod: Enum ('promptpay', 'cod')</li>
                  <li>• status: Enum ('pending', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered')</li>
                  <li>• riderId: FK &rarr; Users.id (Nullable)</li>
                </ul>
              </div>

              {/* OrderItems Schema */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2">
                <p className="font-extrabold text-yellow-400 border-b border-slate-800 pb-1.5">
                  5. OrderItems (รายการอาหารในออร์เดอร์)
                </p>
                <ul className="text-slate-300 space-y-1 font-mono text-[11px]">
                  <li>• id: String (Primary Key)</li>
                  <li>• orderId: FK &rarr; Orders.id</li>
                  <li>• menuItemId: FK &rarr; MenuItems.id</li>
                  <li>• name: String</li>
                  <li>• price: Decimal</li>
                  <li>• quantity: Integer</li>
                  <li>• note: Text</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: CODE SAMPLES */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            <Code className="w-5 h-5 text-amber-400" />
            3. ตัวอย่างโค้ดระบบสั่งซื้อและการอัปเดตสถานะ (Sample Code)
          </h2>

          <div className="space-y-4">
            {/* Create Order Snippet */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-3 bg-slate-800 flex justify-between items-center text-xs font-bold text-slate-300">
                <span>POST /api/orders (ระบบสร้างคำสั่งซื้อ)</span>
                <button
                  onClick={() => copyToClipboard(sampleOrderCode, 'orderCode')}
                  className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[11px] flex items-center gap-1"
                >
                  {copiedSection === 'orderCode' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedSection === 'orderCode' ? 'คัดลอกแล้ว' : 'คัดลอกโค้ด'}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                {sampleOrderCode}
              </pre>
            </div>

            {/* Status Update Snippet */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-3 bg-slate-800 flex justify-between items-center text-xs font-bold text-slate-300">
                <span>PATCH /api/orders/:id/status (ระบบเปลี่ยนสถานะงาน)</span>
                <button
                  onClick={() => copyToClipboard(sampleStatusUpdateCode, 'statusCode')}
                  className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[11px] flex items-center gap-1"
                >
                  {copiedSection === 'statusCode' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedSection === 'statusCode' ? 'คัดลอกแล้ว' : 'คัดลอกโค้ด'}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-amber-300 overflow-x-auto leading-relaxed">
                {sampleStatusUpdateCode}
              </pre>
            </div>
          </div>
        </section>

        {/* SECTION 4: INSTALLATION & RUNNING GUIDE FOR BEGINNERS */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            4. ขั้นตอนการติดตั้งและรันโปรเจกต์ทีละขั้นตอน (Step-by-Step Installation)
          </h2>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 text-xs text-slate-300">
            {/* Step 1 */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
                1
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-sm text-white">การเตรียมสภาพแวดล้อม (Prerequisites)</p>
                <p>
                  ติดตั้ง Node.js (เวอร์ชัน 18 ขึ้นไป) บนเครื่องคอมพิวเตอร์ของคุณ ดาวน์โหลดได้ฟรีจาก{' '}
                  <a href="https://nodejs.org" target="_blank" rel="noreferrer" className="text-amber-400 underline">
                    nodejs.org
                  </a>
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
                2
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-sm text-white">ติดตั้ง Package และ Dependencies</p>
                <p>เปิด Terminal / Command Prompt ในโฟลเดอร์โปรเจกต์ และพิมพ์คำสั่ง:</p>
                <div className="p-2.5 bg-slate-950 rounded-xl font-mono text-emerald-400 font-bold border border-slate-800">
                  npm install
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
                3
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-sm text-white">รันโปรเจกต์ในโหมดพัฒนา (Development Mode)</p>
                <p>รัน Server และ Frontend แบบรวมในคำสั่งเดียว:</p>
                <div className="p-2.5 bg-slate-950 rounded-xl font-mono text-emerald-400 font-bold border border-slate-800">
                  npm run dev
                </div>
                <p className="text-slate-400 pt-1">
                  จากนั้นเปิดเว็บเบราว์เซอร์และเข้าไปที่ <strong className="text-amber-300">http://localhost:3000</strong>
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
                4
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-sm text-white">การ Build และ Production Deploy</p>
                <div className="p-2.5 bg-slate-950 rounded-xl font-mono text-emerald-400 font-bold border border-slate-800 space-y-1">
                  <p># Build ไฟล์สำหรับส่งขึ้น Server Production</p>
                  <p>npm run build</p>
                  <p className="pt-1"># เริ่มรัน Production Server</p>
                  <p>npm start</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
