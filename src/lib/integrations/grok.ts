import 'server-only'
import { isLive, requireEnv } from './env'
import { ok, fail, type ToolResult } from './types'
import { askAzureModel, type ModelAnswer } from './azure'

const KEYS = ['GROK_API_KEY']
const P = 'grok'

async function chat(prompt: string): Promise<string> {
  const key = requireEnv('GROK_API_KEY')
  const base = (process.env.GROK_BASE_URL || 'https://api.x.ai/v1').replace(/\/$/, '')
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: 'grok-beta', messages: [{ role: 'user', content: prompt }], temperature: 0.2 }),
  })
  if (!res.ok) throw new Error(`Grok responded ${res.status}`)
  const json = await res.json()
  return String(json?.choices?.[0]?.message?.content ?? '')
}

export async function askGrokModel(prompt: string): Promise<ToolResult<ModelAnswer>> {
  if (!isLive(KEYS)) {
    return ok(P, { answer: `(Mock Grok reasoning) On "${prompt}", Titan's alternate model would weigh current market context here. Add a Grok key to enable live answers.`, model: 'mock-grok' },
      'Generated an answer with Grok (mock).', true)
  }
  try {
    const answer = await chat(prompt)
    return ok(P, { answer, model: 'grok-beta' }, 'Generated an answer with Grok.', false)
  } catch (e) {
    return fail(P, e instanceof Error ? e.message : 'model call failed')
  }
}

/** Runs the same prompt through Azure and Grok and returns both for comparison. */
export async function compareModelAnswers(prompt: string): Promise<ToolResult<{ azure: string; grok: string }>> {
  const [a, g] = await Promise.all([askAzureModel(prompt), askGrokModel(prompt)])
  return ok(P, { azure: a.data?.answer ?? a.error ?? '', grok: g.data?.answer ?? g.error ?? '' },
    'Compared answers from Azure OpenAI and Grok.', a.mock || g.mock)
}
