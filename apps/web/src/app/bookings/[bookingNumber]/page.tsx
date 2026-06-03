"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewModal from "@/components/ReviewModal";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Payment {
  id: string;
  method: "BANK_TRANSFER" | "PROMPTPAY" | "CREDIT_CARD" | "ALIPAY" | "WECHAT_PAY";
  status: "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED";
  amount: number;
  slipUrl: string | null;
  chillpayOrderNo: string | null;
  failureMessage: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface Booking {
  bookingNumber: string;
  status: string;
  guestName: string;
  guestPhone: string;
  totalAmount: number;
  payments: Payment[];
  review: Review | null;
}

function STATUS_BADGE(s: string) {
  const map: Record<string, [string, string]> = {
    APPROVED: ["bg-green-100 text-green-700", "ชำระเงินแล้ว"],
    PENDING: ["bg-yellow-100 text-yellow-700", "รอชำระเงิน"],
    REJECTED: ["bg-red-100 text-red-700", "ชำระเงินไม่สำเร็จ"],
    REFUNDED: ["bg-slate-100 text-slate-600", "คืนเงินแล้ว"],
  };
  const [cls, label] = map[s] ?? ["bg-slate-100 text-slate-600", s];
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
}

export default function BookingPage({ params }: { params: Promise<{ bookingNumber: string }> }) {
  const { bookingNumber } = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/bookings/${bookingNumber}`);
      if (!res.ok) throw new Error("ไม่พบการจอง");
      setBooking(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }, [bookingNumber]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-20 pb-12 px-4">
        <div className="max-w-md mx-auto">
          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <i className="fa-solid fa-circle-notch fa-spin text-2xl"></i>
            </div>
          ) : error || !booking ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <i className="fa-solid fa-circle-exclamation text-3xl text-red-500 mb-3"></i>
              <p className="text-slate-600">{error}</p>
              <Link href="/" className="inline-block mt-4 text-blue-600 hover:underline">กลับหน้าหลัก</Link>
            </div>
          ) : (
            <BookingDetail booking={booking} onReload={load} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function BookingDetail({ booking, onReload }: { booking: Booking; onReload: () => void }) {
  const payment = booking.payments[0];
  const isPaid = payment?.status === "APPROVED";
  const canReview = ["CHECKED_IN", "COMPLETED"].includes(booking.status);
  const [showReview, setShowReview] = useState(false);

  return (
    <>
      <div className="text-center mb-6">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${isPaid ? "bg-green-100" : "bg-blue-100"}`}>
          <i className={`fa-solid ${isPaid ? "fa-check text-green-500" : "fa-receipt text-blue-500"} text-2xl`}></i>
        </div>
        <h1 className="text-xl font-bold text-slate-800">{isPaid ? "ชำระเงินสำเร็จ" : "กรุณาชำระเงิน"}</h1>
        <p className="text-slate-500 text-sm mt-1">สวัสดีคุณ {booking.guestName}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-[#2563eb] px-6 py-4 text-white">
          <div className="text-xs uppercase tracking-widest opacity-70 mb-1">หมายเลขการจอง</div>
          <div className="text-xl font-bold font-mono">{booking.bookingNumber}</div>
        </div>
        <div className="p-6 space-y-3">
          <Row label="สถานะการชำระเงิน">{payment ? STATUS_BADGE(payment.status) : "—"}</Row>
          <Row label="ยอดชำระ">
            <span className="font-bold text-[#2563eb] text-lg">฿{booking.totalAmount.toLocaleString()}</span>
          </Row>
          <Row label="วิธีชำระเงิน">
            <span className="text-slate-700">{METHOD_LABEL[payment?.method ?? "BANK_TRANSFER"]}</span>
          </Row>
        </div>
      </div>

      {payment && !isPaid && (
        <div className="mt-6">
          {payment.method === "BANK_TRANSFER"
            ? <BankTransferSection bookingNumber={booking.bookingNumber} payment={payment} onReload={onReload} />
            : <ChillPaySection bookingNumber={booking.bookingNumber} payment={payment} onReload={onReload} />}
        </div>
      )}

      {isPaid && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-700 text-center">
          <i className="fa-solid fa-envelope-circle-check mr-2"></i>
          เราได้ส่ง email ยืนยันให้คุณแล้ว
        </div>
      )}

      {canReview && (
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-bold text-slate-800 mb-2"><i className="fa-solid fa-star text-amber-400 mr-2"></i>รีวิวของคุณ</h3>
          {booking.review ? (
            <div>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <i key={n} className={`fa-solid fa-star ${n <= booking.review!.rating ? "text-amber-400" : "text-slate-200"}`}></i>
                ))}
              </div>
              {booking.review.comment && <p className="text-sm text-slate-600 leading-relaxed">{booking.review.comment}</p>}
              <p className="text-xs text-slate-400 mt-2">รีวิวเมื่อ {new Date(booking.review.createdAt).toLocaleDateString("th-TH")}</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-3">ขอบคุณที่ใช้บริการ! บอกเล่าประสบการณ์ของคุณให้คนอื่นรู้จักเรา</p>
              <button onClick={() => setShowReview(true)}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition">
                <i className="fa-solid fa-pen mr-2"></i>เขียนรีวิว
              </button>
            </>
          )}
        </div>
      )}

      {showReview && (
        <ReviewModal
          bookingNumber={booking.bookingNumber}
          guestPhone={booking.guestPhone}
          onClose={() => setShowReview(false)}
          onSubmitted={() => { setShowReview(false); onReload(); }}
        />
      )}

      <div className="flex flex-col gap-2 mt-6">
        <Link href={`/track?bookingNumber=${booking.bookingNumber}`} className="w-full py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold text-center hover:bg-slate-50">
          ติดตามสถานะการจอง
        </Link>
        <Link href="/" className="w-full py-3 text-slate-500 text-center text-sm hover:text-slate-700">
          กลับหน้าหลัก
        </Link>
      </div>
    </>
  );
}

const METHOD_LABEL: Record<string, string> = {
  BANK_TRANSFER: "โอนผ่านธนาคาร",
  PROMPTPAY: "พร้อมเพย์",
  CREDIT_CARD: "บัตรเครดิต/เดบิต",
  ALIPAY: "Alipay",
  WECHAT_PAY: "WeChat Pay",
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-500">{label}</span>
      <span>{children}</span>
    </div>
  );
}

// ─── Bank Transfer + Slip upload ──────────────────────────────────────────────
function BankTransferSection({ bookingNumber, payment, onReload }: { bookingNumber: string; payment: Payment; onReload: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  async function handleUpload() {
    if (!file) return;
    setUploading(true); setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API}/api/payments/${bookingNumber}/slip`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "อัพโหลดล้มเหลว");
      setFile(null);
      onReload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "อัพโหลดล้มเหลว");
    } finally {
      setUploading(false);
    }
  }

  if (payment.slipUrl) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-800 mb-3"><i className="fa-solid fa-clock text-amber-500 mr-2"></i>รอตรวจสอบสลิป</h3>
        <p className="text-sm text-slate-600 mb-3">เราจะตรวจสอบและยืนยันการชำระเงินภายใน 24 ชม.</p>
        <a href={payment.slipUrl} target="_blank" rel="noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={payment.slipUrl} alt="slip" className="rounded-xl w-full max-h-80 object-contain bg-slate-50" />
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-bold text-slate-800 mb-3"><i className="fa-solid fa-building-columns text-[#2563eb] mr-2"></i>โอนผ่านธนาคาร</h3>
      <div className="bg-slate-50 rounded-xl p-4 mb-4 text-sm space-y-1">
        <div className="flex justify-between"><span className="text-slate-500">ธนาคาร</span><span className="font-medium">กสิกรไทย</span></div>
        <div className="flex justify-between"><span className="text-slate-500">เลขที่บัญชี</span><span className="font-mono font-medium">123-4-56789-0</span></div>
        <div className="flex justify-between"><span className="text-slate-500">ชื่อบัญชี</span><span className="font-medium">JongJongDi Co.</span></div>
        <div className="flex justify-between pt-2 border-t border-slate-200 mt-2"><span className="text-slate-500">ยอดที่ต้องโอน</span><span className="font-bold text-[#2563eb]">฿{payment.amount.toLocaleString()}</span></div>
      </div>
      <label className="block">
        <span className="block text-xs font-medium text-slate-500 mb-2">อัพโหลดสลิปการโอน</span>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium" />
      </label>
      {err && <p className="text-red-500 text-xs mt-2"><i className="fa-solid fa-circle-exclamation mr-1"></i>{err}</p>}
      <button onClick={handleUpload} disabled={!file || uploading}
        className="w-full mt-3 py-2.5 bg-[#2563eb] text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50">
        {uploading ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>กำลังอัพโหลด...</> : "ส่งสลิป"}
      </button>
    </div>
  );
}

// ─── Online payment via ChillPay hosted page ──────────────────────────────────
function ChillPaySection({ bookingNumber, payment, onReload }: { bookingNumber: string; payment: Payment; onReload: () => void }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const label = METHOD_LABEL[payment.method] ?? "ออนไลน์";

  // After returning from ChillPay the webhook confirms in the background — poll for it.
  useEffect(() => {
    if (!payment.chillpayOrderNo || payment.status !== "PENDING") return;
    const t = setInterval(() => { onReload(); }, 5000);
    return () => clearInterval(t);
  }, [payment.chillpayOrderNo, payment.status, onReload]);

  async function pay() {
    setLoading(true); setErr("");
    try {
      const res = await fetch(`${API}/api/payments/${bookingNumber}/charge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: payment.method }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "เริ่มชำระเงินไม่สำเร็จ");
      if (!data.url || !data.fields) throw new Error("ไม่ได้รับข้อมูลชำระเงิน");
      submitToChillpay(data.url, data.fields); // redirects the browser
    } catch (e) {
      setErr(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-bold text-slate-800 mb-3"><i className="fa-solid fa-lock text-[#2563eb] mr-2"></i>ชำระผ่าน {label}</h3>
      {payment.chillpayOrderNo && payment.status === "PENDING" ? (
        <p className="text-sm text-slate-500 mb-3 text-center">
          <i className="fa-solid fa-circle-notch fa-spin mr-1"></i>กำลังรอยืนยันการชำระเงิน...
        </p>
      ) : (
        <p className="text-sm text-slate-600 mb-3">กดปุ่มเพื่อไปยังหน้าชำระเงินที่ปลอดภัยของ ChillPay (ยอด ฿{payment.amount.toLocaleString()})</p>
      )}
      {err && <p className="text-red-500 text-xs mb-2"><i className="fa-solid fa-circle-exclamation mr-1"></i>{err}</p>}
      <button onClick={pay} disabled={loading}
        className="w-full py-2.5 bg-[#2563eb] text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50">
        {loading
          ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>กำลังโหลด...</>
          : payment.chillpayOrderNo ? "ชำระเงินอีกครั้ง" : `ชำระผ่าน ${label}`}
      </button>
      <p className="text-xs text-slate-400 mt-2 text-center"><i className="fa-solid fa-lock mr-1"></i>ปลอดภัยด้วย ChillPay</p>
    </div>
  );
}

// Build and submit a hidden form to ChillPay's hosted payment page.
function submitToChillpay(url: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}
