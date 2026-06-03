/**
 * Seeds the Koh Chang half-day 3-island snorkeling tour
 *   (Koh Wai · Koh Laoya · Koh Khlum) by speedboat — Join Trip.
 * Creates the tour + upcoming departures (next 30 days, morning 09:00 & afternoon 13:00).
 * Idempotent: upserts the tour by slug; schedules use skipDuplicates.
 *
 * Run:  pnpm --filter @jongjongdi/database exec tsx prisma/seed-dive-koh-chang.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env") });
import { prisma } from "../src/index";

const SLUG = "koh-chang-snorkeling-3-islands";

const descriptionTh = `ดำน้ำเกาะช้างครึ่งวัน 3 เกาะ ด้วยสปีดโบ๊ท โซนเกาะหวาย เกาะเหลายา เกาะคลุ้ม

สิ่งที่รวมในกิจกรรมนี้
• สถานที่ท่องเที่ยว: เกาะหวาย เกาะเหลายา เกาะคลุ้ม
• ประเภทบริการ: Snorkeling แบบ Join Trip (รวมกับกลุ่มอื่น)
• ประเภทเรือ: สปีดโบ๊ท
• เวลาบริการช่วงเช้า: 09:00 – 12:00 น. (ประมาณ 3 ชั่วโมง)
• เวลาบริการช่วงบ่าย: 13:00 – 16:00 น. (ประมาณ 3 ชั่วโมง)
• อาหาร: บริการเป็นขนมและน้ำดื่ม
• อุปกรณ์: หน้ากากดำน้ำ เสื้อชูชีพ และท่อหายใจ
• จำนวนนักท่องเที่ยวที่รับได้: ประมาณ 15-30 ท่าน/ลำ
• เจ้าหน้าที่ดูแล: เจ้าหน้าที่ทางทะเลท้องถิ่นดูแล
• รถรับส่ง: บริการฟรีระหว่าง KC Grande Resort ถึงหมู่บ้านบางเบ้า
• ประกันอุบัติเหตุ: รวม
• พื้นฐานก่อนทำกิจกรรม: เหมาะสำหรับทุกท่านรวมทั้งผู้เริ่มต้นและว่ายน้ำไม่เป็น
• ค่าธรรมเนียมอุทยาน: ไม่ต้องชำระ
• อื่นๆ: มี SUP Board และภาพถ่ายใต้น้ำบริการ ฟรี

รายละเอียดราคา
• ผู้ใหญ่ (อายุมากกว่า 9 ปี): 1,000 บาท/ท่าน
• เด็ก (อายุ 3-9 ขวบ): 500 บาท/ท่าน
• เด็กเล็ก (อายุน้อยกว่า 3 ปี): ฟรี

โปรแกรมทัวร์ช่วงเช้า
08:00 น. รถรับจากรีสอร์ทต่างๆ
09:00 น. รับอาหารว่างก่อนลงเรือและออกเดินทางไปดำน้ำเกาะหวาย
09:30 น. ดำน้ำ "เกาะหวาย" รับอาหารว่าง ขนมผลไม้ น้ำดื่ม
10:10 น. ดำน้ำ "เกาะคลุ้ม"
11:00 น. ดำน้ำ "เกาะคลุ้ม" และรับอาหารว่างขนมผลไม้ น้ำดื่ม
12:00 น. ออกเดินทางกลับจากหมู่เกาะรัง
12:30 น. ถึงเกาะช้าง รถรอรับส่งท่านกับที่พัก
หมายเหตุ: กำหนดการอาจมีการเปลี่ยนแปลงตามสภาพอากาศ

โปรแกรมทัวร์ช่วงเย็น
12:00 น. รถรับจากรีสอร์ทต่างๆ
13:00 น. รับอาหารว่างก่อนลงเรือและออกเดินทางไปดำน้ำหวาย
13:30 น. ดำน้ำ "เกาะหวาย" รับอาหารว่าง ขนมผลไม้ น้ำดื่ม
14:10 น. ดำน้ำ "เกาะคลุ้ม"
15:00 น. ดำน้ำ "เกาะเหลายา" และรับอาหารว่างขนมผลไม้ น้ำดื่ม
16:00 น. ออกเดินทางกลับจากหมู่เกาะรัง
16:30 น. เดินทางกลับถึงเกาะช้าง รถรอรับส่งท่านกับที่พัก
หมายเหตุ: กำหนดการอาจมีการเปลี่ยนแปลงตามสภาพอากาศ`;

const descriptionEn = `Koh Chang half-day 3-island snorkeling trip by speedboat — Koh Wai, Koh Laoya & Koh Khlum.

What's included
• Spots: Koh Wai, Koh Laoya, Koh Khlum
• Type: Snorkeling — Join Trip (shared with other guests)
• Boat: Speedboat
• Morning session: 09:00 – 12:00 (approx. 3 hours)
• Afternoon session: 13:00 – 16:00 (approx. 3 hours)
• Food: snacks & drinking water
• Equipment: mask, life jacket, snorkel
• Capacity: approx. 15-30 guests per boat
• Guided by local marine staff
• Free transfer between KC Grande Resort and Bang Bao village
• Accident insurance: included
• Suitable for everyone, including beginners and non-swimmers
• No national park fee required
• Free SUP board & underwater photos

Pricing
• Adult (over 9 yrs): 1,000 THB/person
• Child (3-9 yrs): 500 THB/person
• Infant (under 3 yrs): free`;

async function main() {
  // ── operator (tours require one) ──────────────────────────────────────────
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

  // ── tour ────────────────────────────────────────────────────────────────
  const tour = await prisma.tour.upsert({
    where: { slug: SLUG },
    update: { descriptionTh, descriptionEn, pricePerPerson: 1000, maxSeats: 30, durationHours: 3 },
    create: {
      slug: SLUG,
      operatorId: operator.id,
      nameTh: "ดำน้ำเกาะช้าง ครึ่งวัน 3 เกาะ (เกาะหวาย · เกาะเหลายา · เกาะคลุ้ม)",
      nameEn: "Koh Chang Half-Day 3-Island Snorkeling (Koh Wai · Koh Laoya · Koh Khlum)",
      descriptionTh,
      descriptionEn,
      pricePerPerson: 1000,
      maxSeats: 30,
      durationHours: 3,
    },
  });

  // ── schedules: next 30 days, morning 09:00 & afternoon 13:00 ──────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const schedules: { tourId: string; departureDate: Date; departureTime: string; availableSeats: number }[] = [];
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateOnly = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    for (const time of ["09:00", "13:00"]) {
      schedules.push({ tourId: tour.id, departureDate: dateOnly, departureTime: time, availableSeats: 30 });
    }
  }
  const { count } = await prisma.tourSchedule.createMany({ data: schedules, skipDuplicates: true });

  console.log(`✓ Seeded tour "${tour.slug}" with ${count} new departures (09:00 & 13:00 for next 30 days)`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
