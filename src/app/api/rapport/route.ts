import { NextRequest, NextResponse } from "next/server";
import { analyzeWeeklyReport } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const rl = checkRateLimit(`rapport:ip:${ip}`, {
      maxPerMinute: 4,
      maxPerDay: 20,
    });

    if (rl.blocked) {
      return NextResponse.json(
        { error: "Limite atteinte. Réessaie dans un moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { rawInput, patientName, week, lang = "fr" } = body;

    if (!rawInput || typeof rawInput !== "string" || rawInput.trim().length < 10) {
      return NextResponse.json(
        { error: "Décris ce que tu as mangé cette semaine." },
        { status: 400 }
      );
    }

    const result = await analyzeWeeklyReport(rawInput, lang);

    // Save to Supabase if service key available
    try {
      const { createServiceClient } = await import("@/lib/supabase/server");
      const supabase = await createServiceClient();
      await supabase.from("reports").insert({
        patient_name: patientName ?? "Anonyme",
        week: week ?? new Date().toISOString().split("T")[0],
        raw_input: rawInput,
        content_json: result,
        score: result.score,
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Rapport API error:", err);
    return NextResponse.json(
      { error: "Impossible de générer le rapport." },
      { status: 500 }
    );
  }
}
