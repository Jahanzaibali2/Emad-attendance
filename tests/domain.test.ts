import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  dayStatus,
  isLate,
  totalWorkedSeconds,
} from "../src/lib/domain/attendance";
import { earnedPayPkr, monthlyTargetHours } from "../src/lib/domain/pay";
import {
  countWeekdaysInMonth,
  pktDateString,
  pktWallTimeToUtc,
} from "../src/lib/time/pkt";

describe("dayStatus", () => {
  it("marks weekend first", () => {
    assert.equal(
      dayStatus({
        workDate: "2026-11-14", // Saturday
        workedHours: 10,
        dailyTargetHours: 8,
        todayPkt: "2026-11-16",
      }),
      "weekend",
    );
  });

  it("present when >= 8h on weekday", () => {
    assert.equal(
      dayStatus({
        workDate: "2026-11-13",
        workedHours: 8,
        dailyTargetHours: 8,
        todayPkt: "2026-11-16",
      }),
      "present",
    );
  });

  it("partial when under target", () => {
    assert.equal(
      dayStatus({
        workDate: "2026-11-13",
        workedHours: 3,
        dailyTargetHours: 8,
        todayPkt: "2026-11-16",
      }),
      "partial",
    );
  });

  it("absent past weekday with 0h", () => {
    assert.equal(
      dayStatus({
        workDate: "2026-11-13",
        workedHours: 0,
        dailyTargetHours: 8,
        todayPkt: "2026-11-16",
      }),
      "absent",
    );
  });

  it("not_started for today with 0h", () => {
    assert.equal(
      dayStatus({
        workDate: "2026-11-16",
        workedHours: 0,
        dailyTargetHours: 8,
        todayPkt: "2026-11-16",
      }),
      "not_started",
    );
  });
});

describe("late + pay", () => {
  it("late after 14:15 PKT", () => {
    const started = pktWallTimeToUtc("2026-11-16", "14:16");
    assert.equal(
      isLate({
        firstStartedAt: started,
        workDate: "2026-11-16",
        expectedStart: "14:00",
        graceMinutes: 15,
      }),
      true,
    );
  });

  it("not late at 14:15", () => {
    const started = pktWallTimeToUtc("2026-11-16", "14:15");
    assert.equal(
      isLate({
        firstStartedAt: started,
        workDate: "2026-11-16",
        expectedStart: "14:00",
        graceMinutes: 15,
      }),
      false,
    );
  });

  it("caps earned pay at 15000", () => {
    assert.equal(
      earnedPayPkr({
        workedHours: 200,
        targetHours: 176,
        monthlySalaryPkr: 15000,
      }),
      15000,
    );
  });

  it("pro-rates earned pay", () => {
    assert.equal(
      earnedPayPkr({
        workedHours: 88,
        targetHours: 176,
        monthlySalaryPkr: 15000,
      }),
      7500,
    );
  });

  it("target hours = 8 * weekdays", () => {
    const weekdays = countWeekdaysInMonth(2026, 11);
    assert.equal(monthlyTargetHours(weekdays, 8), weekdays * 8);
  });
});

describe("sessions", () => {
  it("sums closed + open elapsed", () => {
    const now = new Date("2026-11-16T12:00:00.000Z");
    const sec = totalWorkedSeconds(
      [
        {
          startedAt: new Date("2026-11-16T09:00:00.000Z"),
          endedAt: new Date("2026-11-16T10:00:00.000Z"),
        },
        {
          startedAt: new Date("2026-11-16T11:00:00.000Z"),
          endedAt: null,
        },
      ],
      now,
    );
    assert.equal(sec, 3600 + 3600);
  });

  it("pktDateString uses Karachi", () => {
    // 2026-11-16 22:30 UTC = 2026-11-17 03:30 PKT
    const d = new Date("2026-11-16T22:30:00.000Z");
    assert.equal(pktDateString(d), "2026-11-17");
  });
});
