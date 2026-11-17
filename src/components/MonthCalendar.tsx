import Link from "next/link";
import type { DayStatus } from "@/lib/domain/attendance";
import { pktDateString, pktWeekday } from "@/lib/time/pkt";

const statusClass: Record<DayStatus, string> = {
  weekend: "text-line",
  upcoming: "text-slate/50",
  present: "text-gold-deep font-semibold",
  partial: "text-slate border-b-2 border-gold",
  absent: "text-absent",
  not_started: "text-slate",
};

export type CalendarDay = {
  date: string;
  status: DayStatus;
  late: boolean;
  workedHours: number;
};

type Props = {
  yearMonth: string;
  monthName: string;
  days: CalendarDay[];
  prevMonth: string;
  nextMonth: string;
  selected?: string | null;
  /** Base path for month/day links, e.g. /calendar or /today */
  basePath: string;
  showLegend?: boolean;
};

export function MonthCalendar({
  yearMonth,
  monthName,
  days,
  prevMonth,
  nextMonth,
  selected,
  basePath,
  showLegend = true,
}: Props) {
  const today = pktDateString();
  const first = days[0]?.date;
  const pad = first ? (pktWeekday(first) + 6) % 7 : 0;

  function hrefFor(day?: string) {
    const q = new URLSearchParams({ month: yearMonth });
    if (day) q.set("day", day);
    return `${basePath}?${q.toString()}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`${basePath}?month=${prevMonth}`}
          className="px-2 py-1 text-xl text-gold-deep hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
          aria-label="Previous month"
        >
          ‹
        </Link>
        <h2 className="font-display text-2xl text-ink md:text-3xl">{monthName}</h2>
        <Link
          href={`${basePath}?month=${nextMonth}`}
          className="px-2 py-1 text-xl text-gold-deep hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
          aria-label="Next month"
        >
          ›
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-y-2 text-center text-xs text-slate sm:gap-y-3 sm:text-sm">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
          <div key={d} className="py-1 font-medium">
            {d}
          </div>
        ))}
        {Array.from({ length: pad }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((d) => {
          const dayNum = Number(d.date.slice(-2));
          const isToday = d.date === today;
          const isSelected = selected === d.date;
          return (
            <Link
              key={d.date}
              href={hrefFor(d.date)}
              className={`relative py-2 ${statusClass[d.status]} ${
                isSelected ? "bg-line/70" : ""
              } ${isToday && !isSelected ? "ring-1 ring-gold/60" : ""} focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold`}
            >
              {dayNum}
              {d.late ? (
                <span
                  className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold-deep"
                  title="Late"
                />
              ) : null}
            </Link>
          );
        })}
      </div>

      {showLegend ? (
        <p className="mt-5 text-xs text-slate">
          Present · partial · absent · weekend · late dot
        </p>
      ) : null}
    </div>
  );
}
