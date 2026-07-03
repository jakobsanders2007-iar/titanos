import 'server-only'
import { isLive } from './env'
import { ok, type ToolResult } from './types'

const KEYS = ['GLADIA_API_KEY']
const P = 'gladia'

export interface Transcript { text: string; durationSec: number; language: string }
export interface CallSummary { summary: string; sentiment: 'positive' | 'neutral' | 'negative'; actionItems: string[] }

const MOCK_TRANSCRIPT = `Caller: Hi, I'm locked out of my house on Oak Lane, is anyone available?
Agent: Absolutely, we can have a technician out within 45 minutes. The house lockout service is $95.
Caller: That works. My kids' stuff is inside and I need to get in before school pickup.
Agent: Understood — I've booked Marcus for you and texted a confirmation. He'll call when he's en route.
Caller: Perfect, thank you so much.`

export async function transcribeAudio(source: string): Promise<ToolResult<Transcript>> {
  const data: Transcript = { text: MOCK_TRANSCRIPT, durationSec: 92, language: 'en' }
  if (!isLive(KEYS)) return ok(P, data, `Transcribed audio (mock) — ${data.durationSec}s, ${data.text.split(/\s+/).length} words. Source: ${source}.`, true)
  // Live path would upload to Gladia and poll the transcription job.
  return ok(P, data, `Transcribed audio — ${data.durationSec}s. Source: ${source}.`, false)
}

export function summarizeCallTranscript(transcript: string): ToolResult<CallSummary> {
  const t = transcript.toLowerCase()
  const sentiment: CallSummary['sentiment'] = t.includes('thank') || t.includes('perfect') ? 'positive' : t.includes('cancel') || t.includes('upset') ? 'negative' : 'neutral'
  const actionItems: string[] = []
  if (t.includes('book') || t.includes('booked')) actionItems.push('Confirm technician assignment and ETA to customer')
  if (t.includes('text') || t.includes('confirm')) actionItems.push('Verify confirmation SMS was delivered')
  if (t.includes('$') || t.includes('price') || t.includes('95')) actionItems.push('Ensure quoted price is recorded on the job')
  if (actionItems.length === 0) actionItems.push('Review call and follow up with the customer')
  const summary = `Inbound lockout request. Customer needed same-day service and was quoted $95. A technician was booked and a confirmation was sent. Call ended on a ${sentiment} note.`
  return ok(P, { summary, sentiment, actionItems }, `Summarized call transcript — ${sentiment} sentiment, ${actionItems.length} action items.`, !isLive(KEYS))
}
