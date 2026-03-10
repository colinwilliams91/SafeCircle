# SafeCircle Frontend (React + Tailwind)

Implements the PRD "Redesigned Reading Edition" demo UI:

- Youth chat simulation + safety panel
- Privacy-by-design explanation
- Guardian view (risk patterns, not transcripts)

This repo contains **frontend only**. All backend calls are thin connection points.

## Run

```bash
npm install
npm run dev
```

Optional: point the frontend at your backend.

1. Copy `.env.example` to `.env`
2. Set `VITE_API_BASE_URL` (defaults to `http://127.0.0.1:8000`)

## Backend Connection Points

The frontend expects these endpoints (see `src/api/safecircle.ts`):

- `POST /predict` `{ text: string }` → `{ label_name?, unsafe_score?, reasons?, risk_category? }`
- `POST /reports/anonymous` `PrivacySignal` → `{ report_id?, message? }`
- `POST /guardian/notify` `PrivacySignal` → `{ ok: boolean }`
- `GET /guardian/overview` → `{ current_risk_level, recent_signals, privacy_notes }`

## Tailwind

Tailwind is configured via:

- `tailwind.config.cjs`
- `postcss.config.cjs`
- `src/index.css` (`@tailwind base/components/utilities`)
