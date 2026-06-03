import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@jongjongdi/database";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

// POST /api/users/register
router.post("/register", async (req, res) => {
  const { name, phone, email, password } = req.body as {
    name: string;
    phone: string;
    email?: string;
    password: string;
  };

  if (!name || !phone || !password) {
    res.status(400).json({ error: "กรุณากรอกชื่อ เบอร์โทร และรหัสผ่าน" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    res.status(409).json({ error: "เบอร์โทรนี้ถูกใช้งานแล้ว" });
    return;
  }

  if (email) {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      res.status(409).json({ error: "อีเมลนี้ถูกใช้งานแล้ว" });
      return;
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, phone, email: email || undefined, passwordHash },
    select: { id: true, name: true, phone: true, email: true, role: true },
  });

  const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
  res.status(201).json({ token, user });
});

// POST /api/users/login
router.post("/login", async (req, res) => {
  const { phone, password } = req.body as { phone: string; password: string };

  if (!phone || !password) {
    res.status(400).json({ error: "กรุณากรอกเบอร์โทรและรหัสผ่าน" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง" });
    return;
  }
  if (user.status === "BLACKLISTED") {
    res.status(403).json({ error: "บัญชีนี้ถูกระงับการใช้งาน" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง" });
    return;
  }

  const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
  res.json({ token, user: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role } });
});

// GET /api/users/me
router.get("/me", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) { res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" }); return; }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, phone: true, email: true, role: true, status: true },
    });
    if (!user) { res.status(404).json({ error: "ไม่พบผู้ใช้" }); return; }
    res.json(user);
  } catch {
    res.status(401).json({ error: "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
});

export default router;
