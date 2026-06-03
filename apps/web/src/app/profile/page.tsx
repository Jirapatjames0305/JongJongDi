"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getUserSession, saveUserSession, type UserInfo } from "@/lib/user-auth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Booking {
  id: string;
  bookingNumber: string;
  type: "ACCOMMODATION" | "DIVE_TOUR";
  status: string;
  totalAmount: number;
  createdAt: string;
  checkInDate: string | null;
  checkOutDate: string | null;
  numGuests: number;
  room: { nameTh: string; slug: string; images: { url: string }[] } | null;
  roomType: { nameTh: string } | null;
  tourSchedule: {
    departureDate: string;
    departureTime: string;
    tour: { nameTh: string; slug: string; images: { url: string }[] };
  } | null;
  payments: { status: string; method: string; amount: number }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "รอชำระเงิน",
  PENDING_CONFIRM: "รอยืนยัน",
  CONFIRMED: "ยืนยันแล้ว",
  CHECKED_IN: "เช็คอินแล้ว",
  COMPLETED: "เสร็จสิ้น",
  CANCELLED: "ยกเลิก",
  REFUNDED: "คืนเงินแล้ว",
  NO_SHOW: "ไม่มาใช้บริการ",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-700",
  PENDING_CONFIRM: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-green-100 text-green-700",
  CHECKED_IN: "bg-teal-100 text-teal-700",
  COMPLETED: "bg-slate-100 text-slate-600",
  CANCELLED: "bg-red-100 text-red-600",
  REFUNDED: "bg-purple-100 text-purple-700",
  NO_SHOW: "bg-red-100 text-red-600",
};

function fmt(n: number) { return n.toLocaleString("en-US"); }
function fmtDate(d: string | null) { if (!d) return "—"; return new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }); }

function authHeader() {
  const token = localStorage.getItem("jjd_user_token") ?? "";
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

// ─── Tab: Bookings ────────────────────────────────────────────────────────────

function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/users/me/bookings`, { headers: authHeader() })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setBookings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-16 text-center text-slate-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>;

  if (bookings.length === 0) return (
    <div className="py-16 text-center text-slate-400">
      <i className="fa-solid fa-calendar-xmark text-4xl mb-3 block"></i>
      <p className="text-sm">ยังไม่มีการจอง</p>
      <Link href="/rooms" className="mt-4 inline-block px-5 py-2 bg-[#2563eb] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
        ดูที่พักทั้งหมด
      </Link>
    </div>
  );

  return (
    <div className="space-y-4">
      {bookings.map((b) => {
        const isRoom = b.type === "ACCOMMODATION";
        const itemName = isRoom
          ? [b.room?.nameTh, b.roomType?.nameTh].filter(Boolean).join(" — ")
          : b.tourSchedule?.tour.nameTh ?? "ทัวร์";
        const img = isRoom
          ? b.room?.images?.[0]?.url
          : b.tourSchedule?.tour.images?.[0]?.url;
        const detailLink = isRoom
          ? (b.room ? `/rooms/${b.room.slug}` : null)
          : (b.tourSchedule ? `/tours/${b.tourSchedule.tour.slug}` : null);

        return (
          <div key={b.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col sm:flex-row">
            {/* Thumbnail */}
            <div className="sm:w-36 h-36 bg-slate-100 flex-shrink-0 relative overflow-hidden">
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt={itemName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <i className={`fa-solid ${isRoom ? "fa-bed" : "fa-water-ladder"} text-3xl`}></i>
                </div>
              )}
            </div>

            <div className="flex-1 p-4 flex flex-col justify-between gap-2">
              <div>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="text-xs text-slate-400 font-mono">{b.bookingNumber}</p>
                    <h3 className="font-semibold text-slate-800 mt-0.5">{itemName}</h3>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLOR[b.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {STATUS_LABEL[b.status] ?? b.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                  {isRoom && b.checkInDate && (
                    <>
                      <span><i className="fa-solid fa-right-to-bracket text-green-500 mr-1"></i>{fmtDate(b.checkInDate)}</span>
                      <span><i className="fa-solid fa-right-from-bracket text-red-400 mr-1"></i>{fmtDate(b.checkOutDate)}</span>
                    </>
                  )}
                  {!isRoom && b.tourSchedule && (
                    <span><i className="fa-solid fa-calendar-day text-blue-500 mr-1"></i>{fmtDate(b.tourSchedule.departureDate)} · {b.tourSchedule.departureTime}</span>
                  )}
                  <span><i className="fa-solid fa-user mr-1"></i>{b.numGuests} ท่าน</span>
                </div>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100">
                <span className="font-bold text-[#f59e0b]">฿{fmt(b.totalAmount)}</span>
                <div className="flex gap-2">
                  {detailLink && (
                    <Link href={detailLink} className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition font-medium">
                      ดูห้อง/ทัวร์
                    </Link>
                  )}
                  <Link href={`/bookings/${b.bookingNumber}`} className="text-xs px-3 py-1.5 bg-[#2563eb] text-white rounded-lg hover:bg-blue-700 transition font-medium">
                    รายละเอียด
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab: Profile Edit ────────────────────────────────────────────────────────

function ProfileTab({ user, onUpdated }: { user: UserInfo; onUpdated: (u: UserInfo) => void }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(""); setErr("");
    try {
      const res = await fetch(`${API}/api/users/me`, {
        method: "PATCH",
        headers: authHeader(),
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      const token = localStorage.getItem("jjd_user_token") ?? "";
      saveUserSession(token, data);
      onUpdated(data);
      setMsg("บันทึกเรียบร้อย");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) { setPwErr("รหัสผ่านใหม่ไม่ตรงกัน"); return; }
    setPwSaving(true); setPwMsg(""); setPwErr("");
    try {
      const res = await fetch(`${API}/api/users/me/change-password`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "เปลี่ยนรหัสผ่านไม่สำเร็จ");
      setPwMsg("เปลี่ยนรหัสผ่านเรียบร้อย");
      setCurPw(""); setNewPw(""); setConfirmPw("");
    } catch (e) {
      setPwErr(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setPwSaving(false);
    }
  }

  const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#2563eb] transition";

  return (
    <div className="space-y-6">
      {/* ข้อมูลพื้นฐาน */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 mb-5">ข้อมูลส่วนตัว</h3>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">ชื่อ</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">เบอร์โทรศัพท์</label>
            <input type="tel" value={user.phone} disabled className={`${inputCls} bg-slate-50 text-slate-400 cursor-not-allowed`} />
            <p className="text-xs text-slate-400 mt-1">เบอร์โทรไม่สามารถเปลี่ยนได้</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">อีเมล (ไม่บังคับ)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className={inputCls} />
          </div>

          {msg && <p className="text-green-600 text-xs"><i className="fa-solid fa-circle-check mr-1"></i>{msg}</p>}
          {err && <p className="text-red-500 text-xs"><i className="fa-solid fa-circle-exclamation mr-1"></i>{err}</p>}

          <button type="submit" disabled={saving} className="px-5 py-2.5 bg-[#2563eb] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {saving ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>กำลังบันทึก...</> : "บันทึก"}
          </button>
        </form>
      </div>

      {/* เปลี่ยนรหัสผ่าน */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 mb-5">เปลี่ยนรหัสผ่าน</h3>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">รหัสผ่านปัจจุบัน</label>
            <input type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)} required className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">รหัสผ่านใหม่</label>
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={6} placeholder="อย่างน้อย 6 ตัวอักษร" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">ยืนยันรหัสผ่านใหม่</label>
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required className={inputCls} />
          </div>

          {pwMsg && <p className="text-green-600 text-xs"><i className="fa-solid fa-circle-check mr-1"></i>{pwMsg}</p>}
          {pwErr && <p className="text-red-500 text-xs"><i className="fa-solid fa-circle-exclamation mr-1"></i>{pwErr}</p>}

          <button type="submit" disabled={pwSaving} className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition disabled:opacity-50">
            {pwSaving ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>กำลังเปลี่ยน...</> : "เปลี่ยนรหัสผ่าน"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Tab: Coupons + Referral ──────────────────────────────────────────────────

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minAmount: number | null;
  maxDiscount: number | null;
  expiresAt: string | null;
}

interface UserCoupon {
  id: string;
  source: string;
  claimedAt: string;
  usedAt: string | null;
  coupon: Coupon;
}

function CouponsTab() {
  const [vouchers, setVouchers] = useState<UserCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [code, setCode] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [claimMsg, setClaimMsg] = useState("");
  const [claimErr, setClaimErr] = useState("");
  const [copied, setCopied] = useState(false);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/users/me/vouchers`, { headers: authHeader() }).then((r) => r.ok ? r.json() : []),
      fetch(`${API}/api/users/me/referral`, { headers: authHeader() }).then((r) => r.ok ? r.json() : null),
    ]).then(([v, ref]) => {
      setVouchers(v);
      if (ref) { setReferralCode(ref.referralCode); setReferralCount(ref.referralCount); }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function claim(e: React.FormEvent) {
    e.preventDefault();
    setClaiming(true); setClaimMsg(""); setClaimErr("");
    try {
      const res = await fetch(`${API}/api/users/me/vouchers/claim`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ไม่สำเร็จ");
      setVouchers((prev) => [data, ...prev]);
      setCode("");
      setClaimMsg(`รับคูปอง "${data.coupon.code}" เรียบร้อย!`);
    } catch (e) {
      setClaimErr(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setClaiming(false);
    }
  }

  function copyReferral() {
    const link = `${siteUrl}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function discountLabel(c: Coupon) {
    return c.discountType === "PERCENT"
      ? `ลด ${c.discountValue}%${c.maxDiscount ? ` (สูงสุด ฿${fmt(c.maxDiscount)})` : ""}`
      : `ลด ฿${fmt(c.discountValue)}`;
  }

  function couponStatus(v: UserCoupon) {
    if (v.usedAt) return { label: "ใช้แล้ว", cls: "bg-slate-100 text-slate-500" };
    if (v.coupon.expiresAt && new Date(v.coupon.expiresAt) < new Date()) return { label: "หมดอายุ", cls: "bg-red-100 text-red-500" };
    return { label: "ใช้ได้", cls: "bg-green-100 text-green-700" };
  }

  const SOURCE_LABEL: Record<string, string> = {
    CLAIM: "รับด้วยโค้ด",
    REFERRAL_NEW: "ชวนเพื่อน (ผู้ถูกชวน)",
    REFERRAL_REWARD: "ชวนเพื่อน (รางวัล)",
  };

  if (loading) return <div className="py-16 text-center text-slate-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>;

  return (
    <div className="space-y-6">

      {/* Referral section */}
      {referralCode && (
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -mr-10 -mt-10"></div>
          <div className="relative">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <i className="fa-solid fa-user-plus"></i>ชวนเพื่อน รับคูปอง
            </h3>
            <p className="text-blue-100 text-sm mt-1">
              แชร์ลิงก์ของคุณ — ทั้งคุณและเพื่อนรับส่วนลด ฿100 ทันที
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 bg-white/20 rounded-xl px-4 py-2.5 font-mono text-sm tracking-widest font-bold">
                {referralCode}
              </div>
              <button
                onClick={copyReferral}
                className="px-4 py-2.5 bg-white text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-50 transition shrink-0 flex items-center gap-2"
              >
                <i className={`fa-solid ${copied ? "fa-check" : "fa-copy"}`}></i>
                {copied ? "คัดลอกแล้ว!" : "คัดลอกลิงก์"}
              </button>
            </div>
            {referralCount > 0 && (
              <p className="text-blue-100 text-xs mt-3">
                <i className="fa-solid fa-star text-yellow-300 mr-1"></i>
                คุณชวนเพื่อนสำเร็จแล้ว {referralCount} คน
              </p>
            )}
          </div>
        </div>
      )}

      {/* Claim form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-ticket text-yellow-500"></i>กรอกรหัสคูปอง
        </h3>
        <form onSubmit={claim} className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="เช่น WELCOME150"
            className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#2563eb] transition"
          />
          <button
            type="submit"
            disabled={claiming || !code.trim()}
            className="px-4 py-2.5 bg-[#2563eb] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 shrink-0"
          >
            {claiming ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "รับคูปอง"}
          </button>
        </form>
        {claimMsg && <p className="text-green-600 text-xs mt-2"><i className="fa-solid fa-circle-check mr-1"></i>{claimMsg}</p>}
        {claimErr && <p className="text-red-500 text-xs mt-2"><i className="fa-solid fa-circle-exclamation mr-1"></i>{claimErr}</p>}
      </div>

      {/* Coupon list */}
      {vouchers.length === 0 ? (
        <div className="py-10 text-center text-slate-400">
          <i className="fa-solid fa-ticket text-3xl mb-2 block opacity-40"></i>
          <p className="text-sm">ยังไม่มีคูปอง — กรอกโค้ดด้านบน หรือชวนเพื่อนเพื่อรับคูปอง</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vouchers.map((v) => {
            const status = couponStatus(v);
            const inactive = !!v.usedAt || (v.coupon.expiresAt ? new Date(v.coupon.expiresAt) < new Date() : false);
            return (
              <div key={v.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex ${inactive ? "opacity-55" : "border-yellow-200"}`}>
                <div className={`w-2 shrink-0 ${inactive ? "bg-slate-200" : "bg-yellow-400"}`}></div>
                <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-slate-800 tracking-widest">{v.coupon.code}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.cls}`}>{status.label}</span>
                      {v.source !== "CLAIM" && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          <i className="fa-solid fa-user-plus mr-1"></i>{SOURCE_LABEL[v.source] ?? v.source}
                        </span>
                      )}
                    </div>
                    {v.coupon.description && <p className="text-xs text-slate-500 mt-0.5">{v.coupon.description}</p>}
                    <p className="text-sm font-semibold text-[#f59e0b] mt-1">{discountLabel(v.coupon)}</p>
                    {v.coupon.minAmount && <p className="text-xs text-slate-400">ยอดขั้นต่ำ ฿{fmt(v.coupon.minAmount)}</p>}
                  </div>
                  <div className="text-right text-xs text-slate-400 shrink-0">
                    {v.coupon.expiresAt ? <p>หมดอายุ {fmtDate(v.coupon.expiresAt)}</p> : <p>ไม่มีวันหมดอายุ</p>}
                    <p className="mt-0.5">รับเมื่อ {fmtDate(v.claimedAt)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Upcoming ───────────────────────────────────────────────────────────

function UpcomingTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/users/me/bookings`, { headers: authHeader() })
      .then((r) => r.ok ? r.json() : [])
      .then((data: Booking[]) => {
        const upcoming = data.filter((b) => {
          if (!["CONFIRMED", "CHECKED_IN", "PENDING_CONFIRM"].includes(b.status)) return false;
          const date = b.checkInDate ?? b.tourSchedule?.departureDate ?? null;
          if (!date) return false;
          return new Date(date) >= new Date();
        });
        setBookings(upcoming);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-16 text-center text-slate-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>;

  if (bookings.length === 0) return (
    <div className="py-16 text-center text-slate-400">
      <i className="fa-solid fa-plane-departure text-4xl mb-3 block"></i>
      <p className="text-sm font-medium text-slate-500">ยังไม่มีแผนการเดินทาง</p>
      <p className="text-xs mt-1">การจองที่ยืนยันแล้วและยังไม่ถึงกำหนดจะแสดงที่นี่</p>
      <Link href="/rooms" className="mt-4 inline-block px-5 py-2 bg-[#2563eb] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
        ค้นหาที่พัก
      </Link>
    </div>
  );

  return (
    <div className="space-y-4">
      {bookings.map((b) => {
        const isRoom = b.type === "ACCOMMODATION";
        const itemName = isRoom
          ? [b.room?.nameTh, b.roomType?.nameTh].filter(Boolean).join(" — ")
          : b.tourSchedule?.tour.nameTh ?? "ทัวร์";
        const img = isRoom ? b.room?.images?.[0]?.url : b.tourSchedule?.tour.images?.[0]?.url;
        const targetDate = isRoom ? b.checkInDate : b.tourSchedule?.departureDate ?? null;
        const daysLeft = targetDate
          ? Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86400000)
          : null;

        return (
          <div key={b.id} className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
            {/* Countdown banner */}
            {daysLeft !== null && (
              <div className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 ${daysLeft <= 3 ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                <i className={`fa-solid ${daysLeft <= 3 ? "fa-bell animate-pulse" : "fa-clock"}`}></i>
                {daysLeft === 0 ? "วันนี้!" : daysLeft === 1 ? "พรุ่งนี้!" : `อีก ${daysLeft} วัน`}
                <span className="ml-auto font-normal text-slate-500">{fmtDate(targetDate)}</span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row">
              <div className="sm:w-32 h-32 bg-slate-100 flex-shrink-0 relative overflow-hidden">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt={itemName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <i className={`fa-solid ${isRoom ? "fa-bed" : "fa-water-ladder"} text-3xl`}></i>
                  </div>
                )}
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-400 font-mono">{b.bookingNumber}</p>
                  <h3 className="font-semibold text-slate-800 mt-0.5">{itemName}</h3>
                  <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLOR[b.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {STATUS_LABEL[b.status] ?? b.status}
                  </span>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap gap-x-3 text-xs text-slate-500">
                    {isRoom && b.checkOutDate && (
                      <span><i className="fa-solid fa-right-from-bracket text-red-400 mr-1"></i>เช็คเอาท์ {fmtDate(b.checkOutDate)}</span>
                    )}
                    <span><i className="fa-solid fa-user mr-1"></i>{b.numGuests} ท่าน</span>
                  </div>
                  <Link href={`/bookings/${b.bookingNumber}`} className="text-xs px-3 py-1.5 bg-[#2563eb] text-white rounded-lg hover:bg-blue-700 transition font-medium">
                    รายละเอียด
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab: Saved Cards ─────────────────────────────────────────────────────────

type CardType = "VISA" | "MASTERCARD" | "JCB" | "AMEX" | "UNIONPAY";

interface SavedCard {
  id: string;
  nickname: string | null;
  cardType: CardType;
  lastFour: string;
  expiryMonth: number;
  expiryYear: number;
  cardHolder: string;
  isDefault: boolean;
  createdAt: string;
}

const CARD_COLORS: Record<CardType, string> = {
  VISA: "from-blue-700 to-blue-500",
  MASTERCARD: "from-red-600 to-orange-500",
  JCB: "from-green-700 to-teal-500",
  AMEX: "from-slate-700 to-slate-500",
  UNIONPAY: "from-red-700 to-red-500",
};

const CARD_LOGO: Record<CardType, string> = {
  VISA: "VISA",
  MASTERCARD: "MC",
  JCB: "JCB",
  AMEX: "AMEX",
  UNIONPAY: "UP",
};

function CreditCardVisual({ card }: { card: SavedCard }) {
  const expiry = `${String(card.expiryMonth).padStart(2, "0")}/${String(card.expiryYear).slice(-2)}`;
  return (
    <div className={`bg-gradient-to-br ${CARD_COLORS[card.cardType]} rounded-2xl p-5 text-white shadow-lg w-full max-w-xs relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -mr-10 -mt-10"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 -ml-8 -mb-8"></div>
      <div className="flex justify-between items-start mb-6 relative">
        <div>
          {card.nickname && <p className="text-white/70 text-xs">{card.nickname}</p>}
          {card.isDefault && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">บัตรหลัก</span>}
        </div>
        <span className="font-bold text-lg tracking-wider">{CARD_LOGO[card.cardType]}</span>
      </div>
      <p className="font-mono text-lg tracking-[0.25em] mb-4 relative">•••• •••• •••• {card.lastFour}</p>
      <div className="flex justify-between items-end relative">
        <div>
          <p className="text-white/60 text-[10px] uppercase tracking-wider">Card Holder</p>
          <p className="font-semibold text-sm tracking-wide">{card.cardHolder}</p>
        </div>
        <div className="text-right">
          <p className="text-white/60 text-[10px] uppercase tracking-wider">Expires</p>
          <p className="font-semibold text-sm">{expiry}</p>
        </div>
      </div>
    </div>
  );
}

function CardsTab() {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [cardType, setCardType] = useState<CardType>("VISA");
  const [cardHolder, setCardHolder] = useState("");
  const [lastFour, setLastFour] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    fetch(`${API}/api/users/me/cards`, { headers: authHeader() })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setCards(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function addCard(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setErr("");
    try {
      const res = await fetch(`${API}/api/users/me/cards`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({
          cardType, cardHolder, lastFour,
          expiryMonth: Number(expiryMonth),
          expiryYear: Number(expiryYear),
          nickname: nickname || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ไม่สำเร็จ");
      setCards((prev) => [...prev, data]);
      setShowForm(false);
      setCardHolder(""); setLastFour(""); setExpiryMonth(""); setExpiryYear(""); setNickname("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  async function setDefault(id: string) {
    await fetch(`${API}/api/users/me/cards/${id}/default`, { method: "PATCH", headers: authHeader() });
    setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
  }

  async function removeCard(id: string) {
    await fetch(`${API}/api/users/me/cards/${id}`, { method: "DELETE", headers: authHeader() });
    const remaining = cards.filter((c) => c.id !== id);
    if (remaining.length && cards.find((c) => c.id === id)?.isDefault) {
      remaining[0].isDefault = true;
    }
    setCards(remaining);
  }

  const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#2563eb] transition";

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="py-16 text-center text-slate-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>
      ) : (
        <>
          {/* Card list */}
          {cards.length === 0 && !showForm ? (
            <div className="py-12 text-center text-slate-400">
              <i className="fa-solid fa-credit-card text-4xl mb-3 block opacity-40"></i>
              <p className="text-sm font-medium text-slate-500">ยังไม่มีบัตรที่บันทึกไว้</p>
              <p className="text-xs mt-1">เพิ่มบัตรเพื่อความสะดวกในการจ่ายเงินครั้งถัดไป</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cards.map((card) => (
                <div key={card.id} className="flex flex-col gap-3">
                  <CreditCardVisual card={card} />
                  <div className="flex gap-2">
                    {!card.isDefault && (
                      <button
                        onClick={() => setDefault(card.id)}
                        className="flex-1 text-xs py-2 border border-[#2563eb] text-[#2563eb] rounded-xl font-semibold hover:bg-blue-50 transition"
                      >
                        ตั้งเป็นบัตรหลัก
                      </button>
                    )}
                    <button
                      onClick={() => removeCard(card.id)}
                      className="flex-1 text-xs py-2 border border-red-200 text-red-500 rounded-xl font-semibold hover:bg-red-50 transition"
                    >
                      <i className="fa-solid fa-trash-can mr-1"></i>ลบบัตร
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add button */}
          {!showForm && cards.length < 5 && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 hover:border-[#2563eb] hover:text-[#2563eb] transition text-sm font-medium flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-plus"></i>เพิ่มบัตรใหม่
            </button>
          )}

          {/* Add form */}
          {showForm && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-5">เพิ่มบัตรใหม่</h3>
              <form onSubmit={addCard} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">ประเภทบัตร</label>
                  <div className="flex gap-2 flex-wrap">
                    {(["VISA", "MASTERCARD", "JCB", "AMEX", "UNIONPAY"] as CardType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setCardType(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${cardType === t ? "bg-[#2563eb] text-white border-[#2563eb]" : "border-slate-200 text-slate-600 hover:border-[#2563eb]"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">ชื่อบนบัตร</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    placeholder="SOMCHAI JAIDEE"
                    required
                    className={`${inputCls} uppercase`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">4 หลักสุดท้ายของบัตร</label>
                  <input
                    type="text"
                    value={lastFour}
                    onChange={(e) => setLastFour(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="1234"
                    maxLength={4}
                    pattern="\d{4}"
                    required
                    className={`${inputCls} font-mono tracking-widest`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">เดือนหมดอายุ</label>
                    <select value={expiryMonth} onChange={(e) => setExpiryMonth(e.target.value)} required className={inputCls}>
                      <option value="">เดือน</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">ปีหมดอายุ</label>
                    <select value={expiryYear} onChange={(e) => setExpiryYear(e.target.value)} required className={inputCls}>
                      <option value="">ปี (ค.ศ.)</option>
                      {Array.from({ length: 12 }, (_, i) => new Date().getFullYear() + i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">ชื่อเรียกบัตร (ไม่บังคับ)</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="เช่น บัตรส่วนตัว, บัตรบริษัท"
                    className={inputCls}
                  />
                </div>

                {err && <p className="text-red-500 text-xs"><i className="fa-solid fa-circle-exclamation mr-1"></i>{err}</p>}

                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#2563eb] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                    {saving ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>กำลังบันทึก...</> : "บันทึกบัตร"}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setErr(""); }} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Tab: Favorites ───────────────────────────────────────────────────────────

interface FavoriteItem {
  id: string;
  targetType: "ROOM" | "TOUR" | "PRODUCT";
  createdAt: string;
  room: { id: string; slug: string; nameTh: string; images: { url: string }[] } | null;
  tour: { id: string; slug: string; nameTh: string; images: { url: string }[] } | null;
  product: { id: string; slug: string; nameTh: string; images: { url: string }[] } | null;
}

const TYPE_LABEL: Record<string, string> = { ROOM: "ที่พัก", TOUR: "ทัวร์", PRODUCT: "สินค้า" };
const TYPE_ICON: Record<string, string> = { ROOM: "fa-bed", TOUR: "fa-water-ladder", PRODUCT: "fa-bag-shopping" };
const TYPE_COLOR: Record<string, string> = { ROOM: "bg-blue-100 text-blue-700", TOUR: "bg-cyan-100 text-cyan-700", PRODUCT: "bg-yellow-100 text-yellow-700" };

function FavoritesTab() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/api/favorites`, { headers: authHeader() })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setFavorites(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function remove(id: string) {
    setRemoving(id);
    await fetch(`${API}/api/favorites/${id}`, { method: "DELETE", headers: authHeader() });
    setFavorites((prev) => prev.filter((f) => f.id !== id));
    setRemoving(null);
  }

  if (loading) return <div className="py-16 text-center text-slate-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>;

  if (favorites.length === 0) return (
    <div className="py-16 text-center text-slate-400">
      <i className="fa-regular fa-heart text-4xl mb-3 block"></i>
      <p className="text-sm font-medium text-slate-500">ยังไม่มีรายการโปรด</p>
      <p className="text-xs mt-1">กดหัวใจในหน้าที่พักหรือทัวร์เพื่อบันทึกไว้ที่นี่</p>
      <div className="flex gap-3 justify-center mt-4">
        <Link href="/rooms" className="px-4 py-2 bg-[#2563eb] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">ดูที่พัก</Link>
        <Link href="/tours" className="px-4 py-2 bg-white border border-[#2563eb] text-[#2563eb] rounded-xl text-sm font-semibold hover:bg-blue-50 transition">ดูทัวร์</Link>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {favorites.map((f) => {
        const entity = f.room ?? f.tour ?? f.product;
        if (!entity) return null;
        const href = f.room ? `/rooms/${entity.slug}` : f.tour ? `/tours/${entity.slug}` : `/products/${entity.slug}`;
        const img = entity.images?.[0]?.url;

        return (
          <div key={f.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group relative">
            <Link href={href} className="block">
              <div className="h-36 bg-slate-100 relative overflow-hidden">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt={entity.nameTh} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <i className={`fa-solid ${TYPE_ICON[f.targetType]} text-3xl`}></i>
                  </div>
                )}
                <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLOR[f.targetType]}`}>
                  {TYPE_LABEL[f.targetType]}
                </span>
              </div>
              <div className="px-4 py-3">
                <p className="font-semibold text-slate-800 text-sm line-clamp-1 group-hover:text-[#2563eb] transition">{entity.nameTh}</p>
              </div>
            </Link>
            <button
              onClick={() => remove(f.id)}
              disabled={removing === f.id}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition"
              title="ลบออกจากรายการโปรด"
            >
              <i className={`fa-solid ${removing === f.id ? "fa-circle-notch fa-spin" : "fa-heart-crack"} text-xs`}></i>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = "upcoming" | "bookings" | "coupons" | "vouchers" | "favorites" | "profile";

const VALID_TABS: Tab[] = ["upcoming", "bookings", "coupons", "vouchers", "favorites", "profile"];

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserInfo | null>(null);

  const rawTab = searchParams.get("tab") as Tab | null;
  const [tab, setTab] = useState<Tab>(VALID_TABS.includes(rawTab as Tab) ? (rawTab as Tab) : "upcoming");

  useEffect(() => {
    const u = getUserSession();
    if (!u) { router.replace("/login"); return; }
    setUser(u);
  }, [router]);

  useEffect(() => {
    const t = searchParams.get("tab") as Tab | null;
    if (t && VALID_TABS.includes(t)) setTab(t);
  }, [searchParams]);

  if (!user) return <><Navbar /><div className="min-h-screen pt-20 flex items-center justify-center text-slate-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div></>;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-20">
        {/* Header */}
        <div className="bg-white border-b border-slate-100">
          <div className="container mx-auto px-4 md:px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#2563eb] text-white flex items-center justify-center text-2xl font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">{user.name}</h1>
                <p className="text-sm text-slate-500">{user.phone}{user.email ? ` · ${user.email}` : ""}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-0.5 mt-5 border-b border-slate-200 overflow-x-auto scrollbar-hide">
              {([
                { key: "upcoming",  label: "ใกล้มาถึง",      icon: "fa-plane-departure" },
                { key: "bookings",  label: "การจองของฉัน",   icon: "fa-calendar-check" },
                { key: "coupons",   label: "คูปอง",          icon: "fa-ticket" },
                { key: "vouchers",  label: "บัตรของฉัน",     icon: "fa-credit-card" },
                { key: "favorites", label: "รายการโปรด",     icon: "fa-heart" },
                { key: "profile",   label: "ข้อมูลส่วนตัว",  icon: "fa-user" },
              ] as { key: Tab; label: string; icon: string }[]).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition -mb-px whitespace-nowrap ${
                    tab === t.key
                      ? "border-[#2563eb] text-[#2563eb]"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <i className={`fa-solid ${t.icon}`}></i>
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className="sm:hidden">{t.label.split("ของ")[0] || t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 md:px-6 py-8 max-w-3xl">
          {tab === "upcoming"  && <UpcomingTab />}
          {tab === "bookings"  && <BookingsTab />}
          {tab === "coupons"   && <CouponsTab />}
          {tab === "vouchers"  && <CardsTab />}
          {tab === "favorites" && <FavoritesTab />}
          {tab === "profile"   && <ProfileTab user={user} onUpdated={setUser} />}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ProfileContent />
    </Suspense>
  );
}
