"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface TourFormData {
  id?: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  pricePerPerson: string;
  maxSeats: string;
  durationHours: string;
}

const empty: TourFormData = {
  slug: "", nameTh: "", nameEn: "",
  descriptionTh: "", descriptionEn: "",
  pricePerPerson: "", maxSeats: "", durationHours: "8",
};

export default function TourFormModal({
  initial, onClose, onSaved,
}: {
  initial: Partial<TourFormData> | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<TourFormData>(empty);
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
        pricePerPerson: String(initial.pricePerPerson ?? ""),
        maxSeats: String(initial.maxSeats ?? ""),
        durationHours: String(initial.durationHours ?? "8"),
      });
    } else {
      setForm(empty);
    }
    setError("");
  }, [initial]);

  function update(k: keyof TourFormData, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const token = localStorage.getItem("jjd_token") ?? "";
      const body = {
        slug: form.slug,
        nameTh: form.nameTh,
        nameEn: form.nameEn,
        descriptionTh: form.descriptionTh,
        descriptionEn: form.descriptionEn,
        pricePerPerson: Number(form.pricePerPerson),
        maxSeats: Number(form.maxSeats),
        durationHours: Number(form.durationHours),
      };
      const url = isEdit ? `${API}/api/tours/${form.id}` : `${API}/api/tours`;
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-slate-800">{isEdit ? "แก้ไขทัวร์" : "เพิ่มทัวร์"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Slug (URL)</label>
            <input type="text" value={form.slug} onChange={(e) => update("slug", e.target.value)} required placeholder="similan-day-trip"
              pattern="[a-z0-9\-]+" title="ใช้ตัวพิมพ์เล็ก ตัวเลข และ - เท่านั้น"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono" />
            <p className="text-xs text-slate-400 mt-1">jongjongdi.com/tours/<b>{form.slug || "your-slug"}</b></p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ชื่อ (ไทย) <span className="text-red-500">*</span></label>
              <input type="text" value={form.nameTh} onChange={(e) => update("nameTh", e.target.value)} required placeholder="ทัวร์เกาะสิมิลัน 1 วัน"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ชื่อ (อังกฤษ) <span className="text-red-500">*</span></label>
              <input type="text" value={form.nameEn} onChange={(e) => update("nameEn", e.target.value)} required placeholder="Similan Island Day Trip"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">รายละเอียด (ไทย)</label>
            <textarea value={form.descriptionTh} onChange={(e) => update("descriptionTh", e.target.value)} rows={4}
              placeholder="สัมผัสโลกใต้ทะเลอันดามัน..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Description (English)</label>
            <textarea value={form.descriptionEn} onChange={(e) => update("descriptionEn", e.target.value)} rows={4}
              placeholder="Explore the vibrant coral reefs..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ราคา/คน (บาท) <span className="text-red-500">*</span></label>
              <input type="number" min="0" value={form.pricePerPerson} onChange={(e) => update("pricePerPerson", e.target.value)} required placeholder="1800"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ที่นั่งสูงสุด/รอบ <span className="text-red-500">*</span></label>
              <input type="number" min="1" value={form.maxSeats} onChange={(e) => update("maxSeats", e.target.value)} required placeholder="20"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ระยะเวลา (ชม.) <span className="text-red-500">*</span></label>
              <input type="number" min="0.5" step="0.5" value={form.durationHours} onChange={(e) => update("durationHours", e.target.value)} required placeholder="8"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs"><i className="fa-solid fa-circle-exclamation mr-1"></i>{error}</p>}

          <div className="flex gap-3 pt-2">
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
