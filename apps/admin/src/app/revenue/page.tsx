"use client";

import { useCallback, useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface RevenueLine {
  bookingNumber: string;
  type: string;
  guestName: string;
  itemName: string;
  method: string;
  approvedAt: string;
  amount: number;
}
interface RevenueData {
  month: string;
  operator: { businessName: string; commissionRate: number };
  lines: RevenueLine[];
  gross: number;
  commission: number;
  net: number;
}

const baht = (n: number) => `฿${n.toLocaleString("en-US")}`;
const METHOD_LABEL: Record<string, string> = {
  BANK_TRANSFER: "โอนธนาคาร", PROMPTPAY: "PromptPay", CREDIT_CARD: "บัตรเครดิต", ALIPAY: "Alipay", WECHAT_PAY: "WeChat Pay",
};

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function RevenuePage() {
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jjd_token") ?? "";
      const res = await fetch(`${API}/api/payouts/me?month=${month}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setData(await res.json());
      else setData(null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { load(); }, [load]);

  function exportCsv() {
    if (!data) return;
    const fmtDate = (s: string) => (s ? new Date(s).toLocaleDateString("en-CA") : "");
    const header = ["เลขที่จอง", "ประเภท", "รายการ", "ลูกค้า", "ช่องทาง", "วันอนุมัติ", "ยอดเงิน"];
    const rows = data.lines.map((l) => [
      l.bookingNumber,
      l.type === "ACCOMMODATION" ? "ที่พัก" : "ทัวร์",
      l.itemName,
      l.guestName,
      METHOD_LABEL[l.method] ?? l.method,
      fmtDate(l.approvedAt),
      String(l.amount),
    ]);
    // summary rows
    rows.push([]);
    rows.push(["", "", "", "", "", "รายได้รวม", String(data.gross)]);
    rows.push(["", "", "", "", "", `หักค่าคอม ${data.operator.commissionRate}%`, String(-data.commission)]);
    rows.push(["", "", "", "", "", "ยอดรับสุทธิ", String(data.net)]);

    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
    // BOM so Excel reads Thai (UTF-8) correctly
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenue-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const summaryCards = data ? [
    { label: "รายได้รวม", value: baht(data.gross), color: "bg-blue-50 text-[#2563eb]", icon: "fa-coins" },
    { label: `หักค่าคอม (${data.operator.commissionRate}%)`, value: `−${baht(data.commission)}`, color: "bg-orange-50 text-orange-600", icon: "fa-percent" },
    { label: "ยอดรับสุทธิ", value: baht(data.net), color: "bg-green-50 text-green-600", icon: "fa-sack-dollar" },
    { label: "จำนวนจอง", value: String(data.lines.length), color: "bg-slate-50 text-slate-600", icon: "fa-calendar-check" },
  ] : [];

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800"><i className="fa-solid fa-coins text-[#2563eb] mr-2"></i>รายได้ของฉัน</h1>
          <p className="text-slate-500 text-sm mt-1">สรุปรายได้รายเดือน (ยึดวันที่อนุมัติชำระเงิน) · ยอดรับสุทธิ = รายได้ − ค่าคอมแพลตฟอร์ม</p>
        </div>
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">เดือน</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
          </div>
          <button onClick={exportCsv} disabled={!data || data.lines.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition disabled:opacity-50">
            <i className="fa-solid fa-file-csv mr-2"></i>Export CSV
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(summaryCards.length ? summaryCards : [0, 1, 2, 3]).map((c, i) => (
          typeof c === "number" ? (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-slate-100 mb-3"></div>
              <div className="text-2xl font-bold text-slate-300">—</div>
            </div>
          ) : (
            <div key={c.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center mb-3`}>
                <i className={`fa-solid ${c.icon}`}></i>
              </div>
              <div className="text-2xl font-bold text-slate-800">{c.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{c.label}</div>
            </div>
          )
        ))}
      </div>

      {/* Lines table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>
        ) : !data || data.lines.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <i className="fa-solid fa-coins text-4xl mb-3 block"></i>
            <p className="text-sm">ไม่มีรายได้ในเดือนนี้</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">เลขที่จอง</th>
                  <th className="px-5 py-3 text-left font-medium">รายการ</th>
                  <th className="px-5 py-3 text-left font-medium">ลูกค้า</th>
                  <th className="px-5 py-3 text-left font-medium">ช่องทาง</th>
                  <th className="px-5 py-3 text-left font-medium">วันอนุมัติ</th>
                  <th className="px-5 py-3 text-right font-medium">ยอดเงิน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.lines.map((l, i) => (
                  <tr key={`${l.bookingNumber}-${i}`} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3 font-mono text-xs text-slate-600">{l.bookingNumber}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${l.type === "ACCOMMODATION" ? "bg-[#2563eb]" : "bg-cyan-500"}`}></span>
                      {l.itemName}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{l.guestName}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{METHOD_LABEL[l.method] ?? l.method}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{l.approvedAt ? new Date(l.approvedAt).toLocaleDateString("th-TH", { day: "numeric", month: "short" }) : "-"}</td>
                    <td className="px-5 py-3 text-right font-semibold text-slate-800">{baht(l.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 text-slate-600">
                  <td className="px-5 py-2.5" colSpan={5}>รายได้รวม</td>
                  <td className="px-5 py-2.5 text-right">{baht(data.gross)}</td>
                </tr>
                <tr className="bg-slate-50 text-slate-500">
                  <td className="px-5 py-2.5" colSpan={5}>หักค่าคอมมิชชั่น ({data.operator.commissionRate}%)</td>
                  <td className="px-5 py-2.5 text-right">−{baht(data.commission)}</td>
                </tr>
                <tr className="bg-slate-50 font-bold text-[#2563eb]">
                  <td className="px-5 py-3" colSpan={5}>ยอดรับสุทธิ</td>
                  <td className="px-5 py-3 text-right">{baht(data.net)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
