// JongJongDi – Shared library (vanilla JS)
const _IS_LOCAL = ['localhost', '127.0.0.1', ''].includes(location.hostname);
const API       = _IS_LOCAL ? 'http://localhost:4000'        : 'https://api.jongjongdi.com';
const SITE_URL  = _IS_LOCAL ? 'http://localhost:3000'        : 'https://jongjongdi.com';
const ADMIN_URL = _IS_LOCAL ? 'http://localhost:3001'        : 'https://admin.jongjongdi.com';
const WATTANA_URL = _IS_LOCAL ? 'http://127.0.0.1:5500/html/wattana-garden/index' : 'https://wattana-garden.jongjongdi.com';
const DURIAN_SLUG = 'durian-chips-premium';

// ─── i18n ─────────────────────────────────────────────────────────────────

const t = {
  nav: {
    booking:    { th: 'บริการจอง',             en: 'Services' },
    business:   { th: 'ซื้อระบบ',              en: 'For Business' },
    aboutMenu:  { th: 'เกี่ยวกับและข้อกำหนด',  en: 'About & Terms' },
    aboutLink:  { th: 'เกี่ยวกับ JongJongDi.com', en: 'About JongJongDi.com' },
    termsLink:  { th: 'ข้อกำหนดและเงื่อนไข',  en: 'Terms & Conditions' },
    upcoming:   { th: 'ใกล้มาถึง',             en: 'Upcoming' },
    myBookings: { th: 'การจองของฉัน',          en: 'My Bookings' },
    coupons:    { th: 'คูปอง',                 en: 'Coupons' },
    myCards:    { th: 'บัตรของฉัน',            en: 'My Cards' },
    favorites:  { th: 'รายการโปรด',            en: 'Favorites' },
    profile:    { th: 'ข้อมูลส่วนตัว',          en: 'Profile' },
    logout:     { th: 'ออกจากระบบ',            en: 'Log Out' },
    login:      { th: 'เข้าสู่ระบบ',            en: 'Log In' },
    register:   { th: 'สมัครสมาชิก',            en: 'Sign Up' },
    home:       { th: 'หน้าแรก',                en: 'Home' },
    promotions: { th: 'โปรโมชั่น',              en: 'Promotions' },
    trackNav:   { th: 'ติดตามการจอง',           en: 'Track Booking' },
    contactNav: { th: 'ติดต่อเรา',              en: 'Contact' },
    aboutUs:    { th: 'เกี่ยวกับเรา',           en: 'About Us' },
  },
  hero: {
    title:      { th: 'จองทุกอย่าง',            en: 'Book Everything,' },
    titleHl:    { th: 'ครบจบในที่เดียว',         en: 'All in One Place' },
    subtitle:   { th: 'ที่พัก ทัวร์ดำน้ำ จองโต๊ะ จองคิว ตั๋วเดินทาง สั่งสินค้าไทย-จีน ส่งง่าย ได้ของชัวร์', en: 'Hotels, dive tours, restaurants, queues, tickets & Thai-China products — all in one place.' },
    searchPh:   { th: 'ปลายทาง / ชื่อที่พัก / โรงแรม', en: 'Destination / Hotel Name' },
    searchBtn:  { th: 'ค้นหา',                  en: 'Search' },
    checkIn:    { th: 'เช็คอิน',                en: 'Check-in' },
    checkOut:   { th: 'เช็คเอาท์',              en: 'Check-out' },
    departDate: { th: 'วันเดินทาง',            en: 'Departure' },
    badge1:     { th: 'ดีลดีที่สุด',             en: 'Best Deals' },
    badge1s:    { th: 'ราคาคุ้มค่า',             en: 'Best prices guaranteed' },
    badge2:     { th: 'จองง่าย',                en: 'Easy Booking' },
    badge2s:    { th: 'ไม่กี่ขั้นตอน',           en: 'Done in just few steps' },
    badge3:     { th: 'ปลอดภัย 100%',           en: '100% Secure' },
    badge3s:    { th: 'มั่นใจทุกการจอง',         en: 'Safe & trusted platform' },
    badge4:     { th: 'บริการลูกค้า 24 ชม.',     en: '24/7 Support' },
    badge4s:    { th: 'พร้อมดูแลคุณ',            en: 'Always here for you' },
  },
  trending: {
    title:    { th: 'ฮิตติดกระแส',                        en: 'Trending Now' },
    subtitle: { th: 'ดีลพิเศษและโปรที่คัดมาเพื่อคุณ', en: 'Hand-picked deals & promotions for you' },
    viewAll:  { th: 'ดูทั้งหมด',                    en: 'View All' },
  },
  productList: {
    title:    { th: 'สินค้าแนะนำ',                  en: 'Featured Products' },
    subtitle: { th: 'สินค้าไทย-จีน คัดสรรส่งตรงถึงคุณ', en: 'Hand-picked Thai-China products' },
    viewMore: { th: 'ดูเพิ่มเติม',                  en: 'View details' },
  },
  services: {
    title:      { th: 'บริการของเรา',       en: 'Our Services' },
    viewAll:    { th: 'ดูทั้งหมด',           en: 'View All' },
    cta:        { th: 'เลือก',               en: 'View' },
    comingSoon: { th: 'เร็วๆ นี้',            en: 'Soon' },
    room:       { label: { th: 'จองที่พัก',         en: 'Book Hotel' },      desc: { th: 'ค้นหาโรงแรม รีสอร์ททั่วไทย',        en: 'Find hotels & resorts across Thailand' } },
    dive:       { label: { th: 'จองทัวร์',          en: 'Book Tours' },      desc: { th: 'ทัวร์ดำน้ำ ทัวร์ทะเล และทัวร์อื่นๆ ทั่วไทย', en: 'Dive, sea & more tours across Thailand' } },
    restaurant: { label: { th: 'จองโต๊ะ',           en: 'Book Table' },      desc: { th: 'จองโต๊ะร้านดัง ไม่ต้องรอคิว',       en: 'Reserve tables at top restaurants' } },
    queue:      { label: { th: 'จองคิว',             en: 'Book Queue' },      desc: { th: 'คลินิก ตัดผม ล้างรถ ฯลฯ',           en: 'Clinics, salons, carwash & more' } },
    ticket:     { label: { th: 'จองตั๋ว',            en: 'Book Tickets' },    desc: { th: 'คอนเสิร์ต สวนสนุก อีเวนต์',         en: 'Concerts, theme parks, events' } },
    product:    { label: { th: 'สั่งสินค้าไทย-จีน', en: 'Thai-China Shop' }, desc: { th: 'สั่งสินค้าจากไทยส่งตรงถึงจีน',      en: 'Thai products shipped directly to China' } },
  },
  b2b: {
    badge:    { th: 'สำหรับเจ้าของธุรกิจ',  en: 'For Business Owners' },
    title1:   { th: 'บริหารจัดการธุรกิจง่ายขึ้น', en: 'Manage Your Business Smarter' },
    title2:   { th: 'ด้วยระบบจองอัตโนมัติ',        en: 'with Auto-Booking System' },
    subtitle: { th: 'ลดความผิดพลาด เพิ่มยอดขายด้วย JongJongDi System ระบบจัดการคิวและออเดอร์ Real-time พร้อมสรุปยอดขายทันที', en: 'Reduce errors, boost revenue with JongJongDi System — real-time queue & order management with instant sales reports.' },
    f1:       { th: 'เปิดรับจองได้ตลอด 24 ชั่วโมง',               en: 'Accept bookings 24/7' },
    f2:       { th: 'รองรับ QR Code และตัดบัตรเครดิต',             en: 'Supports QR Code & credit card payments' },
    f3:       { th: 'Dashboard ดูยอดขายรายวันแบบ Real-time',       en: 'Real-time daily sales dashboard' },
    cta:      { th: 'ขอใบเสนอราคา / สนใจระบบ',                    en: 'Request a Quote' },
    todayOrders: { th: 'ยอดจองวันนี้', en: "Today's Bookings" },
    unit:        { th: 'รายการ',       en: 'orders' },
  },
  footer: {
    tagline:      { th: 'แพลตฟอร์มการจองที่เข้าใจคนไทย ครบ จบ ง่าย ในที่เดียว', en: "Thailand's most complete booking platform. Simple, fast, all-in-one." },
    services:     { th: 'บริการ',                   en: 'Services' },
    room:         { th: 'จองที่พัก',                en: 'Book Hotel' },
    dive:         { th: 'จองทัวร์ดำน้ำ',            en: 'Dive Tours' },
    tableBook:    { th: 'จองโต๊ะ',                  en: 'Book Table' },
    ticketBook:   { th: 'จองตั๋ว',                  en: 'Book Tickets' },
    comingSoon:   { th: 'เร็วๆ นี้',                 en: 'Soon' },
    partner:      { th: 'สมัครเป็นพาร์ทเนอร์',     en: 'Become a Partner' },
    partnerLogin: { th: 'เข้าสู่ระบบพาร์ทเนอร์',   en: 'Partner Login' },
    about:        { th: 'เกี่ยวกับและข้อกำหนด',     en: 'About & Terms' },
    aboutLink:    { th: 'เกี่ยวกับ JongJongDi.com', en: 'About JongJongDi.com' },
    termsLink:    { th: 'ข้อกำหนดและเงื่อนไข',     en: 'Terms & Conditions' },
    contact:      { th: 'ติดต่อเรา',                en: 'Contact Us' },
    copyright:    { th: 'สงวนลิขสิทธิ์',            en: 'All rights reserved' },
  },
  login: {
    subtitle:  { th: 'เข้าสู่ระบบเพื่อดูการจองของคุณ', en: 'Log in to view your bookings' },
    phone:     { th: 'เบอร์โทรศัพท์',  en: 'Phone Number' },
    password:  { th: 'รหัสผ่าน',       en: 'Password' },
    submit:    { th: 'เข้าสู่ระบบ',     en: 'Log In' },
    loading:   { th: 'กำลังเข้าสู่ระบบ...', en: 'Logging in...' },
    noAccount: { th: 'ยังไม่มีบัญชี?',  en: "Don't have an account?" },
    signUp:    { th: 'สมัครสมาชิก',    en: 'Sign Up' },
    back:      { th: 'กลับหน้าหลัก',   en: 'Back to Home' },
    error:     { th: 'เกิดข้อผิดพลาด', en: 'An error occurred' },
  },
  register: {
    subtitle:        { th: 'สมัครสมาชิกเพื่อติดตามการจองได้ง่ายขึ้น', en: 'Sign up to track your bookings easily' },
    refBannerTitle:  { th: 'คุณได้รับคำเชิญจากเพื่อน!',               en: "You've been invited by a friend!" },
    refBannerDesc:   { th: 'สมัครเสร็จรับส่วนลด ฿100 ทันที',          en: 'Register now and get ฿100 discount instantly' },
    name:            { th: 'ชื่อ-นามสกุล',    en: 'Full Name' },
    namePh:          { th: 'สมชาย ใจดี',      en: 'John Smith' },
    phone:           { th: 'เบอร์โทรศัพท์',   en: 'Phone Number' },
    email:           { th: 'อีเมล (ไม่บังคับ)', en: 'Email (Optional)' },
    password:        { th: 'รหัสผ่าน (อย่างน้อย 6 ตัว)', en: 'Password (min 6 chars)' },
    confirmPassword: { th: 'ยืนยันรหัสผ่าน',  en: 'Confirm Password' },
    referralCode:    { th: 'รหัสชวนเพื่อน (ไม่บังคับ)', en: 'Referral Code (Optional)' },
    referralPh:      { th: 'เช่น JJDABC123',  en: 'e.g. JJDABC123' },
    submit:          { th: 'สมัครสมาชิก',     en: 'Sign Up' },
    loading:         { th: 'กำลังสมัคร...',   en: 'Signing up...' },
    hasAccount:      { th: 'มีบัญชีอยู่แล้ว?', en: 'Already have an account?' },
    loginLink:       { th: 'เข้าสู่ระบบ',      en: 'Log In' },
    back:            { th: 'กลับหน้าหลัก',     en: 'Back to Home' },
    errMismatch:     { th: 'รหัสผ่านไม่ตรงกัน', en: 'Passwords do not match' },
    errShort:        { th: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', en: 'Password must be at least 6 characters' },
    errDefault:      { th: 'เกิดข้อผิดพลาด',   en: 'An error occurred' },
  },
  track: {
    title:        { th: 'ตรวจสอบสถานะการจอง',   en: 'Track Your Booking' },
    subtitle:     { th: 'กรอกเบอร์โทรที่ใช้ตอนจอง', en: 'Enter the phone number you used when booking' },
    phone:        { th: 'เบอร์โทรศัพท์',         en: 'Phone Number' },
    search:       { th: 'ค้นหา',                  en: 'Search' },
    notFound:     { th: 'ไม่พบการจองสำหรับเบอร์', en: 'No bookings found for' },
    notFoundHint: { th: 'หากเพิ่งจอง อาจใช้เวลาสักครู่ กรุณาลองใหม่อีกครั้ง', en: 'If you just booked, it may take a moment. Please try again.' },
    or:           { th: 'หรือ',                    en: 'or' },
    callUs:       { th: 'โทรหาเราได้เลย 080-225-6669', en: 'Call us at 080-225-6669' },
  },
  booking: {
    title:         { th: 'กรอกข้อมูลการจอง',    en: 'Booking Details' },
    summary:       { th: 'สรุปการจอง',           en: 'Booking Summary' },
    nights:        { th: 'คืน',                  en: 'nights' },
    guests:        { th: 'ท่าน',                 en: 'guests' },
    estimated:     { th: 'ยอดประมาณ',            en: 'Estimated Total' },
    estimatedNote: { th: 'ยอดสุดท้ายคำนวณจากเซิร์ฟเวอร์ (รวมราคา high season)', en: 'Final total calculated by server (incl. high season pricing)' },
    guestInfo:     { th: 'ข้อมูลผู้จอง',         en: 'Guest Information' },
    fullName:      { th: 'ชื่อ-นามสกุล',         en: 'Full Name' },
    fullNamePh:    { th: 'กรอกชื่อ-นามสกุล',    en: 'Enter your full name' },
    phone:         { th: 'เบอร์โทรศัพท์',        en: 'Phone Number' },
    email:         { th: 'อีเมล',                en: 'Email' },
    payment:       { th: 'ช่องทางชำระเงิน',      en: 'Payment Method' },
    bankTransfer:  { th: 'โอนธนาคาร',            en: 'Bank Transfer' },
    creditCard:    { th: 'บัตรเครดิต',           en: 'Credit Card' },
    terms:         { th: 'เมื่อกด "ยืนยันการจอง" แสดงว่าคุณยอมรับเงื่อนไขการจองของเรา', en: 'By clicking "Confirm Booking" you accept our booking terms.' },
    loading:       { th: 'กำลังจอง...',          en: 'Processing...' },
    confirm:       { th: 'ยืนยันการจอง',         en: 'Confirm Booking' },
    missingInfo:   { th: 'ข้อมูลการจองไม่ครบ',   en: 'Booking info missing' },
    fillAll:       { th: 'กรุณากรอกข้อมูลให้ครบ', en: 'Please fill in all fields' },
    error:         { th: 'เกิดข้อผิดพลาด',        en: 'An error occurred' },
  },
  review: {
    title:    { th: 'รีวิว',                                           en: 'Reviews' },
    noReview: { th: 'ยังไม่มีรีวิว — เป็นคนแรกที่รีวิวสิ!',          en: 'No reviews yet — be the first to review!' },
  },
  calendar: {
    months: {
      th: ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'],
      en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    },
    days: {
      th: ['อา','จ','อ','พ','พฤ','ศ','ส'],
      en: ['Su','Mo','Tu','We','Th','Fr','Sa'],
    },
    checkInSelected: { th: 'เช็คอิน:', en: 'Check-in:' },
    selectCheckout:  { th: 'เลือกวันเช็คเอาต์',     en: 'select check-out date' },
    nights:          { th: 'คืน',                     en: 'nights' },
    unavailable:     { th: 'เต็ม',                    en: 'Full' },
    rangeBlocked:    { th: 'ช่วงวันที่เลือกมีวันที่เต็มอยู่ กรุณาเลือกใหม่', en: 'Selected range includes unavailable dates. Please choose again.' },
  },
};

function tx(s, lang) { return lang === 'en' ? s.en : s.th; }
function pick(th, en, lang) { return lang === 'en' ? en : th; }

// ─── Language ─────────────────────────────────────────────────────────────

const LANG_KEY = 'jjd_lang';
const LANG_EVENT = 'jjd-lang-change';

function getLang() {
  return localStorage.getItem(LANG_KEY) || 'th';
}

function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
  window.dispatchEvent(new CustomEvent(LANG_EVENT));
}

// ─── Auth ─────────────────────────────────────────────────────────────────

function getUserSession() {
  try {
    const s = localStorage.getItem('jjd_user');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

function saveUserSession(token, user) {
  localStorage.setItem('jjd_user_token', token);
  localStorage.setItem('jjd_user', JSON.stringify(user));
}

function clearUserSession() {
  localStorage.removeItem('jjd_user_token');
  localStorage.removeItem('jjd_user');
}

function authHeader() {
  const token = localStorage.getItem('jjd_user_token') || '';
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const fmt = (n) => n.toLocaleString('en-US');

function mainImageUrl(images) {
  if (!images || !images.length) return null;
  return (images.find(i => i.isMain) || images[0]).url;
}

function resolveProductLink(link) {
  return link === `/products/${DURIAN_SLUG}` ? WATTANA_URL : `product.html?slug=${link.replace('/products/', '')}`;
}

function resolveLink(kind, slug) {
  if (kind === 'ROOM') return `room.html?slug=${slug}`;
  if (kind === 'TOUR') return `tour.html?slug=${slug}`;
  if (kind === 'PRODUCT') {
    return slug === DURIAN_SLUG ? WATTANA_URL : `product.html?slug=${slug}`;
  }
  return '#';
}

function getQP(name) {
  return new URLSearchParams(location.search).get(name);
}

// ─── Toast ────────────────────────────────────────────────────────────────

function showToast(msg) {
  document.getElementById('jjd-toast')?.remove();
  const el = document.createElement('div');
  el.id = 'jjd-toast';
  el.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,0.92);color:#fff;padding:12px 24px;border-radius:9999px;box-shadow:0 10px 25px rgba(0,0,0,.3);z-index:9999;display:flex;align-items:center;gap:10px;font-size:14px;font-weight:500;min-width:260px;justify-content:center;backdrop-filter:blur(8px);';
  el.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#4ade80"></i>${msg}`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ─── Status labels ────────────────────────────────────────────────────────

const STATUS_LABEL = {
  PENDING_PAYMENT: 'รอชำระเงิน',
  PENDING_CONFIRM: 'รอยืนยัน',
  CONFIRMED: 'ยืนยันแล้ว',
  CHECKED_IN: 'เช็คอินแล้ว',
  COMPLETED: 'เสร็จสิ้น',
  CANCELLED: 'ยกเลิก',
  REFUNDED: 'คืนเงินแล้ว',
  NO_SHOW: 'ไม่มาใช้บริการ',
};

const STATUS_COLOR = {
  PENDING_PAYMENT: 'background:#fef3c7;color:#b45309;',
  PENDING_CONFIRM: 'background:#dbeafe;color:#1d4ed8;',
  CONFIRMED: 'background:#dcfce7;color:#15803d;',
  CHECKED_IN: 'background:#ccfbf1;color:#0f766e;',
  COMPLETED: 'background:#f1f5f9;color:#475569;',
  CANCELLED: 'background:#fee2e2;color:#dc2626;',
  REFUNDED: 'background:#f3e8ff;color:#7e22ce;',
  NO_SHOW: 'background:#fee2e2;color:#dc2626;',
};

function statusBadge(status) {
  const label = STATUS_LABEL[status] || status;
  const style = STATUS_COLOR[status] || 'background:#f1f5f9;color:#475569;';
  return `<span style="${style}padding:2px 10px;border-radius:9999px;font-size:12px;font-weight:600;">${label}</span>`;
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── API ──────────────────────────────────────────────────────────────────

async function apiGet(path) {
  try {
    const res = await fetch(`${API}${path}`);
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function apiAuth(path, opts = {}) {
  try {
    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers: { ...authHeader(), ...(opts.headers || {}) },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด');
    return data;
  } catch (e) { throw e; }
}

async function listRooms(filters = {}) {
  const p = new URLSearchParams();
  if (filters.q) p.set('q', filters.q);
  if (filters.checkIn) p.set('checkIn', filters.checkIn);
  if (filters.checkOut) p.set('checkOut', filters.checkOut);
  return await apiGet(`/api/rooms${p.toString() ? '?' + p : ''}`) || [];
}

async function getRoom(slug) { return await apiGet(`/api/rooms/${slug}`); }

async function getRoomAvailability(slug, month) {
  return await apiGet(`/api/rooms/${slug}/availability?month=${month}`) || { unavailable: [], totalQuantity: 0 };
}

async function listTours(filters = {}) {
  const p = new URLSearchParams();
  if (filters.q) p.set('q', filters.q);
  if (filters.date) p.set('date', filters.date);
  return await apiGet(`/api/tours${p.toString() ? '?' + p : ''}`) || [];
}

async function getTour(slug) { return await apiGet(`/api/tours/${slug}`); }
async function getProduct(slug) { return await apiGet(`/api/products/${slug}`); }
async function listProducts() { return await apiGet('/api/products') || []; }
async function listTrending() { return await apiGet('/api/trending') || []; }

async function userLogin(phone, password) {
  return await apiAuth('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });
}

async function userRegister(data) {
  return await apiAuth('/api/users/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async function createBooking(input) {
  return await apiAuth('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// ─── Logo SVG ─────────────────────────────────────────────────────────────

const LOGO_SVG = `<svg viewBox="0 0 100 100" style="width:28px;height:28px;" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="20" fill="#2563EB"/>
  <text x="50" y="75" font-family="sans-serif" font-weight="bold" font-size="60" text-anchor="middle" fill="white">J</text>
  <circle cx="72" cy="28" r="12" fill="#F59E0B" stroke="white" stroke-width="3"/>
</svg>`;

// ─── Navbar ───────────────────────────────────────────────────────────────

function renderNavbar(opts = {}) {
  const lang = getLang();
  const user = getUserSession();
  const base = opts.base || '';

  const el = document.createElement('nav');
  el.id = 'jjd-navbar';
  el.style.cssText = 'background:#fff;position:fixed;width:100%;top:0;z-index:100;border-bottom:1px solid #f1f5f9;transition:box-shadow .3s;';

  el.innerHTML = `
    <div style="max-width:1200px;margin:0 auto;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;">
      <!-- Logo -->
      <a href="${base}index.html" style="display:flex;align-items:center;gap:8px;text-decoration:none;flex-shrink:0;">
        <div style="background:#eff6ff;padding:6px;border-radius:8px;">${LOGO_SVG}</div>
        <span style="font-weight:700;font-size:18px;color:#2563eb;">JongJongDi</span>
      </a>

      <!-- Desktop Nav -->
      <div id="nav-links" style="display:flex;align-items:center;gap:20px;font-size:14px;">
        <a href="${base}index.html#services" onclick="scrollToSection(event,'services')" style="color:#475569;text-decoration:none;font-weight:500;">${tx(t.nav.booking, lang)}</a>
        <a href="${base}index.html#promotions" onclick="scrollToSection(event,'promotions')" style="color:#475569;text-decoration:none;font-weight:500;">${tx(t.nav.promotions, lang)}</a>
        <a href="${base}index.html#system" onclick="scrollToSection(event,'system')" style="color:#475569;text-decoration:none;font-weight:500;">${tx(t.nav.business, lang)}</a>
        <a href="${base}about.html" style="color:#475569;text-decoration:none;font-weight:500;">${tx(t.nav.aboutUs, lang)}</a>
        <a href="${base}track.html" style="color:#475569;text-decoration:none;font-weight:500;">${tx(t.nav.trackNav, lang)}</a>
      </div>

      <!-- Right actions -->
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
        <!-- Lang toggle -->
        <button id="lang-toggle" onclick="toggleLang()" style="font-size:12px;font-weight:600;color:#2563eb;background:#eff6ff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;">${lang === 'th' ? 'EN' : 'ไทย'}</button>

        ${user ? `
          <div style="position:relative;" id="user-menu-wrap">
            <button onclick="toggleUserMenu()" style="display:flex;align-items:center;gap:6px;border:1px solid #e2e8f0;border-radius:9999px;padding:6px 12px 6px 8px;background:#fff;cursor:pointer;">
              <div style="width:28px;height:28px;border-radius:50%;background:#2563eb;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">${user.name.charAt(0)}</div>
              <span style="font-size:13px;font-weight:600;color:#334155;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${user.name}</span>
              <i class="fa-solid fa-chevron-down" style="font-size:10px;color:#94a3b8;"></i>
            </button>
            <div id="user-menu-dropdown" style="display:none;position:absolute;right:0;top:calc(100%+8px);background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,.1);padding:6px;min-width:200px;z-index:200;">
              <a href="${base}profile.html?tab=upcoming" style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;color:#475569;text-decoration:none;font-size:13px;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">${tx(t.nav.upcoming, lang)}</a>
              <a href="${base}profile.html?tab=bookings" style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;color:#475569;text-decoration:none;font-size:13px;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">${tx(t.nav.myBookings, lang)}</a>
              <a href="${base}profile.html?tab=coupons" style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;color:#475569;text-decoration:none;font-size:13px;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">${tx(t.nav.coupons, lang)}</a>
              <a href="${base}profile.html?tab=favorites" style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;color:#475569;text-decoration:none;font-size:13px;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">${tx(t.nav.favorites, lang)}</a>
              <a href="${base}profile.html?tab=profile" style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;color:#475569;text-decoration:none;font-size:13px;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">${tx(t.nav.profile, lang)}</a>
              <hr style="border:none;border-top:1px solid #f1f5f9;margin:4px 0;">
              <button onclick="doLogout('${base}')" style="width:100%;text-align:left;display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;color:#ef4444;background:none;border:none;cursor:pointer;font-size:13px;" onmouseover="this.style.background='#fff1f2'" onmouseout="this.style.background=''">${tx(t.nav.logout, lang)}</button>
            </div>
          </div>
        ` : `
          <a href="${base}login.html" style="font-size:13px;font-weight:600;color:#2563eb;text-decoration:none;padding:6px 14px;border:1px solid #2563eb;border-radius:8px;">${tx(t.nav.login, lang)}</a>
          <a href="${base}register.html" style="font-size:13px;font-weight:600;color:#fff;text-decoration:none;padding:6px 14px;background:#2563eb;border-radius:8px;">${tx(t.nav.register, lang)}</a>
        `}
      </div>
    </div>
  `;

  // scroll shadow
  window.addEventListener('scroll', () => {
    el.style.boxShadow = window.scrollY > 10 ? '0 4px 12px rgba(0,0,0,.08)' : '';
  });

  // click outside to close
  document.addEventListener('click', (e) => {
    if (!el.contains(e.target)) {
      document.getElementById('user-menu-dropdown')?.style && (document.getElementById('user-menu-dropdown').style.display = 'none');
    }
  });

  return el;
}

function toggleLang() {
  const lang = getLang();
  setLang(lang === 'th' ? 'en' : 'th');
  location.reload();
}

function toggleUserMenu() {
  const dd = document.getElementById('user-menu-dropdown');
  if (dd) dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
}

function doLogout(base = '') {
  clearUserSession();
  window.location.href = base + 'index.html';
}

function scrollToSection(e, id) {
  const el = document.getElementById(id);
  if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
}

// ─── Footer ───────────────────────────────────────────────────────────────

function renderFooter(opts = {}) {
  const lang = getLang();
  const base = opts.base || '';
  const el = document.createElement('footer');
  el.id = 'contact';
  el.style.cssText = 'background:#020617;border-top:1px solid #1e293b;color:#94a3b8;font-size:14px;';

  el.innerHTML = `
    <div style="max-width:1200px;margin:0 auto;padding:40px 24px 32px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:32px;margin-bottom:32px;">
        <!-- Brand -->
        <div style="grid-column:span 1;">
          <a href="${base}index.html" style="display:flex;align-items:center;gap:8px;text-decoration:none;margin-bottom:16px;">
            <div style="background:rgba(37,99,235,.2);padding:6px;border-radius:8px;border:1px solid #1e3a8a;">${LOGO_SVG}</div>
            <span style="font-weight:700;font-size:18px;color:#fff;">JongJongDi</span>
          </a>
          <p style="font-size:13px;line-height:1.6;margin-bottom:16px;">${tx(t.footer.tagline, lang)}</p>
          <div style="display:flex;gap:8px;">
            <a href="https://facebook.com/jongjongdi" target="_blank" style="width:36px;height:36px;border-radius:50%;background:#1e293b;color:#94a3b8;display:flex;align-items:center;justify-content:center;text-decoration:none;"><i class="fa-brands fa-facebook-f" style="font-size:14px;"></i></a>
            <a href="https://line.me/ti/p/jongjongdi" target="_blank" style="width:36px;height:36px;border-radius:50%;background:#1e293b;color:#94a3b8;display:flex;align-items:center;justify-content:center;text-decoration:none;"><i class="fa-brands fa-line" style="font-size:14px;"></i></a>
            <a href="https://instagram.com/jongjongdi" target="_blank" style="width:36px;height:36px;border-radius:50%;background:#1e293b;color:#94a3b8;display:flex;align-items:center;justify-content:center;text-decoration:none;"><i class="fa-brands fa-instagram" style="font-size:14px;"></i></a>
          </div>
        </div>

        <!-- Services -->
        <div>
          <h4 style="font-weight:700;color:#e2e8f0;margin:0 0 16px;font-size:14px;">${tx(t.footer.services, lang)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px;">
            <li><a href="${base}rooms.html" style="color:#94a3b8;text-decoration:none;">${tx(t.footer.room, lang)}</a></li>
            <li><a href="${base}tours.html" style="color:#94a3b8;text-decoration:none;">${tx(t.footer.dive, lang)}</a></li>
            <li style="color:#475569;">${tx(t.footer.tableBook, lang)} <span style="font-size:11px;background:#1e293b;color:#475569;padding:2px 6px;border-radius:4px;margin-left:4px;">${tx(t.footer.comingSoon, lang)}</span></li>
            <li style="color:#475569;">${tx(t.footer.ticketBook, lang)} <span style="font-size:11px;background:#1e293b;color:#475569;padding:2px 6px;border-radius:4px;margin-left:4px;">${tx(t.footer.comingSoon, lang)}</span></li>
          </ul>
        </div>

        <!-- Help -->
        <div>
          <h4 style="font-weight:700;color:#e2e8f0;margin:0 0 16px;font-size:14px;">${pick('ช่วยเหลือ', 'Help', lang)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px;">
            <li><a href="${base}track.html" style="color:#94a3b8;text-decoration:none;">${tx(t.nav.trackNav, lang)}</a></li>
            <li><a href="mailto:jongjongdisupport@gmail.com" style="color:#94a3b8;text-decoration:none;">${pick('ติดต่อเรา', 'Contact Us', lang)}</a></li>
            <li><a href="${ADMIN_URL}/register" style="color:#94a3b8;text-decoration:none;">${tx(t.footer.partner, lang)}</a></li>
            <li><a href="${ADMIN_URL}/login" style="color:#94a3b8;text-decoration:none;">${tx(t.footer.partnerLogin, lang)}</a></li>
          </ul>
        </div>

        <!-- About -->
        <div>
          <h4 style="font-weight:700;color:#e2e8f0;margin:0 0 16px;font-size:14px;">${tx(t.footer.about, lang)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px;">
            <li><a href="${base}about.html" style="color:#94a3b8;text-decoration:none;">${tx(t.footer.aboutLink, lang)}</a></li>
            <li><a href="${base}terms.html" style="color:#94a3b8;text-decoration:none;">${tx(t.footer.termsLink, lang)}</a></li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h4 style="font-weight:700;color:#e2e8f0;margin:0 0 16px;font-size:14px;">${tx(t.footer.contact, lang)}</h4>
          <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:12px;">
            <li style="display:flex;align-items:center;gap:10px;"><i class="fa-solid fa-phone" style="color:#2563eb;font-size:12px;"></i>080-225-6669</li>
            <li style="display:flex;align-items:center;gap:10px;"><i class="fa-solid fa-envelope" style="color:#2563eb;font-size:12px;"></i><a href="mailto:jongjongdisupport@gmail.com" style="color:#94a3b8;text-decoration:none;font-size:12px;">jongjongdisupport@gmail.com</a></li>
            <li style="display:flex;align-items:center;gap:10px;"><i class="fa-solid fa-clock" style="color:#2563eb;font-size:12px;"></i>${pick('เปิดบริการทุกวัน 09:00–22:00', 'Open daily 09:00–22:00', lang)}</li>
          </ul>
        </div>
      </div>

      <div style="border-top:1px solid #1e293b;padding-top:24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div style="font-size:12px;color:#475569;">© 2025 JongJongDi.com ${tx(t.footer.copyright, lang)}.</div>
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="height:24px;padding:0 10px;background:#1e293b;border:1px solid #334155;border-radius:4px;font-size:11px;font-weight:700;color:#94a3b8;display:flex;align-items:center;">VISA</div>
          <div style="height:24px;padding:0 10px;background:#1e293b;border:1px solid #334155;border-radius:4px;font-size:11px;font-weight:700;color:#94a3b8;display:flex;align-items:center;gap:2px;"><span style="color:#ef4444;">●</span><span style="color:#eab308;margin-left:-4px;">●</span></div>
          <div style="height:24px;padding:0 10px;background:#1e293b;border:1px solid #334155;border-radius:4px;font-size:11px;font-weight:700;color:#94a3b8;display:flex;align-items:center;">QR Pay</div>
        </div>
      </div>
    </div>
  `;
  return el;
}

// ─── Inject nav + footer ──────────────────────────────────────────────────

function initPage(opts = {}) {
  const nav = renderNavbar(opts);
  document.body.insertBefore(nav, document.body.firstChild);
  document.body.appendChild(renderFooter(opts));
}

// ─── Card helpers ─────────────────────────────────────────────────────────

function roomCardHTML(room, lang, checkIn, checkOut) {
  const name = pick(room.nameTh, room.nameEn, lang);
  const desc = pick(room.descriptionTh, room.descriptionEn, lang);
  const img = mainImageUrl(room.images);
  const types = room.types || [];
  const minPrice = types.length ? Math.min(...types.map(t => t.pricePerNight)) : 0;
  const maxPrice = types.length ? Math.max(...types.map(t => t.pricePerNight)) : 0;
  const maxCap = types.length ? Math.max(...types.map(t => t.maxGuests)) : 0;
  const qs = new URLSearchParams();
  qs.set('slug', room.slug);
  if (checkIn) qs.set('checkIn', checkIn);
  if (checkOut) qs.set('checkOut', checkOut);
  return `
    <a href="room.html?${qs}" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.06);border:1px solid #f1f5f9;text-decoration:none;display:block;transition:box-shadow .3s;" onmouseover="this.style.boxShadow='0 8px 24px rgba(0,0,0,.12)'" onmouseout="this.style.boxShadow='0 1px 4px rgba(0,0,0,.06)'">
      <div style="height:200px;background:linear-gradient(135deg,#bfdbfe,#a5f3fc);position:relative;overflow:hidden;">
        ${img ? `<img src="${img}" alt="${name}" style="width:100%;height:100%;object-fit:cover;">` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-bed" style="font-size:48px;color:#bfdbfe;opacity:.5;"></i></div>'}
        <div style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,.9);backdrop-filter:blur(4px);color:#334155;font-size:11px;font-weight:700;padding:4px 10px;border-radius:9999px;">
          <i class="fa-solid fa-user" style="margin-right:4px;"></i>${pick('สูงสุด', 'Up to', lang)} ${maxCap}
        </div>
      </div>
      <div style="padding:20px;">
        <h2 style="font-weight:700;font-size:16px;color:#1e293b;margin:0 0 6px;">${name}</h2>
        <p style="font-size:13px;color:#64748b;margin:0 0 16px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${desc}</p>
        <div style="display:flex;align-items:flex-end;justify-content:space-between;border-top:1px solid #f1f5f9;padding-top:14px;">
          <div>
            <div style="font-size:11px;color:#94a3b8;">${pick('ราคาเริ่มต้น', 'From', lang)}</div>
            <div style="color:#f59e0b;font-weight:700;font-size:18px;">${minPrice.toLocaleString()}${minPrice !== maxPrice ? '–' + maxPrice.toLocaleString() : ''}<span style="font-size:13px;color:#94a3b8;font-weight:400;"> ${pick('.-/คืน', 'THB/night', lang)}</span></div>
          </div>
          <span style="padding:8px 16px;background:#2563eb;color:#fff;border-radius:8px;font-size:13px;font-weight:600;">${pick('ดูรายละเอียด', 'View details', lang)}</span>
        </div>
      </div>
    </a>`;
}

function tourCardHTML(tour, lang, date) {
  const name = pick(tour.nameTh, tour.nameEn, lang);
  const desc = pick(tour.descriptionTh, tour.descriptionEn, lang);
  const img = mainImageUrl(tour.images);
  const nextSchedule = tour.schedules?.[0];
  const qs = new URLSearchParams();
  qs.set('slug', tour.slug);
  if (date) qs.set('date', date);
  return `
    <a href="tour.html?${qs}" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.06);border:1px solid #f1f5f9;text-decoration:none;display:block;transition:box-shadow .3s;" onmouseover="this.style.boxShadow='0 8px 24px rgba(0,0,0,.12)'" onmouseout="this.style.boxShadow='0 1px 4px rgba(0,0,0,.06)'">
      <div style="height:200px;background:linear-gradient(135deg,#a5f3fc,#93c5fd);position:relative;overflow:hidden;">
        ${img ? `<img src="${img}" alt="${name}" style="width:100%;height:100%;object-fit:cover;">` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-water-ladder" style="font-size:48px;color:#67e8f9;opacity:.5;"></i></div>'}
        <div style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,.9);backdrop-filter:blur(4px);color:#334155;font-size:11px;font-weight:700;padding:4px 10px;border-radius:9999px;">${tour.durationHours} ${pick('ชั่วโมง', 'hours', lang)}</div>
        <div style="position:absolute;bottom:12px;left:12px;"><span style="background:#0891b2;color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:9999px;">${pick('สูงสุด', 'Up to', lang)} ${tour.maxSeats} ${pick('ท่าน/รอบ', 'guests/trip', lang)}</span></div>
      </div>
      <div style="padding:20px;">
        <h2 style="font-weight:700;font-size:16px;color:#1e293b;margin:0 0 6px;">${name}</h2>
        <p style="font-size:13px;color:#64748b;margin:0 0 12px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${desc}</p>
        ${nextSchedule ? `<p style="font-size:12px;color:#64748b;margin:0 0 12px;"><i class="fa-regular fa-calendar" style="color:#06b6d4;margin-right:4px;"></i>${pick('รอบถัดไป', 'Next trip', lang)}: <strong style="color:#1e293b;">${new Date(nextSchedule.departureDate).toLocaleDateString(lang === 'en' ? 'en-US' : 'th-TH', { dateStyle: 'medium' })} · ${nextSchedule.departureTime}</strong></p>` : ''}
        <div style="display:flex;align-items:flex-end;justify-content:space-between;border-top:1px solid #f1f5f9;padding-top:14px;">
          <div>
            <div style="font-size:11px;color:#94a3b8;">${pick('ราคาต่อท่าน', 'Per person', lang)}</div>
            <div style="color:#f59e0b;font-weight:700;font-size:18px;">${tour.pricePerPerson.toLocaleString()}<span style="font-size:13px;color:#94a3b8;font-weight:400;">${pick('.-', ' THB', lang)}</span></div>
          </div>
          <span style="padding:8px 16px;background:#0891b2;color:#fff;border-radius:8px;font-size:13px;font-weight:600;">${pick('ดูรายละเอียด', 'View details', lang)}</span>
        </div>
      </div>
    </a>`;
}

function productCardHTML(product, lang) {
  const name = pick(product.nameTh, product.nameEn, lang);
  const img = mainImageUrl(product.images);
  const href = resolveProductLink(`/products/${product.slug}`);
  return `
    <a href="${href}" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.06);border:1px solid #f1f5f9;text-decoration:none;display:block;transition:box-shadow .3s;" onmouseover="this.style.boxShadow='0 8px 24px rgba(0,0,0,.12)'" onmouseout="this.style.boxShadow='0 1px 4px rgba(0,0,0,.06)'">
      <div style="height:176px;background:linear-gradient(135deg,#fef3c7,#fde68a);position:relative;overflow:hidden;">
        ${img ? `<img src="${img}" alt="${name}" style="width:100%;height:100%;object-fit:cover;">` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-bag-shopping" style="font-size:40px;color:#f59e0b;opacity:.5;"></i></div>'}
        ${product.badge ? `<div style="position:absolute;top:12px;left:12px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;padding:4px 10px;border-radius:9999px;text-transform:uppercase;"><i class="fa-solid fa-star" style="color:#fcd34d;margin-right:4px;"></i>${product.badge}</div>` : ''}
      </div>
      <div style="padding:14px;">
        <h3 style="font-weight:700;font-size:13px;color:#1e293b;margin:0 0 6px;line-height:1.4;min-height:2.5em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${name}</h3>
        ${product.location ? `<p style="font-size:11px;color:#64748b;margin:0 0 6px;"><i class="fa-solid fa-location-dot" style="color:#ef4444;margin-right:3px;"></i>${product.location}</p>` : ''}
        <div style="display:flex;align-items:flex-end;justify-content:space-between;border-top:1px solid #f1f5f9;padding-top:10px;">
          <div>
            ${product.oldPrice ? `<div style="color:#94a3b8;text-decoration:line-through;font-size:12px;">${fmt(product.oldPrice)}.-</div>` : ''}
            <div style="color:#f59e0b;font-weight:700;font-size:16px;">${fmt(product.price)}<span style="font-size:12px;color:#94a3b8;font-weight:400;">.-${product.unitLabel || ''}</span></div>
          </div>
          <span style="padding:6px 12px;background:#2563eb;color:#fff;border-radius:8px;font-size:12px;font-weight:600;">${pick('ดูสินค้า', 'View', lang)}</span>
        </div>
      </div>
    </a>`;
}

// ─── Image Gallery ────────────────────────────────────────────────────────

function renderGallery(images, heading = '') {
  if (!images || images.length === 0) return '';
  let current = 0;

  function openLightbox(idx) {
    current = idx;
    const lb = document.getElementById('jjd-lightbox');
    if (lb) {
      lb.style.display = 'flex';
      document.getElementById('jjd-lb-img').src = images[idx].url;
      document.getElementById('jjd-lb-counter').textContent = `${idx + 1} / ${images.length}`;
      document.body.style.overflow = 'hidden';
    }
  }
  window.openGalleryImage = openLightbox;
  window.closeLightbox = function() {
    document.getElementById('jjd-lightbox').style.display = 'none';
    document.body.style.overflow = '';
  };
  window.prevLightbox = function(e) {
    e.stopPropagation();
    current = (current - 1 + images.length) % images.length;
    document.getElementById('jjd-lb-img').src = images[current].url;
    document.getElementById('jjd-lb-counter').textContent = `${current + 1} / ${images.length}`;
  };
  window.nextLightbox = function(e) {
    e.stopPropagation();
    current = (current + 1) % images.length;
    document.getElementById('jjd-lb-img').src = images[current].url;
    document.getElementById('jjd-lb-counter').textContent = `${current + 1} / ${images.length}`;
  };

  // keyboard nav
  document.addEventListener('keydown', (e) => {
    const lb = document.getElementById('jjd-lightbox');
    if (!lb || lb.style.display === 'none') return;
    if (e.key === 'Escape') window.closeLightbox();
    if (e.key === 'ArrowLeft') window.prevLightbox({ stopPropagation: () => {} });
    if (e.key === 'ArrowRight') window.nextLightbox({ stopPropagation: () => {} });
  });

  const grid = images.map((img, i) => `
    <button onclick="openGalleryImage(${i})" style="aspect-ratio:1;border-radius:10px;overflow:hidden;background:#f1f5f9;border:none;cursor:pointer;padding:0;position:relative;outline:none;" onmouseover="this.querySelector('.hover-overlay').style.background='rgba(0,0,0,.2)'" onmouseout="this.querySelector('.hover-overlay').style.background='rgba(0,0,0,0)'">
      <img src="${img.url}" alt="${heading} ${i + 1}" style="width:100%;height:100%;object-fit:cover;">
      <div class="hover-overlay" style="position:absolute;inset:0;background:rgba(0,0,0,0);transition:.2s;display:flex;align-items:center;justify-content:center;">
        <i class="fa-solid fa-magnifying-glass-plus" style="color:#fff;font-size:18px;opacity:0;transition:.2s;"></i>
      </div>
    </button>
  `).join('');

  const lightbox = `
    <div id="jjd-lightbox" onclick="closeLightbox()" style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.9);align-items:center;justify-content:center;">
      <button onclick="closeLightbox()" style="position:absolute;top:16px;right:16px;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.15);border:none;color:#fff;cursor:pointer;font-size:18px;"><i class="fa-solid fa-xmark"></i></button>
      <span id="jjd-lb-counter" style="position:absolute;top:20px;left:20px;color:rgba(255,255,255,.8);font-size:13px;font-weight:500;"></span>
      ${images.length > 1 ? `<button onclick="prevLightbox(event)" style="position:absolute;left:12px;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.15);border:none;color:#fff;cursor:pointer;font-size:18px;"><i class="fa-solid fa-chevron-left"></i></button>` : ''}
      <img id="jjd-lb-img" src="" alt="" onclick="event.stopPropagation()" style="max-width:92vw;max-height:85vh;object-fit:contain;border-radius:8px;box-shadow:0 20px 50px rgba(0,0,0,.5);">
      ${images.length > 1 ? `<button onclick="nextLightbox(event)" style="position:absolute;right:12px;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.15);border:none;color:#fff;cursor:pointer;font-size:18px;"><i class="fa-solid fa-chevron-right"></i></button>` : ''}
    </div>`;

  return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;">${grid}</div>${lightbox}`;
}

// ─── Reviews ──────────────────────────────────────────────────────────────

async function renderReviews(resource, slug, container, lang) {
  container.innerHTML = '<div style="padding:16px;text-align:center;color:#94a3b8;"><i class="fa-solid fa-circle-notch fa-spin"></i></div>';
  const data = await apiGet(`/api/reviews/${resource}/${slug}`);
  if (!data || data.count === 0) {
    container.innerHTML = `<div style="background:#fff;border-radius:16px;border:1px solid #f1f5f9;box-shadow:0 1px 4px rgba(0,0,0,.06);padding:24px;">
      <h3 style="font-weight:700;color:#1e293b;margin:0 0 8px;"><i class="fa-solid fa-star" style="color:#f59e0b;margin-right:8px;"></i>${tx(t.review.title, lang)}</h3>
      <p style="font-size:13px;color:#94a3b8;margin:0;">${tx(t.review.noReview, lang)}</p>
    </div>`;
    return;
  }
  const dateLocale = lang === 'en' ? 'en-US' : 'th-TH';
  const maskName = (name) => name.trim().split(/\s+/).map(p => p.length <= 2 ? p : p[0] + '*'.repeat(p.length - 1)).join(' ');
  const stars = (rating) => [1,2,3,4,5].map(n => `<i class="fa-solid fa-star" style="color:${n <= Math.round(rating) ? '#f59e0b' : '#e2e8f0'};font-size:12px;"></i>`).join('');

  container.innerHTML = `<div style="background:#fff;border-radius:16px;border:1px solid #f1f5f9;box-shadow:0 1px 4px rgba(0,0,0,.06);padding:24px;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <h3 style="font-weight:700;color:#1e293b;margin:0;font-size:16px;"><i class="fa-solid fa-star" style="color:#f59e0b;margin-right:8px;"></i>${tx(t.review.title, lang)} <span style="color:#94a3b8;font-weight:400;font-size:14px;">(${data.count})</span></h3>
      <div style="text-align:right;">
        <div style="font-size:22px;font-weight:700;color:#f59e0b;">${data.avgRating.toFixed(1)}</div>
        <div>${stars(data.avgRating)}</div>
      </div>
    </div>
    <div style="max-height:384px;overflow-y:auto;display:flex;flex-direction:column;gap:0;">
      ${data.items.map(r => `
        <div style="border-bottom:1px solid #f1f5f9;padding-bottom:16px;margin-bottom:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <div style="font-weight:600;color:#334155;font-size:13px;">${maskName(r.guestName)}</div>
            <div>${stars(r.rating)}</div>
          </div>
          ${r.comment ? `<p style="font-size:13px;color:#475569;margin:0 0 4px;line-height:1.5;">${r.comment}</p>` : ''}
          <p style="font-size:11px;color:#94a3b8;margin:0;">${new Date(r.createdAt).toLocaleDateString(dateLocale)}</p>
        </div>
      `).join('')}
    </div>
  </div>`;
}

// ─── Availability Calendar ────────────────────────────────────────────────

function renderCalendar(slug, container, lang, initialCheckIn, initialCheckOut, onSelectDates) {
  let checkIn = initialCheckIn || null;
  let checkOut = initialCheckOut || null;
  let hovered = null;
  let rangeError = false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = ymd(today.getFullYear(), today.getMonth(), today.getDate());
  let unavailable = new Set();
  const fetchedMonths = new Set();

  const initDate = checkIn ? new Date(checkIn.split('-').map(Number)[0], checkIn.split('-').map(Number)[1] - 1, 1) : new Date(today.getFullYear(), today.getMonth(), 1);
  let viewYear = initDate.getFullYear();
  let viewMonth = initDate.getMonth();

  function ymd(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  function rangeHasUnavailable(ci, co) {
    const start = new Date(ci + 'T00:00:00Z').getTime();
    const end = new Date(co + 'T00:00:00Z').getTime();
    for (let ts = start; ts < end; ts += 86400000) {
      if (unavailable.has(new Date(ts).toISOString().slice(0, 10))) return true;
    }
    return false;
  }

  function isInRange(dateStr) {
    const ref = checkOut || hovered;
    if (!checkIn || !ref) return false;
    return dateStr > checkIn && dateStr < ref;
  }

  async function fetchAvailability() {
    const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
    if (fetchedMonths.has(key)) return;
    fetchedMonths.add(key);
    const data = await getRoomAvailability(slug, key);
    data.unavailable.forEach(d => unavailable.add(d));
    render();
  }

  function handleClick(dateStr) {
    if (dateStr < todayStr || unavailable.has(dateStr)) return;
    if (!checkIn || (checkIn && checkOut)) {
      checkIn = dateStr; checkOut = null; rangeError = false;
    } else if (dateStr <= checkIn) {
      checkIn = dateStr; checkOut = null; rangeError = false;
    } else if (rangeHasUnavailable(checkIn, dateStr)) {
      rangeError = true;
    } else {
      checkOut = dateStr; rangeError = false;
      if (onSelectDates) onSelectDates(checkIn, checkOut);
    }
    render();
  }

  function render() {
    const months = t.calendar.months[lang];
    const days = t.calendar.days[lang];
    const yearDisplay = lang === 'th' ? viewYear + 543 : viewYear;
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(ymd(viewYear, viewMonth, d));

    const dayCells = cells.map((dateStr, i) => {
      if (!dateStr) return `<div></div>`;
      const isPast = dateStr < todayStr;
      const isUnavail = unavailable.has(dateStr);
      const isCI = dateStr === checkIn;
      const isCO = dateStr === checkOut;
      const inRange = isInRange(dateStr);
      const disabled = isPast || isUnavail;
      const day = parseInt(dateStr.slice(8));
      let style = 'width:100%;height:36px;border:none;border-radius:50%;cursor:pointer;font-size:14px;background:transparent;transition:.15s;';
      let color = '#334155';
      if (isPast || isUnavail) { color = '#cbd5e1'; style += 'cursor:not-allowed;'; if (isUnavail && !isPast) style += 'text-decoration:line-through;'; }
      if (isCI || isCO) { style += 'background:#2563eb;'; color = '#fff'; style += 'font-weight:700;'; }
      else if (inRange) { style += 'background:#dbeafe;border-radius:0;'; color = '#2563eb'; }
      return `<div><button onclick="handleCalClick('${dateStr}')" ${disabled ? 'disabled' : ''} style="${style}color:${color};" onmouseover="handleCalHover('${dateStr}')" onmouseout="handleCalHoverEnd()">${day}</button></div>`;
    }).join('');

    container.innerHTML = `
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <button onclick="prevCalMonth()" style="width:32px;height:32px;border-radius:50%;background:none;border:none;cursor:pointer;font-size:14px;color:#64748b;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='none'"><i class="fa-solid fa-chevron-left"></i></button>
          <span style="font-weight:700;color:#334155;">${months[viewMonth]} ${yearDisplay}</span>
          <button onclick="nextCalMonth()" style="width:32px;height:32px;border-radius:50%;background:none;border:none;cursor:pointer;font-size:14px;color:#64748b;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='none'"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:8px;">
          ${days.map(d => `<div style="text-align:center;font-size:12px;color:#94a3b8;font-weight:500;padding:4px 0;">${d}</div>`).join('')}
        </div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;">${dayCells}</div>
        ${rangeError ? `<div style="margin-top:12px;background:#fef2f2;color:#dc2626;border-radius:10px;padding:12px;font-size:13px;"><i class="fa-solid fa-triangle-exclamation" style="margin-right:8px;"></i>${t.calendar.rangeBlocked[lang]}</div>` : ''}
        ${checkIn ? `<div style="margin-top:16px;background:#eff6ff;border-radius:10px;padding:12px;font-size:13px;color:#475569;">
          ${!checkOut ? `<i class="fa-solid fa-calendar-check" style="color:#2563eb;margin-right:8px;"></i>${t.calendar.checkInSelected[lang]} <strong>${checkIn}</strong> — ${t.calendar.selectCheckout[lang]}` : `<i class="fa-solid fa-calendar-check" style="color:#16a34a;margin-right:8px;"></i>${checkIn} → ${checkOut} (${Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)} ${t.calendar.nights[lang]})`}
        </div>` : ''}
      </div>`;

    window.prevCalMonth = () => { if (viewMonth === 0) { viewMonth = 11; viewYear--; } else { viewMonth--; } fetchAvailability(); render(); };
    window.nextCalMonth = () => { if (viewMonth === 11) { viewMonth = 0; viewYear++; } else { viewMonth++; } fetchAvailability(); render(); };
    window.handleCalClick = handleClick;
    window.handleCalHover = (d) => { hovered = d; render(); };
    window.handleCalHoverEnd = () => { hovered = null; render(); };
  }

  if (checkIn && checkOut && onSelectDates) onSelectDates(checkIn, checkOut);
  fetchAvailability();
  render();
}
