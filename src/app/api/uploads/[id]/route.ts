import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { imageDiskPath } from "@/lib/uploads";
import { readFile } from "fs/promises";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  const image = await prisma.summaryImage.findUnique({ where: { id } });
  if (!image) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const data = await readFile(imageDiskPath(image.filename));
    return new NextResponse(data, {
      headers: {
        "Content-Type": image.mimeType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
