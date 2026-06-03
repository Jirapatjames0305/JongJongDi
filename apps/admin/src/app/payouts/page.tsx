"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import type { OperatorInfo } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface PayoutRow {
  operatorId: string;
  name: string;
  businessName: string;
  commissionRate: number;
  bookingCount: number;
  gross: number;
  commission: number;
  net: number;
}
interface PayoutSummary {
  month: string;
  rows: PayoutRow[];
  totals: { gross: number; commission: number; net: number; bookingCount: number };
}
interface ReceiptLine {
  bookingNumber: string;
  type: string;
  guestName: string;
  itemName: string;
  method: string;
  approvedAt: string;
  amount: number;
}
interface Receipt {
  month: string;
  operator: { name: string; businessName: string; email: string; phone: string; commissionRate: number };
  lines: ReceiptLine[];
  gross: number;
  commission: number;
  net: number;
}

const baht = (n: number) => `฿${n.toLocaleString("en-US")}`;

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function PayoutsPage() {
  const router = useRouter();
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState<PayoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Super admin only
  useEffect(() => {
    const stored = localStorage.getItem("jjd_operator");
    if (stored) {
      const op = JSON.parse(stored) as OperatorInfo;
      if (op.role !== "SUPER_ADMIN") router.replace("/dashboard");
    }
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jjd_token") ?? "";
      const res = await fetch(`${API}/api/payouts?month=${month}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setData(await res.json());
      else setData(null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { load(); }, [load]);

  async function openReceipt(operatorId: string) {
    setBusyId(operatorId);
    try {
      const token = localStorage.getItem("jjd_token") ?? "";
      const res = await fetch(`${API}/api/payouts/operator/${operatorId}?month=${month}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const r: Receipt = await res.json();
      printReceipt(r);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800"><i className="fa-solid fa-file-invoice-dollar text-[#2563eb] mr-2"></i>ยอดโอนผู้ประกอบการ</h1>
          <p className="text-slate-500 text-sm mt-1">ยอดที่แพลตฟอร์มต้องโอนให้แต่ละผู้ประกอบการ (ยึดวันที่อนุมัติชำระเงิน)</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">เดือน</label>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>
        ) : !data || data.rows.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <i className="fa-solid fa-file-invoice text-4xl mb-3 block"></i>
            <p className="text-sm">ไม่มียอดที่ต้องโอนในเดือนนี้</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">ผู้ประกอบการ</th>
                  <th className="px-5 py-3 text-right font-medium">จำนวนจอง</th>
                  <th className="px-5 py-3 text-right font-medium">รายได้รวม</th>
                  <th className="px-5 py-3 text-right font-medium">ค่าคอม</th>
                  <th className="px-5 py-3 text-right font-medium">ยอดโอนสุทธิ</th>
                  <th className="px-5 py-3 text-right font-medium">ใบสรุป</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.rows.map((r) => (
                  <tr key={r.operatorId} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{r.businessName}</div>
                      <div className="text-xs text-slate-400">{r.name}</div>
                    </td>
                    <td className="px-5 py-4 text-right text-slate-600">{r.bookingCount}</td>
                    <td className="px-5 py-4 text-right text-slate-600">{baht(r.gross)}</td>
                    <td className="px-5 py-4 text-right text-slate-500">
                      <span className="text-xs text-slate-400">{r.commissionRate}%</span> −{baht(r.commission)}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-[#2563eb]">{baht(r.net)}</td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => openReceipt(r.operatorId)} disabled={busyId === r.operatorId}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition disabled:opacity-50">
                        {busyId === r.operatorId ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <><i className="fa-solid fa-print mr-1"></i>ใบสรุป</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold text-slate-800">
                  <td className="px-5 py-4">รวมทั้งหมด</td>
                  <td className="px-5 py-4 text-right">{data.totals.bookingCount}</td>
                  <td className="px-5 py-4 text-right">{baht(data.totals.gross)}</td>
                  <td className="px-5 py-4 text-right text-slate-500">−{baht(data.totals.commission)}</td>
                  <td className="px-5 py-4 text-right text-[#2563eb]">{baht(data.totals.net)}</td>
                  <td className="px-5 py-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

// Open a self-contained printable receipt in a new window
function printReceipt(r: Receipt) {
  const methodLabel: Record<string, string> = {
    BANK_TRANSFER: "โอนธนาคาร", PROMPTPAY: "PromptPay", CREDIT_CARD: "บัตรเครดิต", ALIPAY: "Alipay", WECHAT_PAY: "WeChat Pay",
  };
  const fmtDate = (s: string) => new Date(s).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
  const bahtStr = (n: number) => `฿${n.toLocaleString("en-US")}`;
  const rows = r.lines.map((l, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${l.bookingNumber}</td>
      <td>${l.itemName}<div class="muted">${l.type === "ACCOMMODATION" ? "ที่พัก" : "ทัวร์"} · ${l.guestName}</div></td>
      <td>${methodLabel[l.method] ?? l.method}</td>
      <td>${l.approvedAt ? fmtDate(l.approvedAt) : "-"}</td>
      <td class="r">${bahtStr(l.amount)}</td>
    </tr>`).join("");

  const html = `<!doctype html><html lang="th"><head><meta charset="utf-8">
  <title>ใบสรุปยอดโอน ${r.operator.businessName} ${r.month}</title>
  <style>
    *{box-sizing:border-box} body{font-family:-apple-system,'Segoe UI',Tahoma,sans-serif;color:#1e293b;padding:32px;max-width:800px;margin:0 auto}
    h1{font-size:20px;margin:0 0 4px} .sub{color:#64748b;font-size:13px;margin-bottom:20px}
    .box{border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:20px;font-size:13px}
    .grid{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap}
    table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px}
    th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #eef2f7}
    th{background:#f8fafc;color:#64748b;font-size:11px;text-transform:uppercase}
    td.r,th.r{text-align:right} .muted{color:#94a3b8;font-size:11px}
    .totals{margin-left:auto;width:280px;font-size:14px}
    .totals .row{display:flex;justify-content:space-between;padding:6px 0}
    .totals .net{border-top:2px solid #1e293b;margin-top:6px;padding-top:10px;font-weight:bold;font-size:16px;color:#2563eb}
    .btn{background:#2563eb;color:#fff;border:0;padding:10px 18px;border-radius:8px;font-size:14px;cursor:pointer;margin-top:8px}
    @media print{.btn{display:none}}
  </style></head><body>
    <h1>ใบสรุปยอดโอน / Payout Statement</h1>
    <div class="sub">ประจำเดือน ${r.month} · JongJongDi</div>
    <div class="box grid">
      <div><strong>${r.operator.businessName}</strong><div class="muted">${r.operator.name}</div></div>
      <div class="muted">${r.operator.email}<br>${r.operator.phone}</div>
    </div>
    <table>
      <thead><tr><th>#</th><th>เลขที่จอง</th><th>รายการ</th><th>ช่องทาง</th><th>วันอนุมัติ</th><th class="r">ยอดเงิน</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="6" class="muted" style="text-align:center;padding:24px">ไม่มีรายการ</td></tr>`}</tbody>
    </table>
    <div class="totals">
      <div class="row"><span>รายได้รวม</span><span>${bahtStr(r.gross)}</span></div>
      <div class="row"><span>หักค่าคอมมิชชั่น (${r.operator.commissionRate}%)</span><span>−${bahtStr(r.commission)}</span></div>
      <div class="row net"><span>ยอดโอนสุทธิ</span><span>${bahtStr(r.net)}</span></div>
    </div>
    <button class="btn" onclick="window.print()">พิมพ์ / บันทึก PDF</button>
  </body></html>`;

  const w = window.open("", "_blank", "width=860,height=900");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}
