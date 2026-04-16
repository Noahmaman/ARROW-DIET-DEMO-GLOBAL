import { NextRequest, NextResponse } from "next/server";
import { chatWithSophie } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rateLimit";
import { hashUserId } from "@/lib/security";

const MAX_BODY = 256 * 1024; // 256KB

export async function POST(req: NextRequest) {
  try {
    // Body size check
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_BODY) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const body = await req.json();
    const { messages, lang = "fr", userContext, sessionId } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    // Rate limiting
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const rateLimitKey = sessionId
      ? `chat:session:${hashUserId(sessionId)}`
      : `chat:ip:${ip}`;

    const rl = checkRateLimit(rateLimitKey, {
      maxPerMinute: 8,
      maxPerDay: 50,
    });

    if (rl.blocked) {
      const message =
        rl.reason === "daily_limit"
          ? "Tu as atteint la limite journalière. Contacte Caroline pour un accès complet."
          : "Trop de messages. Attends une minute avant de réessayer.";
      return NextResponse.json({ error: message }, { status: 429 });
    }

    const reply = await chatWithSophie(messages, lang, userContext);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Une erreur est survenue. Réessaie dans un moment." },
      { status: 500 }
    );
  }
}
