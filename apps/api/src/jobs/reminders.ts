import cron from "node-cron";
import { prisma } from "@jongjongdi/database";
import { sendBookingReminder, isEmailEnabled } from "../lib/email";

// Run daily at 09:00 Asia/Bangkok — send reminders for tomorrow's check-ins / tour departures
export function startReminderJob() {
  if (!isEmailEnabled()) {
    console.log("[cron] reminder job skipped (Resend not configured)");
    return;
  }

  cron.schedule(
    "0 9 * * *",
    async () => {
      const start = Date.now();
      try {
        const sent = await runReminders();
        console.log(`[cron] reminders sent: ${sent} in ${Date.now() - start}ms`);
      } catch (err) {
        console.error("[cron] reminder failed:", err);
      }
    },
    { timezone: "Asia/Bangkok" },
  );

  console.log("[cron] reminder job scheduled (09:00 Asia/Bangkok daily)");
}

export async function runReminders(): Promise<number> {
  // tomorrow 00:00 ~ 23:59:59 (Asia/Bangkok approximated via UTC offset is fine for date-only fields)
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(now.getUTCDate() + 1);
  const start = new Date(Date.UTC(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth(), tomorrow.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 1);

  const accomBookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      type: "ACCOMMODATION",
      checkInDate: { gte: start, lt: end },
    },
    include: { room: true, roomType: true },
  });

  const tourBookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      type: "DIVE_TOUR",
      tourSchedule: { departureDate: { gte: start, lt: end } },
    },
    include: { tourSchedule: { include: { tour: true } } },
  });

  let sent = 0;
  for (const b of accomBookings) {
    try {
      await sendBookingReminder({
        to: b.guestEmail,
        guestName: b.guestName,
        bookingNumber: b.bookingNumber,
        itemName: [b.room?.nameTh, b.roomType?.nameTh].filter(Boolean).join(" — ") || "ที่พัก",
        totalAmount: b.totalAmount,
        checkInDate: b.checkInDate,
        checkOutDate: b.checkOutDate,
      });
      sent++;
    } catch (e) {
      console.error(`[cron] reminder ${b.bookingNumber}:`, e);
    }
  }

  for (const b of tourBookings) {
    try {
      await sendBookingReminder({
        to: b.guestEmail,
        guestName: b.guestName,
        bookingNumber: b.bookingNumber,
        itemName: b.tourSchedule?.tour.nameTh ?? "ทัวร์",
        totalAmount: b.totalAmount,
        departureDate: b.tourSchedule?.departureDate,
      });
      sent++;
    } catch (e) {
      console.error(`[cron] reminder ${b.bookingNumber}:`, e);
    }
  }

  return sent;
}
