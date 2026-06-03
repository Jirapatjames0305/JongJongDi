/**
 * Seeds the 3 existing "ฮิตติดกระแส" cards into the DB:
 *   1 marketplace product (durian) + 2 accommodation rooms, linked via Trending.
 * Idempotent: upserts by slug and resets the trending rows for these items.
 *
 * Run:  pnpm --filter @jongjongdi/database exec tsx prisma/seed-trending.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env") });
import { prisma } from "../src/index";

async function main() {
  // ── operator (rooms require one) ──────────────────────────────────────────
  let operator = await prisma.operator.findFirst();
  if (!operator) {
    const bcrypt = await import("bcryptjs");
    operator = await prisma.operator.create({
      data: {
        email: "seed@jongjongdi.com",
        passwordHash: await bcrypt.hash("changeme", 10),
        name: "Seed Operator",
        businessName: "JongJongDi",
        phone: "0000000000",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      },
    });
    console.log("Created seed operator seed@jongjongdi.com (password: changeme) — เปลี่ยนรหัสด้วย");
  }

  // ── 1) marketplace product: durian ────────────────────────────────────────
  const durian = await prisma.product.upsert({
    where: { slug: "durian-chips-premium" },
    update: {},
    create: {
      slug: "durian-chips-premium",
      nameTh: "ทุเรียนทอดพรีเมียม โซเดียมต่ำ",
      nameEn: "Premium Low-Sodium Durian Chips",
      descriptionTh: "กรอบ อร่อย เคี้ยวเพลิน จากสวนวัฒนาการ์เด้นวิว (Wattana Garden View)",
      descriptionEn: "Crispy and delicious, from Wattana Garden View farm.",
      price: 150,
      oldPrice: 180,
      unitLabel: "/ถุง",
      location: "จันทบุรี",
      deliveryNote: "พร้อมส่งทั่วไทย",
      badge: "Best Seller",
    },
  });

  // ── 2) room: nature camp ──────────────────────────────────────────────────
  const natureCamp = await prisma.room.upsert({
    where: { slug: "nature-camp-khao-15-chan" },
    update: {},
    create: {
      slug: "nature-camp-khao-15-chan",
      operatorId: operator.id,
      nameTh: '"หนาวนี้…หนีเมือง ขึ้นเขา นอนดูดาว"',
      nameEn: "Mountain Stargazing Camp",
      descriptionTh: "โทนอบอุ่น–ธรรมชาติ–slow life · ⛺️ ค่ากางเต็นท์ คนละ 30 บาท ค่าเข้าอุทยาน คนละ 20 บาท",
      descriptionEn: "Warm tones, nature, slow life.",
      types: { create: [{ nameTh: "ค่าเข้าอุทยาน", nameEn: "Park Entry", pricePerNight: 20, maxGuests: 1, quantity: 99, order: 0 }] },
    },
  });

  // ── 3) room: glamping ─────────────────────────────────────────────────────
  const glamping = await prisma.room.upsert({
    where: { slug: "glamping-sky-camp" },
    update: {},
    create: {
      slug: "glamping-sky-camp",
      operatorId: operator.id,
      nameTh: "Glamping Sky Camp รับลมหนาว",
      nameEn: "Glamping Sky Camp",
      descriptionTh: "ที่พักเต็นท์หรู ชมดาว สัมผัสหมอก",
      descriptionEn: "Luxury glamping tents, stargazing in the mist.",
      types: { create: [{ nameTh: "เต็นท์ Glamping", nameEn: "Glamping Tent", pricePerNight: 2200, maxGuests: 2, quantity: 5, order: 0 }] },
    },
  });

  // ── trending rows (reset the ones for these items, then recreate) ─────────
  await prisma.trending.deleteMany({
    where: { OR: [{ productId: durian.id }, { roomId: { in: [natureCamp.id, glamping.id] } }] },
  });

  await prisma.trending.createMany({
    data: [
      { targetType: "PRODUCT", productId: durian.id, order: 0 },
      { targetType: "ROOM", roomId: natureCamp.id, order: 1, locationLabel: "อุทยานแห่งชาติ เขาสิบห้าชั้น", ctaLabel: "ดูรายละเอียด" },
      { targetType: "ROOM", roomId: glamping.id, order: 2, locationLabel: "เขาใหญ่", oldPrice: 3500, ctaLabel: "ดูห้องพัก" },
    ],
  });

  console.log("✓ Seeded 3 trending items (1 product + 2 rooms)");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
