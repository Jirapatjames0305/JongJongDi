import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TourCard from "@/components/TourCard";
import { listTours } from "@/lib/api";

export const metadata = { title: "จองทัวร์ | JongJongDi" };

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short" });

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; date?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const date = sp.date || undefined;
  const hasFilter = Boolean(q || date);

  const tours = await listTours({ q, date });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-20">
        <div className="bg-white border-b border-slate-100 py-8 md:py-12">
          <div className="container mx-auto px-4 md:px-6">
            <p className="text-cyan-600 font-bold text-xs tracking-widest uppercase mb-2">
              Tours
            </p>
            <h1 className="text-2xl md:text-4xl font-bold text-slate-800">จองทัวร์</h1>
            <p className="text-slate-500 mt-2 text-sm md:text-base">
              ทัวร์ดำน้ำ ทัวร์ทะเล และทัวร์ท่องเที่ยวทั่วไทย กับไกด์มืออาชีพ
            </p>

            {/* Active filters */}
            {hasFilter && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {q && (
                  <span className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    <i className="fa-solid fa-magnifying-glass"></i>{q}
                  </span>
                )}
                {date && (
                  <span className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    <i className="fa-solid fa-calendar-day"></i>{fmtDate(date)}
                  </span>
                )}
                <a href="/tours" className="text-xs text-slate-400 hover:text-slate-600 underline ml-1">
                  ล้างตัวกรอง
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-10 md:py-16">
          {tours.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <i className="fa-solid fa-water-ladder text-5xl mb-3 block opacity-40"></i>
              <p>{hasFilter ? "ไม่พบทัวร์ที่ตรงกับเงื่อนไข ลองปรับวันเดินทางหรือคำค้นหา" : "ยังไม่มีทัวร์"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} date={date} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
