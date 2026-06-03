import { Router } from "express";
import { z } from "zod";
import { prisma } from "@jongjongdi/database";
import { requireSuperAdmin, requireOperator } from "../middleware/operatorAuth";

const router = Router();

// GET /api/operators — super admin: ดูผู้ประกอบการทั้งหมด
router.get("/", requireSuperAdmin, async (req, res) => {
  const { status } = req.query;
  const operators = await prisma.operator.findMany({
    where: status ? { status: status as string } : undefined,
    select: {
      id: true, email: true, name: true, businessName: true,
      phone: true, role: true, status: true, commissionRate: true, createdAt: true,
      _count: { select: { rooms: true, tours: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(operators);
});

// PATCH /api/operators/:id — super admin: อนุมัติ / ระงับ
router.patch("/:id", requireSuperAdmin, async (req, res) => {
  const schema = z.object({
    status: z.enum(["PENDING", "ACTIVE", "SUSPENDED"]).optional(),
    role: z.enum(["SUPER_ADMIN", "OPERATOR"]).optional(),
    commissionRate: z.number().min(0).max(100).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const operator = await prisma.operator.update({
    where: { id: req.params.id },
    data: parsed.data,
    select: { id: true, email: true, name: true, status: true, role: true, commissionRate: true },
  });
  res.json(operator);
});

// GET /api/operators/stats — operator: เห็นเฉพาะของตัวเอง · super admin: เห็นทั้งหมด
router.get("/stats", requireOperator, async (req, res) => {
  const isSuper = req.operator!.role === "SUPER_ADMIN";
  const operatorId = req.operator!.id;
  const roomWhere = isSuper ? {} : { operatorId };
  const tourWhere = isSuper ? {} : { operatorId };
  const ownedFilter = isSuper
    ? {}
    : { OR: [{ room: { operatorId } }, { tourSchedule: { tour: { operatorId } } }] };
  const [rooms, tours, bookings, pendingBookings] = await Promise.all([
    prisma.room.count({ where: roomWhere }),
    prisma.tour.count({ where: tourWhere }),
    prisma.booking.count({ where: ownedFilter }),
    prisma.booking.count({ where: { ...ownedFilter, status: { in: ["PENDING_PAYMENT", "PENDING_CONFIRM"] } } }),
  ]);
  res.json({ rooms, tours, bookings, pendingBookings });
});

export default router;
