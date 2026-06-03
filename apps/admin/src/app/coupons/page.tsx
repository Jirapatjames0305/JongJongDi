"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import CouponFormModal, { type CouponFormData } from "@/components/CouponFormModal";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minAmount: number | null;
  maxDiscount: number | null;
  expiresAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  _count: { userCoupons: number };
}

const fmt = (n: number) => n.toLocaleString("en-US");
const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) : "—";

function discountLabel(c: Coupon) {
  return c.discountType === "PERCENT"
    ? `${c.discountValue}%${c.maxDiscount ? ` (สูงสุด ฿${fmt(c.maxDiscount)})` : ""}`
    : `฿${fmt(c.discountValue)}`;
}

function isExpired(c: Coupon) {
  return !!c.expiresAt && new Date(c.expiresAt) < new Date();
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState<Partial<CouponFormData> | null>(null);
  const [search, setSearch] = useState("");

  function authHeader() {
    const token = localStorage.getItem("jjd_token") ?? "";
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  }

  async function load() {
    const res = await fetch(`${API}/api/coupons`, { headers: authHeader() });
    if (res.ok) setCoupons(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() { setFormInitial(null); setFormOpen(true); }

  function openEdit(c: Coupon) {
    setFormInitial({
      id: c.id,
      code: c.code,
      description: c.description ?? "",
      discountType: c.discountType,
      discountValue: String(c.discountValue),
      minAmount: c.minAmount != null ? String(c.minAmount) : "",
      maxDiscount: c.maxDiscount != null ? String(c.maxDiscount) : "",
      expiresAt: c.expiresAt ? c.expiresAt.split("T")[0] : "",
      usageLimit: c.usageLimit != null ? String(c.usageLimit) : "",
    });
    setFormOpen(true);
  }

  async function toggleActive(c: Coupon) {
    await fetch(`${API}/api/coupons/${c.id}`, {
      method: "PATCH",
      headers: authHeader(),
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    load();
  }

  async function remove(c: Coupon) {
    if (!confirm(`ลบคูปอง "${c.code}" ?\n(ผู้ที่รับไปแล้วยังใช้งานได้)`)) return;
    await fetch(`${API}/api/coupons/${c.id}`, { method: "DELETE", headers: authHeader() });
    load();
  }

  const filtered = coupons.filter((c) =>
    c.code.includes(search.toUpperCase()) ||
    (c.description ?? "").includes(search)
  );

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            <i className="fa-solid fa-ticket text-yellow-500 mr-2"></i>จัดการคูปอง
          </h1>
          <p className="text-slate-500 text-sm mt-1">{coupons.length} คูปองทั้งหมด</p>
        </div>
        <button onClick={openAdd}
          className="px-4 py-2.5 bg-[#2563eb] text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">
          <i className="fa-solid fa-plus mr-2"></i>สร้างคูปองใหม่
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหารหัสหรือคำอธิบาย..."
          className="w-full max-w-sm border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#2563eb] transition"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <i className="fa-solid fa-circle-notch fa-spin text-2xl"></i>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <i className="fa-solid fa-ticket text-4xl mb-3 block opacity-30"></i>
            <p>ไม่พบคูปอง</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">รหัส / คำอธิบาย</th>
                  <th className="px-4 py-3 text-left">ส่วนลด</th>
                  <th className="px-4 py-3 text-left">ขั้นต่ำ</th>
                  <th className="px-4 py-3 text-left">การใช้งาน</th>
                  <th className="px-4 py-3 text-left">หมดอายุ</th>
                  <th className="px-4 py-3 text-left">สถานะ</th>
                  <th className="px-4 py-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => {
                  const expired = isExpired(c);
                  const full = c.usageLimit !== null && c.usageCount >= c.usageLimit;
                  return (
                    <tr key={c.id} className={`hover:bg-slate-50/50 transition ${!c.isActive || expired ? "opacity-50" : ""}`}>
                      <td className="px-4 py-3">
                        <p className="font-mono font-bold text-slate-800 tracking-widest">{c.code}</p>
                        {c.description && <p className="text-xs text-slate-400 mt-0.5">{c.description}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-semibold ${c.discountType === "PERCENT" ? "text-blue-600" : "text-green-600"}`}>
                          {discountLabel(c)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {c.minAmount ? `฿${fmt(c.minAmount)}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-700">
                          {c.usageCount}
                          {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                        </div>
                        {c.usageLimit && (
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${full ? "bg-red-400" : "bg-blue-400"}`}
                              style={{ width: `${Math.min(100, (c.usageCount / c.usageLimit) * 100)}%` }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={expired ? "text-red-500 font-medium" : "text-slate-500"}>
                          {fmtDate(c.expiresAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {expired ? (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">หมดอายุ</span>
                        ) : full ? (
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">ใช้ครบแล้ว</span>
                        ) : c.isActive ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">ใช้งานอยู่</span>
                        ) : (
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">ปิดใช้งาน</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => openEdit(c)}
                            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-medium transition">
                            <i className="fa-solid fa-pen mr-1"></i>แก้ไข
                          </button>
                          <button onClick={() => toggleActive(c)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${c.isActive ? "border border-amber-200 text-amber-600 hover:bg-amber-50" : "border border-green-200 text-green-600 hover:bg-green-50"}`}>
                            {c.isActive ? "ปิด" : "เปิด"}
                          </button>
                          <button onClick={() => remove(c)}
                            className="text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 font-medium transition">
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formOpen && (
        <CouponFormModal
          initial={formInitial}
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); load(); }}
        />
      )}
    </AdminShell>
  );
}
