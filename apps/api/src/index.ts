import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env") });
import express from "express";
import cors from "cors";
import { prisma } from "@jongjongdi/database";
import roomsRouter from "./routes/rooms";
import toursRouter from "./routes/tours";
import bookingsRouter from "./routes/bookings";
import authRouter from "./routes/auth";
import operatorsRouter from "./routes/operators";
import availabilityRouter from "./routes/availability";
import usersRouter from "./routes/users";
import paymentsRouter from "./routes/payments";
import webhooksRouter from "./routes/webhooks";
import reviewsRouter from "./routes/reviews";
import seasonsRouter from "./routes/seasons";
import productsRouter from "./routes/products";
import trendingRouter from "./routes/trending";
import favoritesRouter from "./routes/favorites";
import couponsRouter from "./routes/coupons";
import bankAccountsRouter from "./routes/bankAccounts";
import payoutsRouter from "./routes/payouts";
import { startReminderJob } from "./jobs/reminders";

const app = express();
const PORT = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);

const allowedOrigins = [
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // ChillPay webhook posts urlencoded

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/operators", operatorsRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/tours", toursRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/availability", availabilityRouter);
app.use("/api/users", usersRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/webhooks", webhooksRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/seasons", seasonsRouter);
app.use("/api/products", productsRouter);
app.use("/api/trending", trendingRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/coupons", couponsRouter);
app.use("/api/bank-accounts", bankAccountsRouter);
app.use("/api/payouts", payoutsRouter);

async function startServer() {
  console.log("─────────────────────────────────");
  console.log("  JongJongDi API  starting up...");
  console.log("─────────────────────────────────");

  // Check env vars
  const dbUrl = process.env.DATABASE_URL;
  const jwtSecret = process.env.JWT_SECRET;
  console.log(`[env] DATABASE_URL : ${dbUrl ? "✓ set" : "✗ MISSING"}`);
  console.log(`[env] JWT_SECRET   : ${jwtSecret ? "✓ set" : "✗ MISSING"}`);
  console.log(`[env] API_PORT     : ${PORT}`);
  console.log(`[env] CORS origins : ${allowedOrigins.join(", ")}`);

  // Check DB connection
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log("[db]  PostgreSQL   : ✓ connected");
  } catch (err: unknown) {
    console.error("[db]  PostgreSQL   : ✗ FAILED —", err instanceof Error ? err.message : err);
  }

  startReminderJob();

  app.listen(PORT, () => {
    console.log("─────────────────────────────────");
    console.log(`[api] Listening on http://localhost:${PORT}`);
    console.log("─────────────────────────────────");
  });
}

startServer();
