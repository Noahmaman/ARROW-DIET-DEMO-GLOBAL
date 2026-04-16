import { NextRequest, NextResponse } from "next/server";
import { analyzeFood } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rateLimit";
import { validateMime, validateMagicBytes, hashUserId } from "@/lib/security";

const MAX_IMAGE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const rl = checkRateLimit(`scan:ip:${ip}`, {
      maxPerMinute: 6,
      maxPerDay: 50,
    });

    if (rl.blocked) {
      return NextResponse.json(
        { error: "Trop de scans. Attends une minute." },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const lang = (formData.get("lang") as string) ?? "fr";

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (file.size > MAX_IMAGE) {
      return NextResponse.json({ error: "Image too large (max 10MB)" }, { status: 413 });
    }

    if (!validateMime(file.type)) {
      return NextResponse.json(
        { error: "Format non supporté. Utilise JPEG, PNG ou WebP." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { error: "Fichier invalide." },
        { status: 400 }
      );
    }

    const base64 = buffer.toString("base64");
    const result = await analyzeFood(base64, file.type, lang as "fr" | "en");

    return NextResponse.json(result);
  } catch (err) {
    console.error("Scan API error:", err);
    return NextResponse.json(
      { error: "Impossible d'analyser cette image." },
      { status: 500 }
    );
  }
}
