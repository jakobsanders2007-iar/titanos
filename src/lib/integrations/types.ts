// Shared types for the Titan integration layer.
// Every external API wrapper conforms to these so the agent, the UI, and the
// logging layer can treat all 14 providers uniformly.

export type IntegrationStatus =
  | 'ready'        // key(s) present, live calls will be attempted
  | 'mock'         // no key, but the wrapper returns realistic demo data
  | 'missing_key'  // required env var(s) absent
  | 'error'        // last check/call failed
  | 'disabled'     // explicitly turned off

export type IntegrationCategory =
  | 'Research & Web'
  | 'Browser Automation'
  | 'Voice & Calls'
  | 'Messaging'
  | 'Data Validation'
  | 'Documents & AI'
  | 'Banking'
  | 'Database'

export interface ProviderStatus {
  provider: string
  label: string
  category: IntegrationCategory
  capability: string
  requiredEnv: string[]
  /** ready when all required env present; missing_key otherwise. Tools still
   *  run in mock mode regardless, so status is informational for the UI. */
  status: IntegrationStatus
  configured: boolean
  lastChecked: string
  error?: string
}

/** Normalized result returned by every integration function and agent tool. */
export interface ToolResult<T = unknown> {
  ok: boolean
  provider: string
  /** true when the result came from the built-in mock, not a live API call. */
  mock: boolean
  /** one-line human summary of what happened, safe to show in the UI. */
  summary: string
  data: T | null
  error?: string
}

export function ok<T>(provider: string, data: T, summary: string, mock: boolean): ToolResult<T> {
  return { ok: true, provider, mock, summary, data }
}

export function fail<T = unknown>(provider: string, error: string): ToolResult<T> {
  return { ok: false, provider, mock: false, summary: `${provider} error: ${error}`, data: null, error }
}
