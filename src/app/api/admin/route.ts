import { NextRequest, NextResponse } from "next/server";
import { validateAdminSecret, generateHmacToken } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const { secret } = await req.json();

    if (!validateAdminSecret(secret)) {
      // Artificial delay to slow brute force
      await new Promise((r) => setTimeout(r, 1000));
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const timestamp = Date.now();
    const token = generateHmacToken(`admin:${timestamp}`);

    const response = NextResponse.json({ success: true, token, timestamp });
    response.cookies.set("admin_session", JSON.stringify({ token, timestamp }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 2 * 60 * 60, // 2 hours
      path: "/admin",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
