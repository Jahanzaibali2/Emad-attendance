"use server";

import { auth } from "@/auth";
import {
  clockIn,
  finishBreakAsClockOut,
  pauseSession,
} from "@/lib/services/sessions";
import { revalidatePath } from "next/cache";

function revalidateClock() {
  revalidatePath("/today");
  revalidatePath("/monitor");
  revalidatePath("/calendar");
}

async function requireEmployee() {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYEE") return null;
  return session;
}

export async function clockInAction() {
  if (!(await requireEmployee())) {
    return { ok: false as const, error: "Not allowed." };
  }
  const result = await clockIn();
  if (result.ok) revalidateClock();
  return result.ok
    ? { ok: true as const }
    : { ok: false as const, error: result.error };
}

export async function clockOutAction() {
  if (!(await requireEmployee())) {
    return { ok: false as const, error: "Not allowed." };
  }
  const result = await finishBreakAsClockOut();
  if (result.ok) revalidateClock();
  return result.ok
    ? { ok: true as const }
    : { ok: false as const, error: result.error };
}

export async function pauseAction() {
  if (!(await requireEmployee())) {
    return { ok: false as const, error: "Not allowed." };
  }
  const result = await pauseSession();
  if (result.ok) revalidateClock();
  return result.ok
    ? { ok: true as const }
    : { ok: false as const, error: result.error };
}
