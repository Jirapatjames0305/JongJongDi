"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import ImageManager from "@/components/ImageManager";
import RoomFormModal, { type RoomFormData } from "@/components/RoomFormModal";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface RoomType {
  id: string;
  nameTh: string;
  nameEn: string;
  pricePerNight: number;
  maxGuests: number;
  quantity: number;
  order: number;
}

interface Room {
  id: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  isActive: boolean;
  images: { url: string; isMain: boolean }[];
  types: RoomType[];
  _count: { bookings: number };
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [formInitial, setFormInitial] = useState<Partial<RoomFormData> | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [imageManager, setImageManager] = useState<{ id: string; name: string } | null>(null);

  async function load() {
    const token = localStorage.getItem("jjd_token") ?? "";
    const res = await fetch(`${API}/api/rooms/admin/list`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setRooms(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setFormInitial(null);
    setFormOpen(true);
  }

  function openEdit(room: Room) {
    setFormInitial({
      id: room.id,
      slug: room.slug,
      nameTh: room.nameTh,
      nameEn: room.nameEn,
      descriptionTh: room.descriptionTh,
      descriptionEn: room.descriptionEn,
      types: room.types.map((t) => ({
        id: t.id,
        nameTh: t.nameTh,
        nameEn: t.nameEn,
        pricePerNight: String(t.pricePerNight),
        maxGuests: String(t.maxGuests),
        quantity: String(t.quantity),
      })),
    });
    setFormOpen(true);
  }

  async function toggleActive(id: string, current: boolean) {
    const token = localStorage.getItem("jjd_token") ?? "";
    await fetch(`${API}/api/rooms/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !current }),
    });
    load();
  }

  const totalRooms = rooms.reduce((sum, r) => sum + r.types.reduce((s, t) => s + t.quantity, 0), 0);
  const activeCount = rooms.filter((r) => r.isActive).length;

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ที่พัก</h1>
          <p className="text-slate-500 text-sm mt-1">
            {rooms.length} ที่พัก · {totalRooms} ห้องรวม · เปิดรับจอง {activeCount}
          </p>
        </div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-[#2563eb] text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">
          <i className="fa-solid fa-plus mr-2"></i>เพิ่มที่พัก
        </button>
      </div>

      {rooms.length > 0 && rooms.every((r) => r.images.length === 0) && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          <i className="fa-solid fa-circle-info mr-2"></i>
          ยังไม่มีรูปภาพเลย — กดปุ่ม <span className="font-semibold">"รูปภาพ"</span> ที่แถวที่พักเพื่อเพิ่ม
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>
        ) : rooms.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <i className="fa-solid fa-bed text-4xl mb-3 block"></i>
            <p className="text-sm mb-2">ยังไม่มีที่พัก</p>
            <p className="text-xs mb-4">เริ่มสร้างที่พักแรก พร้อมประเภทห้องและจำนวน</p>
            <button onClick={openAdd} className="px-4 py-2 bg-[#2563eb] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
              เพิ่มที่พักแรก
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rooms.map((r) => {
              const mainImg = r.images.find((i) => i.isMain)?.url ?? r.images[0]?.url;
              const minPrice = r.types.length ? Math.min(...r.types.map((t) => t.pricePerNight)) : 0;
              const maxPrice = r.types.length ? Math.max(...r.types.map((t) => t.pricePerNight)) : 0;
              const totalQty = r.types.reduce((s, t) => s + t.quantity, 0);
              return (
                <div key={r.id} className="p-4 hover:bg-slate-50 transition flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-32 h-32 md:h-24 rounded-xl bg-slate-100 flex-shrink-0 relative overflow-hidden">
                    {mainImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mainImg} alt={r.nameTh} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <i className="fa-solid fa-bed text-2xl"></i>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-800 truncate">{r.nameTh}</h3>
                        <p className="text-xs text-slate-400 truncate">{r.nameEn} · /{r.slug}</p>
                      </div>
                      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${r.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {r.isActive ? "เปิด" : "ปิด"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-2">
                      <span><i className="fa-solid fa-coins text-[#f59e0b] mr-1"></i>
                        <b className="text-[#2563eb]">฿{minPrice.toLocaleString()}{minPrice !== maxPrice && `–${maxPrice.toLocaleString()}`}</b>/คืน
                      </span>
                      <span><i className="fa-solid fa-layer-group mr-1"></i>{r.types.length} ประเภท · {totalQty} ห้องรวม</span>
                      <span><i className="fa-solid fa-image mr-1"></i>{r.images.length} รูป</span>
                      <span><i className="fa-solid fa-calendar-check mr-1"></i>{r._count.bookings} จอง</span>
                    </div>

                    {/* Types badges */}
                    {r.types.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {r.types.map((t) => (
                          <span key={t.id} className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                            {t.nameTh} ({t.maxGuests} คน · {t.quantity} ห้อง · ฿{t.pricePerNight.toLocaleString()})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 md:flex-col md:w-32">
                    <button onClick={() => openEdit(r)} className="flex-1 md:flex-none px-3 py-1.5 bg-[#2563eb] text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition">
                      <i className="fa-solid fa-pen mr-1"></i>แก้ไข
                    </button>
                    <button onClick={() => setImageManager({ id: r.id, name: r.nameTh })} className="flex-1 md:flex-none px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition">
                      <i className="fa-regular fa-image mr-1"></i>รูปภาพ
                    </button>
                    <button onClick={() => toggleActive(r.id, r.isActive)} className="flex-1 md:flex-none px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition">
                      {r.isActive ? "ปิดรับจอง" : "เปิดรับจอง"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {imageManager && (
        <ImageManager
          resource="rooms"
          resourceId={imageManager.id}
          resourceName={imageManager.name}
          onClose={() => { setImageManager(null); load(); }}
        />
      )}

      {formOpen && (
        <RoomFormModal
          initial={formInitial}
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); load(); }}
        />
      )}
    </AdminShell>
  );
}
