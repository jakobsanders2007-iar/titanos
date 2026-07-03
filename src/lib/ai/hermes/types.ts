// Types for the Hermes Agent adapter.
//
// Hermes Agent (Nous Research) is a self-hosted agent runtime that exposes an
// OpenAI-compatible gateway (`hermes gateway`, default 127.0.0.1:8642) with
// bearer auth via API_SERVER_KEY. Titan talks to it over REST — no SDK needed.
// Docs: https://hermes-agent.nousresearch.com/docs/user-guide/features/api-server

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  tool_call_id?: string
  name?: string
  tool_calls?: RawToolCall[]
}

export interface RawToolCall {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}

/** OpenAI-style function schema — Hermes's gateway is OpenAI-compatible. */
export interface HermesToolSchema {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, { type: string; description: string }>
      required: string[]
    }
  }
}

export interface HermesChatResult {
  content: string
  toolCalls: RawToolCall[]
  mock: boolean
  model: string
}

/** A Titan tool exposed to Hermes: schema + server-side executor. */
export interface TitanHermesTool {
  schema: HermesToolSchema
  provider: string
  /** Outbound / irreversible — executor returns a draft, never sends. */
  requiresApproval?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: (args: Record<string, any>) => Promise<{ summary: string; data: unknown }>
}

// ---------------------------------------------------------------------------
// Intelligence reports — the "intelligence card" output every workflow returns
// ---------------------------------------------------------------------------

export type CardKind = 'changed' | 'why' | 'risk' | 'action' | 'summary' | 'memory' | 'item' | 'metric'

export interface IntelligenceCard {
  kind: CardKind
  title: string
  body: string
  meta?: string
}

export interface ToolTimelineEntry {
  tool: string
  provider: string
  summary: string
  ms: number
}

export interface IntelligenceReport {
  workflowId: string
  title: string
  /** 'hermes' when a live gateway synthesized the answer; 'titan-mock' otherwise. */
  engine: 'hermes' | 'titan-mock'
  /** Reasoning summary shown to the user — never hidden chain-of-thought. */
  narrative: string
  confidence: number // 0..1
  limitations: string
  toolTimeline: ToolTimelineEntry[]
  cards: IntelligenceCard[]
  nextActions: string[]
  approval?: {
    channel: 'sms' | 'email' | 'cart'
    label: string
    draft: unknown
  }
}

export type HermesWorkflowId =
  | 'morning-brief'
  | 'why-revenue'
  | 'cash-leakage'
  | 'job-copilot'
  | 'memory-search'
  | 'goal-plan'
  | 'ceo-packet'
  | 'shopper'
  | 'competitor'
  | 'document'
