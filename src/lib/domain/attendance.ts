import {
  isPktWeekend,
  pktDateString,
  pktWallTimeToUtc,
} from "@/lib/time/pkt";

export type DayStatus =
  | "weekend"
  | "upcoming"
  | "present"
  | "partial"
  | "absent"
  | "not_started";

export type SessionLike = {
  startedAt: Date;
  endedAt: Date | null;
};

export function sessionSeconds(
  session: SessionLike,
  now: Date = new Date(),
): number {
  const end = session.endedAt ?? now;
  const ms = end.getTime() - session.startedAt.getTime();
  return Math.max(0, Math.floor(ms / 1000));
}

export function totalWorkedSeconds(
  sessions: SessionLike[],
  now: Date = new Date(),
): number {
  return sessions.reduce((sum, s) => sum + sessionSeconds(s, now), 0);
}

export function hoursFromSeconds(seconds: number): number {
  return seconds / 3600;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

/** Live clock display: H:MM:SS or M:SS */
export function formatDurationHms(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function dayStatus(args: {
  workDate: string;
  workedHours: number;
  dailyTargetHours: number;
  todayPkt: string;
}): DayStatus {
  const { workDate, workedHours, dailyTargetHours, todayPkt } = args;
  if (isPktWeekend(workDate)) return "weekend";
  if (workDate > todayPkt) return "upcoming";
  if (workDate === todayPkt && workedHours === 0) return "not_started";
  if (workedHours <= 0) return "absent";
  if (workedHours >= dailyTargetHours) return "present";
  return "partial";
}

/** Late if first clock-in after expectedStart + grace on that PKT date */
export function isLate(args: {
  firstStartedAt: Date | null;
  workDate: string;
  expectedStart: string;
  graceMinutes: number;
}): boolean {
  const { firstStartedAt, workDate, expectedStart, graceMinutes } = args;
  if (!firstStartedAt) return false;
  const [hh, mm] = expectedStart.split(":").map(Number);
  const totalMin = hh * 60 + mm + graceMinutes;
  const lateH = Math.floor(totalMin / 60);
  const lateM = totalMin % 60;
  const threshold = pktWallTimeToUtc(
    workDate,
    `${String(lateH).padStart(2, "0")}:${String(lateM).padStart(2, "0")}`,
  );
  return firstStartedAt.getTime() > threshold.getTime();
}

export type LiveState = "working" | "on_break" | "not_working";

export function liveState(args: {
  hasOpenSession: boolean;
  lastEndReason?: "CLOCK_OUT" | "PAUSE" | "AUTO_CLOSED" | null;
}): LiveState {
  if (args.hasOpenSession) return "working";
  if (args.lastEndReason === "PAUSE") return "on_break";
  return "not_working";
}

export { pktDateString };
