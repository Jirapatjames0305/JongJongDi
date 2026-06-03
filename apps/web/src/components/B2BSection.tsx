"use client";

import { useLang } from "@/lib/lang";
import { t, tx } from "@/lib/i18n";

export default function B2BSection() {
  const [lang] = useLang();

  return (
    <section id="system" className="py-12 md:py-20 bg-[#0f172a] text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <i className="fa-solid fa-chart-line absolute top-10 left-10 text-9xl"></i>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-12">
          {/* Left */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <span className="text-[#f59e0b] font-bold text-xs tracking-wider uppercase mb-3 block">
              {tx(t.b2b.badge, lang)}
            </span>
            <h2 className="text-2xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
              {tx(t.b2b.title1, lang)}<br />{tx(t.b2b.title2, lang)}
            </h2>
            <p className="text-slate-300 text-sm md:text-lg mb-8 mx-auto lg:mx-0 max-w-lg">
              {tx(t.b2b.subtitle, lang)}
            </p>

            <ul className="space-y-3 mb-8 text-left inline-block">
              {([t.b2b.f1, t.b2b.f2, t.b2b.f3] as const).map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm md:text-base">
                  <i className="fa-solid fa-check-circle text-green-400"></i>
                  <span>{tx(f, lang)}</span>
                </li>
              ))}
            </ul>

            <a
              href="mailto:puangkasem@gmail.com?subject=สนใจระบบจอง JongJongDi - ขอใบเสนอราคา"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-[#f59e0b] text-white rounded-lg font-bold hover:bg-yellow-600 transition shadow-lg shadow-yellow-500/20 active:scale-95"
            >
              <i className="fa-solid fa-envelope"></i> {tx(t.b2b.cta, lang)}
            </a>
          </div>

          {/* Right: Dashboard Mockup */}
          <div className="lg:w-1/2 w-full">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/10 shadow-2xl">
              <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                <div className="bg-slate-50 p-3 border-b flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-red-400 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="ml-2 text-[10px] text-slate-400 font-mono">dashboard.jongjongdi.com</div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <div className="text-xs text-slate-500">{tx(t.b2b.todayOrders, lang)}</div>
                      <div className="text-2xl font-bold text-slate-800">128 <span className="text-sm font-normal text-slate-400">{tx(t.b2b.unit, lang)}</span></div>
                    </div>
                    <div className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded font-bold">+12%</div>
                  </div>
                  <div className="flex items-end gap-1.5 h-24">
                    <div className="w-1/6 bg-blue-50 h-1/2 rounded-t"></div>
                    <div className="w-1/6 bg-blue-100 h-2/3 rounded-t"></div>
                    <div className="w-1/6 bg-blue-200 h-1/3 rounded-t"></div>
                    <div className="w-1/6 bg-[#2563eb] h-full rounded-t"></div>
                    <div className="w-1/6 bg-blue-200 h-3/4 rounded-t"></div>
                    <div className="w-1/6 bg-blue-100 h-1/2 rounded-t"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
