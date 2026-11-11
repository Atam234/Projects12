# Kaya Mo 🌅

Isang mobile app (Android at iPhone) na may AI na kasama — si **Kaya** — na:

- **Pinapalakas ang loob** ng gumagamit at iniipon ang mga patunay ng lakas niya.
- **Hinahamon ang maling paniniwala** sa sarili ("mahina ako", "bobo ako", "malas ako", "lagi akong mali", "napag-iwanan na ako") gamit ang **Socratic method** at mga teknik ng **CBT (Cognitive Behavioral Therapy)**: paghahanap ng ebidensya, pagkilala sa cognitive distortions, reframing, self-compassion, grounding.
- **Ipinaparamdam na hindi ka nag-iisa.**
- Tumutulong laban sa **anxiety, lungkot, takot, at depression**, at agad nagbibigay ng **crisis hotlines** kapag may senyales ng panganib.

> ⚠️ Ang app na ito ay suporta, hindi kapalit ng doktor, psychologist, o therapist.

## Mga bahagi ng app

| Tab | Laman |
|---|---|
| 💬 **Usap** | Chat kay Kaya. May mga mabilisang panimula ("Pakiramdam ko bobo ako", atbp.). Pindutin nang matagal ang isang mensahe para i-save bilang Patunay. |
| 💪 **Patunay** | Journal ng ebidensya na kaya mo — mga tagumpay, kahit maliit. |
| 💛 **Tulong** | NCMH 1553, In Touch, 911 (tap-to-call), box breathing, 5-4-3-2-1 grounding, at pagbura ng data. |

Lahat ng usapan at patunay ay **naka-save lang sa phone**.

## Istruktura

```
mobile/   Expo (React Native + TypeScript) na app
server/   Node + Express na backend; dito ang AI prompt at ang Claude API key
```

Ang AI prompt ay nasa `server/src/prompt.ts` — dito mo babaguhin ang ugali ni Kaya.
Ang API key ay **nasa server lang**, hindi sa app, para hindi ito manakaw.

## Paano patakbuhin

### 1. Server

```bash
cd server
npm install
export ANTHROPIC_API_KEY=sk-ant-...   # kunin sa https://console.anthropic.com
npm run dev                           # tatakbo sa http://localhost:3000
```

Opsyonal na environment variables:
- `PORT` (default `3000`)
- `CLAUDE_MODEL` (default `claude-opus-5-5`)
- `APP_SHARED_KEY` — kung naka-set, tanging app na may parehong key ang makakagamit.

### 2. Mobile app

```bash
cd mobile
npm install
cp .env.example .env
# I-edit ang .env: ilagay ang IP address ng computer na nagpapatakbo ng server
# hal. EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
npx expo start
```

I-scan ang QR code gamit ang **Expo Go** app sa phone mo (dapat parehong Wi-Fi ang phone at computer).

### 3. Para i-publish sa Play Store / App Store

1. I-deploy ang `server/` sa isang host (hal. Render, Railway, Fly.io) at ilagay ang `ANTHROPIC_API_KEY` doon.
2. Ilagay ang URL nito sa `EXPO_PUBLIC_API_URL`.
3. `npx eas-cli@latest build --platform android` (o `ios`), pagkatapos `eas submit`.

## Kaligtasan

- Ang prompt ay nag-uutos na unahin ang kaligtasan kapag may senyales ng pananakit sa sarili at ibigay ang mga hotline sa Pilipinas.
- May dagdag na keyword detection sa server; kapag tumama, may lalabas na pulang banner ng hotline sa app.
- Kapag tumanggi ang AI model, awtomatikong may fallback, at may mahinahong sagot pa rin ang app.
