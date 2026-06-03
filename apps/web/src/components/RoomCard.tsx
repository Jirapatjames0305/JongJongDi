"use client";

import Link from "next/link";
import { useLang, pick } from "@/lib/lang";
import { type Room, mainImageUrl } from "@/lib/api";

export default function RoomCard({ room }: { room: Room }) {
  const [lang] = useLang();
  const name = pick(room.nameTh, room.nameEn, lang);
  const desc = pick(room.descriptionTh, room.descriptionEn, lang);
  const img = mainImageUrl(room.images);

  const types = room.types ?? [];
  const minPrice = types.length ? Math.min(...types.map((t) => t.pricePerNight)) : 0;
  const maxPrice = types.length ? Math.max(...types.map((t) => t.pricePerNight)) : 0;
  const totalQty = types.reduce((s, t) => s + t.quantity, 0);
  const maxCap = types.length ? Math.max(...types.map((t) => t.maxGuests)) : 0;

  return (
    <Link
      href={`/rooms/${room.slug}`}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-shadow duration-300 group block"
    >
      <div className="h-52 bg-gradient-to-br from-blue-100 to-cyan-200 relative overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="fa-solid fa-bed text-blue-300 text-6xl opacity-50"></i>
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          <span className="bg-white/90 backdrop-blur text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
            <i className="fa-solid fa-user mr-1"></i>{pick("สูงสุด", "Up to", lang)} {maxCap}
          </span>
          {types.length > 1 && (
            <span className="bg-[#2563eb] text-white text-xs font-bold px-3 py-1 rounded-full shadow">
              {types.length} {pick("ประเภท", "types", lang)} · {totalQty} {pick("ห้อง", "rooms", lang)}
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <h2 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-[#2563eb] transition">
          {name}
        </h2>
        <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
          {desc}
        </p>

        <div className="flex items-end justify-between border-t border-slate-100 pt-4">
          <div>
            <div className="text-xs text-slate-400">{pick("ราคาเริ่มต้น", "From", lang)}</div>
            <div className="text-[#f59e0b] font-bold text-xl">
              {minPrice.toLocaleString()}{minPrice !== maxPrice && `–${maxPrice.toLocaleString()}`}
              <span className="text-sm text-slate-500 font-normal"> {pick(".-/คืน", " THB/night", lang)}</span>
            </div>
          </div>
          <span className="px-4 py-2 bg-[#2563eb] text-white text-sm rounded-lg font-semibold group-hover:bg-blue-700 transition">
            {pick("ดูรายละเอียด", "View details", lang)}
          </span>
        </div>
      </div>
    </Link>
  );
}
