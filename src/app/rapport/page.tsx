"use client";
import { useState } from "react";
import { CheckCircle, AlertCircle, Target, RotateCcw } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import DemoBanner from "@/components/DemoBanner";
import PageHeader from "@/components/PageHeader";
import Footer from "@/components/Footer";

interface ReportResult {
  score: number;
  positifs: string[];
  ameliorations: string[];
  objectifs: string[];
}

function ScoreColor(score: number): string {
  if (score >= 7) return "#8DC63F";
  if (score >= 5) return "#f59e0b";
  return "#ef4444";
}

export default function RapportPage() {
  const [lang] = useState<"fr" | "en">("fr");
  const [rawInput, setRawInput] = useState("");
  const [name, setName] = useState("");
  const [result, setResult] = useState<ReportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    if (rawInput.trim().length < 10) {
      setError(
        lang === "en"
          ? "Please describe what you ate this week."
          : "Décris ce que tu as mangé cette semaine."
      );
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/rapport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawInput,
          patientName: name || "Anonyme",
          week: new Date().toISOString().split("T")[0],
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? (lang === "en" ? "Error." : "Erreur."));
        return;
      }
      setResult(data);
    } catch {
      setError(lang === "en" ? "Connection error." : "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen max-w-[390px] mx-auto bg-[#DFFFA0]">
      <DemoBanner />
      <PageHeader
        title={lang === "en" ? "Weekly Report" : "Rapport Semaine"}
        back={false}
        right={
          result ? (
            <button
              onClick={() => {
                setResult(null);
                setRawInput("");
                setName("");
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/60 hover:bg-white/80 transition-colors"
            >
              <RotateCcw size={14} className="text-[#1A1A1A]" />
            </button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-y-auto pb-[80px] px-4 py-4">
        {!result ? (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-gray-600 leading-relaxed">
                {lang === "en"
                  ? "Describe everything you ate this week: meals, snacks, drinks. Sophie will analyze your nutrition and give you personalized feedback."
                  : "Décris tout ce que tu as mangé cette semaine : repas, snacks, boissons. Sophie analysera ta nutrition et te donnera un retour personnalisé."}
              </p>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {lang === "en" ? "Your first name (optional)" : "Ton prénom (optionnel)"}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === "en" ? "Firstname..." : "Prénom..."}
                className="w-full px-4 py-3 rounded-2xl bg-white text-[#1A1A1A] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8DC63F] shadow-sm"
              />
            </div>

            {/* Diary input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {lang === "en" ? "This week's diary *" : "Journal de la semaine *"}
              </label>
              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder={
                  lang === "en"
                    ? "Monday: oatmeal for breakfast, salad for lunch...\nTuesday: ..."
                    : "Lundi : flocons d'avoine au petit-dej, salade au déjeuner...\nMardi : ..."
                }
                rows={8}
                className="w-full px-4 py-3 rounded-2xl bg-white text-[#1A1A1A] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8DC63F] shadow-sm resize-none"
              />
              <p className="text-xs text-gray-400 text-right">
                {rawInput.length} {lang === "en" ? "chars" : "car."}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-2xl">
                {error}
              </div>
            )}

            <button
              onClick={generate}
              disabled={loading || rawInput.trim().length < 10}
              className="w-full py-4 rounded-2xl bg-[#8DC63F] text-white font-semibold text-sm hover:bg-[#7ab535] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              {loading
                ? lang === "en"
                  ? "Generating..."
                  : "Génération..."
                : lang === "en"
                ? "Generate my report"
                : "Générer mon rapport"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Score card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm text-center">
              <div
                className="text-5xl font-black mb-1"
                style={{ color: ScoreColor(result.score) }}
              >
                {result.score}
                <span className="text-2xl text-gray-300">/10</span>
              </div>
              <p className="text-sm font-medium text-gray-500">
                {lang === "en" ? "Nutrition score" : "Score nutritionnel"}
              </p>
              <div
                className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden"
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${result.score * 10}%`,
                    backgroundColor: ScoreColor(result.score),
                  }}
                />
              </div>
            </div>

            {/* Positifs */}
            {result.positifs.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={16} className="text-[#8DC63F]" />
                  <h3 className="text-sm font-bold text-[#1A1A1A]">
                    {lang === "en" ? "Positive points" : "Points positifs"}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {result.positifs.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-[#8DC63F] mt-0.5 shrink-0">✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Améliorations */}
            {result.ameliorations.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={16} className="text-amber-500" />
                  <h3 className="text-sm font-bold text-[#1A1A1A]">
                    {lang === "en" ? "To improve" : "À améliorer"}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {result.ameliorations.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-amber-500 mt-0.5 shrink-0">⚠</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Objectifs */}
            {result.objectifs.length > 0 && (
              <div className="bg-[#1A1A1A] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={16} className="text-[#8DC63F]" />
                  <h3 className="text-sm font-bold text-white">
                    {lang === "en" ? "Goals for next week" : "Objectifs semaine prochaine"}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {result.objectifs.map((o, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-[#8DC63F] mt-0.5 shrink-0">🎯</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Footer />
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
