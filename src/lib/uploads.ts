import { mkdir } from "fs/promises";
import path from "path";

export const MAX_SUMMARY_IMAGES = 10;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function uploadDir(): string {
  return process.env.UPLOAD_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), "uploads");
}

export async function ensureUploadDir() {
  await mkdir(uploadDir(), { recursive: true });
}

export function imageDiskPath(filename: string): string {
  return path.join(/* turbopackIgnore: true */ uploadDir(), filename);
}

export function extForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}
