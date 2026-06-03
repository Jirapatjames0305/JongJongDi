import { Router } from "express";
import { prisma } from "@jongjongdi/database";
import { requireOperator as operatorAuth } from "../middleware/operatorAuth";

const router = Router();

// GET /api/coupons — admin list all coupons
router.get("/", operatorAuth, async (_req, res) => {
  const coupons = await prisma.coupon.findMany({
    include: { _count: { select: { userCoupons: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(coupons);
});

// POST /api/coupons — create
router.post("/", operatorAuth, async (req, res) => {
  const { code, description, discountType, discountValue, minAmount, maxDiscount, expiresAt, usageLimit } =
    req.body as {
      code: string;
      description?: string;
      discountType: "PERCENT" | "FIXED";
      discountValue: number;
      minAmount?: number;
      maxDiscount?: number;
      expiresAt?: string;
      usageLimit?: number;
    };

  if (!code?.trim() || !discountType || discountValue == null) {
    res.status(400).json({ error: "กรุณากรอก code, ประเภท และมูลค่าส่วนลด" });
    return;
  }
  if (discountType === "PERCENT" && (discountValue < 1 || discountValue > 100)) {
    res.status(400).json({ error: "ส่วนลด % ต้องอยู่ระหว่าง 1-100" });
    return;
  }

  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        description: description?.trim() || null,
        discountType,
        discountValue: Number(discountValue),
        minAmount: minAmount ? Number(minAmount) : null,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
      },
    });
    res.status(201).json(coupon);
  } catch {
    res.status(409).json({ error: "รหัสคูปองนี้มีอยู่แล้ว" });
  }
});

// PATCH /api/coupons/:id — update
router.patch("/:id", operatorAuth, async (req, res) => {
  const { description, discountValue, minAmount, maxDiscount, expiresAt, usageLimit, isActive } = req.body as {
    description?: string;
    discountValue?: number;
    minAmount?: number | null;
    maxDiscount?: number | null;
    expiresAt?: string | null;
    usageLimit?: number | null;
    isActive?: boolean;
  };

  const data: Record<string, unknown> = {};
  if (description !== undefined) data.description = description?.trim() || null;
  if (discountValue !== undefined) data.discountValue = Number(discountValue);
  if (minAmount !== undefined) data.minAmount = minAmount ? Number(minAmount) : null;
  if (maxDiscount !== undefined) data.maxDiscount = maxDiscount ? Number(maxDiscount) : null;
  if (expiresAt !== undefined) data.expiresAt = expiresAt ? new Date(expiresAt) : null;
  if (usageLimit !== undefined) data.usageLimit = usageLimit ? Number(usageLimit) : null;
  if (isActive !== undefined) data.isActive = isActive;

  const coupon = await prisma.coupon.update({ where: { id: String(req.params.id) }, data });
  res.json(coupon);
});

// DELETE /api/coupons/:id
router.delete("/:id", operatorAuth, async (req, res) => {
  await prisma.coupon.delete({ where: { id: String(req.params.id) } });
  res.json({ ok: true });
});

export default router;
