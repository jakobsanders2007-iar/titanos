import 'server-only'
import type { ChatMessage, HermesChatResult, HermesToolSchema } from './types'

// REST wrapper for a Hermes Agent gateway (OpenAI-compatible).
//
// Deployment model: Hermes Agent is self-hosted (`hermes gateway`), so from a
// Vercel-deployed Titan the HERMES_BASE_URL must point at a reachable gateway
// (a small VM, a tunnel, or a LAN URL in dev). Auth is a bearer token that maps
// to the gateway's API_SERVER_KEY. When the gateway is unreachable or disabled,
// every caller degrades to Titan's deterministic mock engine — nothing crashes.

const DEFAULT_MODEL = 'hermes-agent'
const TIMEOUT_MS = 45_000

function cfg() {
  const enabled = (process.env.HERMES_ENABLED ?? '').toLowerCase() !== 'false'
  const baseUrlRaw = process.env.HERMES_BASE_URL ?? ''
  const apiKey = process.env.HERMES_API_KEY ?? ''
  const model = process.env.HERMES_MODEL || DEFAULT_MODEL
  // Accept base URLs with or without a trailing /v1.
  const baseUrl = baseUrlRaw.replace(/\/$/, '').replace(/\/v1$/, '')
  return { enabled, baseUrl, apiKey, model }
}

export function hermesConfigured(): boolean {
  const c = cfg()
  return c.enabled && c.baseUrl.length > 0 && c.apiKey.length > 0
}

export async function hermesHealth(): Promise<{ ok: boolean; detail: string }> {
  if (!hermesConfigured()) return { ok: false, detail: 'Hermes gateway not configured (HERMES_BASE_URL / HERMES_API_KEY).' }
  const c = cfg()
  try {
    const res = await fetch(`${c.baseUrl}/v1/health`, {
      headers: { authorization: `Bearer ${c.apiKey}` },
      signal: AbortSignal.timeout(8_000),
    })
    return res.ok
      ? { ok: true, detail: `Gateway healthy at ${c.baseUrl} (model: ${c.model}).` }
      : { ok: false, detail: `Gateway responded ${res.status}.` }
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : 'gateway unreachable' }
  }
}

/**
 * One chat-completions round trip. Passes OpenAI-style tool schemas through —
 * if the gateway/model returns tool_calls, the caller executes them and calls
 * again with the results appended.
 */
export async function hermesChat(
  messages: ChatMessage[],
  opts?: { tools?: HermesToolSchema[]; temperature?: number }
): Promise<HermesChatResult> {
  const c = cfg()
  if (!hermesConfigured()) {
    return { content: '', toolCalls: [], mock: true, model: 'titan-mock' }
  }
  const res = await fetch(`${c.baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${c.apiKey}` },
    body: JSON.stringify({
      model: c.model,
      messages,
      temperature: opts?.temperature ?? 0.2,
      ...(opts?.tools && opts.tools.length > 0 ? { tools: opts.tools } : {}),
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`Hermes gateway responded ${res.status}`)
  const json = await res.json()
  const msg = json?.choices?.[0]?.message ?? {}
  return {
    content: typeof msg.content === 'string' ? msg.content : '',
    toolCalls: Array.isArray(msg.tool_calls) ? msg.tool_calls : [],
    mock: false,
    model: String(json?.model ?? c.model),
  }
}
