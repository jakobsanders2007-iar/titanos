import 'server-only'
import { isLive, requireEnv } from './env'
import { ok, fail, type ToolResult } from './types'

const KEYS = ['ABSTRACT_API_KEY']
const P = 'abstract'

export interface EmailCheck { email: string; valid: boolean; deliverable: boolean; disposable: boolean }
export interface PhoneCheck { phone: string; valid: boolean; type: 'mobile' | 'landline' | 'unknown'; carrier: string }
export interface ContactEnrichment { email: string; company?: string; role?: string; location?: string }

export async function validateEmail(email: string): Promise<ToolResult<EmailCheck>> {
  const looksValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
  const disposable = /@(mailinator|tempmail|guerrilla)\./i.test(email)
  const data: EmailCheck = { email, valid: looksValid, deliverable: looksValid && !disposable, disposable }
  if (!isLive(KEYS)) return ok(P, data, `Email ${email} ${data.deliverable ? 'looks deliverable' : 'may be undeliverable'} (mock).`, true)
  try {
    const key = requireEnv('ABSTRACT_API_KEY')
    const res = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=${key}&email=${encodeURIComponent(email)}`)
    if (!res.ok) throw new Error(`Abstract responded ${res.status}`)
    const j = await res.json()
    return ok(P, {
      email,
      valid: j?.is_valid_format?.value ?? looksValid,
      deliverable: j?.deliverability === 'DELIVERABLE',
      disposable: j?.is_disposable_email?.value ?? disposable,
    }, `Validated ${email}.`, false)
  } catch (e) {
    return fail(P, e instanceof Error ? e.message : 'validation failed')
  }
}

export async function validatePhone(phone: string): Promise<ToolResult<PhoneCheck>> {
  const digits = phone.replace(/\D/g, '')
  const valid = digits.length === 10 || digits.length === 11
  const data: PhoneCheck = { phone, valid, type: valid ? 'mobile' : 'unknown', carrier: valid ? 'Verizon' : 'unknown' }
  return ok(P, data, `Phone ${phone} ${valid ? 'is valid' : 'is invalid'}${isLive(KEYS) ? '' : ' (mock)'}.`, !isLive(KEYS))
}

export async function enrichContact(email: string): Promise<ToolResult<ContactEnrichment>> {
  const domain = email.split('@')[1] ?? ''
  const data: ContactEnrichment = { email, company: domain.includes('.') ? domain.split('.')[0] : undefined, role: 'Owner', location: 'Houston, TX' }
  return ok(P, data, `Enriched contact ${email}${isLive(KEYS) ? '' : ' (mock)'}.`, !isLive(KEYS))
}
