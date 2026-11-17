"use server";

import { auth } from "@/auth";
import {
  ensureDailySummary,
  upsertDailySummaryBody,
} from "@/lib/services/daily-summary";
import { prisma } from "@/lib/prisma";
import { pktDateString } from "@/lib/time/pkt";
import {
  ALLOWED_IMAGE_TYPES,
  ensureUploadDir,
  extForMime,
  imageDiskPath,
  MAX_IMAGE_BYTES,
  MAX_SUMMARY_IMAGES,
} from "@/lib/uploads";
import { randomUUID } from "crypto";
import { unlink, writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";

function revalidateSummaryPages() {
  revalidatePath("/today");
  revalidatePath("/monitor");
  revalidatePath("/calendar");
}

async function requireEmployee() {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYEE") {
    return null;
  }
  return session;
}

export async function saveDailySummaryAction(formData: FormData) {
  if (!(await requireEmployee())) {
    return { ok: false as const, error: "Not allowed." };
  }

  const today = pktDateString();
  const body = String(formData.get("body") ?? "").trim();
  await upsertDailySummaryBody(body, today);

  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > 0) {
    const summary = await ensureDailySummary(today);
    const existing = summary.images.length;
    if (existing + files.length > MAX_SUMMARY_IMAGES) {
      return {
        ok: false as const,
        error: `At most ${MAX_SUMMARY_IMAGES} photos per day.`,
      };
    }

    await ensureUploadDir();
    let order = existing;
    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        return { ok: false as const, error: "Only JPEG, PNG, or WebP images." };
      }
      if (file.size > MAX_IMAGE_BYTES) {
        return { ok: false as const, error: "Each photo must be under 5MB." };
      }
      const id = randomUUID();
      const filename = `${id}.${extForMime(file.type)}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(imageDiskPath(filename), buffer);
      await prisma.summaryImage.create({
        data: {
          id,
          summaryId: summary.id,
          filename,
          mimeType: file.type,
          sortOrder: order,
        },
      });
      order += 1;
    }
  }

  revalidateSummaryPages();
  return { ok: true as const };
}

export async function removeSummaryImageAction(imageId: string) {
  if (!(await requireEmployee())) {
    return { ok: false as const, error: "Not allowed." };
  }

  const today = pktDateString();
  const image = await prisma.summaryImage.findUnique({
    where: { id: imageId },
    include: { summary: true },
  });
  if (!image) return { ok: false as const, error: "Photo not found." };

  const workDate = image.summary.workDate.toISOString().slice(0, 10);
  if (workDate !== today) {
    return { ok: false as const, error: "Only today’s photos can be removed." };
  }

  try {
    await unlink(imageDiskPath(image.filename));
  } catch {
    // ponytail: missing file is fine; DB row is source of truth to clear
  }
  await prisma.summaryImage.delete({ where: { id: imageId } });
  revalidateSummaryPages();
  return { ok: true as const };
}
