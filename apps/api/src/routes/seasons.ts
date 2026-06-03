import { Router } from "express";
import { prisma } from "@jongjongdi/database";
import { requireOperator } from "../middleware/operatorAuth";

const router = Router();

// GET /api/seasons — operator: เฉพาะของตัวเอง · super admin: ทั้งหมด
router.get("/", requireOperator, async (req, res) => {
  const operatorId = req.operator!.id;
  const where = req.operator!.role === "SUPER_ADMIN"
    ? {}
    : { OR: [{ room: { operatorId } }, { tour: { operatorId } }] };
  const seasons = await prisma.seasonPrice.findMany({
    where,
    include: {
      room: { select: { nameTh: true } },
      tour: { select: { nameTh: true } },
    },
    orderBy: { startDate: "desc" },
  });
  res.json(seasons);
});

// POST /api/seasons
// Body: { name, roomId?, tourId?, startDate, endDate, multiplier?, absolutePrice? }
router.post("/", requireOperator, async (req, res) => {
  const { name, roomId, tourId, startDate, endDate, multiplier, absolutePrice } = req.body as {
    name: string; roomId?: string; tourId?: string;
    startDate: string; endDate: string;
    multiplier?: number; absolutePrice?: number;
  };

  if (!name || !startDate || !endDate) { res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบ" }); return; }
  if (!roomId && !tourId) { res.status(400).json({ error: "กรุณาเลือก room หรือ tour" }); return; }
  if (roomId && tourId) { res.status(400).json({ error: "เลือกได้แค่ room หรือ tour อย่างเดียว" }); return; }

  const season = await prisma.seasonPrice.create({
    data: {
      name,
      roomId: roomId ?? null,
      tourId: tourId ?? null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      multiplier: multiplier ?? 1.0,
      absolutePrice: absolutePrice ?? null,
    },
  });
  res.status(201).json(season);
});

// DELETE /api/seasons/:id
router.delete("/:id", requireOperator, async (req, res) => {
  await prisma.seasonPrice.delete({ where: { id: String(req.params.id) } });
  res.json({ ok: true });
});

export default router;
