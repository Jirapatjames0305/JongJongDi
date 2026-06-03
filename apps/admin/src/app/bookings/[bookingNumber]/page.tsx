"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import { fetchBooking, updateBookingStatus, updatePaymentStatus, BookingDetail } from "@/lib/auth";

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "รอชำระเงิน",
  PENDING_CONFIRM: "รอยืนยัน",
  CONFIRMED: "ยืนยันแล้ว",
  CHECKED_IN: "เช็คอินแล้ว",
  COMPLETED: "เสร็จสิ้น",
  CANCELLED: "ยกเลิก",
  REFUNDED: "คืนเงิน",
  NO_SHOW: "ไม่มา",
};
const STATUS_STYLE: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
  PENDING_CONFIRM: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-green-100 text-green-700",
  CHECKED_IN: "bg-teal-100 text-teal-700",
  COMPLETED: "bg-slate-100 text-slate-600",
  CANCELLED: "bg-red-100 text-red-600",
  REFUNDED: "bg-orange-100 text-orange-600",
  NO_SHOW: "bg-gray-100 text-gray-500",
};
const PAY_LABEL: Record<string, string> = {
  PENDING: "รอตรวจสลิป", APPROVED: "อนุมัติแล้ว", REJECTED: "ปฏิเสธ", REFUNDED: "คืนเงิน",
};
const PAY_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-600",
  REFUNDED: "bg-orange-100 text-orange-600",
};
const METHOD_LABEL: Record<string, string> = {
  BANK_TRANSFER: "โอนธนาคาร", PROMPTPAY: "PromptPay", CREDIT_CARD: "บัตรเครดิต",
  ALIPAY: "Alipay", WECHAT_PAY: "WeChat Pay",
};

const NEXT_STATUSES: Record<string, { value: string; label: string; color: string }[]> = {
  PENDING_CONFIRM: [
    { value: "CONFIRMED", label: "ยืนยันการจอง", color: "bg-green-600 hover:bg-green-700" },
    { value: "CANCELLED", label: "ยกเลิก", color: "bg-red-500 hover:bg-red-600" },
  ],
  CONFIRMED: [
    { value: "CHECKED_IN", label: "เช็คอิน", color: "bg-teal-600 hover:bg-teal-700" },
    { value: "CANCELLED", label: "ยกเลิก", color: "bg-red-500 hover:bg-red-600" },
  ],
  CHECKED_IN: [
    { value: "COMPLETED", label: "เสร็จสิ้น", color: "bg-slate-600 hover:bg-slate-700" },
    { value: "NO_SHOW", label: "ไม่มา", color: "bg-gray-500 hover:bg-gray-600" },
  ],
};

export default function BookingDetailPage({ params }: { params: Promise<{ bookingNumber: string }> }) {
  const { bookingNumber } = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    try {
      const token = localStorage.getItem("jjd_token") ?? "";
      const data = await fetchBooking(token, bookingNumber);
      setBooking(data);
      setNote(data.internalNote ?? "");
    } catch {
      router.push("/bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [bookingNumber]);

  async function handleStatus(status: string) {
    if (!booking) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("jjd_token") ?? "";
      await updateBookingStatus(token, bookingNumber, status);
      setMsg("อัปเดตสถานะแล้ว");
      load();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveNote() {
    setSaving(true);
    try {
      const token = localStorage.getItem("jjd_token") ?? "";
      await updateBookingStatus(token, bookingNumber, booking!.status, note);
      setMsg("บันทึก note แล้ว");
    } catch {
      setMsg("บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function handlePayment(status: "APPROVED" | "REJECTED") {
    setSaving(true);
    try {
      const token = localStorage.getItem("jjd_token") ?? "";
      await updatePaymentStatus(token, bookingNumber, status);
      setMsg(status === "APPROVED" ? "อนุมัติการชำระเงินแล้ว" : "ปฏิเสธการชำระเงิน");
      load();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <AdminShell>
      <div className="py-20 text-center text-slate-400">
        <i className="fa-solid fa-circle-notch fa-spin text-2xl"></i>
      </div>
    </AdminShell>
  );

  if (!booking) return null;

  const payment = booking.payments[0];
  const nextActions = NEXT_STATUSES[booking.status] ?? [];

  return (
    <AdminShell>
      <style jsx global>{`
        @media print {
          aside, nav, .no-print, .print\\:hidden { display: none !important; }
          main, .ml-64 { margin-left: 0 !important; padding: 0 !important; }
          body { background: white !important; }
          .bg-white { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/bookings")} className="text-slate-400 hover:text-slate-600 transition no-print">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{booking.bookingNumber}</h1>
          <p className="text-slate-500 text-sm">จอง {new Date(booking.createdAt).toLocaleDateString("th-TH", { dateStyle: "long" })}</p>
        </div>
        <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${STATUS_STYLE[booking.status]}`}>
          {STATUS_LABEL[booking.status]}
        </span>
        <button onClick={() => window.print()} className="ml-auto px-4 py-2 bg-slate-700 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition no-print">
          <i className="fa-solid fa-print mr-2"></i>พิมพ์
        </button>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          <i className="fa-solid fa-circle-check mr-2"></i>{msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-5">

          {/* Guest info */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-user text-[#2563eb]"></i>ข้อมูลผู้จอง
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ["ชื่อ", booking.guestName],
                ["เบอร์โทร", booking.guestPhone],
                ["อีเมล", booking.guestEmail],
                ["จำนวนผู้เข้าพัก", `${booking.numGuests} คน`],
              ].map(([label, val]) => (
                <div key={label}>
                  <dt className="text-slate-400 text-xs mb-0.5">{label}</dt>
                  <dd className="font-medium text-slate-700">{val}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Booking info */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              {booking.type === "ACCOMMODATION"
                ? <><i className="fa-solid fa-bed text-[#2563eb]"></i>ที่พัก</>
                : <><i className="fa-solid fa-water-ladder text-[#2563eb]"></i>ทัวร์ดำน้ำ</>
              }
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {booking.type === "ACCOMMODATION" ? (
                <>
                  <div>
                    <dt className="text-slate-400 text-xs mb-0.5">ห้องพัก</dt>
                    <dd className="font-medium text-slate-700">{booking.room?.nameTh ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 text-xs mb-0.5">เช็คอิน</dt>
                    <dd className="font-medium text-slate-700">
                      {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString("th-TH") : "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 text-xs mb-0.5">เช็คเอาท์</dt>
                    <dd className="font-medium text-slate-700">
                      {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString("th-TH") : "-"}
                    </dd>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <dt className="text-slate-400 text-xs mb-0.5">ทัวร์</dt>
                    <dd className="font-medium text-slate-700">{booking.tourSchedule?.tour.nameTh ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 text-xs mb-0.5">วันออกเดินทาง</dt>
                    <dd className="font-medium text-slate-700">
                      {booking.tourSchedule
                        ? new Date(booking.tourSchedule.departureDate).toLocaleDateString("th-TH")
                        : "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 text-xs mb-0.5">เวลา</dt>
                    <dd className="font-medium text-slate-700">{booking.tourSchedule?.departureTime ?? "-"}</dd>
                  </div>
                </>
              )}
              <div>
                <dt className="text-slate-400 text-xs mb-0.5">ยอดรวม</dt>
                <dd className="font-bold text-lg text-[#2563eb]">฿{booking.totalAmount.toLocaleString()}</dd>
              </div>
            </dl>
          </div>

          {/* Internal note */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 no-print">
            <h2 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-note-sticky text-[#2563eb]"></i>Internal Note
            </h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="บันทึกภายใน (ไม่แสดงให้ลูกค้าเห็น)"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
            />
            <button
              onClick={handleSaveNote}
              disabled={saving}
              className="mt-2 px-4 py-2 bg-slate-700 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-50"
            >
              บันทึก Note
            </button>
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-5">

          {/* Actions */}
          {nextActions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 no-print">
              <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-bolt text-[#f59e0b]"></i>การดำเนินการ
              </h2>
              <div className="space-y-2">
                {nextActions.map((action) => (
                  <button
                    key={action.value}
                    onClick={() => handleStatus(action.value)}
                    disabled={saving}
                    className={`w-full py-2.5 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 ${action.color}`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payment */}
          {payment && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-credit-card text-[#2563eb]"></i>การชำระเงิน
              </h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-slate-400 text-xs mb-0.5">ช่องทาง</dt>
                  <dd className="font-medium text-slate-700">{METHOD_LABEL[payment.method] ?? payment.method}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 text-xs mb-0.5">ยอด</dt>
                  <dd className="font-bold text-slate-800">฿{payment.amount.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 text-xs mb-0.5">สถานะ</dt>
                  <dd>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${PAY_STYLE[payment.status]}`}>
                      {PAY_LABEL[payment.status] ?? payment.status}
                    </span>
                  </dd>
                </div>
                {payment.slipUrl && (
                  <div>
                    <dt className="text-slate-400 text-xs mb-1">สลิป</dt>
                    <a href={payment.slipUrl} target="_blank" rel="noreferrer"
                      className="text-[#2563eb] text-xs underline">ดูสลิป</a>
                  </div>
                )}
              </dl>

              {payment.status === "PENDING" && (
                <div className="flex gap-2 mt-4 no-print">
                  <button
                    onClick={() => handlePayment("APPROVED")}
                    disabled={saving}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
                  >
                    <i className="fa-solid fa-check mr-1"></i>อนุมัติ
                  </button>
                  <button
                    onClick={() => handlePayment("REJECTED")}
                    disabled={saving}
                    className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
                  >
                    <i className="fa-solid fa-xmark mr-1"></i>ปฏิเสธ
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
