import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Admin route protection
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("admin_session");
    if (request.nextUrl.pathname === "/admin/login") {
      return NextResponse.next();
    }
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    try {
      const session = JSON.parse(sessionCookie.value);
      const { verifyAdminToken } = await import("@/lib/session");
      if (!verifyAdminToken(session.token, session.timestamp)) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
