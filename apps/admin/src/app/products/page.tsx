"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import ImageManager from "@/components/ImageManager";
import ProductFormModal, { type ProductFormData } from "@/components/ProductFormModal";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Product {
  id: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  price: number;
  oldPrice: number | null;
  unitLabel: string | null;
  location: string | null;
  deliveryNote: string | null;
  badge: string | null;
  isActive: boolean;
  images: { url: string; isMain: boolean }[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [formInitial, setFormInitial] = useState<Partial<ProductFormData> | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [imageManager, setImageManager] = useState<{ id: string; name: string } | null>(null);

  async function load() {
    const token = localStorage.getItem("jjd_token") ?? "";
    const res = await fetch(`${API}/api/products/admin/list`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setProducts(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() { setFormInitial(null); setFormOpen(true); }

  function openEdit(p: Product) {
    setFormInitial({
      id: p.id, slug: p.slug, nameTh: p.nameTh, nameEn: p.nameEn,
      descriptionTh: p.descriptionTh, descriptionEn: p.descriptionEn,
      price: String(p.price),
      oldPrice: p.oldPrice != null ? String(p.oldPrice) : "",
      unitLabel: p.unitLabel ?? "", location: p.location ?? "",
      deliveryNote: p.deliveryNote ?? "", badge: p.badge ?? "",
    });
    setFormOpen(true);
  }

  async function toggleActive(id: string, current: boolean) {
    const token = localStorage.getItem("jjd_token") ?? "";
    await fetch(`${API}/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !current }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("ลบสินค้านี้? (รายการฮิตติดกระแสที่อ้างถึงจะถูกลบด้วย)")) return;
    const token = localStorage.getItem("jjd_token") ?? "";
    await fetch(`${API}/api/products/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    load();
  }

  const activeCount = products.filter((p) => p.isActive).length;

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">สินค้า</h1>
          <p className="text-slate-500 text-sm mt-1">{products.length} สินค้า · ขายอยู่ {activeCount}</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-[#2563eb] text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">
          <i className="fa-solid fa-plus mr-2"></i>เพิ่มสินค้า
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <i className="fa-solid fa-bag-shopping text-4xl mb-3 block"></i>
            <p className="text-sm mb-2">ยังไม่มีสินค้า</p>
            <button onClick={openAdd} className="px-4 py-2 bg-[#2563eb] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">เพิ่มสินค้าแรก</button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {products.map((p) => {
              const mainImg = p.images.find((i) => i.isMain)?.url ?? p.images[0]?.url;
              return (
                <div key={p.id} className="p-4 hover:bg-slate-50 transition flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-32 h-32 md:h-24 rounded-xl bg-slate-100 flex-shrink-0 relative overflow-hidden">
                    {mainImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mainImg} alt={p.nameTh} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300"><i className="fa-solid fa-bag-shopping text-2xl"></i></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-800 truncate">{p.nameTh}</h3>
                        <p className="text-xs text-slate-400 truncate">{p.nameEn} · /{p.slug}</p>
                      </div>
                      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${p.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {p.isActive ? "ขายอยู่" : "ปิด"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-2">
                      <span><i className="fa-solid fa-coins text-[#f59e0b] mr-1"></i>
                        {p.oldPrice != null && <span className="line-through text-slate-400 mr-1">฿{p.oldPrice.toLocaleString()}</span>}
                        <b className="text-[#2563eb]">฿{p.price.toLocaleString()}</b>{p.unitLabel}
                      </span>
                      {p.location && <span><i className="fa-solid fa-location-dot mr-1"></i>{p.location}</span>}
                      {p.badge && <span><i className="fa-solid fa-tag mr-1"></i>{p.badge}</span>}
                      <span><i className="fa-solid fa-image mr-1"></i>{p.images.length} รูป</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 md:flex-col md:w-32">
                    <button onClick={() => openEdit(p)} className="flex-1 md:flex-none px-3 py-1.5 bg-[#2563eb] text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition">
                      <i className="fa-solid fa-pen mr-1"></i>แก้ไข
                    </button>
                    <button onClick={() => setImageManager({ id: p.id, name: p.nameTh })} className="flex-1 md:flex-none px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition">
                      <i className="fa-regular fa-image mr-1"></i>รูปภาพ
                    </button>
                    <button onClick={() => toggleActive(p.id, p.isActive)} className="flex-1 md:flex-none px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition">
                      {p.isActive ? "ปิดขาย" : "เปิดขาย"}
                    </button>
                    <button onClick={() => remove(p.id)} className="flex-1 md:flex-none px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition">
                      <i className="fa-solid fa-trash mr-1"></i>ลบ
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {imageManager && (
        <ImageManager resource="products" resourceId={imageManager.id} resourceName={imageManager.name}
          onClose={() => { setImageManager(null); load(); }} />
      )}

      {formOpen && (
        <ProductFormModal initial={formInitial} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); load(); }} />
      )}
    </AdminShell>
  );
}
