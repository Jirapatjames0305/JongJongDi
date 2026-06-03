import { Router } from "express";
import { prisma } from "@jongjongdi/database";
import { CreateBookingSchema, BookingLookupSchema, UpdateBookingStatusSchema } from "@jongjongdi/shared";
import { requireOperator } from "../middleware/operatorAuth";
import { sendBookingConfirmation } from "../lib/email";
import { calcRoomTotal, effectiveTourPrice } from "../lib/pricing";

const router = Router();

function generateBookingNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `JJD-${date}-${rand}`;
}

// ─── Admin routes (ต้องอยู่ก่อน /:bookingNumber) ──────────────────────────────

// GET /api/bookings/admin/list
router.get("/admin/list", requireOperator, async (req, res) => {
  const { status, type, page = "1" } = req.query;
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (type) where.type = type;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        room: { select: { nameTh: true, slug: true } },
        roomType: { select: { nameTh: true } },
        tourSchedule: {
          include: { tour: { select: { nameTh: true, slug: true } } },
        },
        payments: { select: { status: true, method: true, amount: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * 20,
      take: 20,
    }),
    prisma.booking.count({ where }),
  ]);

  res.json({ bookings, total, page: Number(page) });
});

// GET /api/bookings/admin/:bookingNumber
router.get("/admin/:bookingNumber", requireOperator, async (req, res) => {
  const booking = await prisma.booking.findUnique({
    where: { bookingNumber: req.params.bookingNumber },
    include: {
      room: { select: { nameTh: true, nameEn: true, slug: true } },
      roomType: true,
      tourSchedule: {
        include: { tour: { select: { nameTh: true, nameEn: true, slug: true } } },
      },
      payments: true,
    },
  });
  if (!booking) { res.status(404).json({ error: "ไม่พบการจอง" }); return; }
  res.json(booking);
});

// PATCH /api/bookings/admin/:bookingNumber
router.patch("/admin/:bookingNumber", requireOperator, async (req, res) => {
  const parsed = UpdateBookingStatusSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const booking = await prisma.booking.update({
    where: { bookingNumber: req.params.bookingNumber },
    data: parsed.data,
  });
  res.json(booking);
});

// PATCH /api/bookings/admin/:bookingNumber/payment  — approve / reject
router.patch("/admin/:bookingNumber/payment", requireOperator, async (req, res) => {
  const { status } = req.body as { status: "APPROVED" | "REJECTED" };
  if (!["APPROVED", "REJECTED"].includes(status)) {
    res.status(400).json({ error: "status ต้องเป็น APPROVED หรือ REJECTED" });
    return;
  }

  const booking = await prisma.booking.findUnique({
    where: { bookingNumber: req.params.bookingNumber },
    include: {
      payments: true,
      room: true,
      tourSchedule: { include: { tour: true } },
    },
  });
  if (!booking) { res.status(404).json({ error: "ไม่พบการจอง" }); return; }

  const payment = booking.payments[0];
  if (!payment) { res.status(404).json({ error: "ไม่พบรายการชำระเงิน" }); return; }

  const now = new Date();
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status,
      approvedAt: status === "APPROVED" ? now : undefined,
      rejectedAt: status === "REJECTED" ? now : undefined,
    },
  });

  if (status === "APPROVED") {
    await prisma.booking.update({
      where: { bookingNumber: req.params.bookingNumber },
      data: { status: "CONFIRMED" },
    });

    sendBookingConfirmation({
      to: booking.guestEmail,
      guestName: booking.guestName,
      bookingNumber: booking.bookingNumber,
      itemName: [booking.room?.nameTh, booking.roomType?.nameTh].filter(Boolean).join(" — ") || booking.tourSchedule?.tour.nameTh || "การจอง",
      totalAmount: booking.totalAmount,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      departureDate: booking.tourSchedule?.departureDate,
    }).catch((e) => console.error("[email]", e));
  }

  res.json({ ok: true });
});

// ─── Public routes ─────────────────────────────────────────────────────────────

// POST /api/bookings
router.post("/", async (req, res) => {
  const parsed = CreateBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const data = parsed.data;

  let totalAmount = 0;
  let resolvedRoomId: string | undefined;
  if (data.type === "ACCOMMODATION" && data.roomTypeId && data.checkInDate && data.checkOutDate) {
    const roomType = await prisma.roomType.findUnique({
      where: { id: data.roomTypeId },
      include: { room: true },
    });
    if (!roomType) { res.status(404).json({ error: "Room type not found" }); return; }
    resolvedRoomId = roomType.roomId;
    totalAmount = await calcRoomTotal(roomType.roomId, roomType.pricePerNight, new Date(data.checkInDate), new Date(data.checkOutDate));
  } else if (data.type === "DIVE_TOUR" && data.tourScheduleId) {
    const schedule = await prisma.tourSchedule.findUnique({
      where: { id: data.tourScheduleId },
      include: { tour: true },
    });
    if (!schedule) { res.status(404).json({ error: "Tour schedule not found" }); return; }
    const perPerson = await effectiveTourPrice(schedule.tour.id, schedule.tour.pricePerPerson, schedule.departureDate);
    totalAmount = perPerson * data.numGuests;
  }

  const booking = await prisma.booking.create({
    data: {
      bookingNumber: generateBookingNumber(),
      type: data.type,
      guestName: data.guestName,
      guestPhone: data.guestPhone,
      guestEmail: data.guestEmail,
      numGuests: data.numGuests,
      roomId: resolvedRoomId,
      roomTypeId: data.roomTypeId,
      checkInDate: data.checkInDate ? new Date(data.checkInDate) : undefined,
      checkOutDate: data.checkOutDate ? new Date(data.checkOutDate) : undefined,
      tourScheduleId: data.tourScheduleId,
      totalAmount,
      payments: {
        create: { amount: totalAmount, method: data.paymentMethod, status: "PENDING" },
      },
    },
    include: { payments: true },
  });

  res.status(201).json(booking);
});

// GET /api/bookings/:bookingNumber
router.get("/:bookingNumber", async (req, res) => {
  const booking = await prisma.booking.findUnique({
    where: { bookingNumber: req.params.bookingNumber },
    include: {
      room: { select: { nameTh: true, slug: true } },
      roomType: true,
      tourSchedule: { include: { tour: { select: { nameTh: true, slug: true } } } },
      payments: true,
      review: true,
    },
  });
  if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }
  res.json(booking);
});

// POST /api/bookings/lookup
router.post("/lookup", async (req, res) => {
  const parsed = BookingLookupSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const bookings = await prisma.booking.findMany({
    where: { guestPhone: parsed.data.phone },
    include: {
      room: { select: { nameTh: true } },
      tourSchedule: { include: { tour: { select: { nameTh: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  res.json(bookings);
});

export default router;
