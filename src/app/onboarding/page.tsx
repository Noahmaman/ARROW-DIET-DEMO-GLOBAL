"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

const DRAFT_KEY = "sophie_onboarding_draft";

const GOALS_FR = [
  { id: "weight", label: "Perdre du poids", emoji: "⚖️" },
  { id: "better", label: "Manger mieux", emoji: "🥗" },
  { id: "sport", label: "Performance sportive", emoji: "🏃" },
  { id: "other", label: "Autre", emoji: "✨" },
];

const GOALS_EN = [
  { id: "weight", label: "Lose weight", emoji: "⚖️" },
  { id: "better", label: "Eat healthier", emoji: "🥗" },
  { id: "sport", label: "Sports performance", emoji: "🏃" },
  { id: "other", label: "Other", emoji: "✨" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [restrictions, setRestrictions] = useState("");
  const [lang] = useState<"fr" | "en">("fr");

  const goals = lang === "en" ? GOALS_EN : GOALS_FR;

  // Load draft
  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        const draft = JSON.parse(raw);
        if (draft.name) setName(draft.name);
        if (draft.goal) setGoal(draft.goal);
        if (draft.restrictions) setRestrictions(draft.restrictions);
      } catch {}
    }
  }, []);

  // Save draft
  useEffect(() => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ name, goal, restrictions })
    );
  }, [name, goal, restrictions]);

  function finish() {
    const profile = { name, goal, restrictions };
    localStorage.setItem("sophie_user", JSON.stringify(profile));
    localStorage.removeItem(DRAFT_KEY);
    router.replace("/chat");
  }

  const stepLabels =
    lang === "en"
      ? ["Your first name", "Your goal", "Restrictions"]
      : ["Ton prénom", "Ton objectif", "Restrictions"];

  return (
    <div className="flex flex-col min-h-screen bg-[#DFFFA0] max-w-[390px] mx-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <div className="text-2xl font-bold text-[#1A1A1A] mb-1">Sophie</div>
        <div className="text-sm text-gray-600">
          {lang === "en"
            ? "Let's personalize your experience"
            : "Personnalisons ton expérience"}
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 mb-8">
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? "bg-[#8DC63F]" : "bg-white/60"
              }`}
            />
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-1.5">
          {lang === "en" ? `Step ${step} of 3` : `Étape ${step} sur 3`}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-6">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#1A1A1A]">
              {lang === "en" ? "What's your first name?" : "Quel est ton prénom ?"}
            </h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={lang === "en" ? "Your first name..." : "Ton prénom..."}
              className="w-full px-4 py-3.5 rounded-2xl bg-white text-[#1A1A1A] text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8DC63F] shadow-sm"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep(2)}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1A1A1A]">
              {lang === "en" ? "What's your goal?" : "Quel est ton objectif ?"}
            </h2>
            <div className="space-y-2.5">
              {goals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setGoal(g.label);
                    setTimeout(() => setStep(3), 200);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left text-sm font-medium transition-all ${
                    goal === g.label
                      ? "bg-[#8DC63F] text-white shadow-md"
                      : "bg-white text-[#1A1A1A] hover:bg-[#8DC63F]/10"
                  }`}
                >
                  <span className="text-xl">{g.emoji}</span>
                  <span>{g.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#1A1A1A]">
              {lang === "en"
                ? "Any food allergies or restrictions?"
                : "Allergies ou restrictions alimentaires ?"}
            </h2>
            <p className="text-sm text-gray-500">
              {lang === "en" ? "Optional — skip if none" : "Optionnel — passe si aucune"}
            </p>
            <textarea
              value={restrictions}
              onChange={(e) => setRestrictions(e.target.value)}
              placeholder={
                lang === "en"
                  ? "e.g. gluten-free, lactose intolerant..."
                  : "Ex: sans gluten, intolérant lactose, végétarien..."
              }
              rows={4}
              className="w-full px-4 py-3.5 rounded-2xl bg-white text-[#1A1A1A] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8DC63F] shadow-sm resize-none"
            />
          </div>
        )}
      </div>

      {/* CTA button */}
      <div className="px-6 pb-12 pt-6">
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && !name.trim()}
            className="w-full py-4 rounded-2xl bg-[#8DC63F] text-white font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#7ab535] transition-colors shadow-md"
          >
            {lang === "en" ? "Continue" : "Continuer"}
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={finish}
            className="w-full py-4 rounded-2xl bg-[#1A1A1A] text-white font-semibold text-base hover:bg-black/80 transition-colors shadow-md"
          >
            {lang === "en" ? "Start with Sophie 🥗" : "Commencer avec Sophie 🥗"}
          </button>
        )}

        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="w-full py-3 text-sm text-gray-500 mt-2"
          >
            {lang === "en" ? "← Back" : "← Retour"}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pb-6 text-[10px] text-gray-400">
        Propulsé par <span className="text-[#8DC63F] font-semibold">Arrow AI</span> — arrow-ai.us
      </div>
    </div>
  );
}
