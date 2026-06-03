export default function HeroSection() {
  return (
    <header className="relative pt-28 pb-12 lg:pt-48 lg:pb-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50/30 -z-10"></div>
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 md:w-96 md:h-96 rounded-full bg-blue-100 opacity-40 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 md:w-80 md:h-80 rounded-full bg-yellow-100 opacity-40 blur-3xl"></div>

      <div className="container mx-auto px-4 md:px-6 text-center">
        <h1 className="text-3xl md:text-6xl font-bold text-slate-800 mb-4 md:mb-6 leading-tight fade-in-up">
          เรื่องจอง เรื่องง่าย{" "}
          <span className="text-[#2563eb] relative inline-block">
            จบที่ JongJongDi
            <svg
              className="absolute w-full h-2 bottom-0 left-0 text-yellow-300 -z-10"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path
                d="M0 5 Q 50 10 100 5"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                opacity="0.5"
              />
            </svg>
          </span>
        </h1>
        <p
          className="text-base md:text-xl text-slate-600 mb-8 md:mb-10 max-w-2xl mx-auto px-4 fade-in-up leading-relaxed"
          style={{ animationDelay: "0.1s" }}
        >
          จองง่าย ครบ จบในที่เดียว! ทั้งที่พัก ร้านอาหาร คิวบริการ{" "}
          <br className="hidden md:inline" />
          และสินค้าสุดฮิต สะดวก รวดเร็ว ตอบโจทย์ทุกไลฟ์สไตล์
        </p>

        <div
          className="flex flex-row justify-center gap-2 md:gap-4 px-2 fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <a
            href="#services"
            className="flex-1 sm:flex-none sm:w-auto px-4 py-3 bg-[#2563eb] text-white rounded-full font-medium sm:font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-95 duration-150 text-sm md:text-base"
          >
            <i className="fa-solid fa-magnifying-glass"></i>
            <span>จองบริการ</span>
          </a>
          <a
            href="#system"
            className="flex-1 sm:flex-none sm:w-auto px-4 py-3 bg-white text-[#2563eb] border border-[#2563eb]/30 rounded-full font-medium sm:font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2 active:scale-95 duration-150 text-sm md:text-base"
          >
            <i className="fa-solid fa-shop"></i>
            <span>สำหรับธุรกิจ</span>
          </a>
        </div>
      </div>
    </header>
  );
}
