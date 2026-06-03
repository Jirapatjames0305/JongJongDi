"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { fetchBlocks, createBlock, deleteBlock } from "@/lib/auth";

interface Block {
  id: string;
  targetType: "ROOM" | "TOUR";
  startDate: string;
  endDate: string;
  reason: string | null;
  room: { nameTh: string } | null;
  tour: { nameTh: string } | null;
}

interface Room { id: string; nameTh: string }
interface Tour { id: string; nameTh: string }

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function AvailabilityPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    targetType: "ROOM" as "ROOM" | "TOUR",
    roomId: "",
    tourId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  async function load() {
    const token = localStorage.getItem("jjd_token") ?? "";
    try {
      const [blocksData, roomsRes, toursRes] = await Promise.all([
        fetchBlocks(token),
        fetch(`${API}/api/rooms/admin/list`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/tours/admin/list`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setBlocks(blocksData);
      if (roomsRes.ok) setRooms(await roomsRes.json());
      if (toursRes.ok) setTours(await toursRes.json());
    } catch {
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.startDate || !form.endDate) { setError("กรุณาระบุวันที่"); return; }
    if (form.targetType === "ROOM" && !form.roomId) { setError("กรุณาเลือกห้องพัก"); return; }
    if (form.targetType === "TOUR" && !form.tourId) { setError("กรุณาเลือกทัวร์"); return; }

    setSaving(true);
    try {
      const token = localStorage.getItem("jjd_token") ?? "";
      await createBlock(token, {
        targetType: form.targetType,
        roomId: form.targetType === "ROOM" ? form.roomId : undefined,
        tourId: form.targetType === "TOUR" ? form.tourId : undefined,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason || undefined,
      });
      setForm({ targetType: "ROOM", roomId: "", tourId: "", startDate: "", endDate: "", reason: "" });
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const token = localStorage.getItem("jjd_token") ?? "";
    await deleteBlock(token, id);
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">จัดการวันว่าง / ปิดให้บริการ</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-ban text-[#2563eb]"></i>เพิ่ม Block วัน
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ประเภท</label>
              <div className="flex gap-2">
                {(["ROOM", "TOUR"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, targetType: t, roomId: "", tourId: "" }))}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition border ${
                      form.targetType === t
                        ? "bg-[#2563eb] text-white border-[#2563eb]"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {t === "ROOM" ? "ที่พัก" : "ทัวร์"}
                  </button>
                ))}
              </div>
            </div>

            {form.targetType === "ROOM" ? (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">ห้องพัก</label>
                <select
                  value={form.roomId}
                  onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="">เลือกห้องพัก...</option>
                  {rooms.map((r) => <option key={r.id} value={r.id}>{r.nameTh}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">ทัวร์</label>
                <select
                  value={form.tourId}
                  onChange={(e) => setForm((f) => ({ ...f, tourId: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="">เลือกทัวร์...</option>
                  {tours.map((t) => <option key={t.id} value={t.id}>{t.nameTh}</option>)}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">วันเริ่ม</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">วันสิ้นสุด</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">เหตุผล (ไม่บังคับ)</label>
              <input
                type="text"
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                placeholder="เช่น วันหยุดสงกรานต์"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs"><i className="fa-solid fa-circle-exclamation mr-1"></i>{error}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-[#2563eb] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>กำลังบันทึก...</> : "บันทึก Block"}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-700">วันที่ Block ทั้งหมด</h2>
            </div>
            {loading ? (
              <div className="py-12 text-center text-slate-400">
                <i className="fa-solid fa-circle-notch fa-spin text-xl"></i>
              </div>
            ) : blocks.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <i className="fa-solid fa-calendar-check text-3xl mb-2 block"></i>
                <p className="text-sm">ยังไม่มีวันที่ block</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {blocks.map((b) => (
                  <div key={b.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                        b.targetType === "ROOM" ? "bg-blue-500" : "bg-teal-500"
                      }`}>
                        <i className={`fa-solid ${b.targetType === "ROOM" ? "fa-bed" : "fa-water-ladder"}`}></i>
                      </span>
                      <div>
                        <div className="font-semibold text-slate-800 text-sm">
                          {b.targetType === "ROOM" ? b.room?.nameTh : b.tour?.nameTh}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {new Date(b.startDate).toLocaleDateString("th-TH")} — {new Date(b.endDate).toLocaleDateString("th-TH")}
                          {b.reason && <span className="ml-2 text-slate-500">· {b.reason}</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition"
                      title="ลบ"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
