"use client";

import { useState } from "react";
import { useLang } from "@/lib/lang";
import { t, tx } from "@/lib/i18n";

const SERVICE_TABS = [
  { icon: "fa-hotel",        labelKey: t.services.room.label,     href: "/rooms",                            active: true  },
  { icon: "fa-water-ladder", labelKey: t.services.dive.label,     href: "/tours",                            active: true  },
  { icon: "fa-utensils",     labelKey: t.services.restaurant.label, href: null,                              active: false },
  { icon: "fa-user-clock",   labelKey: t.services.queue.label,    href: null,                                active: false },
  { icon: "fa-ticket",       labelKey: t.services.ticket.label,   href: null,                                active: false },
];

const TRUST_BADGES = [
  { icon: "fa-tag",         badge: t.hero.badge1, sub: t.hero.badge1s },
  { icon: "fa-shield-halved", badge: t.hero.badge2, sub: t.hero.badge2s },
  { icon: "fa-lock",        badge: t.hero.badge3, sub: t.hero.badge3s },
  { icon: "fa-headset",     badge: t.hero.badge4, sub: t.hero.badge4s },
];

function DateField({
  icon, label, value, min, onChange,
}: {
  icon: string; label: string; value: string; min?: string; onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 cursor-pointer md:w-40">
      <i className={`fa-solid ${icon} text-slate-400 text-sm shrink-0`}></i>
      <span className="flex flex-col min-w-0 flex-1">
        <span className="text-[10px] text-slate-400 leading-none text-left">{label}</span>
        <input
          type="date"
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent outline-none text-sm text-slate-700 w-full"
        />
      </span>
    </label>
  );
}

export default function HeroSection() {
  const [lang] = useLang();
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [date, setDate] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const mode = SERVICE_TABS[activeTab].href; // "/rooms" | "/tours" | external | null

  function handleSearch() {
    const tab = SERVICE_TABS[activeTab];
    if (!tab.active || !tab.href) return;
    if (tab.href.startsWith("http")) {
      window.location.href = tab.href;
      return;
    }
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (tab.href === "/rooms") {
      if (checkIn) params.set("checkIn", checkIn);
      if (checkOut) params.set("checkOut", checkOut);
    } else if (tab.href === "/tours") {
      if (date) params.set("date", date);
    }
    const qs = params.toString();
    window.location.href = qs ? `${tab.href}?${qs}` : tab.href;
  }

  return (
    <>
      {/* Hero */}
      <header className="relative min-h-[75vh] flex flex-col justify-end overflow-hidden pt-16">
        {/* Hero photo background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-bg.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          aria-hidden="true"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

        {/* Text content */}
        <div className="relative z-10 text-center px-4 pb-10 mt-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs text-white/90 mb-5 backdrop-blur-sm">
            <i className="fa-solid fa-location-dot text-[#f59e0b]"></i>
            {lang === "th" ? "ไทย · ทั่วโลก" : "Thailand · Worldwide"}
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
            {tx(t.hero.title, lang)}<br />
            <span className="text-[#f59e0b]">{tx(t.hero.titleHl, lang)}</span>
          </h1>
          <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto mb-8 leading-relaxed min-h-[4.25rem] md:min-h-[3.25rem] flex items-start justify-center">
            <span>{tx(t.hero.subtitle, lang)}</span>
          </p>

          {/* Search widget */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden relative z-20 mt-4 mb-6">
            {/* Service tabs */}
            <div className="flex overflow-x-auto scrollbar-hide border-b border-slate-100">
              {SERVICE_TABS.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 px-5 md:px-7 py-4 text-[11px] md:text-xs font-medium transition border-b-2 min-w-[70px] ${
                    activeTab === i
                      ? "border-[#2563eb] text-[#2563eb]"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  } ${!tab.active ? "opacity-50" : ""}`}
                >
                  <i className={`fa-solid ${tab.icon} text-base md:text-lg`}></i>
                  <span className="whitespace-nowrap">{tx(tab.labelKey, lang)}</span>
                  {!tab.active && (
                    <span className="text-[9px] text-slate-400 -mt-0.5">{tx(t.services.comingSoon, lang)}</span>
                  )}
                </button>
              ))}
            </div>
            {/* Search row */}
            <div className="flex flex-col md:flex-row md:items-stretch gap-2 p-4 md:p-5">
              <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <i className="fa-solid fa-location-dot text-slate-400 text-sm shrink-0"></i>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={tx(t.hero.searchPh, lang)}
                  className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 min-w-0"
                />
              </div>

              {/* Date fields — adapt to active tab */}
              {mode === "/rooms" && (
                <>
                  <DateField
                    icon="fa-calendar-check" label={tx(t.hero.checkIn, lang)}
                    value={checkIn} min={today}
                    onChange={(v) => { setCheckIn(v); if (checkOut && v >= checkOut) setCheckOut(""); }}
                  />
                  <DateField
                    icon="fa-calendar-xmark" label={tx(t.hero.checkOut, lang)}
                    value={checkOut} min={checkIn || today}
                    onChange={setCheckOut}
                  />
                </>
              )}
              {mode === "/tours" && (
                <DateField
                  icon="fa-calendar-day" label={tx(t.hero.departDate, lang)}
                  value={date} min={today}
                  onChange={setDate}
                />
              )}

              <button
                onClick={handleSearch}
                className="px-5 md:px-7 py-3 bg-[#2563eb] text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition shadow-md shadow-blue-500/30 active:scale-95 whitespace-nowrap"
              >
                <i className="fa-solid fa-magnifying-glass mr-1.5"></i>
                {tx(t.hero.searchBtn, lang)}
              </button>
            </div>
            {/* Trust badges — inside widget */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/70">
              {TRUST_BADGES.map((b, i) => (
                <div key={i} className="flex items-center gap-2 min-h-[2.75rem]">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <i className={`fa-solid ${b.icon} text-[#2563eb] text-[11px]`}></i>
                  </div>
                  <div>
                    <div className="font-semibold text-[11px] text-slate-700 leading-tight">{tx(b.badge, lang)}</div>
                    <div className="text-[10px] text-slate-400 leading-tight">{tx(b.sub, lang)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
