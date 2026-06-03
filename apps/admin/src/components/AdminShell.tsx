"use client";

import { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { OperatorInfo } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", icon: "fa-gauge", label: "Dashboard" },
  { href: "/operators", icon: "fa-users", label: "ผู้ประกอบการ", superAdminOnly: true },
  { href: "/rooms", icon: "fa-bed", label: "ที่พัก" },
  { href: "/tours", icon: "fa-water-ladder", label: "ทัวร์" },
  { href: "/bookings", icon: "fa-calendar-check", label: "การจอง" },
  { href: "/availability", icon: "fa-ban", label: "วันว่าง/ปิด" },
  { href: "/seasons", icon: "fa-tag", label: "ราคา High Season" },
  { href: "/settings", icon: "fa-gear", label: "ตั้งค่า" },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [operator, setOperator] = useState<OperatorInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("jjd_operator");
    const token = localStorage.getItem("jjd_token");
    if (!stored || !token) {
      router.replace("/login");
      return;
    }
    setOperator(JSON.parse(stored));
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("jjd_token");
    localStorage.removeItem("jjd_operator");
    router.push("/login");
  }

  if (!operator) return null;

  const visibleNav = navItems.filter(
    (n) => !n.superAdminOnly || operator.role === "SUPER_ADMIN"
  );

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-[#0f172a] text-white w-64">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-[#2563eb] w-9 h-9 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-calendar-check text-white"></i>
          </div>
          <div>
            <div className="font-bold text-sm">JongJongDi</div>
            <div className="text-[10px] text-slate-400">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {visibleNav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                active
                  ? "bg-[#2563eb] text-white font-semibold"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <i className={`fa-solid ${item.icon} w-4 text-center`}></i>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#2563eb]/30 flex items-center justify-center text-xs font-bold">
            {operator.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate">{operator.name}</div>
            <div className="text-[10px] text-slate-400 truncate">{operator.email}</div>
          </div>
          {operator.role === "SUPER_ADMIN" && (
            <span className="text-[9px] bg-[#f59e0b] text-white px-1.5 py-0.5 rounded font-bold">
              OWNER
            </span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition text-sm"
        >
          <i className="fa-solid fa-right-from-bracket"></i>
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="flex shrink-0">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-900"
          >
            <i className="fa-solid fa-bars"></i>
          </button>
          <span className="font-bold text-slate-800">JongJongDi Admin</span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
