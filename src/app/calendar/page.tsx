import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { DailySummaryView } from "@/components/DailySummaryView";
import { MonthCalendar } from "@/components/MonthCalendar";
import { getDailySummary } from "@/lib/services/daily-summary";
import {
  getDaySessions,
  getMonthSummary,
  shiftYearMonth,
} from "@/lib/services/summary";
import { pktDateString } from "@/lib/time/pkt";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; day?: string }>;
}) {
  const params = await searchParams;
  const today = pktDateString();
  const yearMonth = params.month ?? today.slice(0, 7);
  const summary = await getMonthSummary(yearMonth);
  const selected = params.day;
  const daySessions = selected ? await getDaySessions(selected) : null;
  const daySummary = selected ? await getDailySummary(selected) : null;
  const selectedMeta = summary.days.find((d) => d.date === selected);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 lg:px-10 animate-rise">
      <AppHeader title="Emad's Attendance" subtitle="Calendar" />

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14 lg:items-start">
        <section className="lg:pr-6 lg:border-r lg:border-line">
          <MonthCalendar
            yearMonth={yearMonth}
            monthName={summary.monthName}
            days={summary.days}
            prevMonth={shiftYearMonth(yearMonth, -1)}
            nextMonth={shiftYearMonth(yearMonth, 1)}
            selected={selected}
            basePath="/calendar"
          />
          <p className="mt-4 text-xs text-slate">
            All times are Pakistan Standard Time.
          </p>

          <div className="mt-8 border-t border-line pt-6">
            <p className="font-display text-2xl text-ink">
              {summary.workedHours}h{" "}
              <span className="text-lg text-slate">
                / {summary.targetHours}h
              </span>
            </p>
            <p className="mt-1 text-gold-deep">
              Earned Rs {summary.earnedPayPkr.toLocaleString("en-PK")} of{" "}
              {summary.monthlySalaryPkr.toLocaleString("en-PK")}
            </p>
          </div>
        </section>

        <aside>
          {selected && daySessions ? (
            <section>
              <h3 className="font-display text-2xl text-ink">{selected}</h3>
              <p className="mt-1 text-sm text-slate">
                {selectedMeta?.status.replace("_", " ")}
                {selectedMeta?.late ? " · late" : ""}
                {" · "}
                {(selectedMeta?.workedHours ?? 0).toFixed(2)}h
              </p>
              <ul className="mt-6 space-y-2 text-sm">
                {daySessions.length === 0 ? (
                  <li className="text-slate">No sessions</li>
                ) : (
                  daySessions.map((s) => (
                    <li
                      key={s.id}
                      className="flex justify-between border-b border-line/70 py-2"
                    >
                      <span>
                        {s.startedAt} – {s.endedAt}
                        {s.endReason === "AUTO_CLOSED"
                          ? " (auto-closed)"
                          : s.endReason === "PAUSE"
                            ? " (pause)"
                            : ""}
                      </span>
                      <span className="text-slate">{s.duration}</span>
                    </li>
                  ))
                )}
              </ul>
              <div className="mt-8 border-t border-line pt-6">
                <p className="text-sm text-slate">Day summary</p>
                <div className="mt-3">
                  <DailySummaryView
                    body={daySummary?.body ?? ""}
                    images={daySummary?.images ?? []}
                  />
                </div>
              </div>
            </section>
          ) : (
            <p className="text-slate">
              Select a day to see sessions and the written summary.
            </p>
          )}

          <Link
            href="/"
            className="mt-10 inline-block text-sm text-gold-deep underline-offset-4 hover:underline"
          >
            Back
          </Link>
        </aside>
      </div>
    </main>
  );
}
