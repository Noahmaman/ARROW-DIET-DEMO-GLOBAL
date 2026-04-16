import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = await createServiceClient();

    await Promise.all([
      supabase.from("appointments").delete().eq("email", email),
      supabase.from("reports").delete().eq("patient_name", email),
    ]);

    return NextResponse.json({ success: true, message: "Données supprimées." });
  } catch {
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
