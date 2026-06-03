import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface OperatorPayload {
  id: string;
  email: string;
  role: "SUPER_ADMIN" | "OPERATOR";
}

declare global {
  namespace Express {
    interface Request {
      operator?: OperatorPayload;
    }
  }
}

export function requireOperator(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" });
    return;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? "dev-secret") as OperatorPayload;
    req.operator = payload;
    next();
  } catch {
    res.status(401).json({ error: "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  requireOperator(req, res, () => {
    if (req.operator?.role !== "SUPER_ADMIN") {
      res.status(403).json({ error: "สิทธิ์ไม่เพียงพอ" });
      return;
    }
    next();
  });
}
