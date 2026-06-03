"use client";

import { use, useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLang, pick } from "@/lib/lang";
import ReviewList from "@/components/ReviewList";
import { getTour, mainImageUrl, type Tour } from "@/lib/api";

export default function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang] = useLang();
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    getTour(slug).then((t) => { setTour(t); setLoading(false); });
  }, [slug]);

  if (loading) return <><Navbar /><div className="min-h-screen pt-20 text-center text-slate-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl mt-20"></i></div></>;
  if (!tour) { notFound(); }

  const name = pick(tour.nameTh, tour.nameEn, lang);
  const desc = pick(tour.descriptionTh, tour.descriptionEn, lang);
  const heroImg = mainImageUrl(tour.images);
  const schedules = tour.schedules ?? [];
  const schedule = schedules.find((s) => s.id === selectedSchedule);
  const total = schedule ? tour.pricePerPerson * guests : 0;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString(lang === "en" ? "en-US" : "th-TH", { dateStyle: "long" });

  function handleBook() {
    if (!schedule) return;
    router.push(`/booking?type=DIVE_TOUR&tourSlug=${tour!.slug}&scheduleId=${schedule.id}&guests=${guests}`);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-20">
        <div className="h-56 md:h-80 bg-gradient-to-br from-cyan-300 to-blue-500 flex items-center justify-center relative overflow-hidden">
          {heroImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImg} alt={name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <i className="fa-solid fa-water-ladder text-white text-8xl opacity-20"></i>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
          <div className="absolute bottom-6 left-6 text-white">
            <Link href="/tours" className="text-white/70 text-sm hover:text-white transition">
              <i className="fa-solid fa-arrow-left mr-2"></i>{pick("ทัวร์ทั้งหมด", "All tours", lang)}
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">{name}</h1>
            <div className="flex gap-3 mt-2 text-sm text-white/80">
              <span><i className="fa-solid fa-clock mr-1"></i>{tour.durationHours} {pick("ชั่วโมง", "hours", lang)}</span>
              <span><i className="fa-solid fa-users mr-1"></i>{pick("สูงสุด", "Up to", lang)} {tour.maxSeats} {pick("ท่าน/รอบ", "guests/trip", lang)}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="font-bold text-slate-800 text-lg mb-3">{pick("รายละเอียด", "About", lang)}</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{desc}</p>
              </div>

              <ReviewList resource="tour" slug={tour.slug} />

              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="font-bold text-slate-800 text-lg mb-4">
                  <i className="fa-regular fa-calendar text-cyan-600 mr-2"></i>
                  {pick("เลือกรอบออกเดินทาง", "Select departure", lang)}
                </h2>
                {schedules.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">{pick("ยังไม่มีรอบที่เปิดจอง", "No upcoming departures", lang)}</p>
                ) : (
                  <div className="space-y-3">
                    {schedules.map((s) => {
                      const isFull = s.availableSeats <= 0;
                      const isSelected = selectedSchedule === s.id;
                      return (
                        <button
                          key={s.id}
                          disabled={isFull}
                          onClick={() => setSelectedSchedule(s.id)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition text-left ${
                            isSelected ? "border-cyan-500 bg-cyan-50" : isFull ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed" : "border-slate-200 hover:border-cyan-300"
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-slate-800">{fmtDate(s.departureDate)}</div>
                            <div className="text-sm text-slate-500 mt-0.5">{pick("ออกเดินทาง", "Departure", lang)} {s.departureTime}</div>
                          </div>
                          <div className="text-right">
                            {isFull ? (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">{pick("เต็มแล้ว", "Full", lang)}</span>
                            ) : (
                              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">{pick("ว่าง", "Avail", lang)} {s.availableSeats} {pick("ที่", "seats", lang)}</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sticky top-24">
                <div className="mb-4">
                  <div className="text-xs text-slate-400">{pick("ราคาต่อท่าน", "Per person", lang)}</div>
                  <div className="text-3xl font-bold text-[#f59e0b]">
                    {tour.pricePerPerson.toLocaleString()}
                    <span className="text-base text-slate-500 font-normal">.-</span>
                  </div>
                </div>

                {schedule && (
                  <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3 mb-4 text-sm">
                    <div className="font-semibold text-cyan-700">{fmtDate(schedule.departureDate)}</div>
                    <div className="text-cyan-600 text-xs">{pick("ออกเดินทาง", "Departure", lang)} {schedule.departureTime}</div>
                  </div>
                )}

                <div className="border border-slate-200 rounded-xl p-3 mb-5">
                  <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">{pick("จำนวนผู้เดินทาง", "Guests", lang)}</div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
                      <i className="fa-solid fa-minus text-xs"></i>
                    </button>
                    <span className="font-bold text-slate-700 w-4 text-center">{guests}</span>
                    <button onClick={() => setGuests(Math.min(schedule?.availableSeats ?? tour.maxSeats, guests + 1))} className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
                      <i className="fa-solid fa-plus text-xs"></i>
                    </button>
                    <span className="text-xs text-slate-400">{pick("ท่าน", "guests", lang)}</span>
                  </div>
                </div>

                {schedule && (
                  <div className="bg-slate-50 rounded-xl p-4 mb-5 text-sm space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>{tour.pricePerPerson.toLocaleString()} × {guests} {pick("ท่าน", "guests", lang)}</span>
                      <span>{total.toLocaleString()}.-</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-800">
                      <span>{pick("ยอดรวม", "Total", lang)}</span>
                      <span className="text-[#f59e0b]">{total.toLocaleString()}.-</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBook}
                  disabled={!schedule}
                  className={`w-full py-3.5 rounded-xl font-bold text-center transition ${
                    schedule ? "bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-500/30" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {schedule ? pick("จองเลย", "Book Now", lang) : pick("เลือกรอบก่อน", "Select departure first", lang)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
