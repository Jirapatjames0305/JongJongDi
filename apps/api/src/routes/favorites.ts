import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "@jongjongdi/database";

const router = Router();
const jwtSecret = () => process.env.JWT_SECRET ?? "dev-secret";

function authUser(req: import("express").Request): { id: string; phone: string } | null {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  try { return jwt.verify(token, jwtSecret()) as { id: string; phone: string }; }
  catch { return null; }
}

const INCLUDE = {
  room: { select: { id: true, slug: true, nameTh: true, nameEn: true, images: { where: { isMain: true }, take: 1 } } },
  tour: { select: { id: true, slug: true, nameTh: true, nameEn: true, images: { where: { isMain: true }, take: 1 } } },
  product: { select: { id: true, slug: true, nameTh: true, nameEn: true, images: { where: { isMain: true }, take: 1 } } },
};

// GET /api/favorites/check?roomId=x | tourId=x | productId=x
router.get("/check", async (req, res) => {
  const payload = authUser(req);
  if (!payload) { res.json({ favoriteId: null }); return; }

  const { roomId, tourId, productId } = req.query as Record<string, string | undefined>;
  const where = roomId ? { userId: payload.id, roomId }
    : tourId ? { userId: payload.id, tourId }
    : productId ? { userId: payload.id, productId }
    : null;

  if (!where) { res.json({ favoriteId: null }); return; }
  const fav = await prisma.favorite.findFirst({ where });
  res.json({ favoriteId: fav?.id ?? null });
});

// GET /api/favorites
router.get("/", async (req, res) => {
  const payload = authUser(req);
  if (!payload) { res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" }); return; }

  const favorites = await prisma.favorite.findMany({
    where: { userId: payload.id },
    include: INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  res.json(favorites);
});

// POST /api/favorites
router.post("/", async (req, res) => {
  const payload = authUser(req);
  if (!payload) { res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" }); return; }

  const { targetType, roomId, tourId, productId } = req.body as {
    targetType: "ROOM" | "TOUR" | "PRODUCT";
    roomId?: string;
    tourId?: string;
    productId?: string;
  };

  try {
    const fav = await prisma.favorite.create({
      data: { userId: payload.id, targetType, roomId, tourId, productId },
      include: INCLUDE,
    });
    res.status(201).json(fav);
  } catch {
    res.status(409).json({ error: "มีในรายการโปรดแล้ว" });
  }
});

// DELETE /api/favorites/:id
router.delete("/:id", async (req, res) => {
  const payload = authUser(req);
  if (!payload) { res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" }); return; }

  const fav = await prisma.favorite.findFirst({ where: { id: req.params.id, userId: payload.id } });
  if (!fav) { res.status(404).json({ error: "ไม่พบรายการ" }); return; }

  await prisma.favorite.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
