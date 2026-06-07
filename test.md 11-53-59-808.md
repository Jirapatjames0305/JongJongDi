# JongJongDi — Test Plan & Results

แบ่งเป็น 2 ระดับ:
- **Automated** — รันด้วย CLI / curl
- **Manual** — ต้องเปิด browser / ใช้บัญชีจริง (รอ user)

ก่อนเริ่ม: API ทำงานที่ `http://localhost:4000`, web ที่ `http://localhost:3000`, admin ที่ `http://localhost:3001`

> **อัปเดต 2026-06-03** — หลัง migrate **Omise → ChillPay** และ **แยก `.env` ไปแต่ละโปรเจค** (รันเทสจริงแล้ว)
> - env แต่ละ service อยู่แยกกัน: `apps/api/.env`, `apps/web/.env`, `apps/admin/.env`, `packages/database/.env`
> - ✅ DB ออนไลน์ปกติ (DNS NXDOMAIN เมื่อก่อนเป็นปัญหา DNS ชั่วคราว ไม่ใช่ project หาย) — `db push` in sync, API connect ได้
> - 🐛 **เจอ + แก้บั๊กจากการรันเทส**: `lib/chillpay.ts` อ่าน env ตอน import (ก่อน dotenv โหลด) ทำให้ `isChillpayEnabled()` false ตลอด → แก้เป็นอ่าน env แบบ lazy แล้ว
> - ⚠️ ChillPay lib ยังมี 4 จุด `CONFIRM-AGAINST-DOCS` ใน [lib/chillpay.ts](apps/api/src/lib/chillpay.ts) — checksum round-trip ผ่านแล้ว (internal) แต่**ลำดับ field จริงยังต้องเทียบเอกสาร ChillPay** ก่อน go-live

---

## A. Automated tests — ผลล่าสุด

### A1. Build / Type checks (รันได้ ไม่ต้องพึ่ง DB) — 2026-06-03

| Check | Result | Notes |
|---|---|---|
| `prisma validate` | ✅ valid | schema ผ่าน (รวมฟิลด์ ChillPay ใหม่) |
| `prisma db push` | ❌ FAIL | `tenant/user ... not found` — Supabase project หาย (ไม่เกี่ยวกับ schema) |
| `tsc --noEmit` (web) | ✅ clean | 0 errors |
| `tsc --noEmit` (admin) | ✅ clean | 0 errors |
| `tsc --noEmit` (api) | ⚠️ 29 pre-existing | `req.query: string \| string[]` + prisma where types ใน availability/bookings/operators/tours.ts (errors เก่า ไม่ได้มาจาก ChillPay) — tsx watch ignore ทำให้ dev รันได้ปกติ |

> ไฟล์ที่แตะตอน migrate ChillPay (`lib/chillpay.ts`, `routes/payments.ts`, `routes/webhooks.ts`, `index.ts`) **ไม่มี type error ใหม่**

### A2. API startup log — ✅ รันจริง 2026-06-03

```
[env] DATABASE_URL : ✓ set
[env] JWT_SECRET   : ✓ set
[env] API_PORT     : 4000
[env] CORS origins : http://localhost:3000, http://localhost:3001
[db]  PostgreSQL   : ✓ connected
[cron] reminder job scheduled (09:00 Asia/Bangkok daily)
[api] Listening on http://localhost:4000
```

✅ DB connect — หมายเหตุ: cron ตอนนี้ **scheduled** (เมื่อก่อน skip) เพราะ logic เปลี่ยน

### A3. API endpoints (curl) — รันจริง 2026-06-03

| # | Endpoint | Result |
|---|---|---|
| 1 | `GET /health` | ✅ `{ok:true}` |
| 2 | `GET /api/rooms` (public) | ✅ `[]` |
| 3 | `GET /api/tours` (public) | ✅ `[]` |
| 4 | `POST /api/auth/login` (super admin) | ⏸ ต้องใช้ super admin creds (ไม่มี) |
| 5 | `GET /api/operators/stats` | ⏸ ต้อง super admin token |
| 6 | `GET /api/bookings/admin/list` | ⏸ ต้อง super admin token |
| 7 | `GET /api/seasons` | 🔄 **เปลี่ยน**: ตอนนี้ต้อง auth → `กรุณาเข้าสู่ระบบ` (เดิม public) |
| 8 | `POST /api/users/register` | ✅ token 224 chars + user (role CUSTOMER) |
| 9 | `POST /api/users/login` | ✅ token |
| 10 | `GET /api/users/me` (Bearer) | ✅ user info + status ACTIVE |
| 11 | `POST /api/users/login` (รหัสผิด) | ✅ `เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง` |
| 12 | `POST /api/bookings/lookup` (phone สั้น) | ✅ `เบอร์โทรไม่ถูกต้อง` (validation) |

> 4/5/6 รันไม่ได้เพราะไม่มี super admin credentials — ส่ง email/password ของ super admin มา ผมรันให้ครบ

### A4. Business logic — ผลเดิม 2026-05-24 (ยังไม่รันซ้ำรอบนี้)

DB ออนไลน์แล้ว รันซ้ำได้ แต่ต้อง setup test data (room/booking) — logic ไม่ได้เปลี่ยนจากการ migrate ChillPay:

**Season pricing (`calcRoomTotal` per-night)**

| Case | Expected | ผลเดิม |
|---|---|---|
| 3 nights, base 1000, no season | 3000 | ✅ 3000 |
| 3 nights × multiplier 2.0 | 6000 | ✅ 6000 |
| 2 nights, partial overlap (1 base + 1 season) | 1000 + 2000 = 3000 | ✅ 3000 |

**Review API (`/api/reviews/:bookingNumber`)**

| Case | Expected | ผลเดิม |
|---|---|---|
| Review on PENDING_PAYMENT | 400 | ✅ `เขียนรีวิวได้หลังจากเช็คอินแล้วเท่านั้น` |
| Wrong phone | 403 | ✅ `เบอร์โทรไม่ตรง` |
| Rating 6 (out of 1-5) | 400 | ✅ `rating ต้องอยู่ระหว่าง 1-5` |
| Valid after promote to CHECKED_IN | 201 | ✅ review created |
| Submit duplicate | 409 | ✅ `ให้รีวิวแล้ว` |
| `GET /api/reviews/room/:slug` | avg + items | ✅ `{avgRating:5, count:1, items:[...]}` |
| Guest name masked in list | yes | ✅ `Test G****` |

**Booking lifecycle (Phase 1D)**

| Case | ผลเดิม |
|---|---|
| BANK_TRANSFER booking → Payment record สร้าง auto | ✅ status PENDING, method BANK_TRANSFER |
| Admin `PATCH /admin/:bookingNumber/payment` APPROVED | ✅ `approvedAt` timestamp set, booking → CONFIRMED |
| Admin `PATCH /admin/:bookingNumber` (status) | ✅ CONFIRMED → CHECKED_IN |
| Booking GET ส่ง `review` field (Phase 2 schema) | ✅ |

**Webhook + charge (`/api/webhooks/chillpay`, `/api/payments/.../charge`)** — รันจริง 2026-06-03

| Case | Expected | Result |
|---|---|---|
| notify ไม่มี `OrderNo` | `{ok:true, ignored:true}` | ✅ |
| notify checksum ผิด | 400 `invalid checksum` | ✅ |
| notify success (`Status=0`) + checksum ถูก ตรง OrderNo | payment APPROVED + booking CONFIRMED + save transactionId | ✅ (ดู A6) |
| notify ไม่ success | payment REJECTED + failureMessage | ⏸ ยังไม่เทส |
| `/charge` method ไม่ถูกต้อง | 400 `method ไม่ถูกต้อง` | ✅ |
| `/charge` booking ไม่มี | 404 `ไม่พบการจอง` | ✅ |
| ⚠️ endpoint `/api/payments/:bookingNumber/refresh` (Omise dev fallback) | **ถูกลบแล้ว** — ChillPay ใช้ webhook ยืนยัน | — |

### A6. ChillPay integration test — ✅ 11/11 ผ่าน (รันจริง 2026-06-03)

รันด้วย tsx script (สร้าง booking+payment จริงใน DB แล้ว cleanup):

| Check | Result |
|---|---|
| `isChillpayEnabled()` (หลังแก้ lazy env) | ✅ |
| `buildPaymentForm` มี field ครบ (MerchantCode/OrderNo/ApiKey/CheckSum/…) | ✅ |
| CheckSum เป็น 32-char hex | ✅ |
| `form.url` ชี้ sandbox-cdn.chillpay.co | ✅ |
| Amount แปลงเป็นสตางค์ (1500 บาท → "150000") | ✅ |
| webhook success → payment **APPROVED** | ✅ |
| `approvedAt` + `chillpayTransactionId` ถูกบันทึก | ✅ |
| booking → **CONFIRMED** | ✅ |
| webhook checksum ปลอม → 400 | ✅ |

> ⚠️ test นี้ยืนยัน checksum **round-trip ภายใน** (เราสร้าง = เรา verify) — ยังไม่ได้พิสูจน์ว่าตรงกับสูตรจริงของ ChillPay ต้องเทียบเอกสารก่อน go-live

---

## B. Manual tests (browser / external services)

### B1. Web — Guest flow
- [ ] `/` แสดงผลถูกต้อง (Hero, Services, Navbar)
- [ ] Toggle TH/EN ใน Navbar → label ในการ์ดเปลี่ยน
- [ ] `/rooms` → ดูการ์ดห้องพัก (ปัจจุบันใช้ mock data)
- [ ] `/rooms/[slug]` → ดูราคา, calendar, **รีวิว** (Phase 2)
- [ ] กด "จองเลย" → ไปหน้า `/booking`
- [ ] กรอกข้อมูล + เลือก method → submit → redirect ไป `/bookings/[bookingNumber]`
- [ ] หน้า booking confirmation:
  - [ ] BANK_TRANSFER — แสดงเลขบัญชี + form อัพโหลดสลิป
  - [ ] PROMPTPAY / CREDIT_CARD / ALIPAY / WECHAT_PAY — ปุ่ม "ชำระผ่าน …" → auto-submit form ไป **ChillPay hosted page** (ต้อง ChillPay keys + verify checksum)
- [ ] หลังจ่ายบน ChillPay → redirect กลับ `?paid=1` → poll จน webhook ยืนยัน → "ชำระเงินสำเร็จ"
- [ ] `/track?bookingNumber=X` — ดูประวัติการจอง

### B2. Web — User auth
- [ ] `/register` → กรอก name + phone + password → save session → redirect `/`
- [ ] Navbar เปลี่ยนเป็น avatar + dropdown
- [ ] `/login` ด้วย phone + password → success
- [ ] กด "ออกจากระบบ" → กลับเป็นปุ่ม "เข้าสู่ระบบ"

### B3. Admin — Operator flow
- [ ] `localhost:3001/login` → super admin login
- [ ] `/dashboard` — stats + quick actions
- [ ] `/operators` — list, approve, suspend (Super Admin)
- [ ] `/rooms` — เพิ่มห้องพัก, toggle, **กด "รูปภาพ"** → upload → set main → delete (ต้อง Supabase)
- [ ] `/tours` — เพิ่มทัวร์, จัดการ schedule, กด "รูปภาพ"
- [ ] `/bookings` — filter ตาม status, click row → detail
- [ ] `/bookings/[bookingNumber]` — approve/reject payment, update status, save note, **กด "พิมพ์"** (sidebar ซ่อน)
- [ ] `/availability` — เพิ่ม block, ลบ block
- [ ] `/seasons` (Phase 2) — เพิ่มราคา high season + radio ROOM/TOUR + multiplier หรือ absolutePrice
- [ ] `/settings` — เปลี่ยนรหัสผ่าน

### B4. Image upload (ต้องตั้ง Supabase Storage ก่อน)
**Setup**: Supabase dashboard → Storage → New bucket `jongjongdi-uploads` (Public) → ใส่ `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` ใน **`apps/api/.env`**

> ⚠️ ตอนนี้ `SUPABASE_SERVICE_ROLE_KEY` ใส่เป็น `sb_publishable_...` (publishable key) — **ผิดประเภท** ต้องเปลี่ยนเป็น service_role key จริง ไม่งั้น upload โดน RLS บล็อก

- [ ] Admin `/rooms` → "รูปภาพ" → อัพไฟล์ → preview → set main → ลบ
- [ ] รูปแรกที่อัพจะ set as main อัตโนมัติ
- [ ] อัพไฟล์ขนาด > 5MB → multer reject (limit 5MB)

### B5. Payment integration — 🆕 ChillPay (hosted redirect)
**Setup**: ใส่ค่าใน **`apps/api/.env`**
```
CHILLPAY_MERCHANT_CODE=...
CHILLPAY_API_KEY=...
CHILLPAY_MD5_SECRET=...
CHILLPAY_PAYMENT_URL=https://sandbox-cdn.chillpay.co/Payment/   # หรือ production
CHILLPAY_RETURN_BASE=http://localhost:3000
CHILLPAY_NOTIFY_URL=<public-url>/api/webhooks/chillpay          # dev: ใช้ ngrok
```

**ก่อนเทสจริง — ต้อง verify [lib/chillpay.ts](apps/api/src/lib/chillpay.ts) กับเอกสาร ChillPay (4 จุด):**
- [ ] `CHILLPAY_PAYMENT_URL` — sandbox vs production ตรงกับ credentials
- [ ] `CHANNEL_CODE` — รหัส ChannelCode ของแต่ละ method (promptpay/creditcard/alipay/wechat)
- [ ] `requestChecksum()` — ลำดับ field ที่ใช้สร้าง MD5 (ผิด = จ่ายไม่ได้)
- [ ] `verifyNotifyChecksum()` + `isNotifySuccess()` — field/รหัสสถานะของ webhook

**Flow ที่ต้องเทส:**
- [ ] เลือก online method → ปุ่ม "ชำระผ่าน …" → POST `/api/payments/:bookingNumber/charge` → ได้ `{url, fields}` → auto-submit form ไป ChillPay
- [ ] จ่ายบน ChillPay hosted page (sandbox) → redirect กลับ `?paid=1`
- [ ] ChillPay ยิง `POST /api/webhooks/chillpay` → checksum ผ่าน → payment APPROVED + booking CONFIRMED + ส่ง email
- [ ] amount ที่ส่งไป ChillPay = บาท × 100 (สตางค์) — ยืนยันยอดถูกต้องบนหน้า ChillPay
- [ ] ตั้ง Return URL / Notify URL ใน ChillPay dashboard (ถ้าจำเป็นต้อง whitelist)

### B6. Email (ต้อง Resend keys)
**Setup**: Resend → API Key → ใส่ `RESEND_API_KEY` + `EMAIL_FROM` ใน **`apps/api/.env`** + verify domain ของ `EMAIL_FROM`

- [ ] Admin approve slip → ลูกค้าได้ email "ยืนยันการจองสำเร็จ"
- [ ] ChillPay webhook success (paid) → ลูกค้าได้ email
- [ ] Cron 09:00 Asia/Bangkok → booking CONFIRMED check-in พรุ่งนี้ → ได้ email "พรุ่งนี้แล้วนะ"
  - ทดสอบ manually: เรียก `runReminders()` ผ่าน `pnpm --filter @jongjongdi/api exec tsx -e "..."`

### B7. Review (Phase 2)
- [x] **เทส API แล้ว** — UI ยังต้องลองในเบราว์เซอร์:
- [ ] Booking ที่ CHECKED_IN/COMPLETED → ปุ่ม "เขียนรีวิว" บน `/bookings/[bookingNumber]`
- [ ] กรอก rating + comment → save → แสดงในหน้าเดียวกัน + ใน `/rooms/[slug]` (เมื่อย้ายไป API จริง)

---

## C. Edge cases / Negative tests

| Case | Status |
|---|---|
| อัพสลิปไม่ใช่รูป (sharp parse fail) | ⏸ ต้องเทส manual |
| สลิป > 5MB → multer 413 | ⏸ |
| Booking หมดอายุ 24 ชม. ไม่จ่าย → CANCELLED | ⚠️ ยังไม่มี cron นี้ (TODO) |
| รีวิวซ้ำ | ✅ เทสแล้ว → 409 (รอ DB กลับมายืนยันซ้ำ) |
| รีวิวด้วย phone ผิด | ✅ เทสแล้ว → 403 |
| Operator B เข้าถึงข้อมูล Operator A | ⏸ ต้องเทส (multi-tenant) — ปัจจุบัน admin/list ไม่กรอง operatorId |
| ChillPay webhook payload ไม่มี OrderNo | ⏸ ต้องเทส → `{ok:true, ignored:true}` |
| ChillPay webhook checksum ผิด | ⏸ ต้องเทส → 400 |

---

## D. Production readiness

| Item | Status |
|---|---|
| `DATABASE_URL` (api + database) | ✅ connect ได้ (Supabase pooler) |
| `JWT_SECRET` | ✅ set (แนะนำเปลี่ยนเป็น random ≥32 chars ก่อน prod) |
| `CHILLPAY_MERCHANT_CODE` / `API_KEY` / `MD5_SECRET` | ✅ ใส่แล้ว + lib อ่านได้ (A6 ผ่าน) — เหลือ verify checksum กับเอกสาร + เทส payment จริง |
| `CHILLPAY_PAYMENT_URL` | ⚠️ ปัจจุบัน sandbox — เปลี่ยนเป็น `https://cdn.chillpay.co/Payment/` ตอน prod |
| `CHILLPAY_RETURN_BASE` | ⚠️ ปัจจุบัน localhost:3000 — ชี้ production URL ตอน deploy |
| `CHILLPAY_NOTIFY_URL` | ⚠️ ต้องเป็น public URL (dev: ngrok) |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | ⛔ URL ชี้ project ที่หาย + key เป็น publishable (ต้องใช้ service_role) |
| Supabase bucket `jongjongdi-uploads` (Public) | ⏸ ยังไม่สร้าง |
| `RESEND_API_KEY` / `EMAIL_FROM` | ⏸ ยังไม่ set (email, cron skipped) — รอ verify domain |
| Resend domain verified | ⏸ กำลัง map DNS |
| ChillPay Return/Notify URL ใน dashboard | ⏸ |
| Cron timezone `Asia/Bangkok` | ✅ ตั้งในโค้ดแล้ว |
| CORS origins สำหรับ production domain | ⚠️ ปัจจุบันเป็น localhost — ต้องเปลี่ยนตอน deploy |

---

## สิ่งที่ทดสอบไม่ได้ตอนนี้ (รอ setup)

1. **Super admin endpoints (A3 #4/5/6)** — ต้องใช้ super admin email/password ที่ผมไม่มี
2. **Supabase Storage** — image upload (rooms/tours), slip upload — ต้องสร้าง bucket + ใส่ **service_role key** จริง (ตอนนี้เป็น publishable key)
3. **ChillPay payment ของจริง** — backend flow ผ่านเทสแล้ว (A6) เหลือ: verify checksum/channel กับเอกสาร ChillPay + user ลองจ่ายจริงผ่าน sandbox + ngrok สำหรับ NotifyUrl
4. **Resend email** — confirmation, reminder cron — ต้องตั้ง API key + verify domain (กำลัง map DNS)
5. **UI flows ทั้งหมด** — ผมไม่มี browser access; เทสได้แค่ API
6. **Multi-tenant isolation** — Operator A ไม่ควรเห็นข้อมูล Operator B (admin/list ปัจจุบันไม่กรอง operatorId)
7. **Booking expiry cron** — ยังไม่ได้ implement (CANCELLED auto หลัง 24 ชม.)
