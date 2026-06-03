"use client";

import { useLang } from "@/lib/lang";
import { t, tx } from "@/lib/i18n";

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? "https://admin.jongjongdi.com";

export default function Footer() {
  const [lang] = useLang();
  const f = t.footer;

  return (
    <footer id="contact" className="bg-[#020617] border-t border-slate-800">
      {/* Main footer links */}
      <div className="container mx-auto px-6 pt-10 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10 mb-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <div className="bg-blue-900/50 p-1.5 rounded-lg border border-blue-800">
                <svg viewBox="0 0 100 100" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100" height="100" rx="20" fill="#2563EB" />
                  <text x="50" y="75" fontFamily="sans-serif" fontWeight="bold" fontSize="60" textAnchor="middle" fill="white">J</text>
                  <circle cx="72" cy="28" r="12" fill="#F59E0B" stroke="white" strokeWidth="3" />
                </svg>
              </div>
              JongJongDi
            </a>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">{tx(f.tagline, lang)}</p>
            {/* Social icons */}
            <div className="flex gap-2">
              <a href="https://facebook.com/jongjongdi" target="_blank" rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition">
                <i className="fa-brands fa-facebook-f text-sm"></i>
              </a>
              <a href="https://line.me/ti/p/jongjongdi" target="_blank" rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-[#06C755] hover:text-white transition">
                <i className="fa-brands fa-line text-sm"></i>
              </a>
              <a href="https://instagram.com/jongjongdi" target="_blank" rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 hover:text-white transition">
                <i className="fa-brands fa-instagram text-sm"></i>
              </a>
              <a href="https://tiktok.com/@jongjongdi" target="_blank" rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 hover:text-white transition">
                <i className="fa-brands fa-tiktok text-sm"></i>
              </a>
            </div>
          </div>

          {/* บริการ */}
          <div>
            <h4 className="font-bold text-slate-200 mb-4 text-sm">{tx(f.services, lang)}</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="/rooms" className="hover:text-white transition flex items-center gap-2"><i className="fa-solid fa-hotel text-[10px] text-slate-600"></i>{tx(f.room, lang)}</a></li>
              <li><a href="/tours" className="hover:text-white transition flex items-center gap-2"><i className="fa-solid fa-water-ladder text-[10px] text-slate-600"></i>{tx(f.dive, lang)}</a></li>
              <li className="text-slate-600 flex items-center gap-2">
                <i className="fa-solid fa-utensils text-[10px]"></i>
                {tx(f.tableBook, lang)}
                <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">{tx(f.comingSoon, lang)}</span>
              </li>
              <li className="text-slate-600 flex items-center gap-2">
                <i className="fa-solid fa-ticket text-[10px]"></i>
                {tx(f.ticketBook, lang)}
                <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">{tx(f.comingSoon, lang)}</span>
              </li>
            </ul>
          </div>

          {/* ช่วยเหลือ */}
          <div>
            <h4 className="font-bold text-slate-200 mb-4 text-sm">{lang === "th" ? "ช่วยเหลือ" : "Help"}</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="/track" className="hover:text-white transition">{tx(t.nav.trackNav, lang)}</a></li>
              <li><a href="mailto:jongjongdisupport@gmail.com" className="hover:text-white transition">{lang === "th" ? "ติดต่อเรา" : "Contact Us"}</a></li>
              <li><a href={`${ADMIN_URL}/register`} className="hover:text-white transition">{tx(f.partner, lang)}</a></li>
              <li><a href={`${ADMIN_URL}/login`} className="hover:text-white transition">{tx(f.partnerLogin, lang)}</a></li>
            </ul>
          </div>

          {/* เกี่ยวกับ */}
          <div>
            <h4 className="font-bold text-slate-200 mb-4 text-sm">{tx(f.about, lang)}</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="/about" className="hover:text-white transition">{tx(f.aboutLink, lang)}</a></li>
              <li><a href="/terms" className="hover:text-white transition">{tx(f.termsLink, lang)}</a></li>
            </ul>
          </div>

          {/* ติดต่อ */}
          <div>
            <h4 className="font-bold text-slate-200 mb-4 text-sm">{tx(f.contact, lang)}</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2.5">
                <i className="fa-solid fa-phone text-[#2563eb] text-xs"></i>080-225-6669
              </li>
              <li className="flex items-center gap-2.5 overflow-hidden">
                <i className="fa-solid fa-envelope text-[#2563eb] text-xs shrink-0"></i>
                <a href="mailto:jongjongdisupport@gmail.com" className="hover:text-white transition whitespace-nowrap overflow-hidden min-w-0 text-xs">jongjongdisupport@gmail.com</a>
              </li>
              <li className="flex items-center gap-2.5">
                <i className="fa-solid fa-clock text-[#2563eb] text-xs"></i>
                {lang === "th" ? "เปิดบริการทุกวัน 09:00–22:00" : "Open daily 09:00–22:00"}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600 text-center md:text-left">
            &copy; 2025 JongJongDi.com {tx(f.copyright, lang)}.
          </div>
          {/* Payment logos */}
          <div className="flex items-center gap-3">
            {["VISA", "MC", "QR"].map((p) => (
              <div key={p} className="h-6 px-2.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-400 font-bold flex items-center">
                {p === "VISA" && "VISA"}
                {p === "MC"   && <span><span className="text-red-500">●</span><span className="text-yellow-500 -ml-1">●</span></span>}
                {p === "QR"   && "QR Pay"}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
