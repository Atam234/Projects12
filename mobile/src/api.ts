import type { Message } from "./storage";

// Itakda sa .env: EXPO_PUBLIC_API_URL=http://<IP ng computer mo>:3000
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
const APP_KEY = process.env.EXPO_PUBLIC_APP_KEY;

export type ChatResult = { reply: string; crisis: boolean };

export async function sendChat(history: Message[], name: string): Promise<ChatResult> {
  const res = await fetch(`${API_URL}/api/chat`, {
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
