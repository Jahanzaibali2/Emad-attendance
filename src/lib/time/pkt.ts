export const PKT_TZ = "Asia/Karachi";

/** YYYY-MM-DD in Pakistan Standard Time */
export function pktDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PKT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Parse YYYY-MM-DD as a UTC noon anchor for calendar math */
export function parseDateOnly(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

export function pktWeekday(dateStr: string): number {
  // 0 Sun .. 6 Sat in PKT — use formatter
  const noonUtc = parseDateOnly(dateStr);
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: PKT_TZ,
    weekday: "short",
  }).format(noonUtc);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[wd] ?? 0;
}

export function isPktWeekend(dateStr: string): boolean {
  const wd = pktWeekday(dateStr);
  return wd === 0 || wd === 6;
}

/** Instant for HH:mm on a PKT calendar date */
export function pktWallTimeToUtc(dateStr: string, hhmm: string): Date {
  const [hour, minute] = hhmm.split(":").map(Number);
  // Iterate: find UTC instant whose PKT wall clock matches
  const [y, m, d] = dateStr.split("-").map(Number);
  // PKT is UTC+5 year-round
  return new Date(Date.UTC(y, m - 1, d, hour - 5, minute, 0, 0));
}

/** Start of next PKT calendar day as UTC Date (00:00:00 PKT) */
export function pktNextMidnightUtc(workDateStr: string): Date {
  const [y, m, d] = workDateStr.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  const nextStr = next.toISOString().slice(0, 10);
  return pktWallTimeToUtc(nextStr, "00:00");
}

export function formatPktTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: PKT_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatPktLongDate(dateStr: string): string {
  const d = parseDateOnly(dateStr);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: PKT_TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
}

export function listDatesInMonth(year: number, month: number): string[] {
  // month 1-12
  const dates: string[] = [];
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  for (let day = 1; day <= days; day++) {
    dates.push(
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    );
  }
  return dates;
}

export function countWeekdaysInMonth(year: number, month: number): number {
  return listDatesInMonth(year, month).filter((d) => !isPktWeekend(d)).length;
}

export function monthParts(dateStr: string): { year: number; month: number } {
  const [y, m] = dateStr.split("-").map(Number);
  return { year: y, month: m };
}
