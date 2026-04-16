"use client";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import DemoBanner from "@/components/DemoBanner";
import PageHeader from "@/components/PageHeader";
import Footer from "@/components/Footer";

const TYPES_FR = ["Bilan initial", "Suivi", "Question rapide"];
const TYPES_EN = ["Initial assessment", "Follow-up", "Quick question"];

export default function RdvPage() {
  const [lang] = useState<"fr" | "en">("fr");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    type: "",
    date: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const types = lang === "en" ? TYPES_EN : TYPES_FR;

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) {
      setError(
        lang === "en" ? "Name and email required." : "Prénom et email requis."
      );
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? (lang === "en" ? "Error. Try again." : "Erreur. Réessaie."));
        return;
      }
      setSuccess(true);
    } catch {
      setError(lang === "en" ? "Connection error." : "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col min-h-screen max-w-[390px] mx-auto bg-[#DFFFA0]">
        <DemoBanner />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 pb-[80px]">
          <div className="w-20 h-20 rounded-full bg-[#8DC63F]/20 flex items-center justify-center">
            <CheckCircle size={40} className="text-[#8DC63F]" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">
              {lang === "en" ? "Request sent!" : "Demande envoyée !"}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {lang === "en"
                ? "Caroline will get back to you very soon to confirm your appointment."
                : "Caroline te recontactera très vite pour confirmer ton rendez-vous."}
            </p>
          </div>
          <button
            onClick={() => setSuccess(false)}
            className="px-8 py-3 rounded-2xl bg-[#1A1A1A] text-white text-sm font-semibold hover:bg-black/80 transition-colors"
          >
            {lang === "en" ? "New request" : "Nouvelle demande"}
          </button>
        </div>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-[390px] mx-auto bg-[#DFFFA0]">
      <DemoBanner />
      <PageHeader
        title={lang === "en" ? "Book an Appointment" : "Prendre un RDV"}
        back={false}
      />

      <div className="flex-1 overflow-y-auto pb-[80px] px-4 py-4">
        <form onSubmit={submit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {lang === "en" ? "First name *" : "Prénom *"}
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder={lang === "en" ? "Your first name" : "Ton prénom"}
              className="w-full px-4 py-3 rounded-2xl bg-white text-[#1A1A1A] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8DC63F] shadow-sm"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Email *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="ton@email.com"
              className="w-full px-4 py-3 rounded-2xl bg-white text-[#1A1A1A] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8DC63F] shadow-sm"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {lang === "en" ? "Phone (optional)" : "Téléphone (optionnel)"}
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+33 6 00 00 00 00"
              className="w-full px-4 py-3 rounded-2xl bg-white text-[#1A1A1A] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8DC63F] shadow-sm"
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {lang === "en" ? "Appointment type" : "Type de RDV"}
            </label>
            <div className="flex gap-2 flex-wrap">
              {types.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => update("type", t)}
                  className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                    form.type === t
                      ? "bg-[#8DC63F] text-white"
                      : "bg-white text-gray-600 hover:bg-[#8DC63F]/10"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {lang === "en" ? "Preferred date" : "Date souhaitée"}
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 rounded-2xl bg-white text-[#1A1A1A] text-sm focus:outline-none focus:ring-2 focus:ring-[#8DC63F] shadow-sm"
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {lang === "en" ? "Message (optional)" : "Message (optionnel)"}
            </label>
            <textarea
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              placeholder={
                lang === "en"
                  ? "Any specific questions for Caroline..."
                  : "Des questions particulières pour Caroline..."
              }
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-white text-[#1A1A1A] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8DC63F] shadow-sm resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-2xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !form.name || !form.email}
            className="w-full py-4 rounded-2xl bg-[#8DC63F] text-white font-semibold text-sm hover:bg-[#7ab535] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          >
            {loading
              ? lang === "en"
                ? "Sending..."
                : "Envoi..."
              : lang === "en"
              ? "Send my request"
              : "Envoyer ma demande"}
          </button>
        </form>

        <Footer />
      </div>

      <BottomNav />
    </div>
  );
}
