import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { randomBytes } from "crypto";
import { prisma } from "@jongjongdi/database";
import { getSupabase, SUPABASE_BUCKET, isStorageEnabled } from "../lib/supabase";
import { isChillpayEnabled, buildPaymentForm, CHANNEL_CODE } from "../lib/chillpay";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const RETURN_BASE = process.env.CHILLPAY_RETURN_BASE ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
// Public URL ChillPay calls server-to-server with the payment result.
const NOTIFY_URL = process.env.CHILLPAY_NOTIFY_URL ?? "http://localhost:4000/api/webhooks/chillpay";

async function findLatestPayment(bookingNumber: string) {
  const booking = await prisma.booking.findUnique({
    where: { bookingNumber: String(bookingNumber) },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!booking) return null;
  const payment = booking.payments[0];
  if (!payment) return null;
  return { booking, payment };
}

// POST /api/payments/:bookingNumber/slip  — upload bank transfer slip
router.post("/:bookingNumber/slip", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "กรุณาแนบไฟล์สลิป" }); return; }
    if (!isStorageEnabled()) { res.status(503).json({ error: "ระบบอัพโหลดยังไม่ได้ตั้งค่า" }); return; }

    const result = await findLatestPayment(String(req.params.bookingNumber));
    if (!result) { res.status(404).json({ error: "ไม่พบการจอง" }); return; }

    const { data: webpBuffer } = await sharp(req.file.buffer, { failOn: "error" })
      .rotate()
      .resize(1200, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });

    const objectPath = `slips/${randomBytes(12).toString("hex")}.webp`;
    const supabase = getSupabase();
    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(objectPath, webpBuffer, { contentType: "image/webp", cacheControl: "31536000" });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(objectPath);

    await prisma.payment.update({
      where: { id: result.payment.id },
      data: { slipUrl: publicUrlData.publicUrl, method: "BANK_TRANSFER", status: "PENDING" },
    });

    res.status(201).json({ ok: true, slipUrl: publicUrlData.publicUrl });
  } catch (err) {
    console.error("[payments/slip]", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "อัพโหลดล้มเหลว" });
  }
});

// POST /api/payments/:bookingNumber/charge  — start a ChillPay hosted-page session
// Body: { method: "PROMPTPAY" | "CREDIT_CARD" | "ALIPAY" | "WECHAT_PAY" }
// Returns { url, fields } — the browser auto-submits these to ChillPay's hosted page.
router.post("/:bookingNumber/charge", async (req, res) => {
  try {
    if (!isChillpayEnabled()) { res.status(503).json({ error: "ระบบชำระเงินออนไลน์ยังไม่พร้อม" }); return; }

    const { method } = req.body as { method: "PROMPTPAY" | "CREDIT_CARD" | "ALIPAY" | "WECHAT_PAY" };
    const channelCode = CHANNEL_CODE[method];
    if (!channelCode) {
      res.status(400).json({ error: "method ไม่ถูกต้อง" }); return;
    }

    const result = await findLatestPayment(String(req.params.bookingNumber));
    if (!result) { res.status(404).json({ error: "ไม่พบการจอง" }); return; }
    const { booking, payment } = result;

    // Unique per attempt so retries don't collide on the @unique chillpayOrderNo.
    const orderNo = `${booking.bookingNumber}-${randomBytes(4).toString("hex")}`;

    const form = buildPaymentForm({
      orderNo,
      customerId: booking.bookingNumber,
      amount: payment.amount * 100, // amounts stored in baht; ChillPay wants satang
      phoneNumber: booking.guestPhone,
      description: `JongJongDi ${booking.bookingNumber}`,
      channelCode,
      returnUrl: `${RETURN_BASE}/bookings/${booking.bookingNumber}?paid=1`,
      notifyUrl: NOTIFY_URL,
      customerName: booking.guestName,
      customerEmail: booking.guestEmail,
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { method, status: "PENDING", chillpayOrderNo: orderNo },
    });

    res.json({ ok: true, url: form.url, fields: form.fields });
  } catch (err) {
    console.error("[payments/charge]", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "ชำระเงินล้มเหลว" });
  }
});

export default router;
