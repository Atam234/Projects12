import { storage, type Message } from "./storage";

// Itakda sa .env: EXPO_PUBLIC_API_URL=http://<IP ng computer mo>:3000
export const DEFAULT_API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
const APP_KEY = process.env.EXPO_PUBLIC_APP_KEY;

export type ChatResult = { reply: string; crisis: boolean };

export async function sendChat(history: Message[], name: string): Promise<ChatResult> {
  const saved = (await storage.getApiUrl()).trim();
  const base = (saved || DEFAULT_API_URL).replace(/\/+$/, "");
  if (!base) throw new Error("no_server");
  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(APP_KEY ? { "x-app-key": APP_KEY } : {}),
    },
    body: JSON.stringify({
      name,
      messages: history.map((m) => ({ role: m.role, text: m.text })),
    }),
  });
  if (!res.ok) {
    throw new Error(res.status === 429 ? "busy" : `http_${res.status}`);
  }
  const data = (await res.json()) as Partial<ChatResult>;
  return { reply: data.reply ?? "", crisis: Boolean(data.crisis) };
}
