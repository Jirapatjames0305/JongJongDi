export default function TrendingSection() {
  return (
    <section className="py-8 md:py-10 bg-white border-b border-slate-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-fire text-red-500 animate-pulse"></i>{" "}
              ฮิตติดกระแส
            </h2>
            <p className="text-slate-500 text-xs md:text-sm mt-1">
              สินค้าและโปรโมชั่นมาแรง ห้ามพลาด!
            </p>
          </div>
          <a
            href="#"
            className="text-[#2563eb] hover:text-blue-700 text-sm font-semibold whitespace-nowrap bg-blue-50 px-3 py-1 rounded-full transition"
          >
            ดูทั้งหมด <i className="fa-solid fa-arrow-right ml-1"></i>
          </a>
        </div>

        <div className="flex overflow-x-auto pb-8 gap-4 px-4 -mx-4 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:mx-0 md:px-0 scrollbar-hide snap-x snap-mandatory">
          {/* Card 1: Durian */}
          <div className="min-w-[85vw] sm:min-w-[300px] md:min-w-0 md:w-auto bg-white rounded-xl shadow-md md:shadow-lg shadow-slate-200 overflow-hidden group cursor-pointer border border-slate-100 relative card-hover snap-center">
            <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full z-10 shadow-sm uppercase tracking-wide">
              <i className="fa-solid fa-star text-yellow-300 mr-1"></i> Best
              Seller
            </div>
            <div className="h-40 md:h-48 bg-slate-200 relative overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                <i className="fa-solid fa-seedling text-yellow-600 text-5xl opacity-40"></i>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-1 text-[10px] md:text-xs text-slate-500 mb-2">
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                  <i className="fa-solid fa-location-dot text-red-500 mr-1"></i>{" "}
                  จันทบุรี
                </span>
                <span className="text-green-600 font-medium ml-auto">
                  <i className="fa-solid fa-truck-fast"></i> พร้อมส่งทั่วไทย
                </span>
              </div>
              <h3 className="font-bold text-base md:text-lg mb-1 text-slate-800 group-hover:text-[#2563eb] transition line-clamp-1">
                ทุเรียนทอดพรีเมียม โซเดียมต่ำ
              </h3>
              <p className="text-xs md:text-sm text-slate-500 mb-3 line-clamp-2 leading-relaxed">
                กรอบ อร่อย เคี้ยวเพลิน จากสวนวัฒนาการ์เด้นวิว (Wattana Garden
                View)
              </p>
              <div className="flex justify-between items-end border-t border-slate-100 pt-3">
                <div>
                  <span className="text-xs text-slate-400 line-through block">
                    180.-
                  </span>
                  <div className="text-[#f59e0b] font-bold text-lg md:text-xl leading-none">
                    150.-{" "}
                    <span className="text-xs text-slate-500 font-normal">
                      /ถุง
                    </span>
                  </div>
                </div>
                <button className="bg-[#2563eb] text-white px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-blue-700 transition shadow-md shadow-blue-500/20 active:scale-95">
                  สั่งซื้อเลย
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Nature Camp */}
          <div className="min-w-[85vw] sm:min-w-[300px] md:min-w-0 md:w-auto bg-white rounded-xl shadow-md md:shadow-lg shadow-slate-200 overflow-hidden group cursor-pointer border border-slate-100 relative card-hover snap-center">
            <div className="h-40 md:h-48 bg-slate-200 relative overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                <i className="fa-solid fa-mountain-sun text-green-600 text-5xl opacity-40"></i>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-1 text-[10px] md:text-xs text-slate-500 mb-2">
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                  <i className="fa-solid fa-tree text-green-500 mr-1"></i>{" "}
                  อุทยานแห่งชาติ เขาสิบห้าชั้น
                </span>
                <span className="ml-auto text-slate-400">จันทบุรี</span>
              </div>
              <h3 className="font-bold text-base md:text-lg mb-1 text-slate-800 group-hover:text-[#2563eb] transition line-clamp-1">
                "หนาวนี้…หนีเมือง ขึ้นเขา นอนดูดาว"
              </h3>
              <p className="text-xs md:text-sm text-slate-500 mb-3 line-clamp-1">
                โทนอบอุ่น–ธรรมชาติ–slow life
              </p>
              <p className="text-xs md:text-sm text-slate-500 mb-3 line-clamp-1">
                ⛺️ค่ากางเต็นท์ คนละ 30 บาท ค่าเข้าอุทยาน คนละ 20 บาท
              </p>
              <div className="flex justify-between items-end border-t border-slate-100 pt-3">
                <div>
                  <div className="text-[#f59e0b] font-bold text-lg md:text-xl leading-none">
                    20.-
                  </div>
                </div>
                <button className="bg-white text-[#2563eb] border border-[#2563eb] px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-blue-50 transition active:scale-95">
                  ดูรายละเอียด
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Glamping */}
          <div className="min-w-[85vw] sm:min-w-[300px] md:min-w-0 md:w-auto bg-white rounded-xl shadow-md md:shadow-lg shadow-slate-200 overflow-hidden group cursor-pointer border border-slate-100 relative card-hover snap-center">
            <div className="h-40 md:h-48 bg-slate-200 relative overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                <i className="fa-solid fa-tent text-indigo-600 text-5xl opacity-40"></i>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-1 text-[10px] md:text-xs text-slate-500 mb-2">
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                  <i className="fa-solid fa-tree text-green-500 mr-1"></i>{" "}
                  เขาใหญ่
                </span>
              </div>
              <h3 className="font-bold text-base md:text-lg mb-1 text-slate-800 group-hover:text-[#2563eb] transition line-clamp-1">
                Glamping Sky Camp รับลมหนาว
              </h3>
              <p className="text-xs md:text-sm text-slate-500 mb-3 line-clamp-1">
                ที่พักเต็นท์หรู ชมดาว สัมผัสหมอก
              </p>
              <div className="flex justify-between items-end border-t border-slate-100 pt-3">
                <div>
                  <span className="text-xs text-slate-400 line-through block">
                    3,500.-
                  </span>
                  <div className="text-[#f59e0b] font-bold text-lg md:text-xl leading-none">
                    2,200.-
                  </div>
                </div>
                <button className="bg-white text-[#2563eb] border border-[#2563eb] px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-blue-50 transition active:scale-95">
                  ดูห้องพัก
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
