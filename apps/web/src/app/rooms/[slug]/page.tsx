"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import ReviewList from "@/components/ReviewList";
import { getRoom, mainImageUrl, type Room } from "@/lib/api";
import { useLang, pick } from "@/lib/lang";

export default function RoomDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang] = useLang();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    getRoom(slug).then((r) => {
      setRoom(r);
      // Auto-select first type if only one
      if (r && r.types.length === 1) setSelectedTypeId(r.types[0].id);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <><Navbar /><div className="min-h-screen pt-20 text-center text-slate-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl mt-20"></i></div></>;
  if (!room) { notFound(); }

  const name = pick(room.nameTh, room.nameEn, lang);
  const desc = pick(room.descriptionTh, room.descriptionEn, lang);
  const heroImg = mainImageUrl(room.images);
  const selectedType = room.types.find((t) => t.id === selectedTypeId);

  const nights = checkIn && checkOut
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
    : 0;
  const total = selectedType ? nights * selectedType.pricePerNight : 0;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-20">
        <div className="h-56 md:h-96 bg-gradient-to-br from-blue-200 to-cyan-300 flex items-center justify-center relative overflow-hidden">
          {heroImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImg} alt={name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <i className="fa-solid fa-bed text-white text-8xl opacity-30"></i>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
          <div className="absolute bottom-6 left-6 text-white">
            <Link href="/rooms" className="text-white/70 text-sm hover:text-white transition">
              <i className="fa-solid fa-arrow-left mr-2"></i>{pick("ห้องพักทั้งหมด", "All rooms", lang)}
            </Link>
            <h1 className="text-2xl md:text-4xl font-bold mt-1">{name}</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{desc}</p>
              </div>

              {/* Room types selector */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="font-bold text-slate-800 text-lg mb-4">
                  <i className="fa-solid fa-layer-group text-[#2563eb] mr-2"></i>
                  {pick("เลือกประเภทห้อง", "Select room type", lang)}
                </h2>
                <div className="space-y-3">
                  {room.types.map((t) => {
                    const isSelected = selectedTypeId === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => { setSelectedTypeId(t.id); if (guests > t.maxGuests) setGuests(t.maxGuests); }}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition text-left ${
                          isSelected ? "border-[#2563eb] bg-blue-50" : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-slate-800">{pick(t.nameTh, t.nameEn, lang)}</div>
                          <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-3">
                            <span><i className="fa-solid fa-user mr-1"></i>{pick("สูงสุด", "Up to", lang)} {t.maxGuests}</span>
                            <span><i className="fa-solid fa-layer-group mr-1"></i>{t.quantity} {pick("ห้อง", "rooms", lang)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[#f59e0b] font-bold text-lg">฿{t.pricePerNight.toLocaleString()}</div>
                          <div className="text-xs text-slate-400">{pick("/คืน", "/night", lang)}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Image gallery */}
              {room.images.length > 1 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <h2 className="font-bold text-slate-800 text-lg mb-4">
                    <i className="fa-regular fa-image text-[#2563eb] mr-2"></i>
                    {pick("รูปภาพ", "Photos", lang)} ({room.images.length})
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {room.images.map((img, i) => (
                      <a key={i} href={img.url} target="_blank" rel="noreferrer" className="block aspect-square rounded-xl overflow-hidden bg-slate-100 hover:opacity-90 transition">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Calendar */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="font-bold text-slate-800 text-lg mb-4">
                  <i className="fa-solid fa-calendar text-[#2563eb] mr-2"></i>
                  {pick("เลือกวันที่เข้าพัก", "Select dates", lang)}
                </h2>
                <AvailabilityCalendar onSelectDates={(ci, co) => { setCheckIn(ci); setCheckOut(co); }} />
              </div>

              <ReviewList resource="room" slug={room.slug} />
            </div>

            {/* Right: Booking Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sticky top-24">
                {selectedType ? (
                  <div className="mb-4">
                    <div className="text-xs text-slate-400">{pick(selectedType.nameTh, selectedType.nameEn, lang)} · {pick("ราคาต่อคืน", "per night", lang)}</div>
                    <div className="text-3xl font-bold text-[#f59e0b]">
                      {selectedType.pricePerNight.toLocaleString()}
                      <span className="text-base text-slate-500 font-normal">.-</span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 text-slate-400 text-sm">
                    {pick("เลือกประเภทห้องด้านซ้าย", "Select a room type", lang)}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="border border-slate-200 rounded-xl p-3">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">{pick("เช็คอิน", "Check-in", lang)}</div>
                    <div className="text-sm font-semibold text-slate-700 mt-0.5">{checkIn || "—"}</div>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-3">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">{pick("เช็คเอาต์", "Check-out", lang)}</div>
                    <div className="text-sm font-semibold text-slate-700 mt-0.5">{checkOut || "—"}</div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-3 mb-5">
                  <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">{pick("จำนวนผู้เข้าพัก", "Guests", lang)}</div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
                      <i className="fa-solid fa-minus text-xs"></i>
                    </button>
                    <span className="font-bold text-slate-700 w-4 text-center">{guests}</span>
                    <button onClick={() => setGuests(Math.min(selectedType?.maxGuests ?? 99, guests + 1))} disabled={!selectedType} className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition disabled:opacity-40">
                      <i className="fa-solid fa-plus text-xs"></i>
                    </button>
                    <span className="text-xs text-slate-400">{pick("ท่าน", "guests", lang)}</span>
                  </div>
                </div>

                {selectedType && nights > 0 && (
                  <div className="bg-slate-50 rounded-xl p-4 mb-5 text-sm space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>{selectedType.pricePerNight.toLocaleString()} × {nights} {pick("คืน", "nights", lang)}</span>
                      <span>{total.toLocaleString()}.-</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-800">
                      <span>{pick("ยอดประมาณ", "Estimated", lang)}</span>
                      <span className="text-[#f59e0b]">{total.toLocaleString()}.-</span>
                    </div>
                    <p className="text-[10px] text-slate-400 italic">{pick("ยอดสุดท้ายอาจเปลี่ยนถ้าอยู่ใน high season", "Final total may differ if dates fall in high season", lang)}</p>
                  </div>
                )}

                <Link
                  href={selectedType && checkIn && checkOut ? `/booking?type=ACCOMMODATION&roomTypeId=${selectedType.id}&roomSlug=${room.slug}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}` : "#"}
                  className={`w-full py-3.5 rounded-xl font-bold text-center block transition ${
                    selectedType && checkIn && checkOut ? "bg-[#2563eb] text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30" : "bg-slate-200 text-slate-400 cursor-not-allowed pointer-events-none"
                  }`}
                >
                  {!selectedType ? pick("เลือกประเภทห้องก่อน", "Pick a type first", lang) : !checkIn || !checkOut ? pick("เลือกวันที่ก่อน", "Select dates first", lang) : pick("จองเลย", "Book Now", lang)}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
