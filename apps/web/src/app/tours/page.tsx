import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TourCard from "@/components/TourCard";
import { listTours } from "@/lib/api";

export const metadata = { title: "จองทัวร์ดำน้ำ | JongJongDi" };

export default async function ToursPage() {
  const tours = await listTours();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-20">
        <div className="bg-white border-b border-slate-100 py-8 md:py-12">
          <div className="container mx-auto px-4 md:px-6">
            <p className="text-cyan-600 font-bold text-xs tracking-widest uppercase mb-2">
              Dive Tours
            </p>
            <h1 className="text-2xl md:text-4xl font-bold text-slate-800">จองทัวร์ดำน้ำ</h1>
            <p className="text-slate-500 mt-2 text-sm md:text-base">
              สัมผัสโลกใต้ทะเลอันดามัน กับไกด์มืออาชีพ
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-10 md:py-16">
          {tours.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <i className="fa-solid fa-water-ladder text-5xl mb-3 block opacity-40"></i>
              <p>ยังไม่มีทัวร์</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
