import { Router } from "express";
import { prisma } from "@jongjongdi/database";
import { requireSuperAdmin } from "../middleware/operatorAuth";

const router = Router();

interface BankAccountInput {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  branch?: string | null;
  isActive?: boolean;
  order?: number | string;
}

function buildData(body: BankAccountInput) {
  const data: Record<string, unknown> = {};
  for (const k of ["bankName", "accountName", "accountNumber"] as const) {
    if (body[k] !== undefined) data[k] = String(body[k]).trim();
  }
  if (body.branch !== undefined) data.branch = body.branch === "" || body.branch === null ? null : String(body.branch).trim();
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (body.order !== undefined) data.order = Number(body.order);
  return data;
}

// GET /api/bank-accounts — active accounts for the checkout page (public)
router.get("/", async (_req, res) => {
  const accounts = await prisma.bankAccount.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, bankName: true, accountName: true, accountNumber: true, branch: true },
  });
  res.json(accounts);
});

// GET /api/bank-accounts/admin/list — all accounts (super admin)
router.get("/admin/list", requireSuperAdmin, async (_req, res) => {
  const accounts = await prisma.bankAccount.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  res.json(accounts);
});

// POST /api/bank-accounts (super admin)
router.post("/", requireSuperAdmin, async (req, res) => {
  try {
    const body = req.body as BankAccountInput;
    if (!body.bankName?.trim() || !body.accountName?.trim() || !body.accountNumber?.trim()) {
      res.status(400).json({ error: "กรุณากรอกธนาคาร ชื่อบัญชี และเลขที่บัญชีให้ครบ" });
      return;
    }
    const account = await prisma.bankAccount.create({ data: buildData(body) as never });
    res.status(201).json(account);
  } catch (err) {
    console.error("[bankAccounts/create]", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "สร้างล้มเหลว" });
  }
});

// PATCH /api/bank-accounts/:id (super admin)
router.patch("/:id", requireSuperAdmin, async (req, res) => {
  try {
    const account = await prisma.bankAccount.update({
      where: { id: String(req.params.id) },
      data: buildData(req.body as BankAccountInput),
    });
    res.json(account);
  } catch (err) {
    if ((err as { code?: string }).code === "P2025") { res.status(404).json({ error: "ไม่พบบัญชี" }); return; }
    console.error("[bankAccounts/update]", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "อัปเดตล้มเหลว" });
  }
});

// DELETE /api/bank-accounts/:id (super admin)
router.delete("/:id", requireSuperAdmin, async (req, res) => {
  try {
    await prisma.bankAccount.delete({ where: { id: String(req.params.id) } });
    res.json({ ok: true });
  } catch (err) {
    if ((err as { code?: string }).code === "P2025") { res.status(404).json({ error: "ไม่พบบัญชี" }); return; }
    console.error("[bankAccounts/delete]", err);
    res.status(500).json({ error: "ลบไม่สำเร็จ" });
  }
});

export default router;
