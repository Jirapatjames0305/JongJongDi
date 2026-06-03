"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import { fetchBookings, BookingRow } from "@/lib/auth";

const STATUS_TABS = [
  { key: "", label: "ทั้งหมด" },
  { key: "PENDING_PAYMENT", label: "รอชำระ" },
  { key: "PENDING_CONFIRM", label: "รอยืนยัน" },
  { key: "CONFIRMED", label: "ยืนยันแล้ว" },
  { key: "CANCELLED", label: "ยกเลิก" },
];

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

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "รอชำระ",
  PENDING_CONFIRM: "รอยืนยัน",
  CONFIRMED: "ยืนยันแล้ว",
  CHECKED_IN: "เช็คอินแล้ว",
  COMPLETED: "เสร็จสิ้น",
  CANCELLED: "ยกเลิก",
  REFUNDED: "คืนเงิน",
  NO_SHOW: "ไม่มา",
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  async function load(s: string, p: number) {
    setLoading(true);
    try {
      const token = localStorage.getItem("jjd_token") ?? "";
      const data = await fetchBookings(token, { status: s || undefined, page: p });
      setBookings(data.bookings);
      setTotal(data.total);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(status, page); }, [status, page]);

  function changeTab(s: string) {
    setStatus(s);
    setPage(1);
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">การจอง</h1>
          <p className="text-slate-500 text-sm mt-1">ทั้งหมด {total} รายการ</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl border border-slate-100 shadow-sm w-fit flex-wrap">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => changeTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              status === t.key ? "bg-[#2563eb] text-white shadow" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <i className="fa-solid fa-circle-notch fa-spin text-2xl mb-2 block"></i>กำลังโหลด...
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <i className="fa-solid fa-calendar-xmark text-4xl mb-3 block"></i>
            <p className="text-sm">ไม่มีการจอง</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                <tr>
                  {["เลขจอง", "ผู้จอง", "ประเภท / รายการ", "สถานะ", "ยอด", "วันที่จอง", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => {
                  const itemName = b.type === "ACCOMMODATION"
                    ? b.room?.nameTh ?? "-"
                    : b.tourSchedule?.tour.nameTh ?? "-";
                  const payStatus = b.payments[0]?.status ?? "-";
                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">{b.bookingNumber}</td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">{b.guestName}</div>
                        <div className="text-xs text-slate-400">{b.guestPhone}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-slate-700">{itemName}</div>
                        <div className="text-xs text-slate-400">
                          {b.type === "ACCOMMODATION" ? (
                            <><i className="fa-solid fa-bed mr-1"></i>ที่พัก · {b.numGuests} คน</>
                          ) : (
                            <><i className="fa-solid fa-water-ladder mr-1"></i>ทัวร์ · {b.numGuests} คน</>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[b.status] ?? "bg-slate-100 text-slate-500"}`}>
                          {STATUS_LABEL[b.status] ?? b.status}
                        </span>
                        {payStatus === "PENDING" && b.status === "PENDING_PAYMENT" && (
                          <div className="text-xs text-yellow-600 mt-1">
                            <i className="fa-solid fa-clock mr-1"></i>รอสลิป
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700">
                        ฿{b.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">
                        {new Date(b.createdAt).toLocaleDateString("th-TH")}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/bookings/${b.bookingNumber}`}
                          className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition"
                        >
                          ดูรายละเอียด
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-50"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <span className="text-sm text-slate-600">หน้า {page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-50"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}
    </AdminShell>
  );
}
