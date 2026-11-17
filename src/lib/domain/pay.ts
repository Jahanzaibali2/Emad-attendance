export function monthlyTargetHours(
  weekdayCount: number,
  dailyTargetHours: number,
): number {
  return weekdayCount * dailyTargetHours;
}

export function earnedPayPkr(args: {
  workedHours: number;
  targetHours: number;
  monthlySalaryPkr: number;
}): number {
  const { workedHours, targetHours, monthlySalaryPkr } = args;
  if (targetHours <= 0) return 0;
  const raw = (workedHours / targetHours) * monthlySalaryPkr;
  return Math.min(monthlySalaryPkr, Math.round(raw));
}

export function balanceHours(workedHours: number, targetHours: number): number {
  return workedHours - targetHours;
}
