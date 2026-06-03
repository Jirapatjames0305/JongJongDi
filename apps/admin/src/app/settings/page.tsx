"use client";

import { useState } from "react";
import AdminShell from "@/components/AdminShell";
import { changePasswordApi } from "@/lib/auth";

export default function SettingsPage() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setError("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    if (form.newPassword.length < 6) {
      setError("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("jjd_token") ?? "";
      await changePasswordApi(token, form.currentPassword, form.newPassword);
      setSuccess(true);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">ตั้งค่าบัญชี</h1>

      <div className="max-w-lg">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-bold text-slate-700 mb-5 flex items-center gap-2">
            <i className="fa-solid fa-lock text-[#2563eb]"></i>
            เปลี่ยนรหัสผ่าน
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: "currentPassword", label: "รหัสผ่านปัจจุบัน" },
              { key: "newPassword", label: "รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)" },
              { key: "confirmPassword", label: "ยืนยันรหัสผ่านใหม่" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">{f.label}</label>
                <input
                  type="password"
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => update(f.key, e.target.value)}
                  placeholder="••••••••"
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

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm flex items-center gap-2">
                <i className="fa-solid fa-circle-check"></i>
                เปลี่ยนรหัสผ่านสำเร็จ!
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2563eb] text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60 shadow-lg shadow-blue-500/20"
            >
              {loading ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>กำลังบันทึก...</> : "บันทึก"}
            </button>
          </form>
        </div>
      </div>
    </AdminShell>
  );
}
