"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { userLogin, saveUserSession } from "@/lib/user-auth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, user } = await userLogin(form.phone, form.password);
      saveUserSession(token, user);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-[#2563eb]">
            <i className="fa-solid fa-calendar-check text-[#f59e0b]"></i>
            JongJongDi
          </Link>
          <p className="text-slate-500 text-sm mt-2">เข้าสู่ระบบเพื่อดูการจองของคุณ</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="0812345678"
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#2563eb] transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">รหัสผ่าน</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#2563eb] transition"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation"></i>{error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2563eb] text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60 shadow-lg shadow-blue-500/20"
            >
              {loading ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>กำลังเข้าสู่ระบบ...</> : "เข้าสู่ระบบ"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-500">
            ยังไม่มีบัญชี?{" "}
            <Link href="/register" className="text-[#2563eb] font-semibold hover:underline">
              สมัครสมาชิก
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 transition">
            <i className="fa-solid fa-arrow-left mr-1"></i>กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}
