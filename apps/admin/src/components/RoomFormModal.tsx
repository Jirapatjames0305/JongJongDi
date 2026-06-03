"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface RoomTypeRow {
  id?: string;
  nameTh: string;
  nameEn: string;
  pricePerNight: string;
  maxGuests: string;
  quantity: string;
}

export interface RoomFormData {
  id?: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  types: RoomTypeRow[];
}

const emptyType: RoomTypeRow = { nameTh: "", nameEn: "", pricePerNight: "", maxGuests: "", quantity: "1" };

const empty: RoomFormData = {
  slug: "", nameTh: "", nameEn: "",
  descriptionTh: "", descriptionEn: "",
  types: [{ ...emptyType }],
};

export default function RoomFormModal({
  initial, onClose, onSaved,
}: {
  initial: Partial<RoomFormData> | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<RoomFormData>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    if (initial) {
      setForm({
        id: initial.id,
        slug: initial.slug ?? "",
        nameTh: initial.nameTh ?? "",
        nameEn: initial.nameEn ?? "",
        descriptionTh: initial.descriptionTh ?? "",
        descriptionEn: initial.descriptionEn ?? "",
        types: initial.types && initial.types.length ? initial.types : [{ ...emptyType }],
      });
    } else {
      setForm(empty);
    }
    setError("");
  }, [initial]);

  function update(k: keyof Omit<RoomFormData, "types" | "id">, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  }

  function updateType(idx: number, k: keyof RoomTypeRow, v: string) {
    setForm((f) => ({
      ...f,
      types: f.types.map((t, i) => (i === idx ? { ...t, [k]: v } : t)),
    }));
    setError("");
  }

  function addType() {
    setForm((f) => ({ ...f, types: [...f.types, { ...emptyType }] }));
  }

  function removeType(idx: number) {
    setForm((f) => ({ ...f, types: f.types.length === 1 ? f.types : f.types.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.types.some((t) => !t.nameTh || !t.pricePerNight || !t.maxGuests)) {
      setError("กรุณากรอกข้อมูลทุกประเภทห้องให้ครบ (ชื่อ + ราคา + ผู้เข้าพัก)");
      return;
    }
    setSaving(true); setError("");
    try {
      const token = localStorage.getItem("jjd_token") ?? "";
      const body = {
        slug: form.slug,
        nameTh: form.nameTh,
        nameEn: form.nameEn,
        descriptionTh: form.descriptionTh,
        descriptionEn: form.descriptionEn,
        types: form.types.map((t) => ({
          nameTh: t.nameTh,
          nameEn: t.nameEn || t.nameTh,
          pricePerNight: Number(t.pricePerNight),
          maxGuests: Number(t.maxGuests),
          quantity: Number(t.quantity || 1),
        })),
      };
      const url = isEdit ? `${API}/api/rooms/${form.id}` : `${API}/api/rooms`;
      const method = isEdit ? "PATCH" : "POST";
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-slate-800">{isEdit ? "แก้ไขที่พัก" : "เพิ่มที่พัก"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ─── Listing info (shared across all types) ─── */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">ข้อมูลที่พัก</h3>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Slug (URL)</label>
              <input type="text" value={form.slug} onChange={(e) => update("slug", e.target.value)} required placeholder="beachfront-villa"
                pattern="[a-z0-9\-]+" title="ใช้ตัวพิมพ์เล็ก ตัวเลข และ - เท่านั้น"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono" />
              <p className="text-xs text-slate-400 mt-1">jongjongdi.com/rooms/<b>{form.slug || "your-slug"}</b></p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">ชื่อที่พัก (ไทย) <span className="text-red-500">*</span></label>
                <input type="text" value={form.nameTh} onChange={(e) => update("nameTh", e.target.value)} required placeholder="วิลล่าริมทะเล"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Name (English) <span className="text-red-500">*</span></label>
                <input type="text" value={form.nameEn} onChange={(e) => update("nameEn", e.target.value)} required placeholder="Beachfront Villa"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">รายละเอียด (ไทย)</label>
              <textarea value={form.descriptionTh} onChange={(e) => update("descriptionTh", e.target.value)} rows={3}
                placeholder="ห้องพักสุดหรูริมทะเล..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Description (English)</label>
              <textarea value={form.descriptionEn} onChange={(e) => update("descriptionEn", e.target.value)} rows={3}
                placeholder="Luxurious beachfront villa..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
            </div>
          </section>

          {/* ─── Room types (with + button) ─── */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                ประเภทห้อง <span className="text-red-500 normal-case">*</span> <span className="text-slate-400 normal-case font-normal">({form.types.length})</span>
              </h3>
              <button type="button" onClick={addType} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition">
                <i className="fa-solid fa-plus mr-1"></i>เพิ่มประเภทห้อง
              </button>
            </div>

            {form.types.map((t, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-4 space-y-3 relative">
                {form.types.length > 1 && (
                  <button type="button" onClick={() => removeType(i)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 transition flex items-center justify-center">
                    <i className="fa-solid fa-xmark text-sm"></i>
                  </button>
                )}
                <div className="text-xs font-semibold text-slate-500">ประเภท #{i + 1}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">ชื่อประเภท (ไทย) <span className="text-red-500">*</span></label>
                    <input type="text" value={t.nameTh} onChange={(e) => updateType(i, "nameTh", e.target.value)} required placeholder="ห้อง 2 คน"
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">Name (English)</label>
                    <input type="text" value={t.nameEn} onChange={(e) => updateType(i, "nameEn", e.target.value)} placeholder="Standard Twin"
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">ราคา/คืน <span className="text-red-500">*</span></label>
                    <input type="number" min="0" value={t.pricePerNight} onChange={(e) => updateType(i, "pricePerNight", e.target.value)} required placeholder="1500"
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">ผู้เข้าพัก <span className="text-red-500">*</span></label>
                    <input type="number" min="1" value={t.maxGuests} onChange={(e) => updateType(i, "maxGuests", e.target.value)} required placeholder="2"
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">จำนวน <span className="text-red-500">*</span></label>
                    <input type="number" min="1" value={t.quantity} onChange={(e) => updateType(i, "quantity", e.target.value)} required placeholder="5"
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white" />
                  </div>
                </div>
              </div>
            ))}

            <p className="text-xs text-slate-400">
              <i className="fa-solid fa-circle-info mr-1"></i>
              เช่น ห้อง 2 คน 5 ห้อง + ห้อง 4 คน 5 ห้อง — เพิ่มได้หลายประเภทตามต้องการ
            </p>
          </section>

          {error && <p className="text-red-500 text-xs"><i className="fa-solid fa-circle-exclamation mr-1"></i>{error}</p>}

          <div className="flex gap-3 pt-2 sticky bottom-0 bg-white">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
              ยกเลิก
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#2563eb] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
              {saving ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>กำลังบันทึก...</> : (isEdit ? "บันทึกการแก้ไข" : "เพิ่ม")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
