"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Season {
  id: string;
  name: string;
  roomId: string | null;
  tourId: string | null;
  startDate: string;
  endDate: string;
  multiplier: number;
  absolutePrice: number | null;
  room: { nameTh: string } | null;
  tour: { nameTh: string } | null;
}

interface Item { id: string; nameTh: string }

const emptyForm = {
  name: "",
  targetType: "ROOM" as "ROOM" | "TOUR",
  targetId: "",
  startDate: "",
  endDate: "",
  multiplier: "1.5",
  absolutePrice: "",
};

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [rooms, setRooms] = useState<Item[]>([]);
  const [tours, setTours] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const token = () => localStorage.getItem("jjd_token") ?? "";

  async function load() {
    const [s, r, t] = await Promise.all([
      fetch(`${API}/api/seasons`, { headers: { Authorization: `Bearer ${token()}` } }).then((res) => res.ok ? res.json() : []),
      fetch(`${API}/api/rooms/admin/list`, { headers: { Authorization: `Bearer ${token()}` } }).then((res) => res.ok ? res.json() : []),
      fetch(`${API}/api/tours/admin/list`, { headers: { Authorization: `Bearer ${token()}` } }).then((res) => res.ok ? res.json() : []),
    ]);
    setSeasons(s);
    setRooms(r);
    setTours(t);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        startDate: form.startDate,
        endDate: form.endDate,
        multiplier: Number(form.multiplier),
      };
      if (form.absolutePrice) body.absolutePrice = Number(form.absolutePrice);
      if (form.targetType === "ROOM") body.roomId = form.targetId;
      else body.tourId = form.targetId;

      const res = await fetch(`${API}/api/seasons`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "เกิดข้อผิดพลาด");
      setForm(emptyForm);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("ลบราคาช่วงนี้?")) return;
    await fetch(`${API}/api/seasons/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
    load();
  }

  const targetOptions = form.targetType === "ROOM" ? rooms : tours;

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">ราคา High Season</h1>
        <p className="text-slate-500 text-sm mt-1">ตั้งราคาพิเศษช่วงเทศกาล (ปีใหม่, สงกรานต์, ฯลฯ)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 sticky top-6">
            <h2 className="font-bold text-slate-700">เพิ่มราคาช่วงเทศกาล</h2>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ชื่อช่วง</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="เช่น ปีใหม่ 2026"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>

            <div className="flex gap-2">
              {(["ROOM", "TOUR"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setForm({ ...form, targetType: t, targetId: "" })}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${form.targetType === t ? "bg-[#2563eb] text-white" : "bg-slate-100 text-slate-500"}`}>
                  {t === "ROOM" ? "ที่พัก" : "ทัวร์"}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">เลือก {form.targetType === "ROOM" ? "ห้อง" : "ทัวร์"}</label>
              <select value={form.targetId} onChange={(e) => setForm({ ...form, targetId: e.target.value })} required
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                <option value="">-- เลือก --</option>
                {targetOptions.map((o) => <option key={o.id} value={o.id}>{o.nameTh}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">เริ่ม</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">สิ้นสุด</label>
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ตัวคูณ (multiplier)</label>
              <input type="number" step="0.1" min="0.1" value={form.multiplier} onChange={(e) => setForm({ ...form, multiplier: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              <p className="text-xs text-slate-400 mt-1">เช่น 1.5 = ราคาปกติ × 1.5</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">หรือกำหนดราคาตายตัว (บาท)</label>
              <input type="number" value={form.absolutePrice} onChange={(e) => setForm({ ...form, absolutePrice: e.target.value })} placeholder="เว้นว่างเพื่อใช้ตัวคูณ"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              <p className="text-xs text-slate-400 mt-1">ถ้ามีค่า จะใช้แทนตัวคูณ</p>
            </div>

            {error && <p className="text-red-500 text-xs"><i className="fa-solid fa-circle-exclamation mr-1"></i>{error}</p>}
            <button type="submit" disabled={saving} className="w-full py-2.5 bg-[#2563eb] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
              {saving ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>กำลังบันทึก...</> : "เพิ่ม"}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-700">ราคาช่วงเทศกาลทั้งหมด <span className="text-slate-400 font-normal text-sm">({seasons.length})</span></h2>
          </div>
          {loading ? (
            <div className="py-16 text-center text-slate-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>
          ) : seasons.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <i className="fa-solid fa-tag text-3xl mb-2 block"></i>
              <p className="text-sm">ยังไม่มีราคาช่วงเทศกาล</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                <tr>
                  {["ช่วง", "เป้าหมาย", "วันที่", "ราคา", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {seasons.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4 font-semibold text-slate-800">{s.name}</td>
                    <td className="px-5 py-4 text-slate-600">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full mr-2 ${s.roomId ? "bg-blue-100 text-blue-700" : "bg-cyan-100 text-cyan-700"}`}>
                        {s.roomId ? "ที่พัก" : "ทัวร์"}
                      </span>
                      {s.room?.nameTh ?? s.tour?.nameTh}
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-xs">
                      {new Date(s.startDate).toLocaleDateString("th-TH", { dateStyle: "medium" })}
                      <br />
                      {new Date(s.endDate).toLocaleDateString("th-TH", { dateStyle: "medium" })}
                    </td>
                    <td className="px-5 py-4">
                      {s.absolutePrice != null
                        ? <span className="font-bold text-[#2563eb]">฿{s.absolutePrice.toLocaleString()}</span>
                        : <span className="font-bold text-amber-600">× {s.multiplier}</span>}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => handleDelete(s.id)} className="p-2 text-slate-300 hover:text-red-500 transition">
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
