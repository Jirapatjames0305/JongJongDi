"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerApi } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    setLoading(true);
    try {
      const { token, operator } = await registerApi({
        email: form.email,
        password: form.password,
        name: form.name,
        businessName: form.businessName,
        phone: form.phone,
      });
      // Auto-login: store session and go straight into the panel
      localStorage.setItem("jjd_token", token);
      localStorage.setItem("jjd_operator", JSON.stringify(operator));
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setLoading(false);
    }
  }

  const fields = [
    { key: "name", label: "ชื่อผู้ติดต่อ", placeholder: "ชื่อ-นามสกุล", type: "text" },
    { key: "businessName", label: "ชื่อธุรกิจ / ร้าน", placeholder: "เช่น รีสอร์ทวิวทะเล", type: "text" },
    { key: "phone", label: "เบอร์โทรศัพท์", placeholder: "0812345678", type: "tel" },
    { key: "email", label: "อีเมล", placeholder: "email@example.com", type: "email" },
    { key: "password", label: "รหัสผ่าน (อย่างน้อย 6 ตัว)", placeholder: "••••••••", type: "password" },
    { key: "confirmPassword", label: "ยืนยันรหัสผ่าน", placeholder: "••••••••", type: "password" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="bg-[#2563eb] w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <i className="fa-solid fa-calendar-check text-white text-xl"></i>
            </div>
            <span className="text-2xl font-bold text-slate-800">JongJongDi</span>
          </div>
          <p className="text-slate-500 text-sm">สมัครเป็นผู้ประกอบการ</p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
          <i className="fa-solid fa-circle-info mr-2"></i>
          หลังสมัคร Admin จะตรวจสอบและอนุมัติภายใน 1-2 วันทำการ
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 p-8">
          <h1 className="text-xl font-bold text-slate-800 mb-6">สมัครเป็นผู้ประกอบการ</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  {f.label} <span className="text-red-500">*</span>
                </label>
                <input
                  type={f.type}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#2563eb] transition"
                />
              </div>
            ))}

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
                <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>กำลังส่งข้อมูล...</>
              ) : "สมัครเลย"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm text-slate-500">
            มีบัญชีแล้ว?{" "}
            <Link href="/login" className="text-[#2563eb] font-semibold hover:underline">
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
