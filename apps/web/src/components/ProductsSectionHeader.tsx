"use client";

import { useLang } from "@/lib/lang";
import { t, tx } from "@/lib/i18n";

export function ProductsSectionHeader() {
  const [lang] = useLang();
  return (
    <div className="flex items-end justify-between w-full">
      <div>
        <h2 className="text-xl md:text-3xl font-bold text-slate-800">
          {tx(t.productList.title, lang)}
        </h2>
        <p className="text-slate-500 text-sm mt-1">{tx(t.productList.subtitle, lang)}</p>
        <div className="w-10 h-1 bg-[#f59e0b] mt-2 rounded-full"></div>
      </div>
    </div>
  );
}
