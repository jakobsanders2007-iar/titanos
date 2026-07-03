import 'server-only'
import { isLive, requireEnv } from './env'
import { ok, fail, type ToolResult } from './types'

const KEYS = ['RESEND_API_KEY']
const P = 'resend'

export interface EmailDraft { to: string; subject: string; body: string; requiresApproval: true }
export interface EmailSent { id: string; to: string; status: 'sent' }

/** Drafts never send. sendEmail() must only run after explicit approval. */
export function draftEmail(to: string, subject: string, body: string): ToolResult<EmailDraft> {
  return ok(P, { to, subject, body, requiresApproval: true },
    `Drafted email to ${to} — "${subject}". Review before sending.`, !isLive(KEYS))
}

export async function sendEmail(to: string, subject: string, body: string): Promise<ToolResult<EmailSent>> {
  if (!isLive(KEYS)) return ok(P, { id: 'mock-email-0001', to, status: 'sent' }, `Email to ${to} sent (mock — no real email delivered).`, true)
  try {
    const key = requireEnv('RESEND_API_KEY')
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({ from: 'Titan <reports@titanlocksmith.com>', to, subject, html: body.replace(/\n/g, '<br/>') }),
    })
    if (!res.ok) throw new Error(`Resend responded ${res.status}`)
    const json = await res.json()
    return ok(P, { id: String(json?.id ?? 'sent'), to, status: 'sent' }, `Email sent to ${to}.`, false)
  } catch (e) {
    return fail(P, e instanceof Error ? e.message : 'send failed')
  }
}

export function sendCEOPacketEmail(to: string, month: string, body: string) {
  return draftEmail(to, `Your ${month} CEO Packet — Titan Intelligence OS`, body)
}
export function sendOnboardingEmail(to: string, name: string) {
  return draftEmail(to, 'Welcome to Titan Intelligence OS', `Hi ${name},\n\nWelcome to Titan. We've connected your systems and started building your business timeline. Your Command Center is ready whenever you are.\n\n— The Titan Team`)
}
export function sendQuoteFollowUp(to: string, service: string, amount: string) {
  return draftEmail(to, `Following up on your ${service} quote`, `Hi there,\n\nJust following up on your ${service} quote of ${amount}. We'd love to get you on the schedule this week — reply here or call us and we'll lock in a time.\n\n— Titan Locksmith`)
}
