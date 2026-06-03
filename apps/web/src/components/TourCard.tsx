"use client";

import Link from "next/link";
import { useLang, pick } from "@/lib/lang";
import { type Tour, mainImageUrl } from "@/lib/api";

export default function TourCard({ tour }: { tour: Tour }) {
  const [lang] = useLang();
  const name = pick(tour.nameTh, tour.nameEn, lang);
  const desc = pick(tour.descriptionTh, tour.descriptionEn, lang);
  const img = mainImageUrl(tour.images);
  const nextSchedule = tour.schedules?.[0];

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-shadow duration-300 group block"
    >
      <div className="h-52 bg-gradient-to-br from-cyan-100 to-blue-300 relative overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="fa-solid fa-water-ladder text-cyan-300 text-6xl opacity-50"></i>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
          {tour.durationHours} {pick("ชั่วโมง", "hours", lang)}
        </div>
        <div className="absolute bottom-3 left-3 flex gap-2">
          <span className="bg-cyan-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {pick("สูงสุด", "Up to", lang)} {tour.maxSeats} {pick("ท่าน/รอบ", "guests/trip", lang)}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h2 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-cyan-600 transition">{name}</h2>
        <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">{desc}</p>

        {nextSchedule && (
          <div className="text-xs text-slate-500 mb-4">
            <i className="fa-regular fa-calendar mr-1 text-cyan-500"></i>
            {pick("รอบถัดไป", "Next trip", lang)}:{" "}
            <span className="font-medium text-slate-700">
              {new Date(nextSchedule.departureDate).toLocaleDateString(lang === "en" ? "en-US" : "th-TH", { dateStyle: "medium" })} · {nextSchedule.departureTime}
            </span>
          </div>
        )}

        <div className="flex items-end justify-between border-t border-slate-100 pt-4">
          <div>
            <div className="text-xs text-slate-400">{pick("ราคาต่อท่าน", "Per person", lang)}</div>
            <div className="text-[#f59e0b] font-bold text-xl">
              {tour.pricePerPerson.toLocaleString()}
              <span className="text-sm text-slate-500 font-normal">{pick(".-", " THB", lang)}</span>
            </div>
          </div>
          <span className="px-4 py-2 bg-cyan-600 text-white text-sm rounded-lg font-semibold group-hover:bg-cyan-700 transition">
            {pick("ดูรายละเอียด", "View details", lang)}
          </span>
        </div>
      </div>
    </Link>
  );
}
