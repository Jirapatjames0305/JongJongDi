"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface GalleryImage {
  url: string;
}

export default function ImageGallery({
  images,
  heading,
}: {
  images: GalleryImage[];
  heading?: string;
}) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const count = images.length;
  const prev = useCallback(() => setIdx((i) => (i - 1 + count) % count), [count]);
  const next = useCallback(() => setIdx((i) => (i + 1) % count), [count]);

  // Keyboard nav + lock body scroll while the lightbox is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, prev, next]);

  if (count === 0) return null;

  function openAt(i: number) {
    setIdx(i);
    setOpen(true);
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
    touchStartX.current = null;
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => openAt(i)}
            className="block aspect-square rounded-xl overflow-hidden bg-slate-100 hover:opacity-90 transition group relative"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={heading ? `${heading} ${i + 1}` : ""} className="w-full h-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition">
              <i className="fa-solid fa-magnifying-glass-plus text-white opacity-0 group-hover:opacity-100 text-lg transition"></i>
            </span>
          </button>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center select-none"
          onClick={() => setOpen(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>

          <span className="absolute top-5 left-5 text-white/80 text-sm font-medium">
            {idx + 1} / {count}
          </span>

          {count > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 md:left-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              aria-label="Previous"
            >
              <i className="fa-solid fa-chevron-left text-lg"></i>
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[idx].url}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-w-[92vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
          />

          {count > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 md:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              aria-label="Next"
            >
              <i className="fa-solid fa-chevron-right text-lg"></i>
            </button>
          )}
        </div>
      )}
    </>
  );
}
