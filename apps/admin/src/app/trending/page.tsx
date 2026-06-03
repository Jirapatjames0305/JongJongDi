"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import TrendingFormModal, { type TrendingFormData } from "@/components/TrendingFormModal";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Linked { id: string; slug: string; nameTh: string; isActive: boolean; images: { url: string }[] }
interface TrendingItem {
  id: string;
  targetType: "ROOM" | "TOUR" | "PRODUCT";
  order: number;
  isActive: boolean;
  badge: string | null;
  oldPrice: number | null;
  locationLabel: string | null;
  ctaLabel: string | null;
  room: Linked | null;
  tour: Linked | null;
  product: Linked | null;
}

const TYPE_META: Record<TrendingItem["targetType"], { label: string; icon: string; chip: string }> = {
  ROOM:    { label: "ที่พัก", icon: "fa-bed",          chip: "bg-emerald-100 text-emerald-700" },
  TOUR:    { label: "ทัวร์",  icon: "fa-water-ladder", chip: "bg-cyan-100 text-cyan-700" },
  PRODUCT: { label: "สินค้า", icon: "fa-bag-shopping", chip: "bg-amber-100 text-amber-700" },
};

export default function TrendingPage() {
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formInitial, setFormInitial] = useState<Partial<TrendingFormData> | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  async function load() {
    const token = localStorage.getItem("jjd_token") ?? "";
    const res = await fetch(`${API}/api/trending/admin/list`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() { setFormInitial(null); setFormOpen(true); }

  function openEdit(t: TrendingItem) {
    setFormInitial({
      id: t.id, targetType: t.targetType,
      roomId: t.room?.id ?? "", tourId: t.tour?.id ?? "", productId: t.product?.id ?? "",
      order: String(t.order),
      badge: t.badge ?? "", oldPrice: t.oldPrice != null ? String(t.oldPrice) : "",
      locationLabel: t.locationLabel ?? "", ctaLabel: t.ctaLabel ?? "",
    });
    setFormOpen(true);
  }

  async function toggleActive(id: string, current: boolean) {
    const token = localStorage.getItem("jjd_token") ?? "";
    await fetch(`${API}/api/trending/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !current }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("ลบรายการนี้ออกจากฮิตติดกระแส?")) return;
    const token = localStorage.getItem("jjd_token") ?? "";
    await fetch(`${API}/api/trending/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    load();
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800"><i className="fa-solid fa-fire text-red-500 mr-2"></i>ฮิตติดกระแส</h1>
          <p className="text-slate-500 text-sm mt-1">รายการที่แสดงในแถบฮิตติดกระแสหน้าแรกของเว็บ · {items.length} รายการ</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-[#2563eb] text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">
          <i className="fa-solid fa-plus mr-2"></i>เพิ่มรายการ
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <i className="fa-solid fa-fire text-4xl mb-3 block"></i>
            <p className="text-sm mb-2">ยังไม่มีรายการฮิตติดกระแส</p>
            <button onClick={openAdd} className="px-4 py-2 bg-[#2563eb] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">เพิ่มรายการแรก</button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((t) => {
              const linked = t.targetType === "ROOM" ? t.room : t.targetType === "TOUR" ? t.tour : t.product;
              const meta = TYPE_META[t.targetType];
              const img = linked?.images?.[0]?.url;
              const missing = !linked;
              return (
                <div key={t.id} className="p-4 hover:bg-slate-50 transition flex flex-col md:flex-row gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">{t.order}</span>
                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex-shrink-0 relative overflow-hidden">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><i className={`fa-solid ${meta.icon}`}></i></div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.chip}`}>
                          {meta.label}
                        </span>
                        {t.badge && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">{t.badge}</span>}
                      </div>
                      <h3 className="font-semibold text-slate-800 truncate mt-1">
                        {missing ? <span className="text-red-500">⚠ รายการต้นทางถูกลบแล้ว</span> : linked!.nameTh}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-0.5">
                        {linked && <span>/{linked.slug}</span>}
                        {t.locationLabel && <span><i className="fa-solid fa-location-dot mr-1"></i>{t.locationLabel}</span>}
                        {t.oldPrice != null && <span className="line-through">฿{t.oldPrice.toLocaleString()}</span>}
                        {linked && !linked.isActive && <span className="text-amber-600">ต้นทางปิดอยู่ (ไม่แสดงบนเว็บ)</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 md:flex-col md:w-32 items-start">
                    <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${t.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {t.isActive ? "แสดง" : "ซ่อน"}
                    </span>
                    <button onClick={() => openEdit(t)} className="px-3 py-1.5 bg-[#2563eb] text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"><i className="fa-solid fa-pen mr-1"></i>แก้ไข</button>
                    <button onClick={() => toggleActive(t.id, t.isActive)} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition">{t.isActive ? "ซ่อน" : "แสดง"}</button>
                    <button onClick={() => remove(t.id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition"><i className="fa-solid fa-trash mr-1"></i>ลบ</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {formOpen && (
        <TrendingFormModal initial={formInitial} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); load(); }} />
      )}
    </AdminShell>
  );
}
