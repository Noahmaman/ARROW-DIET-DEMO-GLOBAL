import { generateHmacToken, verifyHmacToken } from "./security";

const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export interface AdminSession {
  createdAt: number;
  valid: boolean;
}

export function createAdminToken(timestamp: number): string {
  return generateHmacToken(`admin:${timestamp}`);
}

export function verifyAdminToken(token: string, timestamp: number): boolean {
  if (Date.now() - timestamp > SESSION_TTL_MS) return false;
  return verifyHmacToken(`admin:${timestamp}`, token);
}
