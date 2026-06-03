import { Router } from "express";
import multer from "multer";
import { prisma, Prisma } from "@jongjongdi/database";
import { requireOperator } from "../middleware/operatorAuth";
import { uploadImageToStorage, deleteFromStorage, pathFromPublicUrl } from "../lib/upload";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

// Parse a YYYY-MM-DD query value into a Date (UTC midnight), or null if invalid
function parseDate(value: unknown): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  return isNaN(d.getTime()) ? null : d;
}

// GET /api/tours/admin/list  — operator: เฉพาะของตัวเอง · super admin: ทั้งหมด
router.get("/admin/list", requireOperator, async (req, res) => {
  const where = req.operator!.role === "SUPER_ADMIN" ? {} : { operatorId: req.operator!.id };
  const tours = await prisma.tour.findMany({
    where,
    include: {
      images: { where: { isMain: true } },
      _count: { select: { schedules: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(tours);
});

// GET /api/tours?q=&date=YYYY-MM-DD
router.get("/", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

  const where: Prisma.TourWhereInput = { isActive: true };
  if (q) {
    where.OR = [
      { nameTh: { contains: q, mode: "insensitive" } },
      { nameEn: { contains: q, mode: "insensitive" } },
      { descriptionTh: { contains: q, mode: "insensitive" } },
      { descriptionEn: { contains: q, mode: "insensitive" } },
    ];
  }

  // Only tours with a departure on the chosen date that still has seats
  const date = parseDate(req.query.date);
  if (date) {
    const next = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    where.schedules = {
      some: { departureDate: { gte: date, lt: next }, availableSeats: { gt: 0 } },
    };
  }

  const tours = await prisma.tour.findMany({
    where,
    include: { images: { where: { isMain: true } } },
    orderBy: { pricePerPerson: "asc" },
  });
  res.json(tours);
});

// GET /api/tours/:slug
router.get("/:slug", async (req, res) => {
  const tour = await prisma.tour.findUnique({
    where: { slug: req.params.slug },
    include: {
      images: { orderBy: { order: "asc" } },
      schedules: { where: { departureDate: { gte: new Date() } }, orderBy: { departureDate: "asc" }, take: 30 },
    },
  });
  if (!tour || !tour.isActive) { res.status(404).json({ error: "Tour not found" }); return; }
  res.json(tour);
});

// POST /api/tours  — create tour (admin)
router.post("/", requireOperator, async (req, res) => {
  const { nameTh, nameEn, descriptionTh, descriptionEn, pricePerPerson, maxSeats, durationHours, slug } = req.body;
  if (!nameTh || !nameEn || !slug || !pricePerPerson || !maxSeats) {
    res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบ" });
    return;
  }
  const operatorId = req.operator!.id;
  const tour = await prisma.tour.create({
    data: { nameTh, nameEn, descriptionTh: descriptionTh ?? "", descriptionEn: descriptionEn ?? "", pricePerPerson: Number(pricePerPerson), maxSeats: Number(maxSeats), durationHours: Number(durationHours ?? 8), slug, operatorId },
  });
  res.status(201).json(tour);
});

// PATCH /api/tours/:id  — update tour (admin)
router.patch("/:id", requireOperator, async (req, res) => {
  const tour = await prisma.tour.update({ where: { id: req.params.id }, data: req.body });
  res.json(tour);
});

// ─── Tour Schedules ────────────────────────────────────────────────────────────

// GET /api/tours/:id/schedules
router.get("/:id/schedules", requireOperator, async (req, res) => {
  const schedules = await prisma.tourSchedule.findMany({
    where: { tourId: req.params.id },
    orderBy: { departureDate: "asc" },
  });
  res.json(schedules);
});

// POST /api/tours/:id/schedules
router.post("/:id/schedules", requireOperator, async (req, res) => {
  const { departureDate, departureTime, availableSeats } = req.body;
  if (!departureDate || !departureTime || !availableSeats) {
    res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบ" });
    return;
  }
  const schedule = await prisma.tourSchedule.create({
    data: {
      tourId: req.params.id,
      departureDate: new Date(departureDate),
      departureTime,
      availableSeats: Number(availableSeats),
    },
  });
  res.status(201).json(schedule);
});

// DELETE /api/tours/schedules/:scheduleId
router.delete("/schedules/:scheduleId", requireOperator, async (req, res) => {
  await prisma.tourSchedule.delete({ where: { id: req.params.scheduleId } });
  res.json({ ok: true });
});

// ─── Tour Images ──────────────────────────────────────────────────────────────

router.get("/:id/images", requireOperator, async (req, res) => {
  const images = await prisma.tourImage.findMany({
    where: { tourId: String(req.params.id) },
    orderBy: [{ isMain: "desc" }, { order: "asc" }],
  });
  res.json(images);
});

router.post("/:id/images", requireOperator, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "กรุณาแนบไฟล์รูป" }); return; }
    const tourId = String(req.params.id);
    const tour = await prisma.tour.findUnique({ where: { id: tourId }, include: { _count: { select: { images: true } } } });
    if (!tour) { res.status(404).json({ error: "ไม่พบทัวร์" }); return; }

    const { url } = await uploadImageToStorage(req.file.buffer, `tours/${tourId}`);
    const isMain = tour._count.images === 0;
    const image = await prisma.tourImage.create({
      data: { tourId, url, isMain, order: tour._count.images },
    });
    res.status(201).json(image);
  } catch (err) {
    console.error("[tours/images]", err);
    const status = (err as { status?: number }).status ?? 500;
    res.status(status).json({ error: err instanceof Error ? err.message : "อัพโหลดล้มเหลว" });
  }
});

router.patch("/images/:imageId", requireOperator, async (req, res) => {
  const imageId = String(req.params.imageId);
  const image = await prisma.tourImage.findUnique({ where: { id: imageId } });
  if (!image) { res.status(404).json({ error: "ไม่พบรูป" }); return; }

  await prisma.$transaction([
    prisma.tourImage.updateMany({ where: { tourId: image.tourId }, data: { isMain: false } }),
    prisma.tourImage.update({ where: { id: imageId }, data: { isMain: true } }),
  ]);
  res.json({ ok: true });
});

router.delete("/images/:imageId", requireOperator, async (req, res) => {
  const imageId = String(req.params.imageId);
  const image = await prisma.tourImage.findUnique({ where: { id: imageId } });
  if (!image) { res.status(404).json({ error: "ไม่พบรูป" }); return; }

  const path = pathFromPublicUrl(image.url);
  if (path) await deleteFromStorage(path).catch(() => {});
  await prisma.tourImage.delete({ where: { id: imageId } });
  res.json({ ok: true });
});

export default router;
