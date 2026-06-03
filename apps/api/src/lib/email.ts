import { Resend } from "resend";

let _client: Resend | null = null;

export function isEmailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function getResend(): Resend {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw Object.assign(new Error("EmailNotConfigured"), { status: 503 });
  _client = new Resend(key);
  return _client;
}

interface BookingEmailInput {
  to: string;
  guestName: string;
  bookingNumber: string;
  itemName: string;
  totalAmount: number;
  checkInDate?: Date | null;
  checkOutDate?: Date | null;
  departureDate?: Date | null;
}

export async function sendBookingReminder(input: BookingEmailInput): Promise<void> {
  if (!isEmailEnabled()) return;
  const from = process.env.EMAIL_FROM ?? "noreply@jongjongdi.com";
  const fmt = (d?: Date | null) => (d ? new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) : "");
  const isAccom = !!input.checkInDate;
  const dateLine = isAccom
    ? `<p style="margin:8px 0"><b>เช็คอินพรุ่งนี้:</b> ${fmt(input.checkInDate)}</p>`
    : `<p style="margin:8px 0"><b>ออกเดินทางพรุ่งนี้:</b> ${fmt(input.departureDate)}</p>`;

  await getResend().emails.send({
    from,
    to: input.to,
    subject: `แจ้งเตือน: ${isAccom ? "เช็คอิน" : "ออกเดินทาง"} พรุ่งนี้ — ${input.bookingNumber}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:24px">
        <h2 style="color:#f59e0b">⏰ พรุ่งนี้แล้วนะ!</h2>
        <p>สวัสดีคุณ ${input.guestName},</p>
        <p>การจอง <b>${input.bookingNumber}</b> ของคุณจะ${isAccom ? "เช็คอิน" : "ออกเดินทาง"}ในวันพรุ่งนี้</p>
        <div style="background:#fef3c7;border-radius:12px;padding:16px;margin:16px 0">
          <p style="margin:0"><b>${input.itemName}</b></p>
          ${dateLine}
        </div>
        <p>ดูรายละเอียด: <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/bookings/${input.bookingNumber}">เปิดหน้าการจอง</a></p>
        <p style="color:#64748b;font-size:13px;margin-top:24px">JongJongDi — ระบบจองที่พักและทัวร์</p>
      </div>
    `,
  });
}

export async function sendBookingConfirmation(input: BookingEmailInput): Promise<void> {
  if (!isEmailEnabled()) return;
  const from = process.env.EMAIL_FROM ?? "noreply@jongjongdi.com";
  const fmt = (d?: Date | null) => (d ? new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) : "");
  const dateLine = input.checkInDate
    ? `<p><b>เช็คอิน:</b> ${fmt(input.checkInDate)}<br/><b>เช็คเอาท์:</b> ${fmt(input.checkOutDate)}</p>`
    : input.departureDate
    ? `<p><b>วันออกเดินทาง:</b> ${fmt(input.departureDate)}</p>`
    : "";

  await getResend().emails.send({
    from,
    to: input.to,
    subject: `ยืนยันการจอง ${input.bookingNumber} — JongJongDi`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:24px">
        <h2 style="color:#2563eb">ยืนยันการจองสำเร็จ ✓</h2>
        <p>สวัสดีคุณ ${input.guestName},</p>
        <p>เราได้รับการชำระเงินสำหรับการจอง <b>${input.bookingNumber}</b> เรียบร้อยแล้ว</p>
        <div style="background:#f8fafc;border-radius:12px;padding:16px;margin:16px 0">
          <p style="margin:0"><b>${input.itemName}</b></p>
          ${dateLine}
          <p style="margin:8px 0 0;color:#2563eb;font-size:18px;font-weight:bold">฿${input.totalAmount.toLocaleString()}</p>
        </div>
        <p>ดูรายละเอียดการจอง: <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/bookings/${input.bookingNumber}">เปิดหน้าการจอง</a></p>
        <p style="color:#64748b;font-size:13px;margin-top:24px">JongJongDi — ระบบจองที่พักและทัวร์</p>
      </div>
    `,
  });
}
