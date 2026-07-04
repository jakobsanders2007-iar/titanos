# Titan Intelligence OS — Vercel Deploy Checklist (≤ 5 minutes)

The local `npm run build` passing does **not** guarantee Vercel works, because
Vercel adds two things local doesn't: (1) its own env vars, and (2) middleware
running on every request in the Edge runtime. This list closes both gaps.

Do these in order. Steps 1–3 are the only ones that block a working deploy.

---

## 1. Import the project (30s)

- Vercel → **Add New → Project** → import `jakobsanders2007-iar/titanos`.
- **Root Directory:** `.` (repo root — the app is not in a subfolder). ✅ leave default.
- **Framework Preset:** **Next.js** (auto-detected). ✅ leave default.
- **Build Command:** *(leave blank / default)* → runs `next build`. ✅
- **Install Command:** *(leave blank)* → Vercel uses `npm ci` because
  `package-lock.json` is committed and in sync. ✅ (Do **not** switch to pnpm/yarn — there is no pnpm/yarn lockfile.)
- **Output Directory:** *(leave blank)* → `.next`. ✅
- **Node version:** pinned to **22.x** via `engines` in `package.json` + `.nvmrc`.
  Confirm Project → Settings → General → Node.js Version shows **22.x**.

## 2. Set environment variables (2 min) — THE critical step

Project → **Settings → Environment Variables**. Add for **Production + Preview**.

**Required for a fully working app (Connected Mode):**

| Key | Where to get it | Notes |
|-----|-----------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | public, safe in browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | public, safe in browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | **server-only secret — never `NEXT_PUBLIC_`** |

> The app is designed to **degrade gracefully**: with **zero** env vars it still
> deploys and serves the marketing site + full demo (middleware detects the
> missing config and runs in demo mode instead of crashing). But login, the
> database-backed pages, and server writes need the three keys above.

**Optional (all AI/API tools fall back to mock mode if absent — add only what you have):**

`HERMES_BASE_URL` · `HERMES_API_KEY` · `HERMES_MODEL` · `HERMES_ENABLED` ·
`AZURE_OPENAI_API_KEY` · `AZURE_OPENAI_ENDPOINT` · `AZURE_OPENAI_DEPLOYMENT` ·
`GROK_API_KEY` · `EXA_API_KEY` · `FIRECRAWL_API_KEY` · `BROWSERBASE_API_KEY` ·
`GLADIA_API_KEY` · `VAPI_API_KEY` · `TELNYX_API_KEY` · `TELNYX_PHONE_NUMBER` ·
`SMARTY_AUTH_ID` · `SMARTY_AUTH_TOKEN` · `RESEND_API_KEY` · `ABSTRACT_API_KEY` ·
`INCREASE_API_KEY` · `GINA_API_KEY` · `ATLAS_API_KEY` · `SEED_SECRET`

**Secret-leak guard (10s):** only the two `NEXT_PUBLIC_*` keys may be public.
Everything else — especially `SUPABASE_SERVICE_ROLE_KEY` and every API key —
must **not** start with `NEXT_PUBLIC_`. (Code already reads all secrets
server-side only; this is just a config-time sanity check.)

## 3. Deploy, then hit `/health` (1 min) — the money check

After the deploy finishes, open:

```
https://<your-app>.vercel.app/health
```

It returns JSON telling you exactly what's live vs missing. Read `summary`:

- `"status":"ok"` → Supabase configured, auth + DB working. **Done.**
- `"status":"degraded"` → deploy is up but in **DEMO MODE**; `missing_required`
  lists the exact env vars to add (then redeploy).
- `missing_required: []` and integrations listed → you're fully wired.

Example healthy response:
```json
{ "status":"ok","ready":true,"mode":"connected",
  "summary":"Supabase auth/DB configured · 3/15 AI/API integrations live (hermes, exa, resend) · ...",
  "node":"v22.x","vercel":{"env":"production","commit":"db3f167"},
  "missing_required":[] }
```

## 4. Smoke-test 3 routes (30s)

- `/` → marketing homepage renders (works even with **no** env vars).
- `/command` → Command Center renders (demo data; no DB needed).
- `/login` → loads. If you set Supabase keys, sign-in works; if not, it's demo mode.

If `/` or `/command` 500s, it's almost always a middleware/env issue — re-check
step 2 and `/health`.

## 5. (Optional) Seed the demo database

Only if you set the three Supabase keys **and** want real data behind the DB
pages. Set `SEED_SECRET`, then:
```
curl -X POST https://<your-app>.vercel.app/api/seed -H "Authorization: Bearer $SEED_SECRET"
```

---

## What was hardened for Vercel (already committed)

- **Middleware no longer crashes the whole site** when Supabase env is missing.
  Previously `createServerClient(URL!, KEY!)` threw on every request → total 500
  blackout. It now short-circuits to demo mode and wraps auth in try/catch.
- **`/health`** added (public, `nodejs` runtime, `force-dynamic`, never throws).
- **Node pinned to 22.x** (`engines` + `.nvmrc`) to match local and avoid a
  Vercel default-major mismatch with Next 16.
- **No dynamic `[id]` routes**, so no dynamic-route render crashes.
- **`/api/seed`** already guards on `SUPABASE_SERVICE_ROLE_KEY` + `SEED_SECRET`.
- **All 20+ integrations** fall back to mock mode when their keys are absent —
  a missing API key never breaks a page.

## Runtime notes

- Middleware runs on Vercel's **Edge runtime**; `@supabase/ssr`'s
  `createServerClient` is edge-compatible. No `runtime` override needed there.
- `/health`, `/api/seed`, and `/auth/callback` pin **`nodejs`** runtime where
  they need Node APIs / the service-role client.
- If you ever add `output: 'export'` or a custom `outputDirectory`, remove it —
  this app uses server routes + middleware and must run as a standard Next.js
  server deployment (the Vercel default).
