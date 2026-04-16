"use client";
import { useState, useEffect } from "react";

const COOKIE_KEY = "sophie_cookies_choice";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const choice = localStorage.getItem(COOKIE_KEY);
    if (!choice) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(COOKIE_KEY, "declined");
    fetch("/api/gdpr/withdraw-consent", { method: "POST" });
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-[68px] left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[360px] bg-[#1A1A1A] text-white rounded-2xl p-4 z-50 shadow-2xl">
      <p className="text-xs text-gray-300 mb-3 leading-relaxed">
        Nous utilisons des cookies essentiels pour faire fonctionner Sophie.
        Aucune donnée n&apos;est revendue.{" "}
        <a href="/mentions-legales" className="underline text-[#8DC63F]">
          En savoir plus
        </a>
      </p>
      <div className="flex gap-2">
        <button
          onClick={decline}
          className="flex-1 py-2 rounded-xl bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors"
        >
          Refuser
        </button>
        <button
          onClick={accept}
          className="flex-1 py-2 rounded-xl bg-[#8DC63F] text-white text-xs font-semibold hover:bg-[#7ab535] transition-colors"
        >
          Accepter
        </button>
      </div>
    </div>
  );
}
