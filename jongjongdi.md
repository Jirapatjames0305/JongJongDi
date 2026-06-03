# JongJongDi — Booking System
# jongjongdi.com

# Project Goal

สร้างระบบ Booking สำหรับที่พักและทัวร์ดำน้ำ

เป้าหมาย:

* รับ booking จริงได้
* ลูกค้าเช็ค availability เองได้
* จ่ายเงินออนไลน์ได้
* Admin จัดการได้จาก backoffice

---

# System Overview

ระบบแบ่งเป็น 3 ส่วนหลัก

```text
1. Customer Website (jongjongdi.com)
2. Admin Backoffice
3. API Backend
```

---

# Phase 1 — ที่พัก + ทัวร์ดำน้ำ

## 1. Customer Website

### Purpose

เว็บไซต์สำหรับลูกค้า:

* ดูห้องพัก / ทัวร์
* เช็ค availability
* จอง + ชำระเงิน
* ดูสถานะการจอง

---

### Main Features

```text
- Room / Tour Listing
- Availability Calendar
- Booking Form (guest checkout)
- Online Payment (Omise)
- Booking Confirmation (email)
- Booking Lookup (by phone / email)
- Mobile-first
- TH / EN
```

---

## 2. Admin Backoffice

### Purpose

ระบบหลังบ้านสำหรับเจ้าของ

---

### Features

#### Dashboard

```text
- bookings today
- pending bookings
- upcoming check-in (7 วัน)
- revenue summary
```

---

#### Booking Management

```text
- ดู booking ทั้งหมด
- filter ตาม status / วันที่ / ประเภท
- approve / reject booking
- เปลี่ยน status
- add internal note
- ดู payment slip (manual)
```

---

#### Availability Management

```text
- ตั้งวันหยุด / วันปิด
- จำนวนที่พัก / seats ต่อรอบ
- ราคาตามช่วงเวลา (high season)
- block วัน
```

---

#### Room / Tour Management

```text
- เพิ่ม / แก้ไข ห้องพัก
- เพิ่ม / แก้ไข แพ็คเกจทัวร์
- upload รูป
- ราคา / เงื่อนไข
- จำนวนที่นั่ง (ทัวร์)
```

---

#### Customer Management

```text
- ดูข้อมูลลูกค้า
- booking history
- notes
- blacklist
```

---

#### Payment Management

```text
- ตรวจสลิป (manual)
- approve / reject
- refund (manual)
- ดู Omise charge status
```

---

## 3. API Backend

### Endpoints หลัก

```text
GET  /api/rooms                          list ห้อง + ราคา
GET  /api/rooms/:slug                    detail + availability
GET  /api/tours                          list ทัวร์
GET  /api/tours/:slug                    detail + schedule
GET  /api/availability?type=&id=&month=  calendar availability
POST /api/bookings                       สร้าง booking (guest)
GET  /api/bookings/:bookingNumber        ดูสถานะ
POST /api/bookings/lookup                ค้นหา booking by phone
POST /api/webhooks/omise                 รับ payment event
```

Admin (Bearer token):

```text
GET    /api/admin/stats
GET    /api/admin/bookings
GET    /api/admin/bookings/:bookingNumber
PATCH  /api/admin/bookings/:bookingNumber
POST   /api/admin/payments/:id/approve
POST   /api/admin/payments/:id/reject
POST   /api/admin/payments/:id/refund
POST   /api/admin/payments/:id/refresh-omise
GET    /api/admin/customers
GET    /api/admin/customers/:id
PATCH  /api/admin/customers/:id
POST   /api/admin/customers/:id/notes
GET    /api/admin/rooms
POST   /api/admin/rooms
PATCH  /api/admin/rooms/:id
GET    /api/admin/tours
POST   /api/admin/tours
PATCH  /api/admin/tours/:id
POST   /api/admin/availability/block
DELETE /api/admin/availability/block/:id
POST   /api/admin/uploads
```

---

# Business Flow

```text
ลูกค้าเข้าเว็บ
↓
เลือกห้อง / ทัวร์
↓
เลือกวันที่ / จำนวนคน
↓
ระบบเช็ค availability
↓
กรอกข้อมูล (guest)
↓
เลือกวิธีชำระเงิน
↓
ชำระเงิน
↓
ระบบสร้าง Booking
↓
Admin ได้รับแจ้งเตือน
↓
Admin confirm
↓
ลูกค้าได้รับ confirmation
```

---

# Booking Type

```text
ACCOMMODATION  ← ที่พัก (date range)
DIVE_TOUR      ← ทัวร์ดำน้ำ (departure date + time slot)
```

---

# Booking Status Flow

```text
PENDING_PAYMENT
↓
PENDING_CONFIRM   (จ่ายแล้ว รอ Admin ยืนยัน)
↓
CONFIRMED
↓
CHECKED_IN        (วันเช็คอิน)
↓
COMPLETED
```

กรณีพิเศษ:

```text
CANCELLED
REFUNDED
NO_SHOW
```

---

# Availability Logic

## ที่พัก

```text
วัน = available ถ้า:
  - ไม่มี booking CONFIRMED ในช่วงวันนั้น
  - ไม่ถูก block โดย admin
  - ยังมีห้องว่าง (quantity - confirmed bookings > 0)
```

## ทัวร์ดำน้ำ

```text
รอบ = available ถ้า:
  - จำนวน booking CONFIRMED < maxSeats
  - วันไม่ถูก block
  - booking deadline ยังไม่ผ่าน
```

---

# Payment System

## Phase 1 — Manual + Omise

```text
ช่องทาง:
  - โอนธนาคาร (แนบสลิป)
  - Omise: PromptPay / บัตรเครดิต
```

Manual flow:

```text
ลูกค้าโอน
↓
แนบสลิปในระบบ
↓
Admin ตรวจ + approve
↓
Booking = CONFIRMED
```

Omise flow:

```text
ลูกค้าชำระผ่าน Omise
↓
Webhook อัปเดต payment
↓
Booking = PENDING_CONFIRM
↓
Admin confirm
↓
CONFIRMED
```

## Phase 2

เพิ่ม:

* Alipay / WeChat Pay (นักท่องเที่ยวจีน)
* Stripe (นักท่องเที่ยวต่างชาติ)

---

# Customer Strategy

## Phase 1 — Guest Booking

```text
ลูกค้าจองได้โดยไม่ต้อง login
กรอกแค่:
  - ชื่อ
  - เบอร์โทร
  - อีเมล (สำหรับ confirmation)
  - จำนวนผู้เข้าพัก
```

Auto account creation หลังจอง (เหมือน SiamBox)

## Phase 2

เพิ่ม:

* OTP Login
* Booking history
* Loyalty / repeat customer

---

# Notification

## Phase 1

```text
Email:
  - Booking confirmation → ลูกค้า
  - New booking alert → Admin
  - Reminder (1 วันก่อน check-in) → ลูกค้า
```

## Phase 2

เพิ่ม:

* LINE Notify / LINE OA
* SMS

---

# Recommended Tech Stack

## Frontend (apps/web)

* Next.js 15 + React 19
* TypeScript 5.7 (strict)
* Tailwind CSS 3.4
* shadcn/ui
* next-intl (TH / EN)

## Admin (apps/admin)

* Next.js 15
* TypeScript
* Tailwind CSS
* shadcn/ui
* React Hook Form + Zod

## Backend (apps/api)

* Express.js
* Prisma 6
* Zod (validation)
* Omise SDK
* Resend (email)
* multer + sharp (image upload)

## Database

* PostgreSQL (Supabase)

## Storage

* Cloudflare R2 (รูปห้อง / ทัวร์)

## Monorepo

* Turborepo + pnpm 9

---

# Workspace Structure

```text
JongJongDi/
├── apps/
│   ├── web/        Next.js 15 — customer site     port 3000
│   ├── admin/      Next.js 15 — backoffice         port 3001
│   └── api/        Express + Prisma — REST API     port 4000
├── packages/
│   ├── database/   Prisma schema + client (@jongjongdi/database)
│   ├── shared/     Zod schemas, enums, helpers (@jongjongdi/shared)
│   └── ui/         shared components (@jongjongdi/ui)
├── turbo.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── .env.example
```

---

# Suggested Database Tables

```text
users
rooms                   ← ห้องพัก
room_images
tours                   ← แพ็คเกจทัวร์
tour_schedules          ← รอบ / departure
tour_images
availability_blocks     ← วันที่ปิด / block
bookings
booking_items           ← รายการใน booking
payments
customer_notes
```

---

# Prisma Models (เบื้องต้น)

```text
User
  id, name, phone, email, role, status, createdAt

Room
  id, slug, nameEn, nameTh, descriptionEn, descriptionTh
  pricePerNight, maxGuests, quantity, isActive

RoomImage
  id, roomId, url, isMain, order

Tour
  id, slug, nameEn, nameTh, descriptionEn, descriptionTh
  pricePerPerson, maxSeats, durationHours, isActive

TourSchedule
  id, tourId, departureDate, departureTime, availableSeats

AvailabilityBlock
  id, targetType (ROOM|TOUR), targetId, startDate, endDate, reason

Booking
  id, bookingNumber, type (ACCOMMODATION|DIVE_TOUR)
  userId?, guestName, guestPhone, guestEmail
  checkInDate?, checkOutDate?         ← ที่พัก
  tourScheduleId?                      ← ทัวร์
  numGuests, totalAmount, status
  internalNote, createdAt

Payment
  id, bookingId, amount, method, status
  slipUrl?, omiseChargeId?, failureMessage
  createdAt

User (customer auto-created)
CustomerNote
```

---

# Enums

```text
BookingType:    ACCOMMODATION | DIVE_TOUR
BookingStatus:  PENDING_PAYMENT | PENDING_CONFIRM | CONFIRMED
                CHECKED_IN | COMPLETED | CANCELLED | REFUNDED | NO_SHOW
PaymentStatus:  PENDING | APPROVED | REJECTED | REFUNDED
PaymentMethod:  BANK_TRANSFER | PROMPTPAY | CREDIT_CARD | ALIPAY | WECHAT_PAY
UserRole:       ADMIN | CUSTOMER
CustomerStatus: ACTIVE | BLACKLISTED
```

---

# Deployment

## Stack

```text
web + admin  → Vercel (free tier)
api          → Railway Starter (~$5/mo)
database     → Supabase PostgreSQL (free / $25 upgrade)
storage      → Cloudflare R2 (free 10GB)
email        → Resend (free 3,000/mo)
domain       → jongjongdi.com (DirectAdmin DNS → Vercel)
```

## Domain Setup

```text
jongjongdi.com        → web (Vercel)
admin.jongjongdi.com  → admin (Vercel)
api.jongjongdi.com    → api (Railway)
```

DNS ตั้งที่ DirectAdmin → ชี้ไป Vercel / Railway

---

# Infrastructure Notes

## Avoid

```text
- Google Fonts (ใช้ system font หรือ Bunny Fonts แทน)
- Firebase
```

## Use

```text
- Cloudflare CDN (ผ่าน Vercel)
- Supabase Session Pooler (ไม่ใช้ Direct Connection)
```

Supabase connection note (จาก SiamBox):

```text
ห้ามใช้ Direct Connection (db.<ref>.supabase.co:5432)
  เพราะมีแต่ IPv6
ใช้ Session Pooler:
  aws-1-ap-southeast-1.pooler.supabase.com:5432
  username: postgres.<project-ref>
```

---

# Development Phases

## Phase 0 — Foundation

```text
[x] Monorepo scaffold (Turborepo + pnpm)
[x] TypeScript + ESLint config
[x] Prisma schema + DB setup
[x] Supabase project — เชื่อมต่อแล้ว (Session Pooler ap-southeast-1)
[x] .env.example
[x] prisma db push — tables ครบใน DB แล้ว
```

---

## Phase 1A — Core Booking Flow

```text
[x] Room listing + detail page
[x] Availability calendar (อ่าน availability จาก DB)
[x] Booking form (guest)
[x] สร้าง Booking + Payment ใน DB  ← API endpoints พร้อม รอ DB จริง
[x] Booking confirmation page (/bookings/:bookingNumber)
[x] Booking lookup by phone (/track)
[x] User register / login (phone + password)
[x] Navbar แสดงชื่อ user + dropdown (การจองของฉัน / ออกจากระบบ)
```

---

## Phase 1B — Admin Backoffice

```text
[x] Operator registration (สมัครเป็นผู้ประกอบการ)
[x] Login (JWT-based, bcrypt password)
[x] Dashboard (stats)
[x] Operator management — approve / suspend (Super Admin)
[x] Change password
[x] Booking list + filter (by status)
[x] Booking detail + status update (confirm / check-in / complete / cancel)
[x] Payment approve / reject
[x] Availability block management (ปิดวัน room / tour)
```

---

## Phase 1C — Tour Booking

```text
[x] Tour listing + detail
[x] Tour schedule management (admin) — เพิ่ม/ลบรอบออกเดินทาง
[x] Seat availability check
[x] Booking flow สำหรับ tour (เหมือน room แต่เลือก departure date)
```

---

## Phase 1D — Payment

```text
[x] Bank transfer + slip upload
[x] Omise PromptPay
[x] Omise credit card
[x] Webhook handler
[x] Email confirmation (Resend)
```

---

## Phase 1E — Polish

```text
[x] Mobile responsive (review — already covered with md:/lg: breakpoints)
[x] TH / EN — minimum: language toggle + pick(th, en) helper (no full next-intl routing)
[x] Image upload (Supabase Storage) — room/tour images
[x] Admin: print booking summary
[x] SEO basic (meta, og)
```

---

## Phase 2 — Growth

```text
[ ] LINE Notify แจ้ง admin            ← LINE Notify ถูกปิดบริการ มี.ค. 2025 (รอเลือก replacement)
[x] Reminder email (1 วันก่อน)
[x] High season pricing
[x] Review system
[x] Alipay / WeChat Pay (นักท่องเที่ยวจีน)
[ ] Customer login (OTP)              ← ต้อง setup SMS provider (Twilio / Firebase / Thai SMS)
```

---

# Build Progress

## Phase 0 — Foundation ✅

- Monorepo (Turborepo + pnpm workspace) พร้อม
- packages/database — Prisma schema ครบทุก model
- packages/shared — enums + Zod validation schemas
- apps/web — Next.js 15 + Tailwind v4
- apps/api — Express + Prisma routes (rooms, tours, bookings)
- .env.example + .gitignore + ESLint config
- Supabase PostgreSQL เชื่อมต่อแล้ว + `prisma db push` สร้าง tables ครบ
- API startup log แสดง env/DB status ตอน boot
- dotenv โหลด .env จาก root ใน apps/api

## Phase 1A — Core Booking Flow ✅

- /rooms — listing page
- /rooms/[slug] — detail + AvailabilityCalendar + booking card
- /booking — booking form (guest checkout)
- /bookings/[bookingNumber] — confirmation page
- /track — booking lookup by phone
- /login — user login (phone + password)
- /register — user register
- Navbar: แสดงชื่อ user + dropdown เมื่อ login, ปุ่มสมัคร/เข้าสู่ระบบเมื่อยังไม่ login
- API: POST /api/users/register, /api/users/login, GET /api/users/me

## Phase 1C — Tour Booking ✅ (UI + API skeleton)

- /tours — listing page
- /tours/[slug] — detail + schedule selector + booking card
- booking flow สำหรับ tour เสร็จแล้ว

## Phase 1C — Tour Booking ✅

## Phase 1B — Admin Backoffice ✅

- apps/admin — Next.js 15 (port 3001)
- /login — JWT auth
- /register — ผู้ประกอบการสมัครเอง (status: PENDING → รอ approve)
- /dashboard — stats + quick actions
- /operators — Super Admin: approve/suspend operators
- /bookings — booking list พร้อม filter tabs (status)
- /bookings/[bookingNumber] — detail + update status + payment approve/reject + internal note
- /availability — block วันสำหรับ room / tour
- /settings — เปลี่ยนรหัสผ่าน
- API: POST /api/auth/register, /login, /me, /change-password
- API: GET/PATCH /api/operators (Super Admin)
- API: GET/PATCH /api/bookings/admin/list|:bookingNumber|:bookingNumber/payment
- API: GET/POST/DELETE /api/availability/blocks
- Operator model — multi-tenant: Room/Tour ผูกกับ operatorId
- /rooms — list + เพิ่มห้องพัก + toggle active
- /tours — list + เพิ่มทัวร์ + จัดการรอบออกเดินทาง (schedule CRUD)

## Super Admin Account (คุณ)

```
Email   : jongjongdisupport@gmail.com
Password: 12345  ← เปลี่ยนหลังเข้าสู่ระบบครั้งแรก
Role    : SUPER_ADMIN
Status  : ACTIVE — สร้างใน DB แล้ว (bcrypt จริง)
```

> seed.ts ลบแล้ว (ไม่ขึ้น git) — account อยู่ใน DB เรียบร้อย

## Phase 1D — Payment ✅

- Schema: Payment เพิ่ม `omiseChargeId @unique`, `omiseSourceId`, `approvedAt`, `rejectedAt`
- API lib: `lib/supabase.ts` (Storage), `lib/omise.ts` (Omise SDK), `lib/email.ts` (Resend)
- API: `POST /api/payments/:bookingNumber/slip` — upload สลิป → Supabase Storage (sharp → webp, max 1200x1600)
- API: `POST /api/payments/:bookingNumber/charge` — สร้าง Omise charge (PromptPay source หรือ credit card token)
- API: `POST /api/payments/:bookingNumber/refresh` — ดึง charge status จาก Omise (dev polling)
- API: `POST /api/webhooks/omise` — รับ webhook + re-verify ผ่าน Omise API → sync status + ส่ง email
- Admin approve slip → ส่ง email ยืนยันการจองอัตโนมัติ
- Frontend `/bookings/[bookingNumber]`: fetch booking + แสดง payment UI ตาม method
  - BANK_TRANSFER: แสดงเลขบัญชี + form อัพโหลดสลิป
  - PROMPTPAY: ปุ่มสร้าง QR → แสดง QR + auto-poll status ทุก 5 วินาที
  - CREDIT_CARD: form กรอกบัตร → Omise.js tokenize → POST /charge
- Resend email: HTML template ภาษาไทย พร้อมลิงก์กลับมาที่หน้า booking

## Phase 1E — Polish ✅

- API lib: `lib/upload.ts` (sharp → webp ≤1600x1600 → Supabase Storage)
- API: `GET/POST /api/rooms/:id/images`, `PATCH/DELETE /api/rooms/images/:imageId`
- API: `GET/POST /api/tours/:id/images`, `PATCH/DELETE /api/tours/images/:imageId`
- Admin `<ImageManager>` component → ปุ่ม "รูปภาพ" ใน `/rooms`, `/tours` (อัพโหลด, set main, ลบ)
- Admin booking detail: ปุ่ม "พิมพ์" + `@media print` ซ่อน sidebar/buttons
- SEO: root `layout.tsx` เพิ่ม `metadataBase`, openGraph, twitter, robots; `app/opengraph-image.tsx` สร้าง OG 1200x630 อัตโนมัติด้วย next/og
- i18n minimum: `lib/lang.ts` (`useLang`, `pick(th, en, lang)`) + toggle TH/EN ใน Navbar
- Applied i18n ใน RoomCard, TourCard, /rooms/[slug], /tours/[slug]
- Note: รูป list/detail ฝั่งเว็บยังใช้ mock data — เมื่อย้ายไปใช้ API จริง `RoomImage`/`TourImage` records จะแสดงผลอัตโนมัติ

## Phase 2 — Growth ✅ (4/6)

- **Reminder email** ([apps/api/src/jobs/reminders.ts](apps/api/src/jobs/reminders.ts))
  - `node-cron` schedule `0 9 * * *` Asia/Bangkok
  - หาการจอง CONFIRMED ที่ checkIn / departureDate = พรุ่งนี้ → ส่ง email
  - `sendBookingReminder()` ใน `lib/email.ts`
- **Review system**
  - Prisma: `Review { bookingId @unique, userId, rating, comment }`
  - API: `POST /api/reviews/:bookingNumber` (verify ด้วย guestPhone, ต้อง CHECKED_IN/COMPLETED),
    `GET /api/reviews/room/:slug`, `/api/reviews/tour/:slug` (avg rating + list)
  - UI: `<ReviewModal>` (5 ดาว + comment) ที่ /bookings/[bookingNumber] เมื่อ status พร้อม
  - UI: `<ReviewList>` แสดงรีวิวใน /rooms/[slug] และ /tours/[slug] (mask ชื่อผู้รีวิว)
- **Alipay / WeChat Pay** — extend `POST /api/payments/:bookingNumber/charge` รับ method ALIPAY|WECHAT_PAY (Omise source flow), หน้า booking มี `<OnlineRedirectSection>` พา redirect ไป Omise authorize_uri
- **High season pricing**
  - Prisma: `SeasonPrice { roomId | tourId, startDate, endDate, multiplier | absolutePrice }`
  - API: `GET/POST/DELETE /api/seasons` (requireOperator)
  - Booking total ใช้ `lib/pricing.ts`: `calcRoomTotal()` คำนวณ rate ราย-คืน, `effectiveTourPrice()` ราย-รอบ
  - Admin: `/seasons` page (เพิ่ม/ลบ ราคาช่วงเทศกาล) + เพิ่มเมนู AdminShell

**ยังไม่ได้ทำ** (blocker — รอ user เลือก replacement / provider):
- LINE Notify — ปิดบริการแล้ว ต้องเลือก LINE Messaging API หรือ webhook ตัวอื่น (Discord/Telegram)
- Customer OTP login — ต้องเลือก SMS provider (Twilio / Firebase Auth / Thai SMS gateway)

## รอดำเนินการถัดไป

1. ย้าย `/rooms` / `/tours` listing & detail จาก mock data → fetch จาก API จริง
2. ขยาย i18n: เพิ่ม `pick()` ใน Hero, ServicesSection, Footer, booking form, /track ฯลฯ
3. ตั้งค่า keys ใน .env:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Storage → bucket `jongjongdi-uploads` public)
   - `OMISE_PUBLIC_KEY`, `OMISE_SECRET_KEY`, `NEXT_PUBLIC_OMISE_PUBLIC_KEY` (จาก Omise dashboard)
   - `RESEND_API_KEY`, `EMAIL_FROM` (verify domain ใน Resend)
4. ตั้ง Omise webhook URL: `<API_URL>/api/webhooks/omise`
5. Phase 2 ที่เหลือ — LINE replacement + OTP provider (ต้องเลือกก่อนเริ่ม)
