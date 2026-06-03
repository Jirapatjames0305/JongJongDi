"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUserSession, clearUserSession, UserInfo } from "@/lib/user-auth";
import { useLang } from "@/lib/lang";
import { t, tx } from "@/lib/i18n";

const ABOUT_LINKS = [
  { href: "/about", icon: "fa-circle-info",    labelKey: t.nav.aboutLink, color: "text-blue-500" },
  { href: "/terms", icon: "fa-file-contract",  labelKey: t.nav.termsLink, color: "text-slate-500" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [user, setUser]             = useState<UserInfo | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [aboutOpen, setAboutOpen]   = useState(false);
  const [lang, setLang]             = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    setUser(getUserSession());
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  }

  function handleLogout() {
    clearUserSession();
    setUser(null);
    setDropdownOpen(false);
  }

  return (
    <nav className={`bg-white fixed w-full z-50 transition-all duration-300 border-b border-slate-100 ${scrolled ? "shadow-md" : "shadow-sm"}`}>
      <div className="container mx-auto px-4 md:px-6 py-3">
        <div className="flex justify-between items-center">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-blue-50 p-1.5 rounded-lg">
              <svg viewBox="0 0 100 100" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="20" fill="#2563EB" />
                <text x="50" y="75" fontFamily="sans-serif" fontWeight="bold" fontSize="60" textAnchor="middle" fill="white">J</text>
                <circle cx="72" cy="28" r="12" fill="#F59E0B" stroke="white" strokeWidth="3" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-800 leading-none">
              JongJong<span className="text-[#2563eb]">Di</span>
              <span className="block text-[10px] font-normal text-slate-400 leading-none tracking-wide">Booking Platform</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <Link href="/" className="px-3 py-2 rounded-lg text-slate-600 hover:text-[#2563eb] hover:bg-blue-50 transition">
              {tx(t.nav.home, lang)}
            </Link>
            <button onClick={() => scrollTo("services")} className="px-3 py-2 rounded-lg text-slate-600 hover:text-[#2563eb] hover:bg-blue-50 transition">
              {tx(t.nav.booking, lang)}
            </button>
            <button onClick={() => scrollTo("promotions")} className="px-3 py-2 rounded-lg text-slate-600 hover:text-[#2563eb] hover:bg-blue-50 transition">
              {tx(t.nav.promotions, lang)}
            </button>
            <Link href="/track" className="px-3 py-2 rounded-lg text-slate-600 hover:text-[#2563eb] hover:bg-blue-50 transition">
              {tx(t.nav.trackNav, lang)}
            </Link>

            {/* About dropdown */}
            <div className="relative">
              <button
                onClick={() => setAboutOpen((o) => !o)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-slate-600 hover:text-[#2563eb] hover:bg-blue-50 transition"
              >
                {tx(t.nav.aboutUs, lang)}
                <i className={`fa-solid fa-chevron-down text-[10px] transition-transform ${aboutOpen ? "rotate-180" : ""}`}></i>
              </button>
              {aboutOpen && (
                <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-xl border border-slate-100 shadow-lg py-1 text-sm z-50">
                  {ABOUT_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setAboutOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 text-slate-600"
                    >
                      <i className={`fa-solid ${item.icon} w-4 text-center ${item.color} text-xs`}></i>
                      {tx(item.labelKey, lang)}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => scrollTo("contact")} className="px-3 py-2 rounded-lg text-slate-600 hover:text-[#2563eb] hover:bg-blue-50 transition">
              {tx(t.nav.contactNav, lang)}
            </button>
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Language toggle */}
            <div className="flex items-center bg-slate-100 rounded-full p-0.5 text-xs mr-1">
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
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 hover:border-[#2563eb] transition text-slate-700 text-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-[#2563eb] text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span className="max-w-[80px] truncate">{user.name}</span>
                  <i className={`fa-solid fa-chevron-down text-[10px] transition-transform ${dropdownOpen ? "rotate-180" : ""}`}></i>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-slate-100 shadow-lg py-1 text-sm z-50">
                    {[
                      { href: "/profile?tab=upcoming",  icon: "fa-plane-departure", labelKey: t.nav.upcoming,   color: "text-blue-500" },
                      { href: "/profile?tab=bookings",  icon: "fa-calendar-check",  labelKey: t.nav.myBookings, color: "text-green-500" },
                      { href: "/profile?tab=coupons",   icon: "fa-ticket",          labelKey: t.nav.coupons,    color: "text-yellow-500" },
                      { href: "/profile?tab=vouchers",  icon: "fa-credit-card",     labelKey: t.nav.myCards,    color: "text-purple-500" },
                      { href: "/profile?tab=favorites", icon: "fa-heart",           labelKey: t.nav.favorites,  color: "text-red-500" },
                      { href: "/profile?tab=profile",   icon: "fa-user",            labelKey: t.nav.profile,    color: "text-slate-500" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 text-slate-600"
                      >
                        <i className={`fa-solid ${item.icon} w-4 text-center ${item.color} text-xs`}></i>
                        {tx(item.labelKey, lang)}
                      </Link>
                    ))}
                    <hr className="my-1 border-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 text-red-500"
                    >
                      <i className="fa-solid fa-right-from-bracket w-4 text-center text-xs"></i>
                      {tx(t.nav.logout, lang)}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-sm border border-slate-200 text-slate-700 rounded-full hover:border-[#2563eb] hover:text-[#2563eb] transition font-medium">
                  {tx(t.nav.login, lang)}
                </Link>
                <Link href="/register" className="px-4 py-2 text-sm bg-[#2563eb] text-white rounded-full hover:bg-blue-700 transition font-semibold shadow-sm shadow-blue-500/30">
                  {tx(t.nav.register, lang)}
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-[#2563eb] bg-slate-50 rounded-lg"
          >
            <i className={`fa-solid ${mobileOpen ? "fa-xmark" : "fa-bars"} text-lg`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 absolute w-full shadow-xl">
          <div className="flex flex-col p-4 space-y-1">
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">
              <i className="fa-solid fa-house w-5 text-center text-slate-400 text-sm"></i>{tx(t.nav.home, lang)}
            </Link>
            <button onClick={() => scrollTo("services")} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-slate-50 text-slate-700 font-medium text-left">
              <i className="fa-solid fa-grid-2 w-5 text-center text-slate-400 text-sm"></i>{tx(t.nav.booking, lang)}
            </button>
            <button onClick={() => scrollTo("promotions")} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-slate-50 text-slate-700 font-medium text-left">
              <i className="fa-solid fa-tag w-5 text-center text-slate-400 text-sm"></i>{tx(t.nav.promotions, lang)}
            </button>
            <Link href="/track" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">
              <i className="fa-solid fa-magnifying-glass w-5 text-center text-slate-400 text-sm"></i>{tx(t.nav.trackNav, lang)}
            </Link>
            {ABOUT_LINKS.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">
                <i className={`fa-solid ${item.icon} w-5 text-center ${item.color} text-sm`}></i>{tx(item.labelKey, lang)}
              </Link>
            ))}
            <button onClick={() => scrollTo("contact")} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-slate-50 text-slate-700 font-medium text-left">
              <i className="fa-solid fa-phone w-5 text-center text-slate-400 text-sm"></i>{tx(t.nav.contactNav, lang)}
            </button>

            {/* Lang */}
            <div className="flex items-center justify-center gap-2 py-2 border-t border-slate-100 mt-1">
              {(["th", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-5 py-1.5 rounded-full text-xs font-semibold transition ${lang === l ? "bg-[#2563eb] text-white" : "bg-slate-100 text-slate-500"}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-2 space-y-1">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-slate-500 font-medium flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#2563eb] text-white flex items-center justify-center text-xs font-bold">{user.name.charAt(0)}</div>
                    {user.name}
                  </div>
                  {[
                    { href: "/profile?tab=upcoming",  icon: "fa-plane-departure", labelKey: t.nav.upcoming,   color: "text-blue-500" },
                    { href: "/profile?tab=bookings",  icon: "fa-calendar-check",  labelKey: t.nav.myBookings, color: "text-green-500" },
                    { href: "/profile?tab=favorites", icon: "fa-heart",           labelKey: t.nav.favorites,  color: "text-red-500" },
                    { href: "/profile?tab=profile",   icon: "fa-user",            labelKey: t.nav.profile,    color: "text-slate-400" },
                  ].map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-slate-50 text-slate-600 font-medium">
                      <i className={`fa-solid ${item.icon} w-5 text-center ${item.color} text-sm`}></i>{tx(item.labelKey, lang)}
                    </Link>
                  ))}
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-red-50 text-red-500 font-medium">
                    <i className="fa-solid fa-right-from-bracket w-5 text-center text-sm"></i>{tx(t.nav.logout, lang)}
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold text-center text-sm hover:border-[#2563eb] hover:text-[#2563eb] transition">
                    {tx(t.nav.login, lang)}
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 py-3 bg-[#2563eb] text-white rounded-xl font-semibold text-center text-sm">
                    {tx(t.nav.register, lang)}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
