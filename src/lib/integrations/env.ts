import type { IntegrationCategory, IntegrationStatus, ProviderStatus } from './types'

// Server-only env access. These helpers are the ONLY place integration
// wrappers read process.env, and nothing here is ever imported by a client
// component, so secrets never reach the browser.

/** True only when every listed env var is present and non-empty. */
export function hasEnv(keys: string[]): boolean {
  return keys.every(k => {
    const v = process.env[k]
    return typeof v === 'string' && v.trim().length > 0
  })
}

/** Global kill-switch: force every integration into mock mode. */
export function forceMock(): boolean {
  const v = process.env.TITAN_FORCE_MOCK
  return typeof v === 'string' && ['1', 'true', 'yes'].includes(v.toLowerCase())
}

/** A wrapper should use live calls only when configured AND not force-mocked. */
export function isLive(keys: string[]): boolean {
  return !forceMock() && hasEnv(keys)
}

/** Read a required env var, throwing a clear error if absent. Only call this
 *  after isLive() has confirmed the key is present. */
export function requireEnv(key: string): string {
  const v = process.env[key]
  if (!v || !v.trim()) throw new Error(`Missing required environment variable: ${key}`)
  return v
}

interface ProviderMeta {
  provider: string
  label: string
  category: IntegrationCategory
  capability: string
  requiredEnv: string[]
}

/** Static catalog of every integration Titan knows about. */
export const PROVIDER_CATALOG: ProviderMeta[] = [
  { provider: 'exa', label: 'Exa', category: 'Research & Web', capability: 'Web search, competitor & vendor discovery, industry research', requiredEnv: ['EXA_API_KEY'] },
  { provider: 'firecrawl', label: 'Firecrawl', category: 'Research & Web', capability: 'Crawl and extract content from any website for AI analysis', requiredEnv: ['FIRECRAWL_API_KEY'] },
  { provider: 'browserbase', label: 'Browserbase', category: 'Browser Automation', capability: 'Authorized browser automation & page inspection', requiredEnv: ['BROWSERBASE_API_KEY'] },
  { provider: 'vapi', label: 'Vapi', category: 'Voice & Calls', capability: 'AI receptionist & voice agents, call summaries', requiredEnv: ['VAPI_API_KEY'] },
  { provider: 'telnyx', label: 'Telnyx', category: 'Messaging', capability: 'Phone numbers, SMS, call events', requiredEnv: ['TELNYX_API_KEY', 'TELNYX_PHONE_NUMBER'] },
  { provider: 'gladia', label: 'Gladia', category: 'Voice & Calls', capability: 'Audio & call transcription with summaries', requiredEnv: ['GLADIA_API_KEY'] },
  { provider: 'smarty', label: 'Smarty', category: 'Data Validation', capability: 'Address validation, normalization, service-area checks', requiredEnv: ['SMARTY_AUTH_ID', 'SMARTY_AUTH_TOKEN'] },
  { provider: 'resend', label: 'Resend', category: 'Messaging', capability: 'Transactional email — reports, follow-ups, CEO packets', requiredEnv: ['RESEND_API_KEY'] },
  { provider: 'abstract', label: 'Abstract', category: 'Data Validation', capability: 'Email & phone validation, contact enrichment', requiredEnv: ['ABSTRACT_API_KEY'] },
  { provider: 'increase', label: 'Increase', category: 'Banking', capability: 'Banking connection status (read-only, never moves money)', requiredEnv: ['INCREASE_API_KEY'] },
  { provider: 'hermes', label: 'Hermes Agent (Nous)', category: 'Documents & AI', capability: 'Preferred agentic reasoning engine — self-hosted gateway, OpenAI-compatible', requiredEnv: ['HERMES_BASE_URL', 'HERMES_API_KEY'] },
  { provider: 'azure', label: 'Azure OpenAI', category: 'Documents & AI', capability: 'Primary LLM reasoning, document & business analysis', requiredEnv: ['AZURE_OPENAI_API_KEY', 'AZURE_OPENAI_ENDPOINT', 'AZURE_OPENAI_DEPLOYMENT'] },
  { provider: 'grok', label: 'Grok', category: 'Documents & AI', capability: 'Alternative LLM reasoning & model comparison', requiredEnv: ['GROK_API_KEY'] },
  { provider: 'gina', label: 'Gina', category: 'Research & Web', capability: 'Generic connector (product API varies)', requiredEnv: ['GINA_API_KEY'] },
  { provider: 'atlas', label: 'Atlas', category: 'Research & Web', capability: 'Generic connector (product API varies)', requiredEnv: ['ATLAS_API_KEY'] },
  { provider: 'supabase', label: 'Supabase', category: 'Database', capability: 'Company database, auth, and activity log', requiredEnv: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] },
]

/** Compute the current status for a single provider from its metadata. */
export function statusFor(provider: string): ProviderStatus {
  const meta = PROVIDER_CATALOG.find(p => p.provider === provider)
  if (!meta) {
    return {
      provider, label: provider, category: 'Research & Web', capability: 'Unknown',
      requiredEnv: [], status: 'disabled', configured: false, lastChecked: new Date().toISOString(),
      error: 'Unknown provider',
    }
  }
  const configured = hasEnv(meta.requiredEnv)
  let status: IntegrationStatus
  if (forceMock()) status = 'mock'
  else if (configured) status = 'ready'
  else status = 'missing_key'
  return {
    ...meta,
    status,
    configured,
    lastChecked: new Date().toISOString(),
  }
}

/** Status of every provider in the catalog — powers the Connectors page. */
export function allStatuses(): ProviderStatus[] {
  return PROVIDER_CATALOG.map(p => statusFor(p.provider))
}
