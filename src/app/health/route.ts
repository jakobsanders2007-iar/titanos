import { NextResponse } from 'next/server'

// GET /health — deployment self-check. Reports exactly what is configured vs
// missing after a Vercel deploy. Deliberately self-contained and non-throwing:
// it must work even when everything else is misconfigured.
//
// Always returns HTTP 200 so you can read the body in a browser. Gate on the
// `ready` boolean if you wire this into an uptime monitor.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic' // never cache — always reflect live env

function has(key: string): boolean {
  const v = process.env[key]
  return typeof v === 'string' && v.trim().length > 0
}

function group(keys: string[]): { present: string[]; missing: string[]; configured: boolean } {
  const present = keys.filter(has)
  const missing = keys.filter(k => !has(k))
  return { present, missing, configured: missing.length === 0 }
}

// Optional integrations — absence is fine (each tool falls back to mock mode).
const INTEGRATIONS: Record<string, string[]> = {
  hermes: ['HERMES_BASE_URL', 'HERMES_API_KEY'],
  azure: ['AZURE_OPENAI_API_KEY', 'AZURE_OPENAI_ENDPOINT', 'AZURE_OPENAI_DEPLOYMENT'],
  grok: ['GROK_API_KEY'],
  exa: ['EXA_API_KEY'],
  firecrawl: ['FIRECRAWL_API_KEY'],
  browserbase: ['BROWSERBASE_API_KEY'],
  gladia: ['GLADIA_API_KEY'],
  vapi: ['VAPI_API_KEY'],
  telnyx: ['TELNYX_API_KEY', 'TELNYX_PHONE_NUMBER'],
  smarty: ['SMARTY_AUTH_ID', 'SMARTY_AUTH_TOKEN'],
  resend: ['RESEND_API_KEY'],
  abstract: ['ABSTRACT_API_KEY'],
  increase: ['INCREASE_API_KEY'],
  gina: ['GINA_API_KEY'],
  atlas: ['ATLAS_API_KEY'],
}

export async function GET() {
  try {
    // Required for auth + database (Connected Mode). Without these the app runs
    // in demo mode: marketing site + demo pages work, but login/DB do not.
    const supabaseAuth = group(['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'])
    // Required for server-side writes: seed, agent tool logging, memory saves.
    const supabaseWrite = group(['SUPABASE_SERVICE_ROLE_KEY'])

    const integrations = Object.fromEntries(
      Object.entries(INTEGRATIONS).map(([name, keys]) => {
        const g = group(keys)
        return [name, { configured: g.configured, missing: g.missing }]
      })
    )
    const integrationsLive = Object.entries(integrations).filter(([, v]) => v.configured).map(([k]) => k)

    const hermesEnabled = (process.env.HERMES_ENABLED ?? 'true').toLowerCase() !== 'false'

    const mode = supabaseAuth.configured ? 'connected' : 'demo'
    const ready = supabaseAuth.configured // site is deployable in demo mode, but "ready" = auth/DB usable

    const missingRequired: string[] = [
      ...supabaseAuth.missing,
      ...supabaseWrite.missing.map(k => `${k} (needed for seed/logging/memory writes)`),
    ]

    const summaryParts: string[] = []
    if (supabaseAuth.configured) summaryParts.push('Supabase auth/DB configured')
    else summaryParts.push('DEMO MODE — Supabase auth/DB NOT configured (set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY)')
    if (!supabaseWrite.configured) summaryParts.push('server writes disabled (set SUPABASE_SERVICE_ROLE_KEY)')
    summaryParts.push(`${integrationsLive.length}/${Object.keys(INTEGRATIONS).length} AI/API integrations live${integrationsLive.length ? ` (${integrationsLive.join(', ')})` : ' — all in mock mode'}`)
    summaryParts.push(hermesEnabled ? (integrations.hermes.configured ? 'Hermes gateway configured' : 'Hermes enabled but gateway not set (using deterministic engine)') : 'Hermes disabled')

    return NextResponse.json({
      status: ready ? 'ok' : 'degraded',
      ready,
      mode,
      summary: summaryParts.join(' · '),
      timestamp: new Date().toISOString(),
      runtime: 'nodejs',
      node: process.version,
      vercel: {
        env: process.env.VERCEL_ENV ?? 'local',
        region: process.env.VERCEL_REGION ?? null,
        commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      },
      checks: {
        supabase_auth: { required: true, ...supabaseAuth },
        supabase_writes: { required: false, note: 'seed / agent logging / business memory', ...supabaseWrite },
        hermes: { enabled: hermesEnabled, configured: integrations.hermes.configured },
        integrations,
      },
      missing_required: missingRequired,
    }, { status: 200 })
  } catch (err) {
    // A health check must never itself 500.
    return NextResponse.json(
      { status: 'error', ready: false, error: err instanceof Error ? err.message : 'health check failed', timestamp: new Date().toISOString() },
      { status: 200 }
    )
  }
}
