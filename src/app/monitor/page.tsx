import { AppHeader } from "@/components/AppHeader";
import { DailySummaryView } from "@/components/DailySummaryView";
import { LiveTimer } from "@/components/LiveTimer";
import { MonthCalendar } from "@/components/MonthCalendar";
import { getDailySummary } from "@/lib/services/daily-summary";
import {
  getDaySessions,
  getMonthSummary,
  getTodaySnapshot,
  shiftYearMonth,
} from "@/lib/services/summary";
import { pktDateString } from "@/lib/time/pkt";

export const dynamic = "force-dynamic";

function liveLabel(live: string, openSince: string | null) {
  if (live === "working") {
    return openSince ? `Working since ${openSince}` : "Working";
  }
  if (live === "on_break") return "On break";
  return "Not working";
}

export default async function MonitorPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; day?: string }>;
}) {
  const params = await searchParams;
  const snap = await getTodaySnapshot();
  const today = pktDateString();
  const yearMonth = params.month ?? today.slice(0, 7);
  const selected = params.day ?? null;
  const month = await getMonthSummary(yearMonth);
  const daily = await getDailySummary();
  const daySessions = selected ? await getDaySessions(selected) : null;
  const daySummary = selected ? await getDailySummary(selected) : null;
  const selectedMeta = selected
    ? month.days.find((d) => d.date === selected)
    : null;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8 lg:px-10 animate-rise">
      <AppHeader title="Emad's Attendance" subtitle="Owner" />

      <div className="mt-10 grid flex-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14 lg:items-start">
        <section className="lg:pr-6 lg:border-r lg:border-line">
          <h2 className="font-display text-3xl text-ink md:text-4xl">
            {snap.displayName}
          </h2>
          <p className="mt-2 text-sm text-slate">
            {liveLabel(snap.live, snap.openSince)}
          </p>
          <p className="mt-1 text-xs text-slate/80">
            Today · {snap.todayLabel} · Pakistan Standard Time
          </p>

          <div className="mt-10">
            <LiveTimer
              closedSeconds={snap.closedSeconds}
              openStartedAt={snap.openStartedAt}
              running={snap.live === "working"}
            />
            <p className="mt-3 text-sm text-slate">
              today · {snap.status.replace("_", " ")}
              {snap.late ? " · late" : ""}
            </p>
          </div>

          <div className="mt-12 border-t border-line pt-8">
            <p className="text-sm text-slate">Today’s summary</p>
            <div className="mt-4">
              <DailySummaryView
                body={daily?.body ?? ""}
                images={daily?.images ?? []}
              />
            </div>
          </div>
        </section>

        <aside className="lg:pl-2">
          <MonthCalendar
            yearMonth={yearMonth}
            monthName={month.monthName}
            days={month.days}
            prevMonth={shiftYearMonth(yearMonth, -1)}
            nextMonth={shiftYearMonth(yearMonth, 1)}
            selected={selected}
            basePath="/monitor"
          />

          <div className="mt-8 border-t border-line pt-6">
            <p className="font-display text-2xl text-ink">
              {month.workedHours}h{" "}
              <span className="text-lg text-slate">/ {month.targetHours}h</span>
            </p>
            <p className="mt-1 text-xl text-gold-deep">
              Earned Rs {month.earnedPayPkr.toLocaleString("en-PK")}
            </p>
            <p className="mt-2 text-sm text-slate">
              Pay settled outside this app
            </p>
          </div>

          {selected && daySessions ? (
            <div className="mt-8 border-t border-line pt-6">
              <h3 className="font-display text-xl text-ink">{selected}</h3>
              <p className="mt-1 text-sm text-slate">
                {selectedMeta?.status.replace("_", " ")}
                {selectedMeta?.late ? " · late" : ""}
                {" · "}
                {(selectedMeta?.workedHours ?? 0).toFixed(2)}h
              </p>
              <ul className="mt-4 space-y-2 text-sm">
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
              <div className="mt-6">
                <p className="text-sm text-slate">Day summary</p>
                <div className="mt-3">
                  <DailySummaryView
                    body={daySummary?.body ?? ""}
                    images={daySummary?.images ?? []}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate">
              Tap a day to review sessions and summaries.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
