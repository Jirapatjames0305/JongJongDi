"use client";

import { Suspense, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLang } from "@/lib/lang";
import { t, tx } from "@/lib/i18n";

function TrackForm() {
  const [lang] = useLang();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSearched(true);
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-20">
      <div className="container mx-auto px-4 md:px-6 py-12 max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            <i className="fa-solid fa-magnifying-glass text-[#2563eb] mr-3"></i>
            {tx(t.track.title, lang)}
          </h1>
          <p className="text-slate-500 mt-2">{tx(t.track.subtitle, lang)}</p>
        </div>

        <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-slate-600 mb-2">{tx(t.track.phone, lang)}</label>
          <div className="flex gap-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0812345678"
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#2563eb] transition"
            />
            <button type="submit" disabled={loading || !phone} className="px-5 py-3 bg-[#2563eb] text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : tx(t.track.search, lang)}
            </button>
          </div>
        </form>

        {searched && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
            <i className="fa-solid fa-inbox text-slate-300 text-4xl mb-3"></i>
            <p className="text-slate-500">{tx(t.track.notFound, lang)} {phone}</p>
            <p className="text-sm text-slate-400 mt-1">{tx(t.track.notFoundHint, lang)}</p>
          </div>
        )}

        {!searched && (
          <div className="text-center text-sm text-slate-400">
            <p>
              {tx(t.track.or, lang)}{" "}
              <a href="tel:0802256669" className="text-[#2563eb] hover:underline">{tx(t.track.callUs, lang)}</a>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function TrackPage() {
  return (
    <>
      <Navbar />
      <Suspense>
        <TrackForm />
      </Suspense>
      <Footer />
    </>
  );
}
