"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { userRegister, saveUserSession } from "@/lib/user-auth";
import { useLang } from "@/lib/lang";
import { t, tx } from "@/lib/i18n";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lang] = useLang();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", confirmPassword: "", referralCode: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setForm((f) => ({ ...f, referralCode: ref.toUpperCase() }));
  }, [searchParams]);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError(tx(t.register.errMismatch, lang)); return; }
    if (form.password.length < 6) { setError(tx(t.register.errShort, lang)); return; }

    setLoading(true);
    try {
      const { token, user } = await userRegister({
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        password: form.password,
        referralCode: form.referralCode.trim() || undefined,
      });
      saveUserSession(token, user);
      router.push(form.referralCode ? "/profile?tab=coupons" : "/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : tx(t.register.errDefault, lang));
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#2563eb] transition";

  const mainFields = [
    { key: "name",            label: tx(t.register.name, lang),            type: "text",     placeholder: tx(t.register.namePh, lang), required: true },
    { key: "phone",           label: tx(t.register.phone, lang),           type: "tel",      placeholder: "0812345678",                required: true },
    { key: "email",           label: tx(t.register.email, lang),           type: "email",    placeholder: "example@email.com",         required: false },
    { key: "password",        label: tx(t.register.password, lang),        type: "password", placeholder: "••••••••",                  required: true },
    { key: "confirmPassword", label: tx(t.register.confirmPassword, lang), type: "password", placeholder: "••••••••",                  required: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-[#2563eb]">
            <i className="fa-solid fa-calendar-check text-[#f59e0b]"></i>
            JongJongDi
          </Link>
          <p className="text-slate-500 text-sm mt-2">{tx(t.register.subtitle, lang)}</p>
        </div>

        {form.referralCode && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex items-center gap-3 text-sm">
            <i className="fa-solid fa-gift text-blue-500 text-lg shrink-0"></i>
            <div>
              <p className="font-semibold text-blue-700">{tx(t.register.refBannerTitle, lang)}</p>
              <p className="text-blue-500 text-xs">{tx(t.register.refBannerDesc, lang)}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mainFields.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  required={f.required}
                  className={inputCls}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">{tx(t.register.referralCode, lang)}</label>
              <input
                type="text"
                value={form.referralCode}
                onChange={(e) => update("referralCode", e.target.value.toUpperCase())}
                placeholder={tx(t.register.referralPh, lang)}
                className={`${inputCls} font-mono tracking-widest uppercase`}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation"></i>{error}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-3 bg-[#2563eb] text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60 shadow-lg shadow-blue-500/20">
              {loading ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>{tx(t.register.loading, lang)}</> : tx(t.register.submit, lang)}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-500">
            {tx(t.register.hasAccount, lang)}{" "}
            <Link href="/login" className="text-[#2563eb] font-semibold hover:underline">{tx(t.register.loginLink, lang)}</Link>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 transition">
            <i className="fa-solid fa-arrow-left mr-1"></i>{tx(t.register.back, lang)}
          </Link>
        </div>
      </div>
    </div>
  );
}
