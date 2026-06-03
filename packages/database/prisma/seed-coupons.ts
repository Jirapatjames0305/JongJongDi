import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const coupons = [
  {
    code: "REFERRAL_BONUS",
    description: "รางวัลชวนเพื่อน — ทั้งผู้ชวนและผู้ถูกชวนรับส่วนลด",
    discountType: "FIXED" as const,
    discountValue: 100,
    minAmount: null,
    maxDiscount: null,
    usageLimit: null,
    expiresAt: null,
  },
  {
    code: "WELCOME150",
    description: "ยินดีต้อนรับสมาชิกใหม่ ลด ฿150",
    discountType: "FIXED" as const,
    discountValue: 150,
    minAmount: 500,
    maxDiscount: null,
    usageLimit: 500,
    expiresAt: new Date("2025-12-31"),
  },
  {
    code: "SUMMER20",
    description: "ซัมเมอร์เซล ลด 20% สูงสุด ฿600",
    discountType: "PERCENT" as const,
    discountValue: 20,
    minAmount: 1000,
    maxDiscount: 600,
    usageLimit: 200,
    expiresAt: new Date("2025-08-31"),
  },
  {
    code: "LONGSTAY10",
    description: "พักนาน ลดเพิ่ม 10%",
    discountType: "PERCENT" as const,
    discountValue: 10,
    minAmount: 2000,
    maxDiscount: 800,
    usageLimit: null,
    expiresAt: null,
  },
  {
    code: "FIRSTBOOK200",
    description: "จองครั้งแรก ลด ฿200",
    discountType: "FIXED" as const,
    discountValue: 200,
    minAmount: 800,
    maxDiscount: null,
    usageLimit: 1000,
    expiresAt: new Date("2025-12-31"),
  },
  {
    code: "FLASH50",
    description: "แฟลชเซล ลด 50% สูงสุด ฿300",
    discountType: "PERCENT" as const,
    discountValue: 50,
    minAmount: 500,
    maxDiscount: 300,
    usageLimit: 50,
    expiresAt: new Date("2025-07-31"),
  },
  {
    code: "DIVE15",
    description: "จองทัวร์ดำน้ำ ลด 15%",
    discountType: "PERCENT" as const,
    discountValue: 15,
    minAmount: 1500,
    maxDiscount: 500,
    usageLimit: 100,
    expiresAt: null,
  },
  {
    code: "WEEKEND300",
    description: "วีกเอนด์สเปเชียล ลด ฿300",
    discountType: "FIXED" as const,
    discountValue: 300,
    minAmount: 1200,
    maxDiscount: null,
    usageLimit: 80,
    expiresAt: new Date("2025-09-30"),
  },
  {
    code: "BIRTHDAY25",
    description: "สุขสันต์วันเกิด ลด 25%",
    discountType: "PERCENT" as const,
    discountValue: 25,
    minAmount: 500,
    maxDiscount: 750,
    usageLimit: null,
    expiresAt: null,
  },
  {
    code: "GROUP500",
    description: "จองหมู่คณะ 5 คนขึ้นไป ลด ฿500",
    discountType: "FIXED" as const,
    discountValue: 500,
    minAmount: 3000,
    maxDiscount: null,
    usageLimit: 60,
    expiresAt: null,
  },
  {
    code: "LATENIGHT10",
    description: "เช็คอินดึก 4 ทุ่มขึ้นไป ลด 10%",
    discountType: "PERCENT" as const,
    discountValue: 10,
    minAmount: 800,
    maxDiscount: 300,
    usageLimit: null,
    expiresAt: null,
  },
];

async function main() {
  console.log("Seeding coupons...");
  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
    console.log(`  ✓ ${c.code}`);
  }
  console.log(`Done — ${coupons.length} coupons seeded.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
