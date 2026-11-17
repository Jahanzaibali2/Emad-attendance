import { prisma } from "@/lib/prisma";
import {
  dayStatus,
  formatDuration,
  hoursFromSeconds,
  isLate,
  liveState,
  totalWorkedSeconds,
  type DayStatus,
} from "@/lib/domain/attendance";
import {
  balanceHours,
  earnedPayPkr,
  monthlyTargetHours,
} from "@/lib/domain/pay";
import {
  countWeekdaysInMonth,
  formatPktLongDate,
  formatPktTime,
  listDatesInMonth,
  monthParts,
  pktDateString,
} from "@/lib/time/pkt";

async function profile() {
  const p = await prisma.employeeProfile.findFirst();
  if (!p) throw new Error("Employee profile not seeded");
  return p;
}

function workDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getTodaySnapshot(now: Date = new Date()) {
  const employee = await profile();
  const today = pktDateString(now);
  const sessions = await prisma.timeSession.findMany({
    where: {
      employeeId: employee.id,
      workDate: new Date(`${today}T00:00:00.000Z`),
    },
    orderBy: { startedAt: "asc" },
  });

  const open = sessions.find((s) => s.endedAt === null) ?? null;
  const closed = sessions.filter((s) => s.endedAt !== null);
  const closedSeconds = totalWorkedSeconds(closed, now);
  const workedSec = totalWorkedSeconds(sessions, now);
  const workedHours = hoursFromSeconds(workedSec);
  const status = dayStatus({
    workDate: today,
    workedHours,
    dailyTargetHours: employee.dailyTargetHours,
    todayPkt: today,
  });
  const first = sessions[0] ?? null;
  const late = isLate({
    firstStartedAt: first?.startedAt ?? null,
    workDate: today,
    expectedStart: employee.expectedStart,
    graceMinutes: employee.graceMinutes,
  });
  const lastClosed = [...closed].sort(
    (a, b) => (b.endedAt?.getTime() ?? 0) - (a.endedAt?.getTime() ?? 0),
  )[0];

  const month = await getMonthSummary(today.slice(0, 7), now);

  return {
    displayName: employee.displayName,
    todayLabel: formatPktLongDate(today),
    expectedWindow: `${employee.expectedStart}–${employee.expectedEnd}`,
    live: liveState({
      hasOpenSession: Boolean(open),
      lastEndReason: lastClosed?.endReason ?? null,
    }),
    openSince: open ? formatPktTime(open.startedAt) : null,
    openStartedAt: open ? open.startedAt.toISOString() : null,
    closedSeconds,
    workedSeconds: workedSec,
    workedLabel: formatDuration(workedSec),
    serverNow: now.toISOString(),
    status,
    late,
    month,
  };
}

export async function getMonthSummary(
  yearMonth: string,
  now: Date = new Date(),
) {
  const employee = await profile();
  const [ys, ms] = yearMonth.split("-");
  const year = Number(ys);
  const month = Number(ms);
  const today = pktDateString(now);
  const dates = listDatesInMonth(year, month);
  const start = new Date(`${dates[0]}T00:00:00.000Z`);
  const end = new Date(`${dates[dates.length - 1]}T00:00:00.000Z`);

  const sessions = await prisma.timeSession.findMany({
    where: {
      employeeId: employee.id,
      workDate: { gte: start, lte: end },
    },
    orderBy: { startedAt: "asc" },
  });

  const byDate = new Map<string, typeof sessions>();
  for (const s of sessions) {
    const key = workDateKey(s.workDate);
    const list = byDate.get(key) ?? [];
    list.push(s);
    byDate.set(key, list);
  }

  let workedHours = 0;
  let presentDays = 0;
  let partialDays = 0;
  let absentDays = 0;
  let lateDays = 0;

  const days: {
    date: string;
    status: DayStatus;
    late: boolean;
    workedHours: number;
  }[] = [];

  for (const date of dates) {
    const daySessions = byDate.get(date) ?? [];
    const sec = totalWorkedSeconds(daySessions, now);
    const hours = hoursFromSeconds(sec);
    workedHours += hours;
    const status = dayStatus({
      workDate: date,
      workedHours: hours,
      dailyTargetHours: employee.dailyTargetHours,
      todayPkt: today,
    });
    const first = daySessions[0] ?? null;
    const late = isLate({
      firstStartedAt: first?.startedAt ?? null,
      workDate: date,
      expectedStart: employee.expectedStart,
      graceMinutes: employee.graceMinutes,
    });
    if (status === "present") presentDays += 1;
    if (status === "partial") partialDays += 1;
    if (status === "absent") absentDays += 1;
    if (late) lateDays += 1;
    days.push({ date, status, late, workedHours: hours });
  }

  const targetHours = monthlyTargetHours(
    countWeekdaysInMonth(year, month),
    employee.dailyTargetHours,
  );
  const earned = earnedPayPkr({
    workedHours,
    targetHours,
    monthlySalaryPkr: employee.monthlySalaryPkr,
  });

  const monthName = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));

  return {
    yearMonth,
    monthName,
    workedHours: Math.round(workedHours * 100) / 100,
    targetHours,
    balanceHours: Math.round(balanceHours(workedHours, targetHours) * 100) / 100,
    earnedPayPkr: earned,
    monthlySalaryPkr: employee.monthlySalaryPkr,
    presentDays,
    partialDays,
    absentDays,
    lateDays,
    days,
  };
}

export async function getDaySessions(date: string) {
  const employee = await profile();
  const sessions = await prisma.timeSession.findMany({
    where: {
      employeeId: employee.id,
      workDate: new Date(`${date}T00:00:00.000Z`),
    },
    orderBy: { startedAt: "asc" },
  });
  const now = new Date();
  return sessions.map((s) => {
    const sec = totalWorkedSeconds([s], now);
    return {
      id: s.id,
      startedAt: formatPktTime(s.startedAt),
      endedAt: s.endedAt ? formatPktTime(s.endedAt) : "—",
      duration: formatDuration(sec),
      endReason: s.endReason,
      open: !s.endedAt,
    };
  });
}

export function shiftYearMonth(yearMonth: string, delta: number): string {
  const { year, month } = monthParts(`${yearMonth}-01`);
  const d = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
