import { Router } from "express";
import { prisma } from "@jongjongdi/database";
import { verifyNotifyChecksum, isNotifySuccess, type ChillpayNotify } from "../lib/chillpay";
import { sendBookingConfirmation } from "../lib/email";

const router = Router();

// ChillPay background notification (server-to-server). Sent as urlencoded form.
router.post("/chillpay", async (req, res) => {
  try {
    const notify = req.body as ChillpayNotify;

    if (!notify?.OrderNo) {
      res.json({ ok: true, ignored: true });
      return;
    }
    if (!verifyNotifyChecksum(notify)) {
      console.warn("[webhook/chillpay] invalid checksum", notify.OrderNo);
      res.status(400).json({ error: "invalid checksum" });
      return;
    }

    await syncNotifyToPayment(notify);
    res.json({ ok: true });
  } catch (err) {
    console.error("[webhook/chillpay]", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "webhook failed" });
  }
});

export default router;

export async function syncNotifyToPayment(notify: ChillpayNotify): Promise<{ updated: boolean }> {
  const payment = await prisma.payment.findUnique({
    where: { chillpayOrderNo: String(notify.OrderNo) },
    include: { booking: { include: { room: true, roomType: true, tourSchedule: { include: { tour: true } } } } },
  });
  if (!payment) return { updated: false };

  if (isNotifySuccess(notify)) {
    if (payment.status === "APPROVED") return { updated: false };

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        chillpayTransactionId: notify.TransactionId ?? payment.chillpayTransactionId,
      },
    });
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: "CONFIRMED" },
    });

    // Send confirmation email (fire and forget)
    const itemName = [payment.booking.room?.nameTh, payment.booking.roomType?.nameTh].filter(Boolean).join(" — ")
      || payment.booking.tourSchedule?.tour.nameTh
      || "การจอง";
    sendBookingConfirmation({
      to: payment.booking.guestEmail,
      guestName: payment.booking.guestName,
      bookingNumber: payment.booking.bookingNumber,
      itemName,
      totalAmount: payment.booking.totalAmount,
      checkInDate: payment.booking.checkInDate,
      checkOutDate: payment.booking.checkOutDate,
      departureDate: payment.booking.tourSchedule?.departureDate,
    }).catch((e) => console.error("[email]", e));

    return { updated: true };
  }

  // Any non-success status → mark rejected
  if (payment.status === "REJECTED") return { updated: false };
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "REJECTED",
      rejectedAt: new Date(),
      chillpayTransactionId: notify.TransactionId ?? payment.chillpayTransactionId,
      failureMessage: `ChillPay status ${notify.Status ?? "unknown"}`,
    },
  });
  return { updated: true };
}
