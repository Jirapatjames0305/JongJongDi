"use client";

import { useToast } from "./ToastContext";

const services = [
  {
    icon: "fa-hotel",
    bg: "bg-blue-50",
    color: "text-[#2563eb]",
    label: "จองที่พัก",
    desc: "ค้นหาโรงแรม รีสอร์ททั่วไทย",
    linkColor: "text-[#2563eb]",
    category: "ที่พัก",
    href: "/rooms",
  },
  {
    icon: "fa-water-ladder",
    bg: "bg-cyan-50",
    color: "text-cyan-600",
    label: "จองทัวร์ดำน้ำ",
    desc: "ดำน้ำดูปะการัง ทัวร์ทะเลทั่วไทย",
    linkColor: "text-cyan-600",
    category: "ทัวร์ดำน้ำ",
    href: "/tours",
  },
  {
    icon: "fa-utensils",
    bg: "bg-orange-50",
    color: "text-orange-500",
    label: "จองโต๊ะ",
    desc: "จองโต๊ะร้านดัง ไม่ต้องรอคิว",
    linkColor: "text-orange-500",
    category: "ร้านอาหาร",
    disabled: true,
  },
  {
    icon: "fa-user-clock",
    bg: "bg-green-50",
    color: "text-green-600",
    label: "จองคิว",
    desc: "คลินิก ตัดผม ล้างรถ ฯลฯ",
    linkColor: "text-green-600",
    category: "คิวบริการ",
    disabled: true,
  },
  {
    icon: "fa-ticket",
    bg: "bg-purple-50",
    color: "text-purple-600",
    label: "จองตั๋ว",
    desc: "คอนเสิร์ต สวนสนุก อีเวนต์",
    linkColor: "text-purple-600",
    category: "ตั๋วเข้าชม",
    disabled: true,
  },
  {
    icon: "fa-bag-shopping",
    bg: "bg-pink-50",
    color: "text-pink-600",
    label: "สั่งสินค้าไทย-จีน",
    desc: "สั่งสินค้าจากไทยส่งตรงถึงจีน",
    linkColor: "text-pink-600",
    category: "สินค้า",
    href: "https://siambox.jongjongdi.com/zh",
  },
];

export default function ServicesSection() {
  const { showToast } = useToast();

  return (
    <section id="services" className="py-12 md:py-20 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-16">
          <span className="text-[#f59e0b] font-bold text-xs tracking-widest uppercase">
            Categories
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-slate-800 mt-2">
            บริการที่คุณต้องการ
          </h2>
          <div className="w-16 h-1 bg-[#2563eb] mx-auto mt-3 rounded-full"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-8">
          {services.map((s) =>
            s.disabled ? (
              <div
                key={s.category}
                className="bg-white rounded-xl p-5 md:p-8 text-center border border-slate-100 shadow-sm opacity-50 cursor-not-allowed relative"
              >
                <ServiceCardContent s={s} />
                <span className="absolute top-2 right-2 text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-medium">เร็วๆ นี้</span>
              </div>
            ) : s.href ? (
              <a
                key={s.category}
                href={s.href}
                className="bg-white rounded-xl p-5 md:p-8 text-center transition-all duration-300 card-hover border border-slate-100 cursor-pointer shadow-sm hover:shadow-lg active:scale-95 block no-underline"
              >
                <ServiceCardContent s={s} />
              </a>
            ) : (
              <div
                key={s.category}
                onClick={() => showToast(`เปิดหน้า: ${s.category}`)}
                className="bg-white rounded-xl p-5 md:p-8 text-center transition-all duration-300 card-hover border border-slate-100 cursor-pointer shadow-sm hover:shadow-lg active:scale-95"
              >
                <ServiceCardContent s={s} />
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

function ServiceCardContent({
  s,
}: {
  s: (typeof services)[0];
}) {
  return (
    <>
      <div
        className={`w-12 h-12 md:w-16 md:h-16 ${s.bg} ${s.color} rounded-full flex items-center justify-center text-xl md:text-2xl mx-auto mb-4 md:mb-6`}
      >
        <i className={`fa-solid ${s.icon}`}></i>
      </div>
      <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-3 text-slate-800">
        {s.label}
      </h3>
      <p className="hidden md:block text-slate-500 mb-4 text-sm">{s.desc}</p>
      <span
        className={`${s.linkColor} font-semibold text-xs md:text-sm flex items-center justify-center gap-1`}
      >
        เลือก <i className="fa-solid fa-chevron-right text-[10px]"></i>
      </span>
    </>
  );
}
