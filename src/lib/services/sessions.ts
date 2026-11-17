import { EndReason } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { pktDateString, pktNextMidnightUtc } from "@/lib/time/pkt";

async function getEmployee() {
  const employee = await prisma.employeeProfile.findFirst();
  if (!employee) throw new Error("Employee profile not seeded");
  return employee;
}

export async function getOpenSession(employeeId: string) {
  return prisma.timeSession.findFirst({
    where: { employeeId, endedAt: null },
    orderBy: { startedAt: "desc" },
  });
}

export async function clockIn() {
  const employee = await getEmployee();
  const open = await getOpenSession(employee.id);
  if (open) {
    return { ok: false as const, error: "Already clocked in. Clock out first." };
  }

  const now = new Date();
  const workDate = pktDateString(now);
  const session = await prisma.timeSession.create({
    data: {
      employeeId: employee.id,
      workDate: new Date(`${workDate}T00:00:00.000Z`),
      startedAt: now,
    },
  });
  return { ok: true as const, session };
}

async function endOpenSession(reason: EndReason) {
  const employee = await getEmployee();
  const open = await getOpenSession(employee.id);
  if (!open) {
    return { ok: false as const, error: "No open session to end." };
  }

  const now = new Date();
  if (now.getTime() < open.startedAt.getTime()) {
    return { ok: false as const, error: "End time cannot be before clock-in." };
  }

  const session = await prisma.timeSession.update({
    where: { id: open.id },
    data: { endedAt: now, endReason: reason },
  });
  return { ok: true as const, session };
}

export async function clockOut() {
  return endOpenSession(EndReason.CLOCK_OUT);
}

export async function pauseSession() {
  return endOpenSession(EndReason.PAUSE);
}

/** Finish the day while on break (no open session): mark last PAUSE as CLOCK_OUT */
export async function finishBreakAsClockOut() {
  const employee = await getEmployee();
  const open = await getOpenSession(employee.id);
  if (open) {
    return endOpenSession(EndReason.CLOCK_OUT);
  }

  const today = pktDateString();
  const last = await prisma.timeSession.findFirst({
    where: {
      employeeId: employee.id,
      workDate: new Date(`${today}T00:00:00.000Z`),
      endedAt: { not: null },
    },
    orderBy: { endedAt: "desc" },
  });

  if (!last || last.endReason !== EndReason.PAUSE) {
    return { ok: false as const, error: "No open session to clock out." };
  }

  const session = await prisma.timeSession.update({
    where: { id: last.id },
    data: { endReason: EndReason.CLOCK_OUT },
  });
  return { ok: true as const, session };
}

/** Close sessions whose workDate is before today's PKT date */
export async function autoCloseStaleSessions(now: Date = new Date()) {
  const today = pktDateString(now);
  const open = await prisma.timeSession.findMany({
    where: { endedAt: null },
  });

  let closed = 0;
  for (const session of open) {
    const workDate = session.workDate.toISOString().slice(0, 10);
    if (workDate >= today) continue;
    const endedAt = pktNextMidnightUtc(workDate);
    await prisma.timeSession.update({
      where: { id: session.id },
      data: { endedAt, endReason: EndReason.AUTO_CLOSED },
    });
    closed += 1;
  }
  return closed;
}
