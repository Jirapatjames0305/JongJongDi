"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import BankAccountFormModal, { type BankAccountFormData } from "@/components/BankAccountFormModal";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string | null;
  isActive: boolean;
  order: number;
}

export default function BankAccountsPage() {
  const [items, setItems] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [formInitial, setFormInitial] = useState<Partial<BankAccountFormData> | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  async function load() {
    const token = localStorage.getItem("jjd_token") ?? "";
    const res = await fetch(`${API}/api/bank-accounts/admin/list`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() { setFormInitial(null); setFormOpen(true); }

  function openEdit(a: BankAccount) {
    setFormInitial({
      id: a.id, bankName: a.bankName, accountName: a.accountName,
      accountNumber: a.accountNumber, branch: a.branch ?? "", order: String(a.order),
    });
    setFormOpen(true);
  }

  async function toggleActive(id: string, current: boolean) {
    const token = localStorage.getItem("jjd_token") ?? "";
    await fetch(`${API}/api/bank-accounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !current }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("ลบบัญชีธนาคารนี้?")) return;
    const token = localStorage.getItem("jjd_token") ?? "";
    await fetch(`${API}/api/bank-accounts/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    load();
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800"><i className="fa-solid fa-building-columns text-[#2563eb] mr-2"></i>บัญชีธนาคาร</h1>
          <p className="text-slate-500 text-sm mt-1">บัญชีที่แสดงให้ลูกค้าโอนเงินตอนชำระเงิน · {items.length} บัญชี</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-[#2563eb] text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">
          <i className="fa-solid fa-plus mr-2"></i>เพิ่มบัญชี
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <i className="fa-solid fa-building-columns text-4xl mb-3 block"></i>
            <p className="text-sm mb-2">ยังไม่มีบัญชีธนาคาร</p>
            <button onClick={openAdd} className="px-4 py-2 bg-[#2563eb] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">เพิ่มบัญชีแรก</button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((a) => (
              <div key={a.id} className="p-4 hover:bg-slate-50 transition flex flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">{a.order}</span>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563eb] flex-shrink-0 flex items-center justify-center">
                    <i className="fa-solid fa-building-columns"></i>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">{a.bankName}{a.branch && <span className="text-slate-400 font-normal"> · {a.branch}</span>}</h3>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="font-mono">{a.accountNumber}</span>
                      <span>{a.accountName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 md:flex-col md:w-32 items-start">
                  <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${a.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {a.isActive ? "แสดง" : "ซ่อน"}
                  </span>
                  <button onClick={() => openEdit(a)} className="px-3 py-1.5 bg-[#2563eb] text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"><i className="fa-solid fa-pen mr-1"></i>แก้ไข</button>
                  <button onClick={() => toggleActive(a.id, a.isActive)} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition">{a.isActive ? "ซ่อน" : "แสดง"}</button>
                  <button onClick={() => remove(a.id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition"><i className="fa-solid fa-trash mr-1"></i>ลบ</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <BankAccountFormModal initial={formInitial} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); load(); }} />
      )}
    </AdminShell>
  );
}
