"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginApi } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, operator } = await loginApi(email, password);
      localStorage.setItem("jjd_token", token);
      localStorage.setItem("jjd_operator", JSON.stringify(operator));
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="bg-[#2563eb] w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <i className="fa-solid fa-calendar-check text-white text-xl"></i>
            </div>
            <span className="text-2xl font-bold text-slate-800">JongJongDi</span>
          </div>
          <p className="text-slate-500 text-sm">ระบบจัดการผู้ประกอบการ</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 p-8">
          <h1 className="text-xl font-bold text-slate-800 mb-6">เข้าสู่ระบบ</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#2563eb] transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#2563eb] transition"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation"></i>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2563eb] text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 disabled:opacity-60 mt-2"
            >
              {loading ? (
                <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>กำลังเข้าสู่ระบบ...</>
              ) : "เข้าสู่ระบบ"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm text-slate-500">
            ยังไม่มีบัญชี?{" "}
            <Link href="/register" className="text-[#2563eb] font-semibold hover:underline">
              สมัครเป็นผู้ประกอบการ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
