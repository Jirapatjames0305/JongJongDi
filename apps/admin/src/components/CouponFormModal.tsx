"use client";

import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface CouponFormData {
  id?: string;
  code: string;
  description: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: string;
  minAmount: string;
  maxDiscount: string;
  expiresAt: string;
  usageLimit: string;
}

const empty: CouponFormData = {
  code: "", description: "", discountType: "FIXED",
  discountValue: "", minAmount: "", maxDiscount: "", expiresAt: "", usageLimit: "",
};

export default function CouponFormModal({
  initial, onClose, onSaved,
}: {
  initial: Partial<CouponFormData> | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<CouponFormData>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    setForm(initial ? { ...empty, ...initial } : empty);
    setError("");
  }, [initial]);

  function set(field: keyof CouponFormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    const token = localStorage.getItem("jjd_token") ?? "";
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    const body = {
      code: form.code.trim().toUpperCase(),
      description: form.description,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minAmount: form.minAmount ? Number(form.minAmount) : null,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      expiresAt: form.expiresAt || null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    };

    try {
      const url = isEdit ? `${API}/api/coupons/${initial!.id}` : `${API}/api/coupons`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ไม่สำเร็จ");
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#2563eb] transition";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-lg">
            <i className="fa-solid fa-ticket text-yellow-500 mr-2"></i>
            {isEdit ? "แก้ไขคูปอง" : "สร้างคูปองใหม่"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          {/* Code */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">รหัสคูปอง <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              required
              disabled={isEdit}
              placeholder="เช่น SUMMER20"
              className={`${inputCls} font-mono tracking-widest uppercase ${isEdit ? "bg-slate-50 text-slate-400" : ""}`}
            />
            {isEdit && <p className="text-xs text-slate-400 mt-1">ไม่สามารถเปลี่ยนรหัสคูปองได้</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">คำอธิบาย</label>
            <input type="text" value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="เช่น ลดพิเศษต้อนรับสมาชิกใหม่" className={inputCls} />
          </div>

          {/* Type + Value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ประเภทส่วนลด <span className="text-red-400">*</span></label>
              <select value={form.discountType} onChange={(e) => set("discountType", e.target.value as "PERCENT" | "FIXED")}
                disabled={isEdit} className={`${inputCls} ${isEdit ? "bg-slate-50 text-slate-400" : ""}`}>
                <option value="FIXED">จำนวนเงิน (฿)</option>
                <option value="PERCENT">เปอร์เซ็นต์ (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                มูลค่า {form.discountType === "PERCENT" ? "(%)" : "(฿)"} <span className="text-red-400">*</span>
              </label>
              <input type="number" min="1" max={form.discountType === "PERCENT" ? 100 : undefined}
                value={form.discountValue} onChange={(e) => set("discountValue", e.target.value)}
                required placeholder={form.discountType === "PERCENT" ? "1-100" : "เช่น 150"} className={inputCls} />
            </div>
          </div>

          {/* Min amount + Max discount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ยอดขั้นต่ำ (฿)</label>
              <input type="number" min="0" value={form.minAmount} onChange={(e) => set("minAmount", e.target.value)}
                placeholder="ไม่กำหนด" className={inputCls} />
            </div>
            {form.discountType === "PERCENT" && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">ลดสูงสุด (฿)</label>
                <input type="number" min="0" value={form.maxDiscount} onChange={(e) => set("maxDiscount", e.target.value)}
                  placeholder="ไม่กำหนด" className={inputCls} />
              </div>
            )}
          </div>

          {/* Expiry + Usage limit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">วันหมดอายุ</label>
              <input type="date" value={form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">จำนวนสิทธิ์</label>
              <input type="number" min="1" value={form.usageLimit} onChange={(e) => set("usageLimit", e.target.value)}
                placeholder="ไม่จำกัด" className={inputCls} />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs"><i className="fa-solid fa-circle-exclamation mr-1"></i>{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-[#2563eb] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
              {saving ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>กำลังบันทึก...</> : isEdit ? "บันทึกการแก้ไข" : "สร้างคูปอง"}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
