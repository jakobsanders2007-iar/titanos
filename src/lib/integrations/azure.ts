import 'server-only'
import { isLive, requireEnv } from './env'
import { ok, fail, type ToolResult } from './types'

const KEYS = ['AZURE_OPENAI_API_KEY', 'AZURE_OPENAI_ENDPOINT', 'AZURE_OPENAI_DEPLOYMENT']
const P = 'azure'

export interface ModelAnswer { answer: string; model: string }
export interface DocAnalysis { summary: string; keyFindings: string[]; risks: string[]; recommendations: string[] }

async function chat(system: string, user: string): Promise<string> {
  const endpoint = requireEnv('AZURE_OPENAI_ENDPOINT').replace(/\/$/, '')
  const deployment = requireEnv('AZURE_OPENAI_DEPLOYMENT')
  const key = requireEnv('AZURE_OPENAI_API_KEY')
  const res = await fetch(`${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-06-01`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'api-key': key },
    body: JSON.stringify({ messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.2 }),
  })
  if (!res.ok) throw new Error(`Azure OpenAI responded ${res.status}`)
  const json = await res.json()
  return String(json?.choices?.[0]?.message?.content ?? '')
}

export async function askAzureModel(prompt: string, system = 'You are Titan, an AI business operator.'): Promise<ToolResult<ModelAnswer>> {
  if (!isLive(KEYS)) {
    return ok(P, { answer: `(Mock reasoning) Based on the connected business data, here is Titan's take on: "${prompt}". Add an Azure OpenAI key to enable live model reasoning.`, model: 'mock-azure' },
      'Generated a reasoning answer (mock).', true)
  }
  try {
    const answer = await chat(system, prompt)
    return ok(P, { answer, model: requireEnv('AZURE_OPENAI_DEPLOYMENT') }, 'Generated a reasoning answer.', false)
  } catch (e) {
    return fail(P, e instanceof Error ? e.message : 'model call failed')
  }
}

export async function analyzeBusinessData(question: string, context: string): Promise<ToolResult<ModelAnswer>> {
  return askAzureModel(`${question}\n\nBusiness context:\n${context}`, 'You are Titan, a CFO/COO analyst. Explain the why behind the numbers and recommend a concrete next action.')
}

export function summarizeDocument(text: string): ToolResult<DocAnalysis> {
  // Deterministic heuristic analysis so document workflows run without a key.
  const lower = text.toLowerCase()
  const keyFindings: string[] = []
  const risks: string[] = []
  const recommendations: string[] = []

  const revMatch = text.match(/\$[\d,]+(?:\.\d+)?\s*(?:k|m|million|thousand)?/i)
  if (revMatch) keyFindings.push(`Financial figure referenced: ${revMatch[0]}.`)
  if (lower.includes('margin')) keyFindings.push('Document discusses margin — a core profitability driver.')
  if (lower.includes('recurring') || lower.includes('contract')) keyFindings.push('Recurring / contract revenue mentioned — positive for valuation.')

  if (lower.includes('concentration') || lower.includes('top 5') || lower.includes('top customer')) risks.push('Customer concentration risk called out.')
  if (lower.includes('owner') && (lower.includes('depend') || lower.includes('key man'))) risks.push('Owner-dependency risk present.')
  if (lower.includes('litigation') || lower.includes('lawsuit')) risks.push('Legal / litigation exposure referenced.')
  if (lower.includes('debt') || lower.includes('loan')) risks.push('Leverage / debt obligations mentioned.')
  if (risks.length === 0) risks.push('No explicit risk factors detected in the provided text.')

  recommendations.push('File this document into Company Memory so it is searchable and tied to the timeline.')
  if (lower.includes('renew')) recommendations.push('Add a renewal reminder before the stated date.')
  if (lower.includes('margin')) recommendations.push('Cross-check the margin trend against the Financials module.')

  const summary = `Document analyzed (${text.split(/\s+/).filter(Boolean).length} words). ${keyFindings.length} key findings, ${risks.length} risks, ${recommendations.length} recommendations extracted.`
  return ok(P, { summary, keyFindings, risks, recommendations }, summary, !isLive(KEYS))
}
