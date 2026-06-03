"use client";

import { useLang } from "@/lib/lang";
import { t, tx } from "@/lib/i18n";

export function TrendingSectionHeader() {
  const [lang] = useLang();
  return (
    <div className="flex items-center justify-between w-full">
      <div>
        <h2 className="text-xl md:text-3xl font-bold text-slate-800">
          {tx(t.trending.title, lang)}
        </h2>
        <div className="w-10 h-1 bg-[#f59e0b] mt-2 rounded-full"></div>
      </div>
      <span className="text-sm text-[#2563eb] font-semibold flex items-center gap-1">
        {tx(t.trending.viewAll, lang)} <i className="fa-solid fa-chevron-right text-[10px]"></i>
      </span>
    </div>
  );
}
