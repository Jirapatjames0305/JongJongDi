"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import { fetchStats, fetchBookings, OperatorInfo, BookingRow } from "@/lib/auth";

interface Stats {
  rooms: number;
  tours: number;
  bookings: number;
  pendingBookings: number;
}

const statCards = [
  { key: "bookings", label: "การจองทั้งหมด", icon: "fa-calendar-check", color: "bg-blue-50 text-[#2563eb]" },
  { key: "pendingBookings", label: "รอดำเนินการ", icon: "fa-clock", color: "bg-yellow-50 text-yellow-600" },
  { key: "rooms", label: "ที่พัก", icon: "fa-bed", color: "bg-green-50 text-green-600" },
  { key: "tours", label: "ทัวร์", icon: "fa-water-ladder", color: "bg-cyan-50 text-cyan-600" },
];

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "รอชำระเงิน",
  PENDING_CONFIRM: "รอยืนยัน",
  CONFIRMED: "ยืนยันแล้ว",
  CHECKED_IN: "เช็คอินแล้ว",
  COMPLETED: "เสร็จสิ้น",
  CANCELLED: "ยกเลิก",
  REFUNDED: "คืนเงิน",
  NO_SHOW: "ไม่มา",
};
const STATUS_STYLE: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
  PENDING_CONFIRM: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-green-100 text-green-700",
  CHECKED_IN: "bg-teal-100 text-teal-700",
  COMPLETED: "bg-slate-100 text-slate-600",
  CANCELLED: "bg-red-100 text-red-600",
  REFUNDED: "bg-orange-100 text-orange-600",
  NO_SHOW: "bg-gray-100 text-gray-500",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [operator, setOperator] = useState<OperatorInfo | null>(null);
  const [recent, setRecent] = useState<BookingRow[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("jjd_operator");
    const token = localStorage.getItem("jjd_token");
    if (!stored || !token) return;
    setOperator(JSON.parse(stored));
    fetchStats(token).then(setStats).catch(() => {});
    fetchBookings(token, { page: 1 })
      .then((d) => setRecent(d.bookings.slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoadingRecent(false));
  }, []);

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          สวัสดี, {operator?.name ?? "—"} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {operator?.businessName} · {operator?.role === "SUPER_ADMIN" ? "Super Admin" : "ผู้ประกอบการ"}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.key} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
              <i className={`fa-solid ${card.icon}`}></i>
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {stats ? stats[card.key as keyof Stats] : "—"}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <h2 className="font-bold text-slate-700 mb-4">การดำเนินการด่วน</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "จัดการที่พัก", icon: "fa-bed", href: "/rooms", color: "bg-blue-50 text-[#2563eb] hover:bg-blue-100" },
            { label: "จัดการทัวร์", icon: "fa-water-ladder", href: "/tours", color: "bg-cyan-50 text-cyan-600 hover:bg-cyan-100" },
            { label: "ดูการจอง", icon: "fa-list", href: "/bookings", color: "bg-slate-50 text-slate-600 hover:bg-slate-100" },
            { label: "ตั้งค่าบัญชี", icon: "fa-gear", href: "/settings", color: "bg-slate-50 text-slate-600 hover:bg-slate-100" },
          ].map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-medium transition ${a.color}`}
            >
              <i className={`fa-solid ${a.icon} text-lg`}></i>
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-700">การจองล่าสุด</h2>
          <Link href="/bookings" className="text-xs text-[#2563eb] hover:underline">
            ดูทั้งหมด <i className="fa-solid fa-arrow-right ml-1"></i>
          </Link>
        </div>

        {loadingRecent ? (
          <div className="py-10 text-center text-slate-400">
            <i className="fa-solid fa-circle-notch fa-spin text-xl"></i>
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <i className="fa-solid fa-calendar-xmark text-4xl mb-3 block"></i>
            <p className="text-sm">ยังไม่มีการจอง</p>
            <p className="text-xs mt-1">เพิ่มที่พักหรือทัวร์เพื่อเริ่มรับการจอง</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map((b) => {
              const itemName = b.room?.nameTh ?? b.tourSchedule?.tour.nameTh ?? "—";
              return (
                <Link
                  key={b.id}
                  href={`/bookings/${b.bookingNumber}`}
                  className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${b.type === "ACCOMMODATION" ? "bg-blue-50 text-[#2563eb]" : "bg-cyan-50 text-cyan-600"}`}>
                      <i className={`fa-solid ${b.type === "ACCOMMODATION" ? "fa-bed" : "fa-water-ladder"}`}></i>
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-800 text-sm truncate">{b.guestName}</div>
                      <div className="text-xs text-slate-500 truncate">
                        {b.bookingNumber} · {itemName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-bold text-[#2563eb] text-sm">฿{b.totalAmount.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(b.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                      </div>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[b.status] ?? "bg-slate-100 text-slate-500"}`}>
                      {STATUS_LABEL[b.status] ?? b.status}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
