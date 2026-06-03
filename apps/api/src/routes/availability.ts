import { Router } from "express";
import { prisma } from "@jongjongdi/database";
import { requireOperator } from "../middleware/operatorAuth";

const router = Router();

// GET /api/availability/blocks
router.get("/blocks", requireOperator, async (_req, res) => {
  const blocks = await prisma.availabilityBlock.findMany({
    include: {
      room: { select: { nameTh: true, slug: true } },
      tour: { select: { nameTh: true, slug: true } },
    },
    orderBy: { startDate: "asc" },
  });
  res.json(blocks);
});

// POST /api/availability/blocks
router.post("/blocks", requireOperator, async (req, res) => {
  const { targetType, roomId, tourId, startDate, endDate, reason } = req.body as {
    targetType: "ROOM" | "TOUR";
    roomId?: string;
    tourId?: string;
    startDate: string;
    endDate: string;
    reason?: string;
  };

  if (!targetType || !startDate || !endDate) {
    res.status(400).json({ error: "targetType, startDate, endDate จำเป็นต้องระบุ" });
    return;
  }
  if (targetType === "ROOM" && !roomId) {
    res.status(400).json({ error: "ต้องระบุ roomId สำหรับ ROOM" });
    return;
  }
  if (targetType === "TOUR" && !tourId) {
    res.status(400).json({ error: "ต้องระบุ tourId สำหรับ TOUR" });
    return;
  }

  const block = await prisma.availabilityBlock.create({
    data: {
      targetType,
      roomId: targetType === "ROOM" ? roomId : undefined,
      tourId: targetType === "TOUR" ? tourId : undefined,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
    },
  });
  res.status(201).json(block);
});

// DELETE /api/availability/blocks/:id
router.delete("/blocks/:id", requireOperator, async (req, res) => {
  await prisma.availabilityBlock.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
