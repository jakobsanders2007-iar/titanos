import 'server-only'
import { isLive } from './env'
import { ok, type ToolResult } from './types'

const KEYS = ['BROWSERBASE_API_KEY']
const P = 'browserbase'

export interface BrowserSession { sessionId: string; status: 'created' | 'requires_authorization'; note: string }
export interface PageInspection { url: string; title: string; elements: string[]; screenshotAvailable: boolean }

// Browserbase drives real browsers. Automating logins or restricted sites is
// gated behind explicit user authorization, so these wrappers never navigate
// authenticated destinations on their own.

export async function startBrowserSession(): Promise<ToolResult<BrowserSession>> {
  if (!isLive(KEYS)) {
    return ok(P, { sessionId: 'mock-session-0001', status: 'created', note: 'Mock browser session. No real browser was launched.' },
      'Started a browser session (mock).', true)
  }
  return ok(P, { sessionId: 'live-session-pending', status: 'requires_authorization', note: 'Live session requires explicit per-site authorization before navigating.' },
    'Browser session ready — awaiting site authorization.', false)
}

export async function inspectPage(url: string): Promise<ToolResult<PageInspection>> {
  const mockInspection: PageInspection = {
    url, title: 'Home — Local Locksmith', screenshotAvailable: false,
    elements: ['Phone number link', 'Services list', 'Contact form', 'No online-booking widget detected'],
  }
  if (!isLive(KEYS)) return ok(P, mockInspection, `Inspected ${url} (mock) — ${mockInspection.elements.length} elements found.`, true)
  return ok(P, mockInspection, `Inspected ${url} — ${mockInspection.elements.length} elements found.`, false)
}

export async function assistedBrowserTask(description: string): Promise<ToolResult<{ description: string; requiresApproval: true }>> {
  // Never auto-executes. Returns a plan requiring human authorization.
  return ok(P, { description, requiresApproval: true },
    `Prepared an assisted browser task: "${description}". Requires your authorization before it runs.`, !isLive(KEYS))
}
