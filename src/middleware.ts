import { type NextRequest, NextResponse } from "next/server";

const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

async function verifyHmacEdge(
  payload: string,
  token: string,
  secret: string
): Promise<boolean> {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
    const expected = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    if (expected.length !== token.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin route protection
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }
    const sessionCookie = request.cookies.get("admin_session");
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    try {
      const session = JSON.parse(sessionCookie.value) as {
        token: string;
        timestamp: number;
      };
      if (Date.now() - session.timestamp > SESSION_TTL_MS) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
      const secret = process.env.HASH_SALT ?? "default_salt";
      const valid = await verifyHmacEdge(
        `admin:${session.timestamp}`,
        session.token,
        secret
      );
      if (!valid) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Only run Supabase session refresh if env vars are configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const { updateSession } = await import("@/lib/supabase/middleware");
      return await updateSession(request);
    } catch {
      // Fall through to NextResponse.next()
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
