import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@jongjongdi/database";

const router = Router();
// Read env lazily (not at import time) — dotenv loads .env after this module is imported,
// so a top-level const would capture undefined → "dev-secret".
const jwtSecret = () => process.env.JWT_SECRET ?? "dev-secret";

// POST /api/users/register
router.post("/register", async (req, res) => {
  const { name, phone, email, password } = req.body as {
    name: string;
    phone: string;
    email?: string;
    password: string;
  };

  if (!name || !phone || !password) {
    res.status(400).json({ error: "กรุณากรอกชื่อ เบอร์โทร และรหัสผ่าน" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    res.status(409).json({ error: "เบอร์โทรนี้ถูกใช้งานแล้ว" });
    return;
  }

  if (email) {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      res.status(409).json({ error: "อีเมลนี้ถูกใช้งานแล้ว" });
      return;
    }
  }

  const { referralCode: inputReferralCode } = req.body as { referralCode?: string };

  // ตรวจสอบ referral code ถ้ามี
  let referrer: { id: string } | null = null;
  if (inputReferralCode?.trim()) {
    referrer = await prisma.user.findUnique({
      where: { referralCode: inputReferralCode.trim().toUpperCase() },
      select: { id: true },
    });
  }

  // สร้าง referral code ใหม่ที่ unique
  let referralCode: string | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = "JJD" + Array.from({ length: 6 }, () =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]
    ).join("");
    const exists = await prisma.user.findUnique({ where: { referralCode: candidate } });
    if (!exists) { referralCode = candidate; break; }
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name, phone, email: email || undefined, passwordHash,
      referralCode: referralCode ?? undefined,
      referredById: referrer?.id ?? undefined,
    },
    select: { id: true, name: true, phone: true, email: true, role: true },
  });

  // มอบคูปองรางวัลการชวนเพื่อน
  if (referrer) {
    const rewardCoupon = await prisma.coupon.findUnique({ where: { code: "REFERRAL_BONUS" } });
    if (rewardCoupon) {
      // ใหม่รับ REFERRAL_NEW
      await prisma.userCoupon.create({
        data: { userId: user.id, couponId: rewardCoupon.id, source: "REFERRAL_NEW" },
      }).catch(() => null);
      // ผู้ชวนรับ REFERRAL_REWARD (อนุญาตรับหลายครั้ง)
      await prisma.userCoupon.create({
        data: { userId: referrer.id, couponId: rewardCoupon.id, source: "REFERRAL_REWARD" },
      }).catch(() => null);
      await prisma.coupon.update({
        where: { id: rewardCoupon.id },
        data: { usageCount: { increment: 2 } },
      }).catch(() => null);
    }
  }

  const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role }, jwtSecret(), { expiresIn: "30d" });
  res.status(201).json({ token, user });
});

// POST /api/users/login
router.post("/login", async (req, res) => {
  const { phone, password } = req.body as { phone: string; password: string };

  if (!phone || !password) {
    res.status(400).json({ error: "กรุณากรอกเบอร์โทรและรหัสผ่าน" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง" });
    return;
  }
  if (user.status === "BLACKLISTED") {
    res.status(403).json({ error: "บัญชีนี้ถูกระงับการใช้งาน" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง" });
    return;
  }

  const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role }, jwtSecret(), { expiresIn: "30d" });
  res.json({ token, user: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role } });
});

function authUser(req: import("express").Request): { id: string; phone: string } | null {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  try { return jwt.verify(token, jwtSecret()) as { id: string; phone: string }; }
  catch { return null; }
}

// GET /api/users/me
router.get("/me", async (req, res) => {
  const payload = authUser(req);
  if (!payload) { res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" }); return; }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, name: true, phone: true, email: true, role: true, status: true },
  });
  if (!user) { res.status(404).json({ error: "ไม่พบผู้ใช้" }); return; }
  res.json(user);
});

// PATCH /api/users/me — update name / email
router.patch("/me", async (req, res) => {
  const payload = authUser(req);
  if (!payload) { res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" }); return; }

  const { name, email } = req.body as { name?: string; email?: string };
  const data: Record<string, unknown> = {};
  if (name !== undefined) {
    if (!name.trim()) { res.status(400).json({ error: "ชื่อไม่ควรว่าง" }); return; }
    data.name = name.trim();
  }
  if (email !== undefined) {
    data.email = email === "" ? null : email;
    if (email) {
      const dup = await prisma.user.findFirst({ where: { email, NOT: { id: payload.id } } });
      if (dup) { res.status(409).json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }); return; }
    }
  }
  const user = await prisma.user.update({
    where: { id: payload.id },
    data,
    select: { id: true, name: true, phone: true, email: true, role: true },
  });
  res.json(user);
});

// POST /api/users/me/change-password
router.post("/me/change-password", async (req, res) => {
  const payload = authUser(req);
  if (!payload) { res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" }); return; }

  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
  if (!currentPassword || !newPassword) { res.status(400).json({ error: "กรุณากรอกรหัสผ่านให้ครบ" }); return; }
  if (newPassword.length < 6) { res.status(400).json({ error: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร" }); return; }

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user || !user.passwordHash) { res.status(404).json({ error: "ไม่พบผู้ใช้" }); return; }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) { res.status(401).json({ error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" }); return; }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: payload.id }, data: { passwordHash } });
  res.json({ ok: true });
});

// GET /api/users/me/referral
router.get("/me/referral", async (req, res) => {
  const payload = authUser(req);
  if (!payload) { res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" }); return; }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      referralCode: true,
      _count: { select: { referrals: true } },
    },
  });
  if (!user) { res.status(404).json({ error: "ไม่พบผู้ใช้" }); return; }

  res.json({
    referralCode: user.referralCode,
    referralCount: user._count.referrals,
  });
});

// GET /api/users/me/cards
router.get("/me/cards", async (req, res) => {
  const payload = authUser(req);
  if (!payload) { res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" }); return; }
  const cards = await prisma.savedCard.findMany({
    where: { userId: payload.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  res.json(cards);
});

// POST /api/users/me/cards
router.post("/me/cards", async (req, res) => {
  const payload = authUser(req);
  if (!payload) { res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" }); return; }

  const { nickname, cardType, lastFour, expiryMonth, expiryYear, cardHolder, isDefault } = req.body as {
    nickname?: string; cardType: string; lastFour: string;
    expiryMonth: number; expiryYear: number; cardHolder: string; isDefault?: boolean;
  };

  if (!cardType || !lastFour || !expiryMonth || !expiryYear || !cardHolder) {
    res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบ" }); return;
  }
  if (!/^\d{4}$/.test(lastFour)) { res.status(400).json({ error: "เลขบัตร 4 หลักสุดท้ายต้องเป็นตัวเลขเท่านั้น" }); return; }

  const count = await prisma.savedCard.count({ where: { userId: payload.id } });
  if (count >= 5) { res.status(400).json({ error: "บันทึกได้สูงสุด 5 บัตร" }); return; }

  if (isDefault) {
    await prisma.savedCard.updateMany({ where: { userId: payload.id }, data: { isDefault: false } });
  }
  const firstCard = count === 0;
  const card = await prisma.savedCard.create({
    data: {
      userId: payload.id, nickname: nickname?.trim() || null,
      cardType: cardType as import("@jongjongdi/database").CardType,
      lastFour, expiryMonth, expiryYear,
      cardHolder: cardHolder.trim().toUpperCase(),
      isDefault: isDefault || firstCard,
    },
  });
  res.status(201).json(card);
});

// PATCH /api/users/me/cards/:id/default
router.patch("/me/cards/:id/default", async (req, res) => {
  const payload = authUser(req);
  if (!payload) { res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" }); return; }

  const card = await prisma.savedCard.findFirst({ where: { id: req.params.id, userId: payload.id } });
  if (!card) { res.status(404).json({ error: "ไม่พบบัตร" }); return; }

  await prisma.savedCard.updateMany({ where: { userId: payload.id }, data: { isDefault: false } });
  await prisma.savedCard.update({ where: { id: req.params.id }, data: { isDefault: true } });
  res.json({ ok: true });
});

// DELETE /api/users/me/cards/:id
router.delete("/me/cards/:id", async (req, res) => {
  const payload = authUser(req);
  if (!payload) { res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" }); return; }

  const card = await prisma.savedCard.findFirst({ where: { id: req.params.id, userId: payload.id } });
  if (!card) { res.status(404).json({ error: "ไม่พบบัตร" }); return; }

  await prisma.savedCard.delete({ where: { id: req.params.id } });

  // ถ้าลบบัตร default ให้ตั้งค่าบัตรแรกที่เหลือเป็น default แทน
  if (card.isDefault) {
    const next = await prisma.savedCard.findFirst({ where: { userId: payload.id }, orderBy: { createdAt: "asc" } });
    if (next) await prisma.savedCard.update({ where: { id: next.id }, data: { isDefault: true } });
  }
  res.json({ ok: true });
});

// GET /api/users/me/vouchers
router.get("/me/vouchers", async (req, res) => {
  const payload = authUser(req);
  if (!payload) { res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" }); return; }

  const vouchers = await prisma.userCoupon.findMany({
    where: { userId: payload.id },
    include: { coupon: true },
    orderBy: { claimedAt: "desc" },
  });
  res.json(vouchers);
});

// POST /api/users/me/vouchers/claim
router.post("/me/vouchers/claim", async (req, res) => {
  const payload = authUser(req);
  if (!payload) { res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" }); return; }

  const { code } = req.body as { code: string };
  if (!code?.trim()) { res.status(400).json({ error: "กรุณาระบุรหัสคูปอง" }); return; }

  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!coupon || !coupon.isActive) { res.status(404).json({ error: "ไม่พบคูปองนี้" }); return; }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) { res.status(400).json({ error: "คูปองหมดอายุแล้ว" }); return; }
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) { res.status(400).json({ error: "คูปองถูกใช้ครบแล้ว" }); return; }

  const existing = await prisma.userCoupon.findFirst({
    where: { userId: payload.id, couponId: coupon.id, source: "CLAIM" },
  });
  if (existing) { res.status(409).json({ error: "คุณเคยรับคูปองนี้แล้ว" }); return; }

  const userCoupon = await prisma.userCoupon.create({
    data: { userId: payload.id, couponId: coupon.id, source: "CLAIM" },
    include: { coupon: true },
  });
  await prisma.coupon.update({ where: { id: coupon.id }, data: { usageCount: { increment: 1 } } });
  res.status(201).json(userCoupon);
});

// GET /api/users/me/bookings — bookings ของ user ที่ login (lookup by phone)
router.get("/me/bookings", async (req, res) => {
  const payload = authUser(req);
  if (!payload) { res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" }); return; }

  const bookings = await prisma.booking.findMany({
    where: { guestPhone: payload.phone },
    include: {
      room: { select: { nameTh: true, slug: true, images: { where: { isMain: true } } } },
      roomType: { select: { nameTh: true } },
      tourSchedule: {
        include: { tour: { select: { nameTh: true, slug: true, images: { where: { isMain: true } } } } },
      },
      payments: { select: { status: true, method: true, amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(bookings);
});

export default router;
