"use client";
import { useState, useEffect, useCallback } from "react";
import { LogOut, Calendar, BarChart2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  date: string;
  message: string;
  status: "pending" | "confirmed" | "done";
  created_at: string;
}

interface Report {
  id: string;
  patient_name: string;
  week: string;
  score: number;
  content_json: {
    positifs: string[];
    ameliorations: string[];
    objectifs: string[];
  };
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  done: "Terminé",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

function ScoreColor(score: number): string {
  if (score >= 7) return "text-green-600";
  if (score >= 5) return "text-amber-600";
  return "text-red-600";
}

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"appointments" | "reports">("appointments");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [adminSecret, setAdminSecret] = useState("");

  useEffect(() => {
    // Get secret from cookie (not ideal for client, but admin is internal)
    // In production, use a server component
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin_session="));
    if (cookie) {
      try {
        const session = JSON.parse(decodeURIComponent(cookie.split("=")[1]));
        // We use ADMIN_SECRET from env via API header
        // For demo: store temporarily in sessionStorage
        const stored = sessionStorage.getItem("admin_secret");
        if (stored) setAdminSecret(stored);
      } catch {}
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const secret = sessionStorage.getItem("admin_secret") ?? adminSecret;
    try {
      const [rdvRes, repRes] = await Promise.all([
        fetch("/api/appointments", {
          headers: { "x-admin-secret": secret },
        }),
        fetch("/api/admin/reports", {
          headers: { "x-admin-secret": secret },
        }),
      ]);

      if (!rdvRes.ok || !repRes.ok) {
        router.replace("/admin/login");
        return;
      }

      setAppointments(await rdvRes.json());
      setReports(await repRes.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [adminSecret, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function updateStatus(id: string, status: string) {
    const secret = sessionStorage.getItem("admin_secret") ?? adminSecret;
    await fetch("/api/appointments", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": secret,
      },
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  }

  function logout() {
    document.cookie = "admin_session=; max-age=0; path=/admin";
    sessionStorage.removeItem("admin_secret");
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-base">Dashboard Sophie</h1>
          <p className="text-xs text-gray-400">Caroline Dubois · Admin</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={logout}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 px-6 py-4">
        <div className="bg-white/5 rounded-2xl p-4">
          <div className="text-2xl font-bold text-[#8DC63F]">{appointments.length}</div>
          <div className="text-xs text-gray-400 mt-0.5">RDV total</div>
          <div className="text-xs text-amber-400 mt-1">
            {appointments.filter((a) => a.status === "pending").length} en attente
          </div>
        </div>
        <div className="bg-white/5 rounded-2xl p-4">
          <div className="text-2xl font-bold text-[#8DC63F]">{reports.length}</div>
          <div className="text-xs text-gray-400 mt-0.5">Rapports</div>
          <div className="text-xs text-gray-400 mt-1">
            Score moy:{" "}
            {reports.length
              ? (
                  reports.reduce((a, r) => a + (r.score ?? 0), 0) / reports.length
                ).toFixed(1)
              : "—"}
            /10
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-6 gap-2 mb-4">
        <button
          onClick={() => setTab("appointments")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            tab === "appointments"
              ? "bg-[#8DC63F] text-white"
              : "bg-white/10 text-gray-400 hover:bg-white/20"
          }`}
        >
          <Calendar size={12} /> RDV
        </button>
        <button
          onClick={() => setTab("reports")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            tab === "reports"
              ? "bg-[#8DC63F] text-white"
              : "bg-white/10 text-gray-400 hover:bg-white/20"
          }`}
        >
          <BarChart2 size={12} /> Rapports
        </button>
      </div>

      {/* Content */}
      <div className="px-6 pb-10 space-y-3">
        {tab === "appointments" &&
          (appointments.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              Aucun RDV pour l&apos;instant
            </div>
          ) : (
            appointments.map((appt) => (
              <div key={appt.id} className="bg-white/5 rounded-2xl p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{appt.name}</p>
                    <p className="text-xs text-gray-400">{appt.email}</p>
                    {appt.phone && (
                      <p className="text-xs text-gray-400">{appt.phone}</p>
                    )}
                  </div>
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${
                      STATUS_COLORS[appt.status] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {STATUS_LABELS[appt.status] ?? appt.status}
                  </span>
                </div>

                {appt.type && (
                  <p className="text-xs text-[#8DC63F]">{appt.type}</p>
                )}
                {appt.date && (
                  <p className="text-xs text-gray-400">📅 {appt.date}</p>
                )}
                {appt.message && (
                  <p className="text-xs text-gray-400 leading-relaxed">
                    &ldquo;{appt.message}&rdquo;
                  </p>
                )}

                {/* Status toggle */}
                <div className="flex gap-1.5 pt-1">
                  {(["pending", "confirmed", "done"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(appt.id, s)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                        appt.status === s
                          ? STATUS_COLORS[s]
                          : "bg-white/5 text-gray-500 hover:bg-white/10"
                      }`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>

                <p className="text-[9px] text-gray-600">
                  {new Date(appt.created_at).toLocaleString("fr-FR")}
                </p>
              </div>
            ))
          ))}

        {tab === "reports" &&
          (reports.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              Aucun rapport pour l&apos;instant
            </div>
          ) : (
            reports.map((rep) => (
              <div key={rep.id} className="bg-white/5 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{rep.patient_name}</p>
                    <p className="text-xs text-gray-400">Semaine du {rep.week}</p>
                  </div>
                  <span className={`text-2xl font-black ${ScoreColor(rep.score)}`}>
                    {rep.score}
                    <span className="text-xs text-gray-500">/10</span>
                  </span>
                </div>

                {rep.content_json?.objectifs?.length > 0 && (
                  <div>
                    <p className="text-[10px] text-[#8DC63F] font-semibold uppercase tracking-wide mb-1">
                      Objectifs
                    </p>
                    {rep.content_json.objectifs.map((o, i) => (
                      <p key={i} className="text-xs text-gray-400">
                        🎯 {o}
                      </p>
                    ))}
                  </div>
                )}

                <p className="text-[9px] text-gray-600">
                  {new Date(rep.created_at).toLocaleString("fr-FR")}
                </p>
              </div>
            ))
          ))}
      </div>
    </div>
  );
}
