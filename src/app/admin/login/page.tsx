"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError("Code incorrect.");
        return;
      }
      router.replace("/admin");
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1A1A] items-center justify-center p-6">
      <div className="w-full max-w-[360px] space-y-6">
        <div className="text-center">
          <div className="text-3xl mb-2">🔐</div>
          <h1 className="text-white text-xl font-bold">Admin Sophie</h1>
          <p className="text-gray-400 text-sm mt-1">Caroline Dubois · Espace privé</p>
        </div>

        <form onSubmit={login} className="space-y-4">
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Code d'accès..."
            className="w-full px-4 py-3.5 rounded-2xl bg-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8DC63F] text-sm"
            autoFocus
          />

          {error && (
            <div className="text-red-400 text-xs text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || !secret}
            className="w-full py-3.5 rounded-2xl bg-[#8DC63F] text-white font-semibold text-sm disabled:opacity-40 hover:bg-[#7ab535] transition-colors"
          >
            {loading ? "Connexion..." : "Accéder au dashboard"}
          </button>
        </form>

        <p className="text-center text-[10px] text-gray-600">
          Propulsé par Arrow AI — arrow-ai.us
        </p>
      </div>
    </div>
  );
}
