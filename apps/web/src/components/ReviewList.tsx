"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/lang";
import { t, tx } from "@/lib/i18n";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  guestName: string;
  createdAt: string;
}

interface ReviewData {
  avgRating: number;
  count: number;
  items: ReviewItem[];
}

function maskName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.map((p) => (p.length <= 2 ? p : p[0] + "*".repeat(p.length - 1))).join(" ");
}

export default function ReviewList({ resource, slug }: { resource: "room" | "tour"; slug: string }) {
  const [lang] = useLang();
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/reviews/${resource}/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, [resource, slug]);

  if (loading) return null;

  if (!data || data.count === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 className="font-bold text-slate-800 text-lg mb-2">
          <i className="fa-solid fa-star text-amber-400 mr-2"></i>{tx(t.review.title, lang)}
        </h2>
        <p className="text-sm text-slate-400">{tx(t.review.noReview, lang)}</p>
      </div>
    );
  }

  const dateLocale = lang === "en" ? "en-US" : "th-TH";

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-slate-800 text-lg">
          <i className="fa-solid fa-star text-amber-400 mr-2"></i>
          {tx(t.review.title, lang)} <span className="text-slate-400 font-normal text-sm">({data.count})</span>
        </h2>
        <div className="text-right">
          <div className="text-2xl font-bold text-amber-500">{data.avgRating.toFixed(1)}</div>
          <div className="flex gap-0.5 justify-end">
            {[1, 2, 3, 4, 5].map((n) => (
              <i key={n} className={`fa-solid fa-star text-xs ${n <= Math.round(data.avgRating) ? "text-amber-400" : "text-slate-200"}`}></i>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {data.items.map((r) => (
          <div key={r.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
            <div className="flex items-center justify-between mb-1">
              <div className="font-semibold text-slate-700 text-sm">{maskName(r.guestName)}</div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <i key={n} className={`fa-solid fa-star text-xs ${n <= r.rating ? "text-amber-400" : "text-slate-200"}`}></i>
                ))}
              </div>
            </div>
            {r.comment && <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>}
            <p className="text-xs text-slate-400 mt-1">{new Date(r.createdAt).toLocaleDateString(dateLocale)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
