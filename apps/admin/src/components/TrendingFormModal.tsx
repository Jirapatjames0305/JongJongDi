"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface TrendingFormData {
  id?: string;
  targetType: "ROOM" | "TOUR" | "PRODUCT";
  roomId: string;
  tourId: string;
  productId: string;
  order: string;
  badge: string;
  oldPrice: string;
  locationLabel: string;
  ctaLabel: string;
}

interface Option { id: string; nameTh: string; slug: string }

const TYPES = [
  { key: "ROOM", label: "ที่พัก", icon: "fa-bed" },
  { key: "TOUR", label: "ทัวร์", icon: "fa-water-ladder" },
  { key: "PRODUCT", label: "สินค้า", icon: "fa-bag-shopping" },
] as const;

const empty: TrendingFormData = {
  targetType: "ROOM", roomId: "", tourId: "", productId: "",
  order: "0", badge: "", oldPrice: "", locationLabel: "", ctaLabel: "",
};

export default function TrendingFormModal({
  initial, onClose, onSaved,
}: {
  initial: Partial<TrendingFormData> | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<TrendingFormData>(empty);
  const [rooms, setRooms] = useState<Option[]>([]);
  const [tours, setTours] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    setForm(initial ? { ...empty, ...initial } : empty);
    setError("");
  }, [initial]);

  useEffect(() => {
    const token = localStorage.getItem("jjd_token") ?? "";
    const h = { headers: { Authorization: `Bearer ${token}` } };
    fetch(`${API}/api/rooms/admin/list`, h).then((r) => r.ok ? r.json() : []).then(setRooms).catch(() => {});
    fetch(`${API}/api/tours/admin/list`, h).then((r) => r.ok ? r.json() : []).then(setTours).catch(() => {});
    fetch(`${API}/api/products/admin/list`, h).then((r) => r.ok ? r.json() : []).then(setProducts).catch(() => {});
  }, []);

  function update(k: keyof Omit<TrendingFormData, "id">, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.targetType === "ROOM" && !form.roomId) { setError("กรุณาเลือกที่พัก"); return; }
    if (form.targetType === "TOUR" && !form.tourId) { setError("กรุณาเลือกทัวร์"); return; }
    if (form.targetType === "PRODUCT" && !form.productId) { setError("กรุณาเลือกสินค้า"); return; }
    setSaving(true); setError("");
    try {
      const token = localStorage.getItem("jjd_token") ?? "";
      const url = isEdit ? `${API}/api/trending/${form.id}` : `${API}/api/trending`;
      const method = isEdit ? "PATCH" : "POST";
      const body: Record<string, unknown> = {
        order: form.order, badge: form.badge, oldPrice: form.oldPrice,
        locationLabel: form.locationLabel, ctaLabel: form.ctaLabel,
      };
      if (!isEdit) {
        body.targetType = form.targetType;
        body.roomId = form.targetType === "ROOM" ? form.roomId : null;
        body.tourId = form.targetType === "TOUR" ? form.tourId : null;
        body.productId = form.targetType === "PRODUCT" ? form.productId : null;
      }
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "เกิดข้อผิดพลาด");
      onSaved();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30";
  const isRoom = form.targetType === "ROOM";
  const isTour = form.targetType === "TOUR";
  const sourceLabel = isRoom ? "ที่พัก" : isTour ? "ทัวร์" : "สินค้า";
  const defaultCta = isRoom ? "ดูห้องพัก" : isTour ? "จองทัวร์" : "สั่งซื้อเลย";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-slate-800">{isEdit ? "แก้ไขรายการฮิตติดกระแส" : "เพิ่มรายการฮิตติดกระแส"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">ประเภท</label>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((tt) => (
                <button key={tt.key} type="button" disabled={isEdit}
                  onClick={() => update("targetType", tt.key)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition disabled:opacity-50 ${
                    form.targetType === tt.key ? "bg-[#2563eb] text-white border-[#2563eb]" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}>
                  <i className={`fa-solid ${tt.icon} mr-2`}></i>
                  {tt.label}
                </button>
              ))}
            </div>
            {isEdit && <p className="text-xs text-slate-400 mt-1">เปลี่ยนประเภท/รายการที่อ้างถึงไม่ได้ — ลบแล้วเพิ่มใหม่</p>}
          </div>

          {!isEdit && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">เลือก{sourceLabel} <span className="text-red-500">*</span></label>
              {isRoom && (
                <select value={form.roomId} onChange={(e) => update("roomId", e.target.value)} className={inputCls}>
                  <option value="">— เลือกที่พัก —</option>
                  {rooms.map((r) => <option key={r.id} value={r.id}>{r.nameTh} (/{r.slug})</option>)}
                </select>
              )}
              {isTour && (
                <select value={form.tourId} onChange={(e) => update("tourId", e.target.value)} className={inputCls}>
                  <option value="">— เลือกทัวร์ —</option>
                  {tours.map((tr) => <option key={tr.id} value={tr.id}>{tr.nameTh} (/{tr.slug})</option>)}
                </select>
              )}
              {!isRoom && !isTour && (
                <select value={form.productId} onChange={(e) => update("productId", e.target.value)} className={inputCls}>
                  <option value="">— เลือกสินค้า —</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.nameTh} (/{p.slug})</option>)}
                </select>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ลำดับ (น้อย = แสดงก่อน)</label>
              <input type="number" value={form.order} onChange={(e) => update("order", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ราคาเดิม (ขีดฆ่า)</label>
              <input type="number" min="0" value={form.oldPrice} onChange={(e) => update("oldPrice", e.target.value)} placeholder="3500" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">ป้าย (Badge)</label>
            <input type="text" value={form.badge} onChange={(e) => update("badge", e.target.value)} placeholder="Best Seller" className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              ป้ายพื้นที่ {(isRoom || isTour) && <span className="text-slate-400">({sourceLabel}ไม่มีฟิลด์พื้นที่ — ใส่ที่นี่)</span>}
            </label>
            <input type="text" value={form.locationLabel} onChange={(e) => update("locationLabel", e.target.value)} placeholder="เขาใหญ่" className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">ข้อความปุ่ม (ว่าง = ค่าเริ่มต้น)</label>
            <input type="text" value={form.ctaLabel} onChange={(e) => update("ctaLabel", e.target.value)}
              placeholder={defaultCta} className={inputCls} />
          </div>

          <p className="text-xs text-slate-400">
            <i className="fa-solid fa-circle-info mr-1"></i>
            ชื่อ / รายละเอียด / ราคา / รูป ดึงจาก{sourceLabel}ต้นทางอัตโนมัติ — ช่องด้านบนเป็นข้อมูลโปรโมชั่นเสริม
          </p>

          {error && <p className="text-red-500 text-xs"><i className="fa-solid fa-circle-exclamation mr-1"></i>{error}</p>}

          <div className="flex gap-3 pt-2 sticky bottom-0 bg-white">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">ยกเลิก</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#2563eb] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
              {saving ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>กำลังบันทึก...</> : (isEdit ? "บันทึกการแก้ไข" : "เพิ่ม")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
