"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageGallery from "@/components/ImageGallery";
import { getProduct, mainImageUrl, type Product } from "@/lib/api";
import { useLang, pick } from "@/lib/lang";

const fmt = (n: number) => n.toLocaleString("en-US");

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang] = useLang();

  useEffect(() => {
    getProduct(slug).then((p) => {
      setProduct(p);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <><Navbar /><div className="min-h-screen pt-20 text-center text-slate-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl mt-20"></i></div></>;
  if (!product) { notFound(); }

  const name = pick(product.nameTh, product.nameEn, lang);
  const desc = pick(product.descriptionTh, product.descriptionEn, lang);
  const heroImg = mainImageUrl(product.images);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-20">
        <div className="h-56 md:h-96 bg-gradient-to-br from-yellow-100 to-amber-200 flex items-center justify-center relative overflow-hidden">
          {heroImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImg} alt={name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <i className="fa-solid fa-bag-shopping text-amber-600 text-8xl opacity-30"></i>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
          {product.badge && (
            <div className="absolute top-5 right-5 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow uppercase tracking-wide">
              <i className="fa-solid fa-star text-yellow-300 mr-1"></i> {product.badge}
            </div>
          )}
          <div className="absolute bottom-6 left-6 text-white">
            <Link href="/" className="text-white/70 text-sm hover:text-white transition">
              <i className="fa-solid fa-arrow-left mr-2"></i>{pick("กลับหน้าแรก", "Back home", lang)}
            </Link>
            <h1 className="text-2xl md:text-4xl font-bold mt-1">{name}</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {(product.location || product.deliveryNote) && (
                <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
                  {product.location && (
                    <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-600">
                      <i className="fa-solid fa-location-dot text-red-500 mr-1"></i>{product.location}
                    </span>
                  )}
                  {product.deliveryNote && (
                    <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-medium">
                      <i className="fa-solid fa-truck-fast mr-1"></i>{product.deliveryNote}
                    </span>
                  )}
                </div>
              )}

              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="font-bold text-slate-800 text-lg mb-3">{pick("รายละเอียดสินค้า", "Product details", lang)}</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{desc || pick("—", "—", lang)}</p>
              </div>

              {/* Image gallery */}
              {product.images.length > 1 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <h2 className="font-bold text-slate-800 text-lg mb-4">
                    <i className="fa-regular fa-image text-[#2563eb] mr-2"></i>
                    {pick("รูปภาพ", "Photos", lang)} ({product.images.length})
                  </h2>
                  <ImageGallery images={product.images} heading={name} />
                </div>
              )}
            </div>

            {/* Right: Price Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sticky top-24">
                {product.oldPrice && (
                  <div className="text-slate-400 line-through text-sm">{fmt(product.oldPrice)}.-</div>
                )}
                <div className="text-3xl font-bold text-[#f59e0b]">
                  {fmt(product.price)}
                  <span className="text-base text-slate-500 font-normal">.-{product.unitLabel}</span>
                </div>

                <div className="mt-5 bg-blue-50 text-blue-700 text-sm rounded-xl p-4 leading-relaxed">
                  <i className="fa-solid fa-circle-info mr-1"></i>
                  {pick("สนใจสั่งซื้อ ติดต่อผู้ขายผ่านช่องทางติดต่อของร้าน", "To order, please contact the seller via the shop's channels.", lang)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
