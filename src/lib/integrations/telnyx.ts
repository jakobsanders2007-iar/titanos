import 'server-only'
import { isLive, requireEnv } from './env'
import { ok, fail, type ToolResult } from './types'

const KEYS = ['TELNYX_API_KEY', 'TELNYX_PHONE_NUMBER']
const P = 'telnyx'

export interface SmsDraft { to: string; from: string; body: string; requiresApproval: true }
export interface SmsSent { id: string; to: string; status: 'queued' | 'sent' }
export interface SmsMessage { id: string; to: string; body: string; direction: 'outbound' | 'inbound'; sentAt: string }

function fromNumber(): string {
  return isLive(KEYS) ? requireEnv('TELNYX_PHONE_NUMBER') : '(555) 800-1234'
}

/** Drafts never send. The agent must call sendSMS() only after explicit approval. */
export function draftSMS(to: string, body: string): ToolResult<SmsDraft> {
  return ok(P, { to, from: fromNumber(), body, requiresApproval: true },
    `Drafted SMS to ${to} (${body.length} chars). Review before sending.`, !isLive(KEYS))
}

export async function sendSMS(to: string, body: string): Promise<ToolResult<SmsSent>> {
  if (!isLive(KEYS)) {
    return ok(P, { id: 'mock-sms-0001', to, status: 'queued' }, `SMS to ${to} queued (mock — no real message sent).`, true)
  }
  try {
    const key = requireEnv('TELNYX_API_KEY')
    const res = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({ from: fromNumber(), to, text: body }),
    })
    if (!res.ok) throw new Error(`Telnyx responded ${res.status}`)
    const json = await res.json()
    return ok(P, { id: String(json?.data?.id ?? 'sent'), to, status: 'sent' }, `SMS sent to ${to}.`, false)
  } catch (e) {
    return fail(P, e instanceof Error ? e.message : 'send failed')
  }
}

export async function listMessages(): Promise<ToolResult<SmsMessage[]>> {
  const msgs: SmsMessage[] = [
    { id: 'm-1', to: '(555) 300-1001', body: 'Your technician Marcus is en route, ETA 20 min.', direction: 'outbound', sentAt: new Date(Date.now() - 3600e3).toISOString() },
    { id: 'm-2', to: '(555) 300-1004', body: 'Payment link for your lock replacement: pay.titan.com/xyz', direction: 'outbound', sentAt: new Date(Date.now() - 7200e3).toISOString() },
  ]
  return ok(P, msgs, `${msgs.length} recent messages${isLive(KEYS) ? '' : ' (mock)'}.`, !isLive(KEYS))
}

// Templated drafts — all return drafts requiring approval.
export function sendJobConfirmation(to: string, service: string, time: string) {
  return draftSMS(to, `Titan Locksmith: your ${service} is confirmed for ${time}. Your technician will text when en route. Reply STOP to opt out.`)
}
export function sendPaymentReminder(to: string, amount: string, link: string) {
  return draftSMS(to, `Titan Locksmith: a friendly reminder your balance of ${amount} is due. Pay securely here: ${link}. Thank you!`)
}
export function sendReviewRequest(to: string) {
  return draftSMS(to, `Thanks for choosing Titan Locksmith! If we did a great job, a quick Google review would mean a lot: g.page/titan-review`)
}
