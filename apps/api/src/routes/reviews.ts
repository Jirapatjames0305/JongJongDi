import { Router } from "express";
import { prisma } from "@jongjongdi/database";

const router = Router();

// POST /api/reviews/:bookingNumber  — create review (guest can submit if booking is CHECKED_IN/COMPLETED)
// Body: { rating: 1-5, comment?: string, phone: string (for guest verification) }
router.post("/:bookingNumber", async (req, res) => {
  try {
    const { rating, comment, phone } = req.body as { rating: number; comment?: string; phone: string };

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: "rating ต้องอยู่ระหว่าง 1-5" }); return;
    }
    if (!phone) { res.status(400).json({ error: "กรุณาระบุเบอร์โทร" }); return; }

    const booking = await prisma.booking.findUnique({
      where: { bookingNumber: String(req.params.bookingNumber) },
      include: { review: true },
    });
    if (!booking) { res.status(404).json({ error: "ไม่พบการจอง" }); return; }
    if (booking.guestPhone !== phone) { res.status(403).json({ error: "เบอร์โทรไม่ตรง" }); return; }
    if (!["CHECKED_IN", "COMPLETED"].includes(booking.status)) {
      res.status(400).json({ error: "เขียนรีวิวได้หลังจากเช็คอินแล้วเท่านั้น" }); return;
    }
    if (booking.review) { res.status(409).json({ error: "ให้รีวิวแล้ว" }); return; }

    const review = await prisma.review.create({
      data: {
        bookingId: booking.id,
        userId: booking.userId,
        rating,
        comment: comment ?? null,
      },
    });
    res.status(201).json(review);
  } catch (err) {
    console.error("[reviews/create]", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "บันทึกรีวิวล้มเหลว" });
  }
});

// GET /api/reviews/room/:slug
router.get("/room/:slug", async (req, res) => {
  const room = await prisma.room.findUnique({ where: { slug: String(req.params.slug) } });
  if (!room) { res.status(404).json({ error: "ไม่พบห้องพัก" }); return; }

  const reviews = await prisma.review.findMany({
    where: { booking: { roomId: room.id } },
    include: { booking: { select: { guestName: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const total = reviews.length;
  const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  res.json({
    avgRating: Math.round(avg * 10) / 10,
    count: total,
    items: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      guestName: r.booking.guestName,
      createdAt: r.createdAt,
    })),
  });
});

// GET /api/reviews/tour/:slug
router.get("/tour/:slug", async (req, res) => {
  const tour = await prisma.tour.findUnique({ where: { slug: String(req.params.slug) } });
  if (!tour) { res.status(404).json({ error: "ไม่พบทัวร์" }); return; }

  const reviews = await prisma.review.findMany({
    where: { booking: { tourSchedule: { tourId: tour.id } } },
    include: { booking: { select: { guestName: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const total = reviews.length;
  const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  res.json({
    avgRating: Math.round(avg * 10) / 10,
    count: total,
    items: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      guestName: r.booking.guestName,
      createdAt: r.createdAt,
    })),
  });
});

export default router;
