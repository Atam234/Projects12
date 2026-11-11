import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import { SYSTEM_PROMPT, looksLikeCrisis } from "./prompt.js";

const PORT = Number(process.env.PORT ?? 3000);
const MODEL = process.env.CLAUDE_MODEL ?? "claude-opus-5-5";
// Opsyonal: kung naka-set, kailangang ipadala ng app ang parehong value sa header na "x-app-key".
const APP_KEY = process.env.APP_SHARED_KEY;

const MAX_MESSAGES = 60; // pinakabagong mensahe lang ang ipinapadala
const MAX_CHARS_PER_MESSAGE = 4000;

// Kinukuha ang ANTHROPIC_API_KEY mula sa environment. Huwag ilagay sa mobile app.
const client = new Anthropic();

type ChatTurn = { role: "user" | "assistant"; text: string };

function parseMessages(body: unknown): ChatTurn[] | null {
  if (!body || typeof body !== "object") return null;
  const raw = (body as { messages?: unknown }).messages;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const turns: ChatTurn[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") return null;
    const { role, text } = m as { role?: unknown; text?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof text !== "string") return null;
    const trimmed = text.trim().slice(0, MAX_CHARS_PER_MESSAGE);
    if (trimmed) turns.push({ role, text: trimmed });
  }
  let recent = turns.slice(-MAX_MESSAGES);
  // Dapat magsimula sa "user" at magtapos sa "user" ang usapan.
  while (recent.length && recent[0].role !== "user") recent = recent.slice(1);
  if (!recent.length || recent[recent.length - 1].role !== "user") return null;
  return recent;
}

const app = express();
app.use(express.json({ limit: "256kb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/chat", async (req, res) => {
  if (APP_KEY && req.header("x-app-key") !== APP_KEY) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const turns = parseMessages(req.body);
  if (!turns) {
    res.status(400).json({ error: "invalid_messages" });
    return;
  }

  const name = typeof req.body?.name === "string" ? req.body.name.trim().slice(0, 40) : "";
  const lastUserText = turns[turns.length - 1].text;
  const crisis = looksLikeCrisis(lastUserText);

  const messages: Anthropic.Beta.BetaMessageParam[] = turns.map((t) => ({
    role: t.role,
    content: t.text,
  }));
  // Impormasyong nagbabago kada user: inilalagay bilang mid-conversation system message
  // para hindi masira ang cache ng frozen na system prompt.
  const notes: string[] = [];
  if (name) notes.push(`Ang pangalan ng kausap mo ay "${name}".`);
  if (crisis) {
    notes.push(
      "BABALA: May posibleng senyales ng panganib sa huling mensahe. Sundin ang seksiyong KALIGTASAN ngayon.",
    );
  }
  if (notes.length) messages.push({ role: "system", content: notes.join(" ") });

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages,
      output_config: { effort: "medium" },
      // Kapag tumanggi ang safety classifier, awtomatikong susubok sa ibang model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });

    if (response.stop_reason === "refusal") {
      res.json({
        reply:
          "Pasensya na, hindi ko masagot nang maayos ang mensaheng iyan. Pero nandito pa rin ako. Puwede mo bang ikuwento sa ibang paraan ang nararamdaman mo?",
        crisis,
      });
      return;
    }

    const reply = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    res.json({ reply, crisis });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      res.status(429).json({ error: "rate_limited" });
    } else if (err instanceof Anthropic.APIConnectionError) {
      res.status(502).json({ error: "upstream_unreachable" });
    } else if (err instanceof Anthropic.APIError) {
      console.error("Claude API error", err.status, err.message);
      res.status(502).json({ error: "upstream_error" });
    } else {
      console.error(err);
      res.status(500).json({ error: "internal_error" });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Kaya Mo server running on http://localhost:${PORT}`);
});
