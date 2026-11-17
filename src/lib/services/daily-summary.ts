import { prisma } from "@/lib/prisma";
import { pktDateString } from "@/lib/time/pkt";

async function getEmployee() {
  const employee = await prisma.employeeProfile.findFirst();
  if (!employee) throw new Error("Employee profile not seeded");
  return employee;
}

function workDateValue(dateStr: string) {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export type DailySummaryView = {
  id: string;
  workDate: string;
  body: string;
  images: { id: string; url: string }[];
};

export async function getDailySummary(
  dateStr: string = pktDateString(),
): Promise<DailySummaryView | null> {
  const employee = await getEmployee();
  const row = await prisma.dailySummary.findUnique({
    where: {
      employeeId_workDate: {
        employeeId: employee.id,
        workDate: workDateValue(dateStr),
      },
    },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!row) return null;
  return {
    id: row.id,
    workDate: dateStr,
    body: row.body,
    images: row.images.map((img) => ({
      id: img.id,
      url: `/api/uploads/${img.id}`,
    })),
  };
}

export async function upsertDailySummaryBody(body: string, dateStr?: string) {
  const employee = await getEmployee();
  const workDate = dateStr ?? pktDateString();
  return prisma.dailySummary.upsert({
    where: {
      employeeId_workDate: {
        employeeId: employee.id,
        workDate: workDateValue(workDate),
      },
    },
    create: {
      employeeId: employee.id,
      workDate: workDateValue(workDate),
      body,
    },
    update: { body },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function ensureDailySummary(dateStr?: string) {
  const employee = await getEmployee();
  const workDate = dateStr ?? pktDateString();
  return prisma.dailySummary.upsert({
    where: {
      employeeId_workDate: {
        employeeId: employee.id,
        workDate: workDateValue(workDate),
      },
    },
    create: {
      employeeId: employee.id,
      workDate: workDateValue(workDate),
      body: "",
    },
    update: {},
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
}
