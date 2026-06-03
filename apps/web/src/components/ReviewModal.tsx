"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Props {
  bookingNumber: string;
  guestPhone: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function ReviewModal({ bookingNumber, guestPhone, onClose, onSubmitted }: Props) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setErr("");
    try {
      const res = await fetch(`${API}/api/reviews/${bookingNumber}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || undefined, phone: guestPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกรีวิวไม่สำเร็จ");
      onSubmitted();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">เขียนรีวิว</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">ให้คะแนน</label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                  className="text-4xl transition transform hover:scale-110"
                >
                  <i className={`fa-solid fa-star ${(hover || rating) >= n ? "text-amber-400" : "text-slate-200"}`}></i>
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-slate-500 mt-2">{["", "ไม่ประทับใจ", "พอใช้", "ดี", "ดีมาก", "ยอดเยี่ยม"][rating]}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">ความคิดเห็น (ไม่บังคับ)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="บอกเล่าประสบการณ์ของคุณ..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
            />
            <p className="text-xs text-slate-400 text-right mt-1">{comment.length}/500</p>
          </div>

          {err && <p className="text-red-500 text-sm"><i className="fa-solid fa-circle-exclamation mr-1"></i>{err}</p>}

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50">
              ยกเลิก
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-2.5 bg-[#2563eb] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
              {submitting ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>กำลังส่ง...</> : "ส่งรีวิว"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
