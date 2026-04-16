import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = await createServiceClient();

    const [appointments, reports] = await Promise.all([
      supabase.from("appointments").select("*").eq("email", email),
      supabase.from("reports").select("*").eq("patient_name", email),
    ]);

    return NextResponse.json({
      email,
      exported_at: new Date().toISOString(),
      appointments: appointments.data ?? [],
      reports: reports.data ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
