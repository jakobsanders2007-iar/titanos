import 'server-only'
import { hermesConfigured, hermesChat, hermesHealth } from './hermes/client'
import { runHermesWorkflow, askHermesAgentic } from './hermes/executor'
import { askAzureModel, summarizeDocument } from '@/lib/integrations/azure'
import { askGrokModel } from '@/lib/integrations/grok'
import { isLive } from '@/lib/integrations/env'
import type { IntelligenceReport } from './hermes/types'

// Provider abstraction for Titan's reasoning engines. Hermes (Nous Research)
// is the preferred agentic runtime when its gateway is configured; Azure
// OpenAI and Grok are direct-model fallbacks; the mock provider guarantees the
// product always answers.

export interface AIProvider {
  name: string
  isAvailable(): boolean
  generate(prompt: string): Promise<string>
  runToolWorkflow(id: string, input?: Record<string, unknown>): Promise<IntelligenceReport>
  summarize(text: string): Promise<string>
  analyze(question: string, context: string): Promise<string>
  classifyIntent(message: string): Promise<string>
}

const INTENTS = ['revenue', 'cash', 'goal', 'shopper', 'competitor', 'document', 'memory', 'brief'] as const

function keywordIntent(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('cash')) return 'cash'
  if (m.includes('revenue') || m.includes('sales') || m.includes('why')) return 'revenue'
  if (m.includes('goal') || m.includes('worth') || m.includes('valuation')) return 'goal'
  if (m.includes('buy') || m.includes('suppl')) return 'shopper'
  if (m.includes('competitor')) return 'competitor'
  if (m.includes('document') || m.includes('10-k')) return 'document'
  if (m.includes('remember') || m.includes('history')) return 'memory'
  return 'brief'
}

export const hermesProvider: AIProvider = {
  name: 'hermes',
  isAvailable: () => hermesConfigured(),
  generate: async prompt => (await hermesChat([{ role: 'user', content: prompt }])).content,
  runToolWorkflow: (id, input) => runHermesWorkflow(id, input ?? {}),
  summarize: async text => (await hermesChat([{ role: 'user', content: `Summarize for a business owner:\n\n${text}` }])).content,
  analyze: async (question, context) => (await hermesChat([{ role: 'user', content: `${question}\n\nContext:\n${context}` }])).content,
  classifyIntent: async message => {
    const reply = await hermesChat([{ role: 'user', content: `Classify this into exactly one of [${INTENTS.join(', ')}]. Reply with only the word.\n\n"${message}"` }])
    const word = reply.content.trim().toLowerCase()
    return (INTENTS as readonly string[]).includes(word) ? word : keywordIntent(message)
  },
}

export const azureProvider: AIProvider = {
  name: 'azure',
  isAvailable: () => isLive(['AZURE_OPENAI_API_KEY', 'AZURE_OPENAI_ENDPOINT', 'AZURE_OPENAI_DEPLOYMENT']),
  generate: async prompt => (await askAzureModel(prompt)).data?.answer ?? '',
  runToolWorkflow: (id, input) => runHermesWorkflow(id, input ?? {}), // shared tool plans; Azure synthesizes nothing extra yet
  summarize: async text => summarizeDocument(text).data?.summary ?? '',
  analyze: async (question, context) => (await askAzureModel(`${question}\n\nContext:\n${context}`)).data?.answer ?? '',
  classifyIntent: async message => keywordIntent(message),
}

export const grokProvider: AIProvider = {
  name: 'grok',
  isAvailable: () => isLive(['GROK_API_KEY']),
  generate: async prompt => (await askGrokModel(prompt)).data?.answer ?? '',
  runToolWorkflow: (id, input) => runHermesWorkflow(id, input ?? {}),
  summarize: async text => (await askGrokModel(`Summarize: ${text}`)).data?.answer ?? '',
  analyze: async (question, context) => (await askGrokModel(`${question}\n\nContext:\n${context}`)).data?.answer ?? '',
  classifyIntent: async message => keywordIntent(message),
}

export const mockProvider: AIProvider = {
  name: 'titan-mock',
  isAvailable: () => true,
  generate: async prompt => `(Demo engine) Titan's take on: "${prompt}". Connect a Hermes gateway for live agentic reasoning.`,
  runToolWorkflow: (id, input) => runHermesWorkflow(id, input ?? {}),
  summarize: async text => summarizeDocument(text).data?.summary ?? '',
  analyze: async (question, context) => (await askAzureModel(`${question}\n\nContext:\n${context}`)).data?.answer ?? '',
  classifyIntent: async message => keywordIntent(message),
}

/** Preference order: Hermes → Azure → Grok → mock. */
export function getPreferredProvider(): AIProvider {
  if (hermesProvider.isAvailable()) return hermesProvider
  if (azureProvider.isAvailable()) return azureProvider
  if (grokProvider.isAvailable()) return grokProvider
  return mockProvider
}

export async function engineStatus(): Promise<{ engine: string; live: boolean; detail: string }> {
  if (hermesConfigured()) {
    const h = await hermesHealth()
    return { engine: 'Hermes Agent (Nous Research)', live: h.ok, detail: h.detail }
  }
  const p = getPreferredProvider()
  return {
    engine: p.name === 'titan-mock' ? 'Titan demo engine' : p.name,
    live: p.name !== 'titan-mock',
    detail: p.name === 'titan-mock' ? 'No reasoning gateway configured — deterministic demo intelligence active.' : `${p.name} available as reasoning fallback.`,
  }
}

export { askHermesAgentic }
