"use client";
import { useState, useRef } from "react";
import { Camera, Upload, RotateCcw } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import DemoBanner from "@/components/DemoBanner";
import DonutChart from "@/components/DonutChart";
import SuggestionChips from "@/components/SuggestionChips";
import PageHeader from "@/components/PageHeader";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";

interface FoodResult {
  name: string;
  description: string;
  macros: { proteins: number; carbs: number; fats: number; water: number };
  ingredients: string[];
  analysis: string;
}

const CHIPS_FR = [
  "Comment stocker ce produit ?",
  "Analyse complète des ingrédients ?",
  "C'est bon pour mon objectif ?",
  "Alternatives plus saines ?",
];

const CHIPS_EN = [
  "How to store this product?",
  "Full ingredient analysis?",
  "Is this good for my goal?",
  "Healthier alternatives?",
];

export default function ScanPage() {
  const router = useRouter();
  const [result, setResult] = useState<FoodResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"analyse" | "ingredients">("analyse");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [lang] = useState<"fr" | "en">("fr");
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file) return;
    setError("");
    setResult(null);
    setImageUrl(URL.createObjectURL(file));
    setLoading(true);

    try {
      const form = new FormData();
      form.append("image", file);
      form.append("lang", lang);

      const res = await fetch("/api/scan", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? (lang === "en" ? "Analysis failed." : "Analyse échouée."));
        return;
      }

      setResult(data);
    } catch {
      setError(lang === "en" ? "Connection error." : "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  }

  function handleChip(chip: string) {
    const encoded = encodeURIComponent(
      `${chip} (à propos de ${result?.name ?? "ce produit"})`
    );
    router.push(`/chat?q=${encoded}`);
  }

  function reset() {
    setResult(null);
    setImageUrl(null);
    setError("");
    setActiveTab("analyse");
  }

  const chips = lang === "en" ? CHIPS_EN : CHIPS_FR;

  return (
    <div className="flex flex-col min-h-screen max-w-[390px] mx-auto bg-[#DFFFA0]">
      <DemoBanner />
      <PageHeader
        title={lang === "en" ? "Food Scanner" : "Scanner Aliment"}
        back={false}
      />

      <div className="flex-1 overflow-y-auto pb-[80px]">
        {!result && !loading && (
          <div className="px-4 py-6 space-y-4">
            {/* Upload zone */}
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-square max-h-52 bg-white rounded-3xl flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[#8DC63F]/40 cursor-pointer hover:border-[#8DC63F] hover:bg-[#8DC63F]/5 transition-all"
            >
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="preview"
                  className="w-full h-full object-cover rounded-3xl"
                />
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-[#DFFFA0] flex items-center justify-center">
                    <Upload size={22} className="text-[#8DC63F]" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-[#1A1A1A]">
                      {lang === "en" ? "Upload a photo" : "Importer une photo"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG, WebP — 10MB max</p>
                  </div>
                </>
              )}
            </div>

            {/* Camera button */}
            <button
              onClick={() => cameraRef.current?.click()}
              className="w-full py-3.5 rounded-2xl bg-[#1A1A1A] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-black/80 transition-colors"
            >
              <Camera size={18} />
              {lang === "en" ? "Take a photo" : "Prendre une photo"}
            </button>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-2xl">
                {error}
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full bg-[#8DC63F]/20 flex items-center justify-center animate-pulse">
              <span className="text-3xl">🔍</span>
            </div>
            <p className="text-sm font-medium text-gray-600">
              {lang === "en" ? "Analysing..." : "Analyse en cours..."}
            </p>
          </div>
        )}

        {result && (
          <div className="space-y-0">
            {/* Product image card */}
            <div className="mx-4 mt-4 rounded-3xl overflow-hidden shadow-md bg-white">
              <div className="relative h-44 bg-gradient-to-br from-[#DFFFA0] to-[#8DC63F] flex items-center justify-center">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={result.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">🥗</span>
                )}
                <button
                  onClick={reset}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                  <RotateCcw size={14} className="text-white" />
                </button>
              </div>
              <div className="bg-[#1A1A1A] px-4 py-3">
                <p className="text-white font-bold text-base">{result.name}</p>
                <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">
                  {result.description}
                </p>
              </div>
            </div>

            {/* Donut chart */}
            <div className="mx-4 mt-3 bg-white rounded-3xl p-4 shadow-sm">
              <DonutChart data={result.macros} lang={lang} />
            </div>

            {/* Tab switcher */}
            <div className="mx-4 mt-3">
              <div className="bg-[#1A1A1A] rounded-2xl p-1 flex gap-1">
                <button
                  onClick={() => setActiveTab("analyse")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === "analyse"
                      ? "bg-[#8DC63F] text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {lang === "en" ? "Analysis" : "Analyse"}
                </button>
                <button
                  onClick={() => setActiveTab("ingredients")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === "ingredients"
                      ? "bg-[#8DC63F] text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {lang === "en" ? "Ingredients" : "Ingrédients"}
                </button>
              </div>

              {/* Tab content */}
              <div className="bg-[#1A1A1A] rounded-b-2xl px-4 pt-3 pb-4 -mt-2 rounded-t-none">
                {activeTab === "analyse" ? (
                  <div className="space-y-2">
                    <p className="text-white text-sm leading-relaxed">
                      {result.analysis
                        .split(/(\*\*[^*]+\*\*)/g)
                        .map((part, i) =>
                          part.startsWith("**") && part.endsWith("**") ? (
                            <strong key={i} className="font-semibold">
                              {part.slice(2, -2)}
                            </strong>
                          ) : (
                            <span key={i}>{part}</span>
                          )
                        )}
                    </p>

                    {/* Get Pro button placeholder */}
                    <button
                      onClick={() => router.push("/chat")}
                      className="mt-2 flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-full text-white text-xs font-semibold"
                    >
                      <span>✦</span>
                      {lang === "en" ? "Ask Sophie more" : "Demander à Sophie"}
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-1.5">
                    {result.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-[#8DC63F] mt-0.5">•</span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Suggestion chips */}
            <div className="mt-3 -mx-0">
              <SuggestionChips chips={chips} onSelect={handleChip} />
            </div>

            <div className="mt-4">
              <Footer />
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
