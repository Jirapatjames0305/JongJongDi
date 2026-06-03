"use client";

import { useToast } from "./ToastContext";
import { useLang } from "@/lib/lang";
import { t, tx } from "@/lib/i18n";

const SERVICES = [
  {
    icon:      "fa-hotel",
    grad:      "from-blue-400 to-blue-600",
    bg:        "bg-blue-50",
    color:     "text-[#2563eb]",
    category:  "ที่พัก",
    href:      "/rooms",
    image:     "/resort.png",
    ...t.services.room,
  },
  {
    icon:      "fa-water-ladder",
    grad:      "from-cyan-400 to-teal-600",
    bg:        "bg-cyan-50",
    color:     "text-cyan-600",
    category:  "ทัวร์",
    href:      "/tours",
    image:     "/coral.png",
    ...t.services.dive,
  },
  {
    icon:      "fa-utensils",
    grad:      "from-orange-400 to-red-500",
    bg:        "bg-orange-50",
    color:     "text-orange-500",
    category:  "ร้านอาหาร",
    disabled:  true,
    ...t.services.restaurant,
  },
  {
    icon:      "fa-user-clock",
    grad:      "from-green-400 to-emerald-600",
    bg:        "bg-green-50",
    color:     "text-green-600",
    category:  "คิวบริการ",
    disabled:  true,
    ...t.services.queue,
  },
  {
    icon:      "fa-ticket",
    grad:      "from-purple-400 to-violet-600",
    bg:        "bg-purple-50",
    color:     "text-purple-600",
    category:  "ตั๋วเข้าชม",
    disabled:  true,
    ...t.services.ticket,
  },
  {
    icon:      "fa-bag-shopping",
    grad:      "from-pink-400 to-rose-500",
    bg:        "bg-pink-50",
    color:     "text-pink-600",
    category:  "สินค้า",
    href:      "https://siambox.jongjongdi.com/zh",
    image:     "/siambox-logo.png",
    imageContain: true,
    imageBg:   "bg-[#6e1f23]",
    ...t.services.product,
  },
] as const;

export default function ServicesSection() {
  const { showToast } = useToast();
  const [lang] = useLang();

  return (
    <section id="services" className="py-10 md:py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <div>
            <h2 className="text-xl md:text-3xl font-bold text-slate-800">
              {tx(t.services.title, lang)}
            </h2>
            <div className="w-10 h-1 bg-[#2563eb] mt-2 rounded-full"></div>
          </div>
          <a href="/rooms" className="text-sm text-[#2563eb] font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            {tx(t.services.viewAll, lang)} <i className="fa-solid fa-chevron-right text-[10px]"></i>
          </a>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-5">
          {SERVICES.map((s) => {
            const isDisabled = "disabled" in s && s.disabled;
            const href       = "href" in s ? s.href : undefined;

            const inner = (
              <>
                {/* Image area */}
                {(() => {
                const hasImg  = "image" in s && s.image;
                const contain = "imageContain" in s && s.imageContain;
                const imgBg   = "imageBg" in s ? s.imageBg : "";
                return (
                <div className={`relative h-28 md:h-40 flex items-center justify-center overflow-hidden ${hasImg ? imgBg : `bg-gradient-to-br ${s.grad}`}`}>
                  {hasImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.image} alt={tx(s.label, lang)} className={`absolute inset-0 w-full h-full ${contain ? "object-contain p-3 md:p-4" : "object-cover"}`} />
                  ) : (
                    <>
                      <i className={`fa-solid ${s.icon} text-4xl md:text-5xl text-white/60`}></i>
                      {/* Decorative circle */}
                      <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white/10"></div>
                      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-white/10"></div>
                    </>
                  )}
                  {/* Coming soon badge */}
                  {isDisabled && (
                    <span className="absolute top-2 right-2 text-[9px] md:text-[10px] bg-black/30 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                      {tx(t.services.comingSoon, lang)}
                    </span>
                  )}
                </div>
                );
                })()}
                {/* Icon badge overlapping */}
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 md:hidden w-8 h-8 rounded-full ${s.bg} ${s.color} border-2 border-white shadow-md flex items-center justify-center text-xs`}>
                  <i className={`fa-solid ${s.icon}`}></i>
                </div>
                {/* Content */}
                <div className="p-3 md:p-4">
                  <h3 className="font-bold text-xs md:text-sm text-slate-800 text-center md:text-left mb-1 line-clamp-1">
                    {tx(s.label, lang)}
                  </h3>
                  <p className="hidden md:block text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                    {tx(s.desc, lang)}
                  </p>
                  <div className={`hidden md:flex items-center gap-1 mt-2 text-[11px] font-semibold ${s.color}`}>
                    {tx(t.services.cta, lang)} <i className="fa-solid fa-chevron-right text-[9px]"></i>
                  </div>
                </div>
              </>
            );

            const baseClass = "relative rounded-xl overflow-visible border border-slate-100 shadow-sm group";

            if (isDisabled) {
              return (
                <div key={s.category} className={`${baseClass} opacity-60 cursor-not-allowed overflow-hidden`}>
                  {inner}
                </div>
              );
            }
            if (href) {
              return (
                <a
                  key={s.category}
                  href={href}
                  className={`${baseClass} overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95 block no-underline`}
                >
                  {inner}
                </a>
              );
            }
            return (
              <div
                key={s.category}
                onClick={() => showToast(`เปิดหน้า: ${s.category}`)}
                className={`${baseClass} overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95 cursor-pointer`}
              >
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
