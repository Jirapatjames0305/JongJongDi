"use client";

import Link from "next/link";
import { useLang } from "@/lib/lang";
import { t, tx } from "@/lib/i18n";

export default function TermsContent() {
  const [lang] = useLang();
  const tr = t.terms;

  return (
    <main className="min-h-screen bg-white pt-16">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-16 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-5">
            <i className="fa-solid fa-file-contract text-yellow-400"></i>
            {tx(tr.tag, lang)}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{tx(tr.title, lang)}</h1>
          <p className="text-slate-400 text-sm">{tx(tr.updated, lang)}</p>
        </div>
      </section>

      <div className="container mx-auto max-w-4xl px-4 py-12 flex gap-8">
        {/* Sidebar TOC — desktop only */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24 bg-slate-50 rounded-2xl border border-slate-100 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{tx(tr.toc, lang)}</p>
            <nav className="space-y-1">
              {tr.sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="block text-sm text-slate-500 hover:text-[#2563eb] py-1 transition leading-snug">
                  {tx(s.title, lang)}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 mb-8 text-sm text-blue-700 flex gap-3">
            <i className="fa-solid fa-circle-info text-blue-400 mt-0.5 shrink-0"></i>
            <p>{tx(tr.notice, lang)}</p>
          </div>

          <div className="space-y-10">
            {tr.sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">{tx(s.title, lang)}</h2>
                <ul className="space-y-3">
                  {s.content.map((line, i) => (
                    <li key={i} className="flex gap-3 text-slate-600 text-sm leading-relaxed">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2563eb] shrink-0"></span>
                      {tx(line, lang)}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-12 bg-slate-50 rounded-2xl border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 mb-2">{tx(tr.contactTitle, lang)}</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-3">{tx(tr.contactDesc, lang)}</p>
            <div className="flex flex-col sm:flex-row gap-3 text-sm">
              <a href="mailto:support@jongjongdi.com" className="flex items-center gap-2 text-[#2563eb] hover:underline">
                <i className="fa-solid fa-envelope text-xs"></i>support@jongjongdi.com
              </a>
              <span className="hidden sm:block text-slate-300">·</span>
              <a href="tel:+6621234567" className="flex items-center gap-2 text-[#2563eb] hover:underline">
                <i className="fa-solid fa-phone text-xs"></i>02-123-4567
              </a>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center py-8 text-xs text-slate-400 border-t border-slate-100">
        <Link href="/" className="font-semibold text-[#2563eb]">JongJongDi.com</Link>
        {" · "}
        <Link href="/about" className="hover:text-slate-600 transition">{tx(t.nav.aboutLink, lang)}</Link>
        {" · "}© 2024 JongJongDi Co., Ltd.
      </footer>
    </main>
  );
}
