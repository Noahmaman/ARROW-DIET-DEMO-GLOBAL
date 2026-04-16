import { createHash, createHmac, timingSafeEqual } from "crypto";

const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"];

// Magic bytes for allowed image types
const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
};

export function validateMime(mime: string): boolean {
  return ALLOWED_IMAGE_MIMES.includes(mime);
}

export function validateMagicBytes(buffer: Buffer, mime: string): boolean {
  const sigs = MAGIC_BYTES[mime];
  if (!sigs) return false;
  return sigs.some((sig) => sig.every((byte, i) => buffer[i] === byte));
}

export function hashUserId(userId: string): string {
  const salt = process.env.HASH_SALT ?? "default_salt";
  return createHash("sha256")
    .update(`${salt}:${userId}`)
    .digest("hex")
    .substring(0, 16);
}

export function generateHmacToken(payload: string): string {
  const secret = process.env.HASH_SALT ?? "default_salt";
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyHmacToken(payload: string, token: string): boolean {
  const expected = generateHmacToken(payload);
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}

export function validateAdminSecret(secret: string): boolean {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return false;
  try {
    return timingSafeEqual(
      Buffer.from(adminSecret),
      Buffer.from(secret)
    );
  } catch {
    return false;
  }
}
