"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { getRoomAvailability } from "@/lib/api";

type Props = {
  slug: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  onSelectDates: (checkIn: string, checkOut: string) => void;
};

// Build "YYYY-MM-DD" directly from numbers — avoids the timezone shift that
// toISOString() introduces on a local Date, and matches the server's strings.
function ymd(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function monthStartFromStr(s: string) {
  const [y, m] = s.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

export default function AvailabilityCalendar({ slug, initialCheckIn, initialCheckOut, onSelectDates }: Props) {
  const [lang] = useLang();
  const months = t.calendar.months[lang];
  const days = t.calendar.days[lang];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = ymd(today.getFullYear(), today.getMonth(), today.getDate());

  const initMonth = initialCheckIn ? monthStartFromStr(initialCheckIn) : today;
  const [viewDate, setViewDate] = useState(new Date(initMonth.getFullYear(), initMonth.getMonth(), 1));
  const [checkIn, setCheckIn] = useState<string | null>(initialCheckIn ?? null);
  const [checkOut, setCheckOut] = useState<string | null>(initialCheckOut ?? null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [rangeError, setRangeError] = useState(false);

  const [unavailable, setUnavailable] = useState<Set<string>>(new Set());
  const fetchedMonths = useRef<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const yearDisplay = lang === "th" ? year + 543 : year;

  // Sync pre-selected dates up to the parent once on mount
  useEffect(() => {
    if (initialCheckIn && initialCheckOut) onSelectDates(initialCheckIn, initialCheckOut);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch real availability for the viewed month (once per month)
  useEffect(() => {
    const key = `${year}-${String(month + 1).padStart(2, "0")}`;
    if (fetchedMonths.current.has(key)) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    getRoomAvailability(slug, key).then((data) => {
      if (cancelled) return;
      fetchedMonths.current.add(key);
      setUnavailable((prev) => {
        const next = new Set(prev);
        data.unavailable.forEach((d) => next.add(d));
        return next;
      });
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [slug, year, month]);

  function prevMonth() { setViewDate(new Date(year, month - 1, 1)); }
  function nextMonth() { setViewDate(new Date(year, month + 1, 1)); }

  // Any unavailable night within [ci, co)?
  function rangeHasUnavailable(ci: string, co: string) {
    const start = new Date(`${ci}T00:00:00Z`).getTime();
    const end = new Date(`${co}T00:00:00Z`).getTime();
    for (let ts = start; ts < end; ts += 86400000) {
      if (unavailable.has(new Date(ts).toISOString().slice(0, 10))) return true;
    }
    return false;
  }

  function handleClick(dateStr: string) {
    if (dateStr < todayStr || unavailable.has(dateStr)) return;
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut(null);
      setRangeError(false);
    } else if (dateStr <= checkIn) {
      setCheckIn(dateStr);
      setCheckOut(null);
      setRangeError(false);
    } else if (rangeHasUnavailable(checkIn, dateStr)) {
      setRangeError(true);
    } else {
      setCheckOut(dateStr);
      setRangeError(false);
      onSelectDates(checkIn, dateStr);
    }
  }

  function isInRange(dateStr: string) {
    const ref = checkOut ?? hovered;
    if (!checkIn || !ref) return false;
    return dateStr > checkIn && dateStr < ref;
  }

  const cells: (string | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(ymd(year, month, d));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      {/* Month Nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition">
          <i className="fa-solid fa-chevron-left text-slate-500 text-sm"></i>
        </button>
        <span className="font-bold text-slate-700 flex items-center gap-2">
          {months[month]} {yearDisplay}
          {loading && <i className="fa-solid fa-circle-notch fa-spin text-slate-300 text-xs"></i>}
        </span>
        <button onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition">
          <i className="fa-solid fa-chevron-right text-slate-500 text-sm"></i>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {days.map((d) => (
          <div key={d} className="text-center text-xs text-slate-400 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((dateStr, i) => {
          if (!dateStr) return <div key={`empty-${i}`} />;
          const isPast = dateStr < todayStr;
          const isUnavailable = unavailable.has(dateStr);
          const isCheckIn = dateStr === checkIn;
          const isCheckOut = dateStr === checkOut;
          const inRange = isInRange(dateStr);
          const day = parseInt(dateStr.slice(8));
          const disabled = isPast || isUnavailable;
          return (
            <button
              key={dateStr}
              disabled={disabled}
              onClick={() => handleClick(dateStr)}
              onMouseEnter={() => !disabled && setHovered(dateStr)}
              onMouseLeave={() => setHovered(null)}
              title={isUnavailable && !isPast ? t.calendar.unavailable[lang] : undefined}
              className={`relative h-9 w-full flex items-center justify-center text-sm rounded-full transition-colors
                ${isPast ? "text-slate-300 cursor-not-allowed" : ""}
                ${isUnavailable && !isPast ? "text-slate-300 line-through cursor-not-allowed" : ""}
                ${!disabled ? "cursor-pointer" : ""}
                ${isCheckIn || isCheckOut ? "bg-[#2563eb] text-white font-bold" : ""}
                ${inRange ? "bg-blue-100 text-[#2563eb] rounded-none" : ""}
                ${!disabled && !isCheckIn && !isCheckOut && !inRange ? "hover:bg-slate-100" : ""}`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Range error */}
      {rangeError && (
        <div className="mt-3 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
          <i className="fa-solid fa-triangle-exclamation mr-2"></i>
          {t.calendar.rangeBlocked[lang]}
        </div>
      )}

      {/* Selected range summary */}
      {checkIn && (
        <div className="mt-4 p-3 bg-blue-50 rounded-xl text-sm text-slate-600">
          {!checkOut ? (
            <span>
              <i className="fa-solid fa-calendar-check text-[#2563eb] mr-2"></i>
              {t.calendar.checkInSelected[lang]}{" "}<strong>{checkIn}</strong>{" "}— {t.calendar.selectCheckout[lang]}
            </span>
          ) : (
            <span>
              <i className="fa-solid fa-calendar-check text-green-600 mr-2"></i>
              {checkIn} → {checkOut}{" "}(
              {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)}{" "}
              {t.calendar.nights[lang]})
            </span>
          )}
        </div>
      )}
    </div>
  );
}
