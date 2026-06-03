"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const MAX_IMAGES = 10;

interface ImageItem {
  id: string;
  url: string;
  isMain: boolean;
  order: number;
}

interface Props {
  resource: "rooms" | "tours" | "products";
  resourceId: string;
  resourceName: string;
  onClose: () => void;
}

export default function ImageManager({ resource, resourceId, resourceName, onClose }: Props) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    const token = localStorage.getItem("jjd_token") ?? "";
    const res = await fetch(`${API}/api/${resource}/${resourceId}/images`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setImages(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [resource, resourceId]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (selected.length === 0) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) { setErr(`อัพโหลดได้สูงสุด ${MAX_IMAGES} รูป`); return; }

    const toUpload = selected.slice(0, remaining);
    const skipped = selected.length - toUpload.length;
    setUploading(true); setErr("");
    try {
      const token = localStorage.getItem("jjd_token") ?? "";
      for (const file of toUpload) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch(`${API}/api/${resource}/${resourceId}/images`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "อัพโหลดล้มเหลว");
      }
      if (skipped > 0) setErr(`อัพโหลดได้สูงสุด ${MAX_IMAGES} รูป — ข้าม ${skipped} รูปที่เกิน`);
      load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "อัพโหลดล้มเหลว");
      load();
    } finally {
      setUploading(false);
    }
  }

  async function setMain(id: string) {
    const token = localStorage.getItem("jjd_token") ?? "";
    await fetch(`${API}/api/${resource}/images/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("ลบรูปนี้?")) return;
    const token = localStorage.getItem("jjd_token") ?? "";
    await fetch(`${API}/api/${resource}/images/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-bold text-slate-800">จัดการรูปภาพ</h2>
            <p className="text-xs text-slate-500 mt-0.5">{resourceName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="p-6">
          <label className="block mb-4">
            <span className="block text-xs font-medium text-slate-500 mb-2">
              เพิ่มรูปภาพ (เลือกได้หลายรูป · สูงสุด {MAX_IMAGES} รูป · 8MB/รูป) — มีแล้ว {images.length}/{MAX_IMAGES}
            </span>
            <input type="file" accept="image/*" multiple onChange={handleUpload}
              disabled={uploading || images.length >= MAX_IMAGES}
              className="w-full text-sm file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium disabled:opacity-50" />
            {images.length >= MAX_IMAGES && <p className="text-xs text-amber-600 mt-1"><i className="fa-solid fa-circle-info mr-1"></i>ครบ {MAX_IMAGES} รูปแล้ว — ลบรูปเดิมก่อนเพิ่มรูปใหม่</p>}
            {uploading && <p className="text-xs text-blue-600 mt-1"><i className="fa-solid fa-circle-notch fa-spin mr-1"></i>กำลังอัพโหลด...</p>}
            {err && <p className="text-xs text-red-500 mt-1"><i className="fa-solid fa-circle-exclamation mr-1"></i>{err}</p>}
          </label>

          {loading ? (
            <div className="py-12 text-center text-slate-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>
          ) : images.length === 0 ? (
            <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
              <i className="fa-regular fa-image text-3xl mb-2 block"></i>
              <p className="text-sm">ยังไม่มีรูปภาพ</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative group rounded-xl overflow-hidden bg-slate-100 aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  {img.isMain && (
                    <span className="absolute top-2 left-2 bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                      <i className="fa-solid fa-star mr-1"></i>หลัก
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                    {!img.isMain && (
                      <button onClick={() => setMain(img.id)}
                        className="px-3 py-1.5 bg-white text-slate-700 rounded-lg text-xs font-semibold hover:bg-amber-50">
                        <i className="fa-solid fa-star mr-1"></i>ตั้งเป็นหลัก
                      </button>
                    )}
                    <button onClick={() => remove(img.id)}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600">
                      <i className="fa-solid fa-trash mr-1"></i>ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
