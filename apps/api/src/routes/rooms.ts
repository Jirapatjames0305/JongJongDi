import { Router } from "express";
import multer from "multer";
import { prisma } from "@jongjongdi/database";
import { requireOperator } from "../middleware/operatorAuth";
import { uploadImageToStorage, deleteFromStorage, pathFromPublicUrl } from "../lib/upload";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

// GET /api/rooms/admin/list  — all rooms (admin)
router.get("/admin/list", requireOperator, async (_req, res) => {
  const rooms = await prisma.room.findMany({
    include: {
      images: { where: { isMain: true } },
      types: { orderBy: { order: "asc" } },
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(rooms);
});

// GET /api/rooms
router.get("/", async (_req, res) => {
  const rooms = await prisma.room.findMany({
    where: { isActive: true, types: { some: {} } },
    include: {
      images: { where: { isMain: true } },
      types: { orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(rooms);
});

// GET /api/rooms/:slug/availability?month=2025-01
router.get("/:slug/availability", async (req, res) => {
  const room = await prisma.room.findUnique({ where: { slug: req.params.slug } });
  if (!room) { res.status(404).json({ error: "Not found" }); return; }

  const month = (req.query.month as string) ?? new Date().toISOString().slice(0, 7);
  const [year, mon] = month.split("-").map(Number);
  const start = new Date(year, mon - 1, 1);
  const end = new Date(year, mon, 0);

  const [bookings, blocks] = await Promise.all([
    prisma.booking.findMany({
      where: {
        roomId: room.id,
        status: { in: ["CONFIRMED", "CHECKED_IN"] },
        OR: [{ checkInDate: { gte: start, lte: end } }, { checkOutDate: { gte: start, lte: end } }],
      },
      select: { checkInDate: true, checkOutDate: true },
    }),
    prisma.availabilityBlock.findMany({
      where: {
        roomId: room.id,
        OR: [{ startDate: { gte: start, lte: end } }, { endDate: { gte: start, lte: end } }],
      },
      select: { startDate: true, endDate: true },
    }),
  ]);

  res.json({ bookings, blocks });
});

// GET /api/rooms/:slug
router.get("/:slug", async (req, res) => {
  const room = await prisma.room.findUnique({
    where: { slug: req.params.slug },
    include: {
      images: { orderBy: { order: "asc" } },
      types: { orderBy: { order: "asc" } },
    },
  });
  if (!room || !room.isActive) { res.status(404).json({ error: "Room not found" }); return; }
  res.json(room);
});

interface RoomTypeInput {
  id?: string;
  nameTh: string;
  nameEn: string;
  pricePerNight: number | string;
  maxGuests: number | string;
  quantity: number | string;
}

function normalizeTypes(types: unknown): { nameTh: string; nameEn: string; pricePerNight: number; maxGuests: number; quantity: number; order: number }[] {
  if (!Array.isArray(types)) return [];
  return types
    .map((t: RoomTypeInput, i: number) => ({
      nameTh: String(t.nameTh ?? "").trim(),
      nameEn: String(t.nameEn ?? "").trim(),
      pricePerNight: Number(t.pricePerNight),
      maxGuests: Number(t.maxGuests),
      quantity: Number(t.quantity ?? 1),
      order: i,
    }))
    .filter((t) => t.nameTh && t.pricePerNight > 0 && t.maxGuests > 0);
}

// POST /api/rooms  — create room with types (admin)
router.post("/", requireOperator, async (req, res) => {
  try {
    const { nameTh, nameEn, descriptionTh, descriptionEn, slug, types } = req.body;
    if (!nameTh || !nameEn || !slug) {
      res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบ (ชื่อ + slug)" });
      return;
    }
    const cleanTypes = normalizeTypes(types);
    if (cleanTypes.length === 0) {
      res.status(400).json({ error: "ต้องมีอย่างน้อย 1 ประเภทห้อง" });
      return;
    }
    const operatorId = req.operator!.id;
    const room = await prisma.room.create({
      data: {
        slug, operatorId,
        nameTh, nameEn,
        descriptionTh: descriptionTh ?? "",
        descriptionEn: descriptionEn ?? "",
        types: { create: cleanTypes },
      },
      include: { types: true },
    });
    res.status(201).json(room);
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2002") {
      res.status(409).json({ error: "Slug นี้ถูกใช้แล้ว กรุณาเปลี่ยน" });
      return;
    }
    console.error("[rooms/create]", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "สร้างห้องล้มเหลว" });
  }
});

// PATCH /api/rooms/:id  — update room + replace types (admin)
router.patch("/:id", requireOperator, async (req, res) => {
  try {
    const id = String(req.params.id);
    const { types, isActive, ...rest } = req.body;

    if (typeof isActive === "boolean") {
      const room = await prisma.room.update({ where: { id }, data: { isActive } });
      res.json(room);
      return;
    }

    const data: Record<string, unknown> = {};
    for (const k of ["slug", "nameTh", "nameEn", "descriptionTh", "descriptionEn"] as const) {
      if (rest[k] !== undefined) data[k] = rest[k];
    }

    if (types !== undefined) {
      const cleanTypes = normalizeTypes(types);
      if (cleanTypes.length === 0) {
        res.status(400).json({ error: "ต้องมีอย่างน้อย 1 ประเภทห้อง" });
        return;
      }
      const room = await prisma.$transaction(async (tx) => {
        await tx.roomType.deleteMany({ where: { roomId: id } });
        return tx.room.update({
          where: { id },
          data: { ...data, types: { create: cleanTypes } },
          include: { types: true },
        });
      });
      res.json(room);
      return;
    }

    const room = await prisma.room.update({ where: { id }, data, include: { types: true } });
    res.json(room);
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2002") { res.status(409).json({ error: "Slug นี้ถูกใช้แล้ว" }); return; }
    if (code === "P2025") { res.status(404).json({ error: "ไม่พบห้องพัก" }); return; }
    console.error("[rooms/update]", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "อัปเดตล้มเหลว" });
  }
});

// ─── Room Images ──────────────────────────────────────────────────────────────

// GET /api/rooms/:id/images
router.get("/:id/images", requireOperator, async (req, res) => {
  const images = await prisma.roomImage.findMany({
    where: { roomId: String(req.params.id) },
    orderBy: [{ isMain: "desc" }, { order: "asc" }],
  });
  res.json(images);
});

// POST /api/rooms/:id/images  — upload (multipart "file")
router.post("/:id/images", requireOperator, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "กรุณาแนบไฟล์รูป" }); return; }
    const roomId = String(req.params.id);
    const room = await prisma.room.findUnique({ where: { id: roomId }, include: { _count: { select: { images: true } } } });
    if (!room) { res.status(404).json({ error: "ไม่พบห้องพัก" }); return; }

    const { url } = await uploadImageToStorage(req.file.buffer, `rooms/${roomId}`);
    const isMain = room._count.images === 0;
    const image = await prisma.roomImage.create({
      data: { roomId, url, isMain, order: room._count.images },
    });
    res.status(201).json(image);
  } catch (err) {
    console.error("[rooms/images]", err);
    const status = (err as { status?: number }).status ?? 500;
    res.status(status).json({ error: err instanceof Error ? err.message : "อัพโหลดล้มเหลว" });
  }
});

// PATCH /api/rooms/images/:imageId  — set as main
router.patch("/images/:imageId", requireOperator, async (req, res) => {
  const imageId = String(req.params.imageId);
  const image = await prisma.roomImage.findUnique({ where: { id: imageId } });
  if (!image) { res.status(404).json({ error: "ไม่พบรูป" }); return; }

  await prisma.$transaction([
    prisma.roomImage.updateMany({ where: { roomId: image.roomId }, data: { isMain: false } }),
    prisma.roomImage.update({ where: { id: imageId }, data: { isMain: true } }),
  ]);
  res.json({ ok: true });
});

// DELETE /api/rooms/images/:imageId
router.delete("/images/:imageId", requireOperator, async (req, res) => {
  const imageId = String(req.params.imageId);
  const image = await prisma.roomImage.findUnique({ where: { id: imageId } });
  if (!image) { res.status(404).json({ error: "ไม่พบรูป" }); return; }

  const path = pathFromPublicUrl(image.url);
  if (path) await deleteFromStorage(path).catch(() => {});
  await prisma.roomImage.delete({ where: { id: imageId } });
  res.json({ ok: true });
});

export default router;
