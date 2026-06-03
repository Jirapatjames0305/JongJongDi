"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const THAI_BANKS = [
  "กสิกรไทย", "ไทยพาณิชย์", "กรุงเทพ", "กรุงไทย", "กรุงศรีอยุธยา",
  "ทหารไทยธนชาต (ttb)", "ออมสิน", "ธ.ก.ส.", "ซีไอเอ็มบี ไทย", "ยูโอบี", "เกียรตินาคินภัทร",
];

export interface BankAccountFormData {
  id?: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  order: string;
}

const empty: BankAccountFormData = {
  bankName: "", accountName: "", accountNumber: "", branch: "", order: "0",
};

export default function BankAccountFormModal({
  initial, onClose, onSaved,
}: {
  initial: Partial<BankAccountFormData> | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<BankAccountFormData>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    setForm(initial ? { ...empty, ...initial } : empty);
    setError("");
  }, [initial]);

  function update(k: keyof Omit<BankAccountFormData, "id">, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.bankName.trim() || !form.accountName.trim() || !form.accountNumber.trim()) {
      setError("กรุณากรอกธนาคาร ชื่อบัญชี และเลขที่บัญชีให้ครบ");
      return;
    }
    setSaving(true); setError("");
    try {
      const token = localStorage.getItem("jjd_token") ?? "";
      const url = isEdit ? `${API}/api/bank-accounts/${form.id}` : `${API}/api/bank-accounts`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          bankName: form.bankName, accountName: form.accountName,
          accountNumber: form.accountNumber, branch: form.branch, order: form.order,
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-slate-800">{isEdit ? "แก้ไขบัญชีธนาคาร" : "เพิ่มบัญชีธนาคาร"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">ธนาคาร <span className="text-red-500">*</span></label>
            <input list="thai-banks" value={form.bankName} onChange={(e) => update("bankName", e.target.value)}
              placeholder="กสิกรไทย" className={inputCls} />
            <datalist id="thai-banks">
              {THAI_BANKS.map((b) => <option key={b} value={b} />)}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">ชื่อบัญชี <span className="text-red-500">*</span></label>
            <input type="text" value={form.accountName} onChange={(e) => update("accountName", e.target.value)}
              placeholder="บริษัท จองจองดิ จำกัด" className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">เลขที่บัญชี <span className="text-red-500">*</span></label>
            <input type="text" value={form.accountNumber} onChange={(e) => update("accountNumber", e.target.value)}
              placeholder="123-4-56789-0" className={`${inputCls} font-mono`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">สาขา</label>
              <input type="text" value={form.branch} onChange={(e) => update("branch", e.target.value)}
                placeholder="สีลม" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ลำดับ (น้อย = แสดงก่อน)</label>
              <input type="number" value={form.order} onChange={(e) => update("order", e.target.value)} className={inputCls} />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs"><i className="fa-solid fa-circle-exclamation mr-1"></i>{error}</p>}

          <div className="flex gap-3 pt-2">
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
