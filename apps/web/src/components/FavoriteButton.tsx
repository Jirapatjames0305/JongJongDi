"use client";

import { useEffect, useState } from "react";
import { getUserSession } from "@/lib/user-auth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type TargetType = "ROOM" | "TOUR" | "PRODUCT";

interface Props {
  targetType: TargetType;
  roomId?: string;
  tourId?: string;
  productId?: string;
  className?: string;
}

function authHeader() {
  const token = (typeof window !== "undefined" ? localStorage.getItem("jjd_user_token") : null) ?? "";
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export default function FavoriteButton({ targetType, roomId, tourId, productId, className = "" }: Props) {
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const user = getUserSession();
    if (!user) { setReady(true); return; }

    const param = roomId ? `roomId=${roomId}` : tourId ? `tourId=${tourId}` : `productId=${productId}`;
    fetch(`${API}/api/favorites/check?${param}`, { headers: authHeader() })
      .then((r) => r.json())
      .then((d) => { setFavoriteId(d.favoriteId); setReady(true); })
      .catch(() => setReady(true));
  }, [roomId, tourId, productId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!getUserSession()) {
      window.location.href = "/login";
      return;
    }

    setSaving(true);
    try {
      if (favoriteId) {
        await fetch(`${API}/api/favorites/${favoriteId}`, { method: "DELETE", headers: authHeader() });
        setFavoriteId(null);
        showToast("ลบออกจากรายการโปรดแล้ว");
      } else {
        const res = await fetch(`${API}/api/favorites`, {
          method: "POST",
          headers: authHeader(),
          body: JSON.stringify({ targetType, roomId, tourId, productId }),
        });
        const d = await res.json();
        setFavoriteId(d.id);
        showToast("เพิ่มในรายการโปรดแล้ว ❤️");
      }
    } finally {
      setSaving(false);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  if (!ready) return null;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggle}
        disabled={saving}
        title={favoriteId ? "ลบจากรายการโปรด" : "เพิ่มในรายการโปรด"}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
          favoriteId
            ? "bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110"
            : "bg-white/90 backdrop-blur text-slate-400 hover:text-red-500 hover:border-red-300 border border-slate-200 shadow"
        } ${saving ? "opacity-60" : ""}`}
      >
        <i className={`${favoriteId ? "fa-solid" : "fa-regular"} fa-heart text-sm`}></i>
      </button>

      {toast && (
        <div className="absolute top-12 right-0 z-50 whitespace-nowrap bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg pointer-events-none animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
