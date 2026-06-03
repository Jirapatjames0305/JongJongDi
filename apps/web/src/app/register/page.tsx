"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { userRegister, saveUserSession } from "@/lib/user-auth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("รหัสผ่านไม่ตรงกัน"); return; }
    if (form.password.length < 6) { setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); return; }

    setLoading(true);
    try {
      const { token, user } = await userRegister({
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        password: form.password,
      });
      saveUserSession(token, user);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { key: "name", label: "ชื่อ-นามสกุล", type: "text", placeholder: "สมชาย ใจดี" },
    { key: "phone", label: "เบอร์โทรศัพท์", type: "tel", placeholder: "0812345678" },
    { key: "email", label: "อีเมล (ไม่บังคับ)", type: "email", placeholder: "example@email.com" },
    { key: "password", label: "รหัสผ่าน (อย่างน้อย 6 ตัว)", type: "password", placeholder: "••••••••" },
    { key: "confirmPassword", label: "ยืนยันรหัสผ่าน", type: "password", placeholder: "••••••••" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-[#2563eb]">
            <i className="fa-solid fa-calendar-check text-[#f59e0b]"></i>
            JongJongDi
          </Link>
          <p className="text-slate-500 text-sm mt-2">สมัครสมาชิกเพื่อติดตามการจองได้ง่ายขึ้น</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  required={f.key !== "email"}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#2563eb] transition"
                />
              </div>
            ))}

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
              {loading ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>กำลังสมัคร...</> : "สมัครสมาชิก"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-500">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/login" className="text-[#2563eb] font-semibold hover:underline">
              เข้าสู่ระบบ
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
