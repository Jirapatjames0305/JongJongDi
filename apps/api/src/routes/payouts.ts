import { Router } from "express";
import { prisma } from "@jongjongdi/database";
import { requireSuperAdmin, requireOperator } from "../middleware/operatorAuth";

const router = Router();

// Resolve [start, end) of a YYYY-MM month (defaults to current month)
function monthRange(month: unknown): { key: string; start: Date; end: Date } {
  const now = new Date();
  const key = typeof month === "string" && /^\d{4}-\d{2}$/.test(month)
    ? month
    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [y, m] = key.split("-").map(Number);
  return { key, start: new Date(y, m - 1, 1), end: new Date(y, m, 1) };
}

function operatorIdOf(b: { room: { operatorId: string } | null; tourSchedule: { tour: { operatorId: string } } | null }): string | null {
  return b.room?.operatorId ?? b.tourSchedule?.tour?.operatorId ?? null;
}

const round = (n: number) => Math.round(n);

// GET /api/payouts?month=YYYY-MM — per-operator settlement summary for the month
router.get("/", requireSuperAdmin, async (req, res) => {
  const { key, start, end } = monthRange(req.query.month);

  const [payments, operators] = await Promise.all([
    prisma.payment.findMany({
      where: { status: "APPROVED", approvedAt: { gte: start, lt: end } },
      select: {
        amount: true,
        booking: {
          select: {
            room: { select: { operatorId: true } },
            tourSchedule: { select: { tour: { select: { operatorId: true } } } },
          },
        },
      },
    }),
    prisma.operator.findMany({
      select: { id: true, name: true, businessName: true, commissionRate: true },
    }),
  ]);

  const opMap = new Map(operators.map((o) => [o.id, o]));
  const agg = new Map<string, { gross: number; count: number }>();
  for (const p of payments) {
    const opId = operatorIdOf(p.booking);
    if (!opId) continue;
    const cur = agg.get(opId) ?? { gross: 0, count: 0 };
    cur.gross += p.amount;
    cur.count += 1;
    agg.set(opId, cur);
  }

  const rows = [...agg.entries()].map(([operatorId, { gross, count }]) => {
    const op = opMap.get(operatorId);
    const rate = op?.commissionRate ?? 0;
    const commission = round((gross * rate) / 100);
    return {
      operatorId,
      name: op?.name ?? "(ลบแล้ว)",
      businessName: op?.businessName ?? "—",
      commissionRate: rate,
      bookingCount: count,
      gross,
      commission,
      net: gross - commission,
    };
  });
  rows.sort((a, b) => b.net - a.net);

  const totals = rows.reduce(
    (t, r) => ({ gross: t.gross + r.gross, commission: t.commission + r.commission, net: t.net + r.net, bookingCount: t.bookingCount + r.bookingCount }),
    { gross: 0, commission: 0, net: 0, bookingCount: 0 },
  );

  res.json({ month: key, rows, totals });
});

// Build one operator's monthly revenue/receipt (shared by super-admin and self views)
async function buildOperatorPayout(operatorId: string, month: unknown) {
  const { key, start, end } = monthRange(month);
  const operator = await prisma.operator.findUnique({
    where: { id: operatorId },
    select: { id: true, name: true, businessName: true, email: true, phone: true, commissionRate: true },
  });
  if (!operator) return null;

  const payments = await prisma.payment.findMany({
    where: {
      status: "APPROVED",
      approvedAt: { gte: start, lt: end },
      booking: {
        OR: [{ room: { operatorId } }, { tourSchedule: { tour: { operatorId } } }],
      },
    },
    orderBy: { approvedAt: "asc" },
    select: {
      amount: true, method: true, approvedAt: true,
      booking: {
        select: {
          bookingNumber: true, type: true, guestName: true,
          room: { select: { nameTh: true } },
          tourSchedule: { select: { tour: { select: { nameTh: true } } } },
        },
      },
    },
  });

  const lines = payments.map((p) => ({
    bookingNumber: p.booking.bookingNumber,
    type: p.booking.type,
    guestName: p.booking.guestName,
    itemName: p.booking.room?.nameTh ?? p.booking.tourSchedule?.tour?.nameTh ?? "—",
    method: p.method,
    approvedAt: p.approvedAt,
    amount: p.amount,
  }));

  const gross = lines.reduce((s, l) => s + l.amount, 0);
  const commission = round((gross * operator.commissionRate) / 100);
  return { month: key, operator, lines, gross, commission, net: gross - commission };
}

// GET /api/payouts/operator/:operatorId?month=YYYY-MM — one operator (super admin)
router.get("/operator/:operatorId", requireSuperAdmin, async (req, res) => {
  const result = await buildOperatorPayout(String(req.params.operatorId), req.query.month);
  if (!result) { res.status(404).json({ error: "ไม่พบผู้ประกอบการ" }); return; }
  res.json(result);
});

// GET /api/payouts/me?month=YYYY-MM — the logged-in operator's own monthly revenue
router.get("/me", requireOperator, async (req, res) => {
  const result = await buildOperatorPayout(req.operator!.id, req.query.month);
  if (!result) { res.status(404).json({ error: "ไม่พบผู้ประกอบการ" }); return; }
  res.json(result);
});

export default router;
