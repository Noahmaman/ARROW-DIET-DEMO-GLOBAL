"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Send, Paperclip, Mic } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import DemoBanner from "@/components/DemoBanner";
import SuggestionChips from "@/components/SuggestionChips";
import Footer from "@/components/Footer";

const SESSION_KEY = "sophie_session_msgs";
const USER_KEY = "sophie_user";
const SESSION_ID_KEY = "sophie_session_id";
const MSG_LIMIT = 10;

interface Message {
  role: "user" | "model";
  parts: string;
  ts: number;
}

function genSessionId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const CHIPS_FR = [
  "Prendre un RDV",
  "Analyser un aliment",
  "Mon rapport semaine",
  "Conseils nutrition",
];
const CHIPS_EN = [
  "Book an appointment",
  "Analyze a food",
  "My weekly report",
  "Nutrition tips",
];

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [userProfile, setUserProfile] = useState<{
    name?: string;
    goal?: string;
    restrictions?: string;
  }>({});
  const [sessionId, setSessionId] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Load user profile
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) setUserProfile(JSON.parse(raw));
    } catch {}

    // Session ID
    let sid = localStorage.getItem(SESSION_ID_KEY) ?? "";
    if (!sid) {
      sid = genSessionId();
      localStorage.setItem(SESSION_ID_KEY, sid);
    }
    setSessionId(sid);

    // Load messages
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const msgs = JSON.parse(raw) as Message[];
        setMessages(msgs);
        if (msgs.filter((m) => m.role === "user").length >= MSG_LIMIT) {
          setLimitReached(true);
        }
      }
    } catch {}

    // Language
    const savedLang = localStorage.getItem("sophie_lang") as "fr" | "en" | null;
    if (savedLang) setLang(savedLang);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const greeting = userProfile.name
    ? lang === "en"
      ? `Hi ${userProfile.name}! I'm Sophie, Caroline's assistant 🥗 How can I help you today?`
      : `Salut ${userProfile.name} ! Je suis Sophie, l'assistante de Caroline 🥗 Comment puis-je t'aider aujourd'hui ?`
    : lang === "en"
    ? "Hi! I'm Sophie, Caroline's assistant 🥗 How can I help you today?"
    : "Salut ! Je suis Sophie, l'assistante de Caroline 🥗 Comment puis-je t'aider aujourd'hui ?";

  const chips = lang === "en" ? CHIPS_EN : CHIPS_FR;

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading || limitReached) return;

      const userMsg: Message = { role: "user", parts: text.trim(), ts: Date.now() };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setLoading(true);

      // Check limit
      const userCount = newMessages.filter((m) => m.role === "user").length;
      if (userCount >= MSG_LIMIT) {
        const limitMsg: Message = {
          role: "model",
          parts:
            lang === "en"
              ? "You've reached the demo limit 😊 Caroline can give you full access."
              : "Tu as atteint la limite de la démo 😊 Caroline peut te donner accès complet.",
          ts: Date.now(),
        };
        const finalMessages = [...newMessages, limitMsg];
        setMessages(finalMessages);
        localStorage.setItem(SESSION_KEY, JSON.stringify(finalMessages));
        setLimitReached(true);
        setLoading(false);
        return;
      }

      // Redirect chips
      const lowerText = text.toLowerCase();
      if (
        lowerText.includes("rdv") ||
        lowerText.includes("rendez-vous") ||
        lowerText.includes("appointment") ||
        lowerText.includes("prendre un rdv") ||
        lowerText.includes("book an appointment")
      ) {
        const redirectMsg: Message = {
          role: "model",
          parts:
            lang === "en"
              ? "I'll redirect you to Caroline's booking page 📅"
              : "Je te redirige vers la prise de RDV avec Caroline 📅",
          ts: Date.now(),
        };
        const finalMessages = [...newMessages, redirectMsg];
        setMessages(finalMessages);
        localStorage.setItem(SESSION_KEY, JSON.stringify(finalMessages));
        setLoading(false);
        setTimeout(() => router.push("/rdv"), 800);
        return;
      }

      if (
        lowerText.includes("rapport") ||
        lowerText.includes("report") ||
        lowerText.includes("semaine")
      ) {
        const redirectMsg: Message = {
          role: "model",
          parts:
            lang === "en"
              ? "Let's generate your weekly nutrition report 📊"
              : "Allons générer ton rapport nutritionnel de la semaine 📊",
          ts: Date.now(),
        };
        const finalMessages = [...newMessages, redirectMsg];
        setMessages(finalMessages);
        localStorage.setItem(SESSION_KEY, JSON.stringify(finalMessages));
        setLoading(false);
        setTimeout(() => router.push("/rapport"), 800);
        return;
      }

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({
              role: m.role,
              parts: m.parts,
            })),
            lang,
            userContext: userProfile,
            sessionId,
          }),
        });

        const data = await res.json();
        const reply =
          data.reply ??
          data.error ??
          (lang === "en" ? "Sorry, try again." : "Désolée, réessaie.");

        const modelMsg: Message = { role: "model", parts: reply, ts: Date.now() };
        const finalMessages = [...newMessages, modelMsg];
        setMessages(finalMessages);
        localStorage.setItem(SESSION_KEY, JSON.stringify(finalMessages));

        if (res.status === 429) setLimitReached(true);
      } catch {
        const errMsg: Message = {
          role: "model",
          parts:
            lang === "en"
              ? "Connection error. Try again."
              : "Erreur de connexion. Réessaie.",
          ts: Date.now(),
        };
        const finalMessages = [...newMessages, errMsg];
        setMessages(finalMessages);
        localStorage.setItem(SESSION_KEY, JSON.stringify(finalMessages));
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, limitReached, lang, userProfile, sessionId, router]
  );

  function handleChip(chip: string) {
    sendMessage(chip);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const showChips = messages.length === 0;

  return (
    <div className="flex flex-col h-screen max-w-[390px] mx-auto bg-[#DFFFA0]">
      <DemoBanner />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <div className="w-8" />
        <div className="flex flex-col items-center">
          <span className="text-base font-semibold text-[#1A1A1A]">
            {lang === "en" ? "AI Chat" : "Chat IA"}
          </span>
          <span className="text-[10px] text-gray-400 bg-white/60 px-3 py-0.5 rounded-full mt-0.5">
            {lang === "en" ? "Today" : "Aujourd'hui"}
          </span>
        </div>
        <button
          onClick={() => {
            const newLang = lang === "fr" ? "en" : "fr";
            setLang(newLang);
            localStorage.setItem("sophie_lang", newLang);
          }}
          className="text-[10px] font-semibold px-2.5 py-1.5 rounded-full bg-white/60 text-gray-600 hover:bg-white transition-colors"
        >
          {lang === "fr" ? "EN" : "FR"}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-2">
        {/* Greeting + product card */}
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-lg font-bold text-[#1A1A1A] mb-1">
              {lang === "en" ? "Hi there!" : "Salut !"}
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">{greeting}</p>
          </div>

          {/* Coach card */}
          <div className="rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="relative h-28 bg-gradient-to-br from-[#DFFFA0] to-[#8DC63F] flex items-center justify-center">
              <div className="text-5xl">🥗</div>
            </div>
            <div className="bg-[#1A1A1A] px-4 py-3">
              <p className="text-white font-semibold text-sm">
                {lang === "en" ? "Sophie — Nutrition AI" : "Sophie — IA Nutrition"}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                {lang === "en"
                  ? "Light and personalized nutritional guidance."
                  : "Conseils nutritionnels légers et personnalisés."}
              </p>
            </div>
          </div>
        </div>

        {/* Suggestion chips on load */}
        {showChips && (
          <div className="pt-1 -mx-4">
            <SuggestionChips chips={chips} onSelect={handleChip} disabled={loading} />
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#8DC63F] text-white rounded-br-sm"
                  : "bg-white text-[#1A1A1A] rounded-bl-sm shadow-sm"
              }`}
            >
              {msg.parts}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#8DC63F] animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#8DC63F] animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#8DC63F] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {limitReached && (
          <div className="bg-[#1A1A1A] text-white text-xs text-center px-4 py-3 rounded-2xl">
            {lang === "en"
              ? "Demo limit reached 😊 Contact Caroline for full access."
              : "Limite de la démo atteinte 😊 Contacte Caroline pour un accès complet."}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <Footer />

      {/* Input area */}
      <div className="px-4 pb-[72px] pt-2 shrink-0">
        <div className="flex items-end gap-2 bg-white rounded-2xl px-3 py-2 shadow-sm border border-gray-100">
          <button className="p-1.5 text-gray-400 hover:text-[#8DC63F] transition-colors shrink-0 mb-0.5">
            <Paperclip size={18} />
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              limitReached
                ? lang === "en"
                  ? "Limit reached"
                  : "Limite atteinte"
                : lang === "en"
                ? "Ask a question..."
                : "Pose une question..."
            }
            disabled={loading || limitReached}
            rows={1}
            className="flex-1 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none resize-none bg-transparent py-1 min-h-[28px] max-h-[80px] disabled:opacity-50"
            style={{ overflowY: "auto" }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading || limitReached}
            className="w-8 h-8 rounded-full bg-[#8DC63F] flex items-center justify-center shrink-0 mb-0.5 disabled:opacity-40 transition-opacity hover:bg-[#7ab535]"
          >
            {loading ? (
              <Mic size={14} className="text-white animate-pulse" />
            ) : (
              <Send size={14} className="text-white" />
            )}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
