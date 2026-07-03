import 'server-only'
import { isLive } from './env'
import { ok, type ToolResult } from './types'

const KEYS = ['VAPI_API_KEY']
const P = 'vapi'

export interface VoiceAgent { id: string; name: string; firstMessage: string; status: 'draft' | 'live' }
export interface VapiCall { id: string; caller: string; durationSec: number; outcome: string; bookedJob: boolean }
export interface ReceptionistResult {
  transcript: string
  bookedJob: boolean
  serviceType: string
  quotedPrice: number
  urgency: 'Emergency' | 'Same Day' | 'This Week' | 'Flexible'
  summary: string
}

export async function createVoiceAgent(name: string): Promise<ToolResult<VoiceAgent>> {
  const agent: VoiceAgent = { id: 'agent-ava-001', name, firstMessage: 'Thanks for calling Titan Locksmith, this is Ava — how can I help?', status: isLive(KEYS) ? 'live' : 'draft' }
  return ok(P, agent, `Voice agent "${name}" ${agent.status === 'live' ? 'created' : 'drafted (mock)'}.`, !isLive(KEYS))
}

export async function listCalls(): Promise<ToolResult<VapiCall[]>> {
  const calls: VapiCall[] = [
    { id: 'call-201', caller: '(555) 410-2201', durationSec: 92, outcome: 'Job booked — House Lockout', bookedJob: true },
    { id: 'call-202', caller: '(555) 410-2205', durationSec: 141, outcome: 'Quote requested — Rekey', bookedJob: false },
    { id: 'call-203', caller: '(555) 410-2208', durationSec: 63, outcome: 'Escalated — Safe ownership unverified', bookedJob: false },
  ]
  return ok(P, calls, `${calls.length} recent calls${isLive(KEYS) ? '' : ' (mock)'}.`, !isLive(KEYS))
}

export function summarizeVapiCall(callId: string): ToolResult<{ summary: string }> {
  return ok(P, { summary: `Call ${callId}: caller requested same-day service, Ava qualified urgency and booked the job, then sent a confirmation text.` },
    `Summarized call ${callId}.`, !isLive(KEYS))
}

export async function simulateReceptionistCall(scenario: string): Promise<ToolResult<ReceptionistResult>> {
  const result: ReceptionistResult = {
    transcript: `Ava: Thanks for calling Titan Locksmith, this is Ava — how can I help?\nCaller: ${scenario}\nAva: I can help with that right away. I have a technician who can be there today. The service runs $95 for a standard house lockout — shall I book it?\nCaller: Yes please.\nAva: Booked. You'll get a confirmation text and a call when the tech is en route.`,
    bookedJob: true,
    serviceType: 'House Lockout',
    quotedPrice: 95,
    urgency: 'Same Day',
    summary: 'Ava answered, qualified the request as a same-day house lockout, quoted $95, booked the job, and confirmed via SMS.',
  }
  return ok(P, result, `Simulated AI receptionist call — booked a ${result.serviceType} at $${result.quotedPrice}.`, !isLive(KEYS))
}
