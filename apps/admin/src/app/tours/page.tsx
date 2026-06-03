"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import ImageManager from "@/components/ImageManager";
import TourFormModal, { type TourFormData } from "@/components/TourFormModal";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Schedule {
  id: string;
  departureDate: string;
  departureTime: string;
  availableSeats: number;
}

interface Tour {
  id: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  pricePerPerson: number;
  maxSeats: number;
  durationHours: number;
  isActive: boolean;
  images: { url: string; isMain: boolean }[];
  _count: { schedules: number };
}

const emptySchedule = { departureDate: "", departureTime: "08:00", availableSeats: "" };

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [formInitial, setFormInitial] = useState<Partial<TourFormData> | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [imageManager, setImageManager] = useState<{ id: string; name: string } | null>(null);

  // Schedule management
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [scheduleForm, setScheduleForm] = useState(emptySchedule);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleErr, setScheduleErr] = useState("");

  const token = () => localStorage.getItem("jjd_token") ?? "";

  async function loadTours() {
    const res = await fetch(`${API}/api/tours/admin/list`, { headers: { Authorization: `Bearer ${token()}` } });
    if (res.ok) setTours(await res.json());
    setLoading(false);
  }

  async function loadSchedules(tourId: string) {
    setScheduleLoading(true);
    const res = await fetch(`${API}/api/tours/${tourId}/schedules`, { headers: { Authorization: `Bearer ${token()}` } });
    if (res.ok) setSchedules(await res.json());
    setScheduleLoading(false);
  }

  useEffect(() => { loadTours(); }, []);

  function openAdd() { setFormInitial(null); setFormOpen(true); }

  function openEdit(tour: Tour) {
    setFormInitial({
      id: tour.id,
      slug: tour.slug,
      nameTh: tour.nameTh,
      nameEn: tour.nameEn,
      descriptionTh: tour.descriptionTh,
      descriptionEn: tour.descriptionEn,
      pricePerPerson: String(tour.pricePerPerson),
      maxSeats: String(tour.maxSeats),
      durationHours: String(tour.durationHours),
    });
    setFormOpen(true);
  }

  function openSchedules(tour: Tour) { setSelectedTour(tour); loadSchedules(tour.id); }

  async function handleAddSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTour) return;
    setScheduleSaving(true); setScheduleErr("");
    try {
      const res = await fetch(`${API}/api/tours/${selectedTour.id}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ ...scheduleForm, availableSeats: Number(scheduleForm.availableSeats) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "เกิดข้อผิดพลาด");
      setScheduleForm(emptySchedule);
      loadSchedules(selectedTour.id);
      loadTours();
    } catch (e: unknown) {
      setScheduleErr(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setScheduleSaving(false);
    }
  }

  async function handleDeleteSchedule(scheduleId: string) {
    await fetch(`${API}/api/tours/schedules/${scheduleId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
    if (selectedTour) loadSchedules(selectedTour.id);
    loadTours();
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`${API}/api/tours/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ isActive: !current }),
    });
    loadTours();
  }

  const activeCount = tours.filter((t) => t.isActive).length;

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ทัวร์</h1>
          <p className="text-slate-500 text-sm mt-1">{tours.length} ทัวร์ · เปิดรับจอง {activeCount}</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-[#2563eb] text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">
          <i className="fa-solid fa-plus mr-2"></i>เพิ่มทัวร์
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>
        ) : tours.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <i className="fa-solid fa-water-ladder text-4xl mb-3 block"></i>
            <p className="text-sm mb-2">ยังไม่มีทัวร์</p>
            <button onClick={openAdd} className="mt-2 px-4 py-2 bg-[#2563eb] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">เพิ่มทัวร์แรก</button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tours.map((t) => {
              const mainImg = t.images.find((i) => i.isMain)?.url ?? t.images[0]?.url;
              return (
                <div key={t.id} className="p-4 hover:bg-slate-50 transition flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-32 h-32 md:h-24 rounded-xl bg-slate-100 flex-shrink-0 relative overflow-hidden">
                    {mainImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mainImg} alt={t.nameTh} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <i className="fa-solid fa-water-ladder text-2xl"></i>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-800 truncate">{t.nameTh}</h3>
                        <p className="text-xs text-slate-400 truncate">{t.nameEn} · /{t.slug}</p>
                      </div>
                      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${t.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {t.isActive ? "เปิด" : "ปิด"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-2">
                      <span><i className="fa-solid fa-coins text-[#f59e0b] mr-1"></i><b className="text-[#2563eb]">฿{t.pricePerPerson.toLocaleString()}</b>/คน</span>
                      <span><i className="fa-solid fa-users mr-1"></i>{t.maxSeats} คน/รอบ</span>
                      <span><i className="fa-solid fa-clock mr-1"></i>{t.durationHours} ชม.</span>
                      <span><i className="fa-solid fa-image mr-1"></i>{t.images.length} รูป</span>
                      <button onClick={() => openSchedules(t)} className="bg-cyan-50 text-cyan-700 hover:bg-cyan-100 px-2 py-0.5 rounded-full transition">
                        <i className="fa-solid fa-calendar-days mr-1"></i>{t._count.schedules} รอบ
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 md:flex-col md:w-32">
                    <button onClick={() => openEdit(t)} className="flex-1 md:flex-none px-3 py-1.5 bg-[#2563eb] text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition">
                      <i className="fa-solid fa-pen mr-1"></i>แก้ไข
                    </button>
                    <button onClick={() => setImageManager({ id: t.id, name: t.nameTh })} className="flex-1 md:flex-none px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition">
                      <i className="fa-regular fa-image mr-1"></i>รูปภาพ
                    </button>
                    <button onClick={() => toggleActive(t.id, t.isActive)} className="flex-1 md:flex-none px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition">
                      {t.isActive ? "ปิดรับจอง" : "เปิดรับจอง"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {formOpen && (
        <TourFormModal
          initial={formInitial}
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); loadTours(); }}
        />
      )}

      {imageManager && (
        <ImageManager
          resource="tours"
          resourceId={imageManager.id}
          resourceName={imageManager.name}
          onClose={() => { setImageManager(null); loadTours(); }}
        />
      )}

      {/* Schedule Management Modal */}
      {selectedTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-slate-800">รอบออกเดินทาง</h2>
                <p className="text-xs text-slate-400 mt-0.5">{selectedTour.nameTh}</p>
              </div>
              <button onClick={() => { setSelectedTour(null); setSchedules([]); setScheduleErr(""); }} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <form onSubmit={handleAddSchedule} className="bg-slate-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">เพิ่มรอบใหม่</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3 sm:col-span-1">
                    <label className="block text-xs text-slate-500 mb-1">วันที่</label>
                    <input type="date" value={scheduleForm.departureDate} onChange={(e) => setScheduleForm((p) => ({ ...p, departureDate: e.target.value }))} required
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">เวลา</label>
                    <input type="time" value={scheduleForm.departureTime} onChange={(e) => setScheduleForm((p) => ({ ...p, departureTime: e.target.value }))} required
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">ที่นั่ง</label>
                    <input type="number" value={scheduleForm.availableSeats} onChange={(e) => setScheduleForm((p) => ({ ...p, availableSeats: e.target.value }))} placeholder={String(selectedTour.maxSeats)} required min="1"
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                  </div>
                </div>
                {scheduleErr && <p className="text-red-500 text-xs">{scheduleErr}</p>}
                <button type="submit" disabled={scheduleSaving} className="w-full py-2 bg-[#2563eb] text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                  {scheduleSaving ? <><i className="fa-solid fa-circle-notch fa-spin mr-1"></i>กำลังเพิ่ม...</> : <><i className="fa-solid fa-plus mr-1"></i>เพิ่มรอบ</>}
                </button>
              </form>

              {scheduleLoading ? (
                <div className="py-8 text-center text-slate-400"><i className="fa-solid fa-circle-notch fa-spin"></i></div>
              ) : schedules.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-4">ยังไม่มีรอบออกเดินทาง</p>
              ) : (
                <div className="space-y-2">
                  {schedules.map((s) => (
                    <div key={s.id} className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-4 py-3">
                      <div>
                        <div className="font-semibold text-slate-800 text-sm">
                          {new Date(s.departureDate).toLocaleDateString("th-TH", { dateStyle: "medium" })}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          <i className="fa-solid fa-clock mr-1"></i>{s.departureTime}
                          <span className="mx-2">·</span>
                          <i className="fa-solid fa-users mr-1"></i>{s.availableSeats} ที่นั่ง
                        </div>
                      </div>
                      <button onClick={() => handleDeleteSchedule(s.id)} className="p-2 text-slate-300 hover:text-red-500 transition">
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
