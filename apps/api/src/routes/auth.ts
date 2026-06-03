import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "@jongjongdi/database";
import { requireOperator } from "../middleware/operatorAuth";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
const JWT_EXPIRES = "7d";

function signToken(payload: { id: string; email: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

// POST /api/auth/register — ผู้ประกอบการสมัคร
router.post("/register", async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
    name: z.string().min(2),
    businessName: z.string().min(2),
    phone: z.string().regex(/^0\d{8,9}$/),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.operator.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    res.status(409).json({ error: "อีเมลนี้ถูกใช้งานแล้ว" });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const operator = await prisma.operator.create({
    data: {
      ...parsed.data,
      passwordHash,
      status: "PENDING",
      role: "OPERATOR",
    },
    select: { id: true, email: true, name: true, businessName: true, status: true, createdAt: true },
  });

  res.status(201).json({
    operator,
    message: "สมัครสำเร็จ! รอการอนุมัติจาก Admin ก่อนเข้าใช้งาน",
  });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "ข้อมูลไม่ถูกต้อง" });
    return;
  }

  const operator = await prisma.operator.findUnique({ where: { email: parsed.data.email } });
  if (!operator) {
    res.status(401).json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    return;
  }

  const valid = await bcrypt.compare(parsed.data.password, operator.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    return;
  }

  if (operator.status === "PENDING") {
    res.status(403).json({ error: "บัญชีของคุณรอการอนุมัติจาก Admin" });
    return;
  }
  if (operator.status === "SUSPENDED") {
    res.status(403).json({ error: "บัญชีของคุณถูกระงับการใช้งาน" });
    return;
  }

  const token = signToken({ id: operator.id, email: operator.email, role: operator.role });
  res.json({
    token,
    operator: {
      id: operator.id,
      email: operator.email,
      name: operator.name,
      businessName: operator.businessName,
      role: operator.role,
    },
  });
});

// GET /api/auth/me
router.get("/me", requireOperator, async (req, res) => {
  const operator = await prisma.operator.findUnique({
    where: { id: req.operator!.id },
    select: { id: true, email: true, name: true, businessName: true, phone: true, role: true, status: true, createdAt: true },
  });
  res.json(operator);
});

// POST /api/auth/change-password
router.post("/change-password", requireOperator, async (req, res) => {
  const schema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(6, "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร"),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const operator = await prisma.operator.findUnique({ where: { id: req.operator!.id } });
  if (!operator) { res.status(404).json({ error: "ไม่พบบัญชี" }); return; }

  const valid = await bcrypt.compare(parsed.data.currentPassword, operator.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.operator.update({ where: { id: operator.id }, data: { passwordHash } });
  res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
});

export default router;
