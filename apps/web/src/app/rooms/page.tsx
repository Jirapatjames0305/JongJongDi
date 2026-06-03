import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RoomCard from "@/components/RoomCard";
import { listRooms } from "@/lib/api";

export const metadata = { title: "จองที่พัก | JongJongDi" };

export default async function RoomsPage() {
  const rooms = await listRooms();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-20">
        {/* Header */}
        <div className="bg-white border-b border-slate-100 py-8 md:py-12">
          <div className="container mx-auto px-4 md:px-6">
            <p className="text-[#f59e0b] font-bold text-xs tracking-widest uppercase mb-2">
              Accommodation
            </p>
            <h1 className="text-2xl md:text-4xl font-bold text-slate-800">จองที่พัก</h1>
            <p className="text-slate-500 mt-2 text-sm md:text-base">
              เลือกห้องพักที่ใช่สำหรับคุณ พร้อมวิวทะเลอันดามัน
            </p>
          </div>
        </div>

        {/* Room Grid */}
        <div className="container mx-auto px-4 md:px-6 py-10 md:py-16">
          {rooms.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <i className="fa-solid fa-bed text-5xl mb-3 block opacity-40"></i>
              <p>ยังไม่มีห้องพัก</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
