import 'server-only'
import { isLive } from './env'
import { ok, type ToolResult } from './types'

const KEYS = ['ATLAS_API_KEY']
const P = 'atlas'

// Generic wrapper — the exact Atlas product API varies, so we ship a safe
// connection-status check and a generic request placeholder.

export async function checkAtlasConnection(): Promise<ToolResult<{ connected: boolean }>> {
  const connected = isLive(KEYS)
  return ok(P, { connected }, connected ? 'Atlas connected.' : 'Atlas not connected — status only.', !connected)
}

export async function atlasRequest(action: string): Promise<ToolResult<{ action: string; note: string }>> {
  return ok(P, { action, note: 'Generic Atlas request placeholder. Define a concrete tool once the product API is confirmed.' },
    `Prepared a generic Atlas request: "${action}".`, !isLive(KEYS))
}
