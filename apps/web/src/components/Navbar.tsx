"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUserSession, clearUserSession, UserInfo } from "@/lib/user-auth";
import { useLang } from "@/lib/lang";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lang, setLang] = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    setUser(getUserSession());
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleLogout() {
    clearUserSession();
    setUser(null);
    setDropdownOpen(false);
  }

  return (
    <nav className={`bg-white/95 backdrop-blur-sm fixed w-full z-50 transition-all duration-300 border-b border-slate-100 ${scrolled ? "shadow-md" : "shadow-sm"}`}>
      <div className="container mx-auto px-4 md:px-6 py-3">
        <div className="flex justify-between items-center">

          {/* Logo */}
          <Link href="/" className="text-xl md:text-2xl font-bold text-[#2563eb] flex items-center gap-2">
            <div className="bg-blue-50 p-1.5 rounded-lg">
              <svg viewBox="0 0 100 100" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="20" fill="#2563EB" />
                <text x="50" y="75" fontFamily="sans-serif" fontWeight="bold" fontSize="60" textAnchor="middle" fill="white">J</text>
                <circle cx="72" cy="28" r="12" fill="#F59E0B" stroke="white" strokeWidth="3" />
              </svg>
            </div>
            JongJongDi
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center font-medium text-sm">
            <a href="#services" className="text-slate-600 hover:text-[#2563eb] transition">บริการจอง</a>
            <a href="#system" className="text-slate-600 hover:text-[#2563eb] transition">ซื้อระบบ</a>

            {/* Language toggle */}
            <div className="flex items-center bg-slate-100 rounded-full p-0.5 text-xs">
              {(["th", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1 rounded-full font-semibold transition ${lang === l ? "bg-white text-[#2563eb] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 hover:border-[#2563eb] transition text-slate-700"
                >
                  <div className="w-6 h-6 rounded-full bg-[#2563eb] text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span>{user.name}</span>
                  <i className={`fa-solid fa-chevron-down text-xs transition-transform ${dropdownOpen ? "rotate-180" : ""}`}></i>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-slate-100 shadow-lg py-1 text-sm">
                    <Link
                      href="/track"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 text-slate-600"
                    >
                      <i className="fa-solid fa-calendar-check w-4 text-center text-[#2563eb]"></i>การจองของฉัน
                    </Link>
                    <hr className="my-1 border-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 text-red-500"
                    >
                      <i className="fa-solid fa-right-from-bracket w-4 text-center"></i>ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 bg-[#2563eb] text-white rounded-full hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-[#2563eb] focus:outline-none bg-slate-50 rounded-lg"
          >
            <i className="fa-solid fa-bars text-xl"></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-xl">
          <div className="flex flex-col p-4 space-y-2">
            <a href="#services" onClick={() => setMobileOpen(false)} className="block py-3 px-4 rounded-lg hover:bg-slate-50 text-slate-600 font-medium">
              <i className="fa-solid fa-magnifying-glass w-6 text-center mr-2 text-slate-400"></i>บริการจอง
            </a>
            <a href="#system" onClick={() => setMobileOpen(false)} className="block py-3 px-4 rounded-lg hover:bg-slate-50 text-slate-600 font-medium">
              <i className="fa-solid fa-shop w-6 text-center mr-2 text-slate-400"></i>ซื้อระบบ
            </a>
            <div className="flex items-center justify-center gap-2 py-2">
              {(["th", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => { setLang(l); }}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${lang === l ? "bg-[#2563eb] text-white" : "bg-slate-100 text-slate-500"}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="border-t border-slate-100 my-2 pt-2"></div>
            {user ? (
              <>
                <div className="px-4 py-2 text-sm text-slate-500">
                  <i className="fa-solid fa-user mr-2 text-[#2563eb]"></i>{user.name}
                </div>
                <Link
                  href="/track"
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 px-4 rounded-lg hover:bg-slate-50 text-slate-600 font-medium"
                >
                  <i className="fa-solid fa-calendar-check w-6 text-center mr-2 text-slate-400"></i>การจองของฉัน
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="block w-full text-left py-3 px-4 rounded-lg hover:bg-red-50 text-red-500 font-medium"
                >
                  <i className="fa-solid fa-right-from-bracket w-6 text-center mr-2"></i>ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 px-4 bg-[#2563eb] text-white rounded-lg font-semibold text-center shadow-md"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 px-4 border border-[#2563eb] text-[#2563eb] rounded-lg font-semibold text-center"
                >
                  สมัครสมาชิก
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
