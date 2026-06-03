"use client";

import Link from "next/link";
import { useLang, pick } from "@/lib/lang";
import { type Product, mainImageUrl } from "@/lib/api";

const fmt = (n: number) => n.toLocaleString("en-US");

export default function ProductCard({ product }: { product: Product }) {
  const [lang] = useLang();
  const name = pick(product.nameTh, product.nameEn, lang);
  const img = mainImageUrl(product.images);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-shadow duration-300 group block"
    >
      <div className="h-44 bg-gradient-to-br from-yellow-100 to-amber-200 relative overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="fa-solid fa-bag-shopping text-amber-500 text-5xl opacity-50"></i>
          </div>
        )}
        {product.badge && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wide">
            <i className="fa-solid fa-star text-yellow-300 mr-1"></i>{product.badge}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-sm text-slate-800 mb-1 line-clamp-2 leading-snug group-hover:text-[#2563eb] transition min-h-[2.5rem]">
          {name}
        </h3>

        {(product.location || product.deliveryNote) && (
          <div className="flex flex-wrap items-center gap-1.5 mb-2 text-[10px]">
            {product.location && (
              <span className="text-slate-500">
                <i className="fa-solid fa-location-dot text-red-400 mr-0.5"></i>{product.location}
              </span>
            )}
            {product.deliveryNote && (
              <span className="text-green-600 font-medium">
                <i className="fa-solid fa-truck-fast mr-0.5"></i>{product.deliveryNote}
              </span>
            )}
          </div>
        )}

        <div className="flex items-end justify-between border-t border-slate-100 pt-3">
          <div>
            {product.oldPrice && (
              <div className="text-slate-400 line-through text-xs leading-none">{fmt(product.oldPrice)}.-</div>
            )}
            <div className="text-[#f59e0b] font-bold text-lg leading-tight">
              {fmt(product.price)}
              <span className="text-xs text-slate-500 font-normal">.-{product.unitLabel}</span>
            </div>
          </div>
          <span className="px-3 py-1.5 bg-[#2563eb] text-white text-xs rounded-lg font-semibold group-hover:bg-blue-700 transition shrink-0">
            {pick("ดูสินค้า", "View", lang)}
          </span>
        </div>
      </div>
    </Link>
  );
}
