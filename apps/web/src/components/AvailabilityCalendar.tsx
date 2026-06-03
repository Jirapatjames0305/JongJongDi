"use client";

import { useState } from "react";

type Props = {
  onSelectDates: (checkIn: string, checkOut: string) => void;
};

const DAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const MONTHS_TH = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
];

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function AvailabilityCalendar({ onSelectDates }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  function handleClick(dateStr: string) {
    const date = new Date(dateStr);
    if (date < today) return;

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut(null);
    } else {
      if (dateStr <= checkIn) {
        setCheckIn(dateStr);
        setCheckOut(null);
      } else {
        setCheckOut(dateStr);
        onSelectDates(checkIn, dateStr);
      }
    }
  }

  function isInRange(dateStr: string) {
    const ref = checkOut ?? hovered;
    if (!checkIn || !ref) return false;
    return dateStr > checkIn && dateStr < ref;
  }

  const cells: (string | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(toDateStr(new Date(year, month, d)));
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      {/* Month Nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition"
        >
          <i className="fa-solid fa-chevron-left text-slate-500 text-sm"></i>
        </button>
        <span className="font-bold text-slate-700">
          {MONTHS_TH[month]} {year + 543}
        </span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition"
        >
          <i className="fa-solid fa-chevron-right text-slate-500 text-sm"></i>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs text-slate-400 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((dateStr, i) => {
          if (!dateStr) return <div key={`empty-${i}`} />;

          const isPast = new Date(dateStr) < today;
          const isCheckIn = dateStr === checkIn;
          const isCheckOut = dateStr === checkOut;
          const inRange = isInRange(dateStr);
          const day = parseInt(dateStr.slice(8));

          return (
            <button
              key={dateStr}
              disabled={isPast}
              onClick={() => handleClick(dateStr)}
              onMouseEnter={() => setHovered(dateStr)}
              onMouseLeave={() => setHovered(null)}
              className={`
                relative h-9 w-full flex items-center justify-center text-sm rounded-full transition-colors
                ${isPast ? "text-slate-300 cursor-not-allowed" : "cursor-pointer"}
                ${isCheckIn || isCheckOut ? "bg-[#2563eb] text-white font-bold" : ""}
                ${inRange ? "bg-blue-100 text-[#2563eb] rounded-none" : ""}
                ${!isPast && !isCheckIn && !isCheckOut && !inRange ? "hover:bg-slate-100" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Selected range summary */}
      {checkIn && (
        <div className="mt-4 p-3 bg-blue-50 rounded-xl text-sm text-slate-600">
          {checkIn && !checkOut ? (
            <span>
              <i className="fa-solid fa-calendar-check text-[#2563eb] mr-2"></i>
              เช็คอิน: <strong>{checkIn}</strong> — เลือกวันเช็คเอาต์
            </span>
          ) : (
            <span>
              <i className="fa-solid fa-calendar-check text-green-600 mr-2"></i>
              {checkIn} → {checkOut}
              {" "}(
              {Math.ceil(
                (new Date(checkOut!).getTime() - new Date(checkIn).getTime()) / 86400000
              )}{" "}
              คืน)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
