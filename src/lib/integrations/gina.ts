import 'server-only'
import { isLive } from './env'
import { ok, type ToolResult } from './types'

const KEYS = ['GINA_API_KEY']
const P = 'gina'

// Generic wrapper — the exact Gina product API varies, so we ship a safe
// connection-status check and a generic request placeholder. No dangerous
// financial or legal behavior is assumed.

export async function checkGinaConnection(): Promise<ToolResult<{ connected: boolean }>> {
  const connected = isLive(KEYS)
  return ok(P, { connected }, connected ? 'Gina connected.' : 'Gina not connected — status only.', !connected)
}

export async function ginaRequest(action: string): Promise<ToolResult<{ action: string; note: string }>> {
  return ok(P, { action, note: 'Generic Gina request placeholder. Define a concrete tool once the product API is confirmed.' },
    `Prepared a generic Gina request: "${action}".`, !isLive(KEYS))
}
