export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-12 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 text-center md:text-left md:grid-cols-4 gap-8 md:gap-12 mb-10">

          {/* Brand */}
          <div className="col-span-1">
            <a
              href="/"
              className="text-2xl font-bold text-[#2563eb] flex items-center justify-center md:justify-start gap-2 mb-4"
            >
              <i className="fa-solid fa-calendar-check text-[#f59e0b]"></i>
              JongJongDi
            </a>
            <p className="text-slate-500 text-sm leading-relaxed">
              แพลตฟอร์มการจองที่เข้าใจคนไทย
              <br />
              ครบ จบ ง่าย ในที่เดียว
            </p>
          </div>

          {/* บริการ */}
          <div>
            <h4 className="font-bold text-slate-800 mb-4">บริการ</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <a href="/rooms" className="hover:text-[#2563eb] transition">
                  จองที่พัก
                </a>
              </li>
              <li>
                <a href="/tours" className="hover:text-[#2563eb] transition">
                  จองทัวร์ดำน้ำ
                </a>
              </li>
              <li className="text-slate-300 cursor-not-allowed">
                จองโต๊ะ <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded ml-1">เร็วๆ นี้</span>
              </li>
              <li className="text-slate-300 cursor-not-allowed">
                จองตั๋ว <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded ml-1">เร็วๆ นี้</span>
              </li>
            </ul>
          </div>

          {/* สำหรับธุรกิจ */}
          <div>
            <h4 className="font-bold text-slate-800 mb-4">สำหรับธุรกิจ</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <a href="http://localhost:3001/register" className="hover:text-[#2563eb] transition">
                  สมัครเป็นพาร์ทเนอร์
                </a>
              </li>
              <li>
                <a href="http://localhost:3001/login" className="hover:text-[#2563eb] transition">
                  เข้าสู่ระบบพาร์ทเนอร์
                </a>
              </li>
            </ul>
          </div>

          {/* ติดต่อ */}
          <div>
            <h4 className="font-bold text-slate-800 mb-4">ติดต่อเรา</h4>
            <ul className="space-y-3 text-sm text-slate-500 flex flex-col items-center md:items-start">
              <li className="flex items-center gap-2">
                <i className="fa-solid fa-phone text-[#2563eb]"></i>
                080-225-6669
              </li>
              <li className="flex items-center gap-2">
                <i className="fa-solid fa-envelope text-[#2563eb]"></i>
                jongjongdisupport@gmail.com
              </li>
              <div className="flex gap-3 mt-2">
                <a
                  href="https://facebook.com/jongjongdi"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition"
                >
                  <i className="fa-brands fa-facebook-f"></i>
                </a>
                <a
                  href="https://line.me/ti/p/jongjongdi"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-[#06C755] hover:text-white transition"
                >
                  <i className="fa-brands fa-line"></i>
                </a>
              </div>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          &copy; 2025 JongJongDi.com All rights reserved.
        </div>
      </div>
    </footer>
  );
}
