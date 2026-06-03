"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getRoom, getTour, createBooking, type Room, type Tour, type TourSchedule } from "@/lib/api";
import { useLang, pick } from "@/lib/lang";

type Method = "BANK_TRANSFER" | "PROMPTPAY" | "CREDIT_CARD" | "ALIPAY" | "WECHAT_PAY";

function BookingForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [lang] = useLang();

  const type = params.get("type") as "ACCOMMODATION" | "DIVE_TOUR" | null;
  const roomSlug = params.get("roomSlug");
  const roomTypeId = params.get("roomTypeId");
  const tourSlug = params.get("tourSlug");
  const tourScheduleId = params.get("scheduleId");
  const checkIn = params.get("checkIn") ?? "";
  const checkOut = params.get("checkOut") ?? "";
  const guests = Number(params.get("guests") ?? 1);

  const [room, setRoom] = useState<Room | null>(null);
  const [tour, setTour] = useState<Tour | null>(null);
  const [loadingItem, setLoadingItem] = useState(true);

  useEffect(() => {
    if (type === "ACCOMMODATION" && roomSlug) {
      getRoom(roomSlug).then((r) => { setRoom(r); setLoadingItem(false); });
    } else if (type === "DIVE_TOUR" && tourSlug) {
      getTour(tourSlug).then((t) => { setTour(t); setLoadingItem(false); });
    } else {
      setLoadingItem(false);
    }
  }, [type, roomSlug, tourSlug]);

  const roomType = room?.types.find((t) => t.id === roomTypeId);
  const schedule: TourSchedule | undefined = tour?.schedules?.find((s) => s.id === tourScheduleId);
  const nights = checkIn && checkOut
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
    : 0;

  // Estimated total (server will compute final with season pricing)
  let estimated = 0;
  if (roomType && nights > 0) estimated = roomType.pricePerNight * nights;
  else if (tour && schedule) estimated = tour.pricePerPerson * guests;

  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [method, setMethod] = useState<Method>("PROMPTPAY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.phone || !form.email) { setError(pick("กรุณากรอกข้อมูลให้ครบ", "Please fill in all fields", lang)); return; }

    setLoading(true);
    try {
      const payload = {
        type: type!,
        guestName: form.name,
        guestPhone: form.phone,
        guestEmail: form.email,
        numGuests: guests,
        paymentMethod: method,
        ...(type === "ACCOMMODATION" ? { roomTypeId: roomType!.id, checkInDate: checkIn, checkOutDate: checkOut } : {}),
        ...(type === "DIVE_TOUR" ? { tourScheduleId: schedule!.id } : {}),
      };
      const { bookingNumber } = await createBooking(payload);
      router.push(`/bookings/${bookingNumber}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  if (loadingItem) return <><Navbar /><div className="min-h-screen pt-20 text-center text-slate-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl mt-20"></i></div></>;
  if ((type === "ACCOMMODATION" && (!room || !roomType)) || (type === "DIVE_TOUR" && (!tour || !schedule))) {
    return <><Navbar /><div className="min-h-screen pt-20 text-center text-slate-500"><p className="mt-20">{pick("ข้อมูลการจองไม่ครบ", "Booking info missing", lang)}</p></div></>;
  }

  const itemName = room && roomType
    ? `${pick(room.nameTh, room.nameEn, lang)} — ${pick(roomType.nameTh, roomType.nameEn, lang)}`
    : tour ? pick(tour.nameTh, tour.nameEn, lang) : "";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-20">
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-3xl">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8">
            <i className="fa-solid fa-clipboard-list text-[#2563eb] mr-3"></i>
            {pick("กรอกข้อมูลการจอง", "Booking details", lang)}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">{pick("สรุปการจอง", "Summary", lang)}</h2>
              <div className="flex gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 ${room ? "bg-blue-100" : "bg-cyan-100"}`}>
                  <i className={`fa-solid ${room ? "fa-bed text-blue-400" : "fa-water-ladder text-cyan-500"} text-2xl`}></i>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-800">{itemName}</div>
                  {room && roomType && (
                    <div className="text-sm text-slate-500 mt-1">
                      {checkIn} → {checkOut} ({nights} {pick("คืน", "nights", lang)}) · {guests} {pick("ท่าน", "guests", lang)}
                    </div>
                  )}
                  {tour && schedule && (
                    <div className="text-sm text-slate-500 mt-1">
                      {new Date(schedule.departureDate).toLocaleDateString(lang === "en" ? "en-US" : "th-TH", { dateStyle: "long" })} · {schedule.departureTime} · {guests} {pick("ท่าน", "guests", lang)}
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t border-slate-100 mt-4 pt-4 flex justify-between items-center">
                <div>
                  <div className="text-slate-500 text-sm">{pick("ยอดประมาณ", "Estimated", lang)}</div>
                  <p className="text-[10px] text-slate-400 italic">{pick("ยอดสุดท้ายคำนวณจากเซิร์ฟเวอร์ (รวมราคา high season)", "Final total calculated by server (incl. high season)", lang)}</p>
                </div>
                <span className="text-xl font-bold text-[#f59e0b]">{estimated.toLocaleString()}.-</span>
              </div>
            </div>

            {/* Guest Info */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{pick("ข้อมูลผู้จอง", "Guest info", lang)}</h2>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">{pick("ชื่อ-นามสกุล", "Full name", lang)} <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder={pick("กรอกชื่อ-นามสกุล", "Your full name", lang)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#2563eb] transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">{pick("เบอร์โทรศัพท์", "Phone", lang)} <span className="text-red-500">*</span></label>
                <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="0812345678"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#2563eb] transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">{pick("อีเมล", "Email", lang)} <span className="text-red-500">*</span></label>
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="email@example.com"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#2563eb] transition" />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-4">{pick("ช่องทางชำระเงิน", "Payment method", lang)}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {([
                  { value: "PROMPTPAY", label: "PromptPay", icon: "fa-qrcode", color: "text-purple-600" },
                  { value: "BANK_TRANSFER", label: pick("โอนธนาคาร", "Bank transfer", lang), icon: "fa-building-columns", color: "text-green-600" },
                  { value: "CREDIT_CARD", label: pick("บัตรเครดิต", "Credit card", lang), icon: "fa-credit-card", color: "text-blue-600" },
                  { value: "ALIPAY", label: "Alipay", icon: "fa-circle-dot", color: "text-sky-500" },
                  { value: "WECHAT_PAY", label: "WeChat Pay", icon: "fa-comment", color: "text-green-500" },
                ] as { value: Method; label: string; icon: string; color: string }[]).map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMethod(m.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${method === m.value ? "border-[#2563eb] bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <i className={`fa-solid ${m.icon} text-2xl ${m.color}`}></i>
                    <span className="text-xs font-medium text-slate-700">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                <i className="fa-solid fa-circle-exclamation mr-2"></i>{error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#2563eb] text-white rounded-xl font-bold text-base hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {loading ? (
                <span><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>{pick("กำลังจอง...", "Booking...", lang)}</span>
              ) : (
                <span><i className="fa-solid fa-lock mr-2"></i>{pick("ยืนยันการจอง", "Confirm Booking", lang)}</span>
              )}
            </button>

            <p className="text-center text-xs text-slate-400">
              {pick("เมื่อกด \"ยืนยันการจอง\" แสดงว่าคุณยอมรับเงื่อนไขการจองของเรา", "By clicking \"Confirm Booking\", you accept our terms.", lang)}
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function BookingPage() {
  return (
    <Suspense>
      <BookingForm />
    </Suspense>
  );
}
