import { GoogleGenerativeAI, Part } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY ?? "");

export const MODEL = "gemini-2.5-flash-lite-preview-06-17";

export function getModel() {
  return genAI.getGenerativeModel({ model: MODEL });
}

export const SOPHIE_SYSTEM_PROMPT = `Tu es Sophie, l'assistante IA personnelle de Caroline Dubois, coach nutrition certifiée à Paris 17ème.

Règles strictes:
- Toujours en français (ou anglais si l'utilisateur a changé la langue)
- Réponses courtes: 2-3 phrases max, 1 emoji
- Ne jamais mentionner que tu es une IA ou un modèle
- Réponds DIRECTEMENT sans répéter la question

Tu peux:
- Répondre aux questions nutrition, macros, repas, aliments
- Analyser des photos d'aliments ou de produits
- Aider à prendre un RDV avec Caroline (redirige vers /rdv)
- Générer des rapports nutritionnels (redirige vers /rapport)
- Donner des conseils personnalisés basés sur l'objectif de l'utilisateur

Tu ne donnes pas de conseils médicaux → "Consulte ton médecin 🏥"
Caroline est disponible pour un suivi personnalisé complet.`;

export const SOPHIE_SYSTEM_PROMPT_EN = `You are Sophie, the personal AI assistant of Caroline Dubois, certified nutrition coach in Paris 17th.

Strict rules:
- Always respond in English
- Short answers: 2-3 sentences max, 1 emoji
- Never mention you are an AI or a model
- Reply DIRECTLY without repeating the question

You can:
- Answer nutrition, macros, meals, food questions
- Analyze food/product photos
- Help book an appointment with Caroline (redirect to /rdv)
- Generate nutrition reports (redirect to /rapport)
- Give personalized advice based on user goals

No medical advice → "See your doctor 🏥"
Caroline is available for complete personalized follow-up.`;

export async function chatWithSophie(
  messages: { role: "user" | "model"; parts: string }[],
  lang: "fr" | "en" = "fr",
  userContext?: { name?: string; goal?: string; restrictions?: string }
): Promise<string> {
  const model = getModel();

  const systemPrompt = lang === "en" ? SOPHIE_SYSTEM_PROMPT_EN : SOPHIE_SYSTEM_PROMPT;
  const contextNote = userContext
    ? `\n\nContexte utilisateur: Prénom: ${userContext.name || "inconnu"}, Objectif: ${userContext.goal || "non précisé"}, Restrictions: ${userContext.restrictions || "aucune"}`
    : "";

  const chat = model.startChat({
    systemInstruction: systemPrompt + contextNote,
    history: messages.slice(0, -1).map((m) => ({
      role: m.role,
      parts: [{ text: m.parts }],
    })),
  });

  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessage(lastMessage.parts);
  return result.response.text();
}

export async function analyzeFood(
  imageBase64: string,
  mimeType: string,
  lang: "fr" | "en" = "fr"
): Promise<{
  name: string;
  description: string;
  macros: { proteins: number; carbs: number; fats: number; water: number };
  ingredients: string[];
  analysis: string;
}> {
  const model = getModel();

  const prompt =
    lang === "en"
      ? `Analyze this food/product image. Return a JSON object with:
{
  "name": "product name",
  "description": "short description (1 sentence)",
  "macros": {
    "proteins": <percentage as number>,
    "carbs": <percentage as number>,
    "fats": <percentage as number>,
    "water": <percentage as number>
  },
  "ingredients": ["ingredient1", "ingredient2", ...],
  "analysis": "brief nutrition analysis (2-3 sentences)"
}
The percentages must add up to 100. Return ONLY valid JSON, no markdown.`
      : `Analyse cette image d'aliment ou de produit. Retourne un objet JSON avec:
{
  "name": "nom du produit",
  "description": "description courte (1 phrase)",
  "macros": {
    "proteins": <pourcentage en nombre>,
    "carbs": <pourcentage en nombre>,
    "fats": <pourcentage en nombre>,
    "water": <pourcentage en nombre>
  },
  "ingredients": ["ingrédient1", "ingrédient2", ...],
  "analysis": "analyse nutritionnelle brève (2-3 phrases)"
}
Les pourcentages doivent totaliser 100. Retourne UNIQUEMENT du JSON valide, pas de markdown.`;

  const imagePart: Part = {
    inlineData: { data: imageBase64, mimeType },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text().trim();

  // Strip markdown code blocks if present
  const clean = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(clean);
}

export async function analyzeWeeklyReport(
  rawInput: string,
  lang: "fr" | "en" = "fr"
): Promise<{
  score: number;
  positifs: string[];
  ameliorations: string[];
  objectifs: string[];
}> {
  const model = getModel();

  const prompt =
    lang === "en"
      ? `Analyze this weekly food diary and return a JSON object:
{
  "score": <number from 1 to 10>,
  "positifs": ["positive point 1", "positive point 2", ...],
  "ameliorations": ["improvement 1", "improvement 2", ...],
  "objectifs": ["goal for next week 1", "goal 2", "goal 3"]
}
Diary: ${rawInput}
Return ONLY valid JSON, no markdown.`
      : `Analyse ce journal alimentaire de la semaine et retourne un objet JSON:
{
  "score": <nombre de 1 à 10>,
  "positifs": ["point positif 1", "point positif 2", ...],
  "ameliorations": ["amélioration 1", "amélioration 2", ...],
  "objectifs": ["objectif semaine prochaine 1", "objectif 2", "objectif 3"]
}
Journal: ${rawInput}
Retourne UNIQUEMENT du JSON valide, pas de markdown.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(clean);
}
