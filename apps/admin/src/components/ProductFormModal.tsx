"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface ProductFormData {
  id?: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  price: string;
  oldPrice: string;
  unitLabel: string;
  location: string;
  deliveryNote: string;
  badge: string;
}

const empty: ProductFormData = {
  slug: "", nameTh: "", nameEn: "", descriptionTh: "", descriptionEn: "",
  price: "", oldPrice: "", unitLabel: "", location: "", deliveryNote: "", badge: "",
};

export default function ProductFormModal({
  initial, onClose, onSaved,
}: {
  initial: Partial<ProductFormData> | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ProductFormData>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    setForm(initial ? { ...empty, ...initial } : empty);
    setError("");
  }, [initial]);

  function update(k: keyof Omit<ProductFormData, "id">, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nameTh || !form.nameEn || !form.slug || !form.price) {
      setError("กรุณากรอก ชื่อ + slug + ราคา ให้ครบ");
      return;
    }
    setSaving(true); setError("");
    try {
      const token = localStorage.getItem("jjd_token") ?? "";
      const url = isEdit ? `${API}/api/products/${form.id}` : `${API}/api/products`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          slug: form.slug,
          nameTh: form.nameTh,
          nameEn: form.nameEn,
          descriptionTh: form.descriptionTh,
          descriptionEn: form.descriptionEn,
          price: form.price,
          oldPrice: form.oldPrice,
          unitLabel: form.unitLabel,
          location: form.location,
          deliveryNote: form.deliveryNote,
          badge: form.badge,
        }),
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-slate-800">{isEdit ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Slug (URL)</label>
            <input type="text" value={form.slug} onChange={(e) => update("slug", e.target.value)} required placeholder="durian-chips"
              pattern="[a-z0-9\-]+" title="ใช้ตัวพิมพ์เล็ก ตัวเลข และ - เท่านั้น"
              className={`${inputCls} font-mono`} />
            <p className="text-xs text-slate-400 mt-1">jongjongdi.com/products/<b>{form.slug || "your-slug"}</b></p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ชื่อสินค้า (ไทย) <span className="text-red-500">*</span></label>
              <input type="text" value={form.nameTh} onChange={(e) => update("nameTh", e.target.value)} required placeholder="ทุเรียนทอดพรีเมียม"
                className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Name (English) <span className="text-red-500">*</span></label>
              <input type="text" value={form.nameEn} onChange={(e) => update("nameEn", e.target.value)} required placeholder="Premium Durian Chips"
                className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">รายละเอียด (ไทย)</label>
            <textarea value={form.descriptionTh} onChange={(e) => update("descriptionTh", e.target.value)} rows={2}
              placeholder="กรอบ อร่อย เคี้ยวเพลิน..." className={`${inputCls} resize-none`} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Description (English)</label>
            <textarea value={form.descriptionEn} onChange={(e) => update("descriptionEn", e.target.value)} rows={2}
              placeholder="Crispy and delicious..." className={`${inputCls} resize-none`} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ราคา <span className="text-red-500">*</span></label>
              <input type="number" min="0" value={form.price} onChange={(e) => update("price", e.target.value)} required placeholder="150"
                className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ราคาเดิม (ขีดฆ่า)</label>
              <input type="number" min="0" value={form.oldPrice} onChange={(e) => update("oldPrice", e.target.value)} placeholder="180"
                className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">หน่วย</label>
              <input type="text" value={form.unitLabel} onChange={(e) => update("unitLabel", e.target.value)} placeholder="/ถุง"
                className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">พื้นที่/จังหวัด</label>
              <input type="text" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="จันทบุรี"
                className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ข้อความจัดส่ง</label>
              <input type="text" value={form.deliveryNote} onChange={(e) => update("deliveryNote", e.target.value)} placeholder="พร้อมส่งทั่วไทย"
                className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ป้าย (Badge)</label>
              <input type="text" value={form.badge} onChange={(e) => update("badge", e.target.value)} placeholder="Best Seller"
                className={inputCls} />
            </div>
          </div>

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
