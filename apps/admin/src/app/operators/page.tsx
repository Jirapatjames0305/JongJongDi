"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { fetchOperators, approveOperator } from "@/lib/auth";

interface Operator {
  id: string;
  name: string;
  email: string;
  businessName: string;
  phone: string;
  role: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  createdAt: string;
  _count: { rooms: number; tours: number };
}

const statusStyle: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACTIVE: "bg-green-100 text-green-700",
  SUSPENDED: "bg-red-100 text-red-700",
};
const statusLabel: Record<string, string> = {
  PENDING: "รอการอนุมัติ",
  ACTIVE: "ใช้งานได้",
  SUSPENDED: "ระงับ",
};

export default function OperatorsPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const token = localStorage.getItem("jjd_token") ?? "";
    try {
      const data = await fetchOperators(token, filter === "all" ? undefined : filter);
      setOperators(data);
    } catch {
      // API ยังไม่ต่อ DB — แสดง mock
      setOperators([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filter]);

  async function handleAction(id: string, status: string) {
    const token = localStorage.getItem("jjd_token") ?? "";
    await approveOperator(token, id, status);
    load();
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ผู้ประกอบการ</h1>
          <p className="text-slate-500 text-sm mt-1">จัดการและอนุมัติผู้ประกอบการที่สมัครเข้ามา</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl border border-slate-100 shadow-sm w-fit">
        {[
          { key: "all", label: "ทั้งหมด" },
          { key: "PENDING", label: "รอการอนุมัติ" },
          { key: "ACTIVE", label: "ใช้งานได้" },
          { key: "SUSPENDED", label: "ระงับ" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f.key ? "bg-[#2563eb] text-white shadow" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <i className="fa-solid fa-circle-notch fa-spin text-2xl mb-2 block"></i>
            กำลังโหลด...
          </div>
        ) : operators.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <i className="fa-solid fa-users text-4xl mb-3 block"></i>
            <p className="text-sm">ยังไม่มีผู้ประกอบการ</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                <tr>
                  {["ชื่อ / ธุรกิจ", "ติดต่อ", "สถานะ", "ที่พัก/ทัวร์", "วันที่สมัคร", "การดำเนินการ"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {operators.map((op) => (
                  <tr key={op.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{op.name}</div>
                      <div className="text-xs text-slate-400">{op.businessName}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-slate-600">{op.email}</div>
                      <div className="text-xs text-slate-400">{op.phone}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle[op.status]}`}>
                        {statusLabel[op.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      <span className="mr-3"><i className="fa-solid fa-bed mr-1"></i>{op._count.rooms}</span>
                      <span><i className="fa-solid fa-water-ladder mr-1"></i>{op._count.tours}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs">
                      {new Date(op.createdAt).toLocaleDateString("th-TH")}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {op.status === "PENDING" && (
                          <button
                            onClick={() => handleAction(op.id, "ACTIVE")}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 transition"
                          >
                            อนุมัติ
                          </button>
                        )}
                        {op.status === "ACTIVE" && (
                          <button
                            onClick={() => handleAction(op.id, "SUSPENDED")}
                            className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-200 transition"
                          >
                            ระงับ
                          </button>
                        )}
                        {op.status === "SUSPENDED" && (
                          <button
                            onClick={() => handleAction(op.id, "ACTIVE")}
                            className="px-3 py-1.5 bg-blue-100 text-[#2563eb] rounded-lg text-xs font-semibold hover:bg-blue-200 transition"
                          >
                            เปิดใช้งาน
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
