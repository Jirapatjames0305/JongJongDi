"use client";

import Link from "next/link";
import { useLang } from "@/lib/lang";
import { t, tx } from "@/lib/i18n";

export default function AboutContent() {
  const [lang] = useLang();
  const a = t.about;

  return (
    <main className="min-h-screen bg-white pt-16">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1d4ed8] to-[#0f172a] text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-8 left-12 w-64 h-64 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-8 right-12 w-96 h-96 rounded-full bg-blue-300 blur-3xl"></div>
        </div>
        <div className="relative container mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <i className="fa-solid fa-circle-info text-yellow-400"></i>
            {tx(a.tag, lang)}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            {tx(a.title, lang)}<br />
            <span className="text-yellow-400">{tx(a.titleHl, lang)}</span>
          </h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-xl mx-auto">{tx(a.subtitle, lang)}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="container mx-auto max-w-4xl px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {a.stats.map((s) => (
            <div key={s.value}>
              {/* <div className="text-3xl font-bold text-[#2563eb]">{s.value}</div> */}
              <div className="text-sm text-slate-500 mt-1">{tx(s.label, lang)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="container mx-auto max-w-3xl px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{tx(a.storyTitle, lang)}</h2>
        </div>
        <div className="text-slate-600 leading-relaxed space-y-5 text-base">
          <p>{tx(a.story1, lang)}</p>
          <p>{tx(a.story2, lang)}</p>
          <p>{tx(a.story3, lang)}</p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-slate-50 py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{tx(a.valuesTitle, lang)}</h2>
            <p className="text-slate-500 mt-2 text-sm">{tx(a.valuesDesc, lang)}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {a.values.map((v) => (
              <div key={v.icon} className="bg-white rounded-2xl border border-slate-100 p-6 flex gap-4">
                <div className={`w-11 h-11 rounded-xl ${v.color} flex items-center justify-center shrink-0`}>
                  <i className={`fa-solid ${v.icon}`}></i>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">{tx(v.title, lang)}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{tx(v.desc, lang)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      {/* <section className="container mx-auto max-w-4xl px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{tx(a.teamTitle, lang)}</h2>
          <p className="text-slate-500 mt-2 text-sm">{tx(a.teamDesc, lang)}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {a.team.map((m) => (
            <div key={m.avatar} className="text-center">
              <div className={`w-16 h-16 rounded-2xl ${m.color} text-white text-2xl font-bold flex items-center justify-center mx-auto mb-3`}>
                {m.avatar}
              </div>
              <div className="font-semibold text-slate-800 text-sm">{tx(m.name, lang)}</div>
              <div className="text-xs text-slate-400 mt-0.5">{tx(m.role, lang)}</div>
            </div>
          ))}
        </div>
      </section> */}

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white py-16 px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">{tx(a.ctaTitle, lang)}</h2>
        <p className="text-white/80 mb-7 text-sm">{tx(a.ctaDesc, lang)}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="px-7 py-3 bg-white text-[#2563eb] rounded-full font-semibold hover:bg-blue-50 transition shadow-lg">
            <i className="fa-solid fa-magnifying-glass mr-2"></i>{tx(a.ctaSearch, lang)}
          </Link>
          <Link href="/terms" className="px-7 py-3 border border-white/30 text-white rounded-full font-semibold hover:bg-white/10 transition">
            {tx(a.ctaTerms, lang)}
          </Link>
        </div>
      </section>

      <footer className="text-center py-8 text-xs text-slate-400">
        <Link href="/" className="font-semibold text-[#2563eb]">JongJongDi.com</Link>
        {" · "}
        <Link href="/terms" className="hover:text-slate-600 transition">{tx(a.ctaTerms, lang)}</Link>
        {" · "}© 2024 JongJongDi Co., Ltd.
      </footer>
    </main>
  );
}
