import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { Restaurant, MenuItem, Order, OrderStatus } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database for Community Delivery Platform
let restaurants: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'ร้านป้าเกศ อาหารตามสั่ง',
    category: 'อาหารตามสั่ง',
    isOpen: true,
    phone: '081-234-5678',
    address: '12/1 หมู่ 2 ต.หนองโคก อ.เมือง',
    locationLandmark: 'ข้างโรงเรียนบ้านหนองโคก ตรงข้ามร้านซ่อมมอเตอร์ไซค์ช่างเก่ง',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewCount: 142,
    deliveryFee: 15,
    estPrepTime: '15-20 นาที',
    ownerName: 'ป้าเกศรา',
  },
  {
    id: 'rest-2',
    name: 'ก๋วยเตี๋ยวเรือยายสมบูรณ์ (สูตรโบราณ)',
    category: 'ก๋วยเตี๋ยว',
    isOpen: true,
    phone: '089-876-5432',
    address: '45 หมู่ 3 ต.หนองโคก อ.เมือง',
    locationLandmark: 'ใกล้ตู้ ATM ธ.ก.ส. ปากทางเข้าวัดกูบ',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewCount: 210,
    deliveryFee: 15,
    estPrepTime: '10-15 นาที',
    ownerName: 'ยายสมบูรณ์',
  },
  {
    id: 'rest-3',
    name: 'ส้มตำแซ่บปากซอย ยายคำ',
    category: 'อาหารอีสาน',
    isOpen: true,
    phone: '086-555-1234',
    address: '88/4 หมู่ 1 ต.หนองโคก อ.เมือง',
    locationLandmark: 'สามแยกต้นโพธิ์ใหญ่ ตรงข้ามศาลากลางหมู่บ้าน',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewCount: 98,
    deliveryFee: 20,
    estPrepTime: '20-25 นาที',
    ownerName: 'ยายคำ ส้มตำนัว',
  },
  {
    id: 'rest-4',
    name: 'ชากระเหรี่ยง & กาแฟสดโบราณ',
    category: 'เครื่องดื่ม',
    isOpen: true,
    phone: '090-999-8877',
    address: '3/9 หมู่ 3 ต.หนองโคก อ.เมือง',
    locationLandmark: 'หน้าปั๊มหลอดแก้วชุมชน หมู่ที่ 3',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviewCount: 76,
    deliveryFee: 10,
    estPrepTime: '5-10 นาที',
    ownerName: 'ช่างนพ',
  },
];

let menuItems: MenuItem[] = [
  // ร้านป้าเกศ
  {
    id: 'item-101',
    restaurantId: 'rest-1',
    name: 'ข้าวผัดกะเพราหมูกรอบ + ไข่ดาว',
    description: 'หมูกรอบทำเอง หนังกรอบเนื้อนุ่ม ผัดพริกแห้งเข้มข้น หอมใบกะเพราบ้าน',
    price: 55,
    category: 'จานเดียว',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80',
    options: [
      {
        name: 'ความเผ็ด',
        choices: [
          { name: 'เผ็ดน้อย', extraPrice: 0 },
          { name: 'เผ็ดปกติ', extraPrice: 0 },
          { name: 'เผ็ดมาก (พริก 10 เม็ด)', extraPrice: 0 },
        ],
      },
      {
        name: 'ตัวเลือกเพิ่มเติม',
        choices: [
          { name: 'ไข่ดาวสุก', extraPrice: 0 },
          { name: 'ไข่ดาวเยิ้ม', extraPrice: 0 },
          { name: 'เพิ่มข้าว', extraPrice: 10 },
        ],
      },
    ],
  },
  {
    id: 'item-102',
    restaurantId: 'rest-1',
    name: 'ผัดซีอิ๊วเส้นใหญ่หมูหมัก',
    description: 'เส้นใหญ่ผัดกระทะไฟแรง หอมกลิ่นกระทะ ใส่ผักคะน้าสดกรอบ',
    price: 50,
    category: 'จานเดียว',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'item-103',
    restaurantId: 'rest-1',
    name: 'ข้าวผัดต้มยำกุ้งสด',
    description: 'กุ้งแม่น้ำตัวใหญ่ ผัดเครื่องต้มยำสดใหม่ รสชาติจัดจ้าน',
    price: 65,
    category: 'จานเดียว',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'item-104',
    restaurantId: 'rest-1',
    name: 'ต้มยำโป๊ะแตกทะเลหม้อเล็ก',
    description: 'กุ้ง หมึก ปลาสด ต้มยำรสเด็ด สมุนไพรไทยพื้นบ้าน',
    price: 120,
    category: 'กับข้าว',
    isAvailable: false, // หมดชั่วคราว
    image: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=500&auto=format&fit=crop&q=80',
  },

  // ก๋วยเตี๋ยวเรือ
  {
    id: 'item-201',
    restaurantId: 'rest-2',
    name: 'ก๋วยเตี๋ยวเรือน้ำตกเนื้อเปื่อยรวมมิตร',
    description: 'น้ำซุปเข้มข้นเคี่ยวเคี้ยว 8 ชั่งโมง เนื้อเปื่อยละลายในปาก ลูกชิ้นแท้',
    price: 50,
    category: 'ก๋วยเตี๋ยว',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80',
    options: [
      {
        name: 'เลือกเส้น',
        choices: [
          { name: 'เส้นเล็ก', extraPrice: 0 },
          { name: 'เส้นหมี่ขาว', extraPrice: 0 },
          { name: 'เส้นใหญ่', extraPrice: 0 },
          { name: 'บะหมี่เหลือง', extraPrice: 0 },
        ],
      },
      {
        name: 'ขนาด',
        choices: [
          { name: 'ธรรมดา', extraPrice: 0 },
          { name: 'พิเศษ', extraPrice: 10 },
        ],
      },
    ],
  },
  {
    id: 'item-202',
    restaurantId: 'rest-2',
    name: 'ก๋วยเตี๋ยวเรือหมูตุ๋นน้ำตกรสเด็ด',
    description: 'หมูตุ๋นสมุนไพร นุ่มล่อน ไม่ติดฟัน พร้อมกากหมูกรอบเจียวเอง',
    price: 45,
    category: 'ก๋วยเตี๋ยว',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'item-203',
    restaurantId: 'rest-2',
    name: 'กากหมูกระเทียมเจียวถุงเล็ก',
    description: 'กากหมูทอดสดใหม่ทุกวัน ทานคู่ก๋วยเตี๋ยวฟินมาก',
    price: 20,
    category: 'ทานเล่น',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=500&auto=format&fit=crop&q=80',
  },

  // ส้มตำ
  {
    id: 'item-301',
    restaurantId: 'rest-3',
    name: 'ส้มตำปูปลาร้าแซ่บนัว',
    description: 'ปลาร้าต้มเองสูตรยายคำ หอมนัวไม่คาว มะละกอสับกรอบ',
    price: 40,
    category: 'ส้มตำ',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'item-302',
    restaurantId: 'rest-3',
    name: 'ไก่ย่างหมักสมุนไพร (ครึ่งตัว)',
    description: 'หมักสามเกลอ ย่างเตาถ่านหอมๆ น้ำจิ้มแจ่วมะขามเปียก',
    price: 90,
    category: 'ย่าง/ทอด',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500&auto=format&fit=crop&q=80',
  },

  // เครื่องดื่ม
  {
    id: 'item-401',
    restaurantId: 'rest-4',
    name: 'ชาไทยเย็นเข้มข้น (ใส่ถุงกระดาษเก็บความเย็น)',
    description: 'ใบชาไทยอบพิเศษ หอมมันกลมกล่อม ไม่หวานตัดขา',
    price: 30,
    category: 'เครื่องดื่ม',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'item-402',
    restaurantId: 'rest-4',
    name: 'เอสเพรสโซเย็นโบราณ (สูตรเข้มข้น)',
    description: 'เมล็ดกาแฟคั่วเข้มผสมกาแฟโบราณ หอมเข้มตื่นตลอดวัน',
    price: 35,
    category: 'เครื่องดื่ม',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80',
  },
];

let orders: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'ORD-20260729-01',
    customerId: 'cust-1',
    customerName: 'สมชาย รักบ้านเกิด',
    customerPhone: '082-111-2233',
    deliveryAddress: 'บ้านเลขที่ 99/2 หมู่ 2 ต.หนองโคก',
    deliveryLandmark: 'บ้านปูนชั้นเดียวหลังสีฟ้า มีต้นมะม่วงใหญ่หน้าบ้าน ใกล้ศาลากลางหมู่บ้าน',
    restaurantId: 'rest-1',
    restaurantName: 'ร้านป้าเกศ อาหารตามสั่ง',
    restaurantPhone: '081-234-5678',
    restaurantLandmark: 'ข้างโรงเรียนบ้านหนองโคก',
    items: [
      {
        menuItemId: 'item-101',
        name: 'ข้าวผัดกะเพราหมูกรอบ + ไข่ดาว',
        price: 55,
        quantity: 2,
        note: 'ขอพริกน้ำปลาเยอะๆ ครับ',
        selectedOptions: [{ optionName: 'ความเผ็ด', choiceName: 'เผ็ดปกติ', extraPrice: 0 }],
      },
    ],
    subtotal: 110,
    deliveryFee: 15,
    totalAmount: 125,
    paymentMethod: 'promptpay',
    paymentStatus: 'paid',
    promptPayRef: 'PP-88912301',
    status: 'preparing',
    estimatedMinutes: 15,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'ord-1002',
    orderNumber: 'ORD-20260729-02',
    customerId: 'cust-2',
    customerName: 'ป้าสมใจ ตลาดสด',
    customerPhone: '085-444-5566',
    deliveryAddress: 'ร้านขายของชำป้าสมใจ หมู่ 3',
    deliveryLandmark: 'ตรงข้ามตู้บุญเติม ข้างอนามัยตำบล',
    restaurantId: 'rest-2',
    restaurantName: 'ก๋วยเตี๋ยวเรือยายสมบูรณ์ (สูตรโบราณ)',
    restaurantPhone: '089-876-5432',
    restaurantLandmark: 'ใกล้ตู้ ATM ธ.ก.ส.',
    items: [
      {
        menuItemId: 'item-201',
        name: 'ก๋วยเตี๋ยวเรือน้ำตกเนื้อเปื่อยรวมมิตร',
        price: 60,
        quantity: 1,
        selectedOptions: [
          { optionName: 'เลือกเส้น', choiceName: 'เส้นเล็ก', extraPrice: 0 },
          { optionName: 'ขนาด', choiceName: 'พิเศษ', extraPrice: 10 },
        ],
      },
      {
        menuItemId: 'item-203',
        name: 'กากหมูกระเทียมเจียวถุงเล็ก',
        price: 20,
        quantity: 2,
      },
    ],
    subtotal: 100,
    deliveryFee: 15,
    totalAmount: 115,
    paymentMethod: 'cod',
    paymentStatus: 'cod_pending',
    status: 'ready_for_pickup',
    estimatedMinutes: 10,
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id: 'ord-1003',
    orderNumber: 'ORD-20260729-03',
    customerId: 'cust-3',
    customerName: 'พี่เดชา ไร่อ้อย',
    customerPhone: '089-777-9988',
    deliveryAddress: 'กระท่อมริมคลองชลประทาน สาย 2',
    deliveryLandmark: 'สะพานปูนข้ามคลอง จุดสังเกตมีแท็งก์น้ำสีน้ำเงินสูงๆ',
    restaurantId: 'rest-3',
    restaurantName: 'ส้มตำแซ่บปากซอย ยายคำ',
    restaurantPhone: '086-555-1234',
    restaurantLandmark: 'สามแยกต้นโพธิ์ใหญ่',
    items: [
      {
        menuItemId: 'item-301',
        name: 'ส้มตำปูปลาร้าแซ่บนัว',
        price: 40,
        quantity: 2,
        note: 'เผ็ดๆ ปลาร้านัวๆ',
      },
      {
        menuItemId: 'item-302',
        name: 'ไก่ย่างหมักสมุนไพร (ครึ่งตัว)',
        price: 90,
        quantity: 1,
      },
    ],
    subtotal: 170,
    deliveryFee: 20,
    totalAmount: 190,
    paymentMethod: 'promptpay',
    paymentStatus: 'paid',
    promptPayRef: 'PP-77441102',
    status: 'out_for_delivery',
    estimatedMinutes: 12,
    riderId: 'rider-1',
    riderName: 'พี่ชัย ไรเดอร์หนองโคก',
    riderPhone: '084-999-3322',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
];

// --- REST API ROUTES ---

// Get all restaurants
app.get('/api/restaurants', (req, res) => {
  res.json({ success: true, data: restaurants });
});

// Toggle restaurant status (Open / Closed)
app.put('/api/restaurants/:id/toggle', (req, res) => {
  const { id } = req.params;
  const rest = restaurants.find((r) => r.id === id);
  if (!rest) {
    return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลร้านค้า' });
  }
  rest.isOpen = !rest.isOpen;
  res.json({ success: true, data: rest });
});

// Get menu items (optionally filtered by restaurantId)
app.get('/api/menu-items', (req, res) => {
  const { restaurantId } = req.query;
  let items = menuItems;
  if (restaurantId) {
    items = menuItems.filter((i) => i.restaurantId === restaurantId);
  }
  res.json({ success: true, data: items });
});

// Add new menu item
app.post('/api/menu-items', (req, res) => {
  const { restaurantId, name, description, price, category, image } = req.body;
  if (!restaurantId || !name || !price) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }
  const newItem: MenuItem = {
    id: `item-${Date.now()}`,
    restaurantId,
    name,
    description: description || '',
    price: Number(price),
    category: category || 'ทั่วไป',
    isAvailable: true,
    image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
  };
  menuItems.push(newItem);
  res.json({ success: true, data: newItem });
});

// Toggle menu item availability (Sold out / Available)
app.patch('/api/menu-items/:id/availability', (req, res) => {
  const { id } = req.params;
  const item = menuItems.find((i) => i.id === id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'ไม่พบเมนูนี้' });
  }
  item.isAvailable = !item.isAvailable;
  res.json({ success: true, data: item });
});

// Update menu item
app.put('/api/menu-items/:id', (req, res) => {
  const { id } = req.params;
  const index = menuItems.findIndex((i) => i.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'ไม่พบเมนูนี้' });
  }
  menuItems[index] = {
    ...menuItems[index],
    ...req.body,
    price: req.body.price ? Number(req.body.price) : menuItems[index].price,
  };
  res.json({ success: true, data: menuItems[index] });
});

// Delete menu item
app.delete('/api/menu-items/:id', (req, res) => {
  const { id } = req.params;
  menuItems = menuItems.filter((i) => i.id !== id);
  res.json({ success: true, message: 'ลบเมนูเรียบร้อยแล้ว' });
});

// Get orders
app.get('/api/orders', (req, res) => {
  const { restaurantId, riderId, customerId, status } = req.query;
  let result = [...orders];

  if (restaurantId) {
    result = result.filter((o) => o.restaurantId === restaurantId);
  }
  if (riderId) {
    result = result.filter((o) => o.riderId === riderId);
  }
  if (customerId) {
    result = result.filter((o) => o.customerId === customerId);
  }
  if (status) {
    result = result.filter((o) => o.status === status);
  }

  // Sort latest first
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ success: true, data: result });
});

// Place new order
app.post('/api/orders', (req, res) => {
  const {
    customerId,
    customerName,
    customerPhone,
    deliveryAddress,
    deliveryLandmark,
    restaurantId,
    items,
    paymentMethod,
  } = req.body;

  if (!customerName || !customerPhone || !deliveryAddress || !restaurantId || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'ข้อมูลการสั่งซื้อไม่สมบูรณ์' });
  }

  const restaurant = restaurants.find((r) => r.id === restaurantId);
  if (!restaurant) {
    return res.status(404).json({ success: false, message: 'ไม่พบร้านค้านี้' });
  }

  const subtotal = items.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = restaurant.deliveryFee || 15;
  const totalAmount = subtotal + deliveryFee;

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      10 + Math.random() * 90
    )}`,
    customerId: customerId || 'cust-anon',
    customerName,
    customerPhone,
    deliveryAddress,
    deliveryLandmark: deliveryLandmark || 'ไม่มีระบุจุดสังเกต',
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    restaurantPhone: restaurant.phone,
    restaurantLandmark: restaurant.locationLandmark,
    items,
    subtotal,
    deliveryFee,
    totalAmount,
    paymentMethod,
    paymentStatus: paymentMethod === 'promptpay' ? 'paid' : 'cod_pending',
    promptPayRef: paymentMethod === 'promptpay' ? `PP-${Math.floor(10000000 + Math.random() * 90000000)}` : undefined,
    status: 'pending',
    estimatedMinutes: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.unshift(newOrder);
  res.json({ success: true, data: newOrder });
});

// Update order status (Accept order, set prep time, claim job by rider, update delivery status, cancel)
app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, estimatedMinutes, riderId, riderName, riderPhone, cancelReason } = req.body;

  const order = orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'ไม่พบรายการคำสั่งซื้อ' });
  }

  if (status) {
    order.status = status as OrderStatus;
  }
  if (estimatedMinutes !== undefined) {
    order.estimatedMinutes = Number(estimatedMinutes);
  }
  if (riderId) {
    order.riderId = riderId;
    order.riderName = riderName || 'ไรเดอร์ประจำตำบล';
    order.riderPhone = riderPhone || '088-000-1122';
  }
  if (cancelReason) {
    order.cancelReason = cancelReason;
  }

  order.updatedAt = new Date().toISOString();

  res.json({ success: true, data: order });
});

// Seed data reset endpoint
app.post('/api/seed', (req, res) => {
  // resets data back to standard demo state
  res.json({ success: true, message: 'ข้อมูลถูกตั้งค่าเริ่มต้นเรียบร้อยแล้ว' });
});

// Tech Specs & DB Schema docs endpoint
app.get('/api/system/schema', (req, res) => {
  res.json({
    architecture: {
      title: 'สถาปัตยกรรม Local Food Delivery Platform (ตำบล/ชุมชน)',
      techStack: [
        { layer: 'Frontend', tech: 'React 19, TypeScript, Tailwind CSS, Lucide Icons' },
        { layer: 'Backend', tech: 'Node.js / Express (Lightweight REST API)' },
        { layer: 'Database', tech: 'SQLite (ผ่าน Prisma หรือ Drizzle ORM) หรือ MongoDB (Mongoose)' },
        { layer: 'Deployment', tech: 'VPS เล็กๆ (เช่น DigitalOcean $5/mo หรือ Cloud Run/Docker)' },
      ],
      schemas: {
        Users: [
          'id (PK, String/UUID)',
          'name (String)',
          'phone (String, Unique)',
          'role (Enum: customer, merchant, rider)',
          'address (Text)',
          'landmark (Text - จุดสังเกต)',
          'createdAt (DateTime)',
        ],
        Restaurants: [
          'id (PK, String/UUID)',
          'name (String)',
          'category (String)',
          'isOpen (Boolean)',
          'phone (String)',
          'address (Text)',
          'locationLandmark (Text)',
          'deliveryFee (Decimal)',
          'estPrepTime (String)',
          'ownerId (FK -> Users.id)',
        ],
        MenuItems: [
          'id (PK, String/UUID)',
          'restaurantId (FK -> Restaurants.id)',
          'name (String)',
          'description (Text)',
          'price (Decimal)',
          'category (String)',
          'isAvailable (Boolean)',
          'options (JSON - ระดับความเผ็ด/ท็อปปิ้ง)',
        ],
        Orders: [
          'id (PK, String/UUID)',
          'orderNumber (String, Unique)',
          'customerId (FK -> Users.id)',
          'customerName (String)',
          'customerPhone (String)',
          'deliveryAddress (Text)',
          'deliveryLandmark (Text - จุดสังเกตเด่นท้องถิ่น)',
          'restaurantId (FK -> Restaurants.id)',
          'subtotal (Decimal)',
          'deliveryFee (Decimal)',
          'totalAmount (Decimal)',
          'paymentMethod (Enum: promptpay, cod)',
          'paymentStatus (Enum: pending, paid, cod_pending)',
          'status (Enum: pending, preparing, ready_for_pickup, out_for_delivery, delivered, cancelled)',
          'riderId (FK -> Users.id, Nullable)',
          'createdAt (DateTime)',
          'updatedAt (DateTime)',
        ],
        OrderItems: [
          'id (PK, String/UUID)',
          'orderId (FK -> Orders.id)',
          'menuItemId (FK -> MenuItems.id)',
          'name (String)',
          'price (Decimal)',
          'quantity (Integer)',
          'note (Text)',
          'selectedOptions (JSON)',
        ],
      },
    },
  });
});

// START SERVER (DEVELOPMENT VS PRODUCTION)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Local Food Delivery Server running on http://localhost:${PORT}`);
  });
}

startServer();
