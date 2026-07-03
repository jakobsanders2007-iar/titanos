import 'server-only'
import { hermesChat, hermesConfigured } from './client'
import { getHermesTool, hermesToolSchemas } from './tools'
import { HERMES_SYSTEM_PROMPT, WORKFLOW_PROMPTS } from './prompts'
import { getWorkflowDef, type ToolOutput } from './workflows'
import { logToolRun, logAgentExchange } from '@/lib/agent/log'
import type { ChatMessage, IntelligenceReport, ToolTimelineEntry } from './types'

// The Hermes executor. Two entry points:
//  - runHermesWorkflow: deterministic tool plan → (Hermes synthesis | mock synthesis)
//  - askHermesAgentic: free-form agentic loop with OpenAI-style tool calling
// Every tool run is logged to agent_tool_runs; approval-gated tools only ever
// return drafts.

async function executeTool(name: string, args: Record<string, unknown>): Promise<ToolOutput & { ms: number }> {
  const tool = getHermesTool(name)
  const started = Date.now()
  if (!tool) {
    return { tool: name, provider: 'unknown', summary: `Unknown tool: ${name}`, data: null, ms: Date.now() - started }
  }
  try {
    const result = await tool.execute(args)
    const ms = Date.now() - started
    await logToolRun({ toolName: name, provider: tool.provider, status: tool.requiresApproval ? 'draft' : 'ok', mock: false, summary: result.summary, output: result.data }, { input: args })
    return { tool: name, provider: tool.provider, summary: result.summary, data: result.data, ms }
  } catch (e) {
    const ms = Date.now() - started
    const msg = e instanceof Error ? e.message : 'tool failed'
    await logToolRun({ toolName: name, provider: tool.provider, status: 'error', mock: false, summary: msg, output: null }, { input: args })
    return { tool: name, provider: tool.provider, summary: `Error: ${msg}`, data: null, ms }
  }
}

/** Try to parse Hermes's JSON reply into report fields; null if malformed. */
function parseHermesJson(content: string): Partial<IntelligenceReport> | null {
  try {
    const start = content.indexOf('{')
    const end = content.lastIndexOf('}')
    if (start === -1 || end === -1) return null
    const j = JSON.parse(content.slice(start, end + 1))
    if (typeof j.narrative !== 'string') return null
    return {
      narrative: j.narrative,
      confidence: typeof j.confidence === 'number' ? Math.max(0, Math.min(1, j.confidence)) : 0.7,
      limitations: typeof j.limitations === 'string' ? j.limitations : '',
      cards: Array.isArray(j.cards) ? j.cards : [],
      nextActions: Array.isArray(j.nextActions) ? j.nextActions : [],
    }
  } catch {
    return null
  }
}

export async function runHermesWorkflow(id: string, input: Record<string, unknown> = {}): Promise<IntelligenceReport> {
  const def = getWorkflowDef(id)
  if (!def) throw new Error(`Unknown Hermes workflow: ${id}`)

  // 1. Run the tool plan (real Titan tools, real demo data).
  const timeline: ToolTimelineEntry[] = []
  const results: ToolOutput[] = []
  for (const step of def.plan(input)) {
    const out = await executeTool(step.tool, step.args)
    timeline.push({ tool: out.tool, provider: out.provider, summary: out.summary, ms: out.ms })
    results.push(out)
  }

  // 2. Deterministic synthesis — always available.
  const fallback = def.synthesize(results, input)
  await logAgentExchange(def.question, fallback.narrative, timeline)

  // 3. If a Hermes gateway is live, let it write the narrative from the same evidence.
  if (hermesConfigured()) {
    try {
      const evidence = results.map(r => `## ${r.tool} (${r.provider})\n${r.summary}\n${JSON.stringify(r.data)?.slice(0, 1200) ?? ''}`).join('\n\n')
      const messages: ChatMessage[] = [
        { role: 'system', content: HERMES_SYSTEM_PROMPT },
        { role: 'user', content: `${WORKFLOW_PROMPTS[def.id] ?? def.question}\n\nInput: ${JSON.stringify(input)}\n\nTool evidence:\n${evidence}` },
      ]
      const reply = await hermesChat(messages)
      const parsed = parseHermesJson(reply.content)
      if (parsed) {
        return {
          workflowId: def.id,
          title: def.title,
          engine: 'hermes',
          toolTimeline: timeline,
          narrative: parsed.narrative ?? fallback.narrative,
          confidence: parsed.confidence ?? fallback.confidence,
          limitations: parsed.limitations || fallback.limitations,
          cards: parsed.cards?.length ? parsed.cards : fallback.cards,
          nextActions: parsed.nextActions?.length ? parsed.nextActions : fallback.nextActions,
          approval: fallback.approval,
        }
      }
      if (reply.content.trim()) {
        return { workflowId: def.id, title: def.title, engine: 'hermes', toolTimeline: timeline, ...fallback, narrative: reply.content.trim() }
      }
    } catch {
      // fall through to deterministic synthesis
    }
  }

  return { workflowId: def.id, title: def.title, engine: 'titan-mock', toolTimeline: timeline, ...fallback }
}

/** Free-form agentic loop: Hermes chooses Titan tools via OpenAI tool calling. */
export async function askHermesAgentic(question: string): Promise<IntelligenceReport> {
  if (!hermesConfigured()) {
    // Mock: route to the closest workflow so the product always answers well.
    const q = question.toLowerCase()
    const id =
      q.includes('cash') ? 'cash-leakage'
      : q.includes('revenue') || q.includes('why') ? 'why-revenue'
      : q.includes('goal') || q.includes('worth') || q.includes('valuation') ? 'goal-plan'
      : q.includes('buy') || q.includes('suppl') || q.includes('order') ? 'shopper'
      : q.includes('competitor') ? 'competitor'
      : q.includes('document') || q.includes('10-k') ? 'document'
      : q.includes('remember') || q.includes('history') || q.includes('did we') ? 'memory-search'
      : 'morning-brief'
    return runHermesWorkflow(id, { question })
  }

  const timeline: ToolTimelineEntry[] = []
  const messages: ChatMessage[] = [
    { role: 'system', content: HERMES_SYSTEM_PROMPT },
    { role: 'user', content: question },
  ]
  const tools = hermesToolSchemas()

  for (let i = 0; i < 6; i++) {
    const reply = await hermesChat(messages, { tools })
    if (reply.toolCalls.length === 0) {
      const parsed = parseHermesJson(reply.content)
      await logAgentExchange(question, parsed?.narrative ?? reply.content, timeline)
      return {
        workflowId: 'freeform',
        title: 'Titan Intelligence',
        engine: 'hermes',
        toolTimeline: timeline,
        narrative: parsed?.narrative ?? reply.content ?? 'No answer produced.',
        confidence: parsed?.confidence ?? 0.7,
        limitations: parsed?.limitations ?? 'Free-form analysis; verify critical numbers in the linked modules.',
        cards: parsed?.cards ?? [],
        nextActions: parsed?.nextActions ?? [],
      }
    }
    messages.push({ role: 'assistant', content: reply.content, tool_calls: reply.toolCalls })
    for (const call of reply.toolCalls) {
      let args: Record<string, unknown> = {}
      try { args = JSON.parse(call.function.arguments || '{}') } catch { /* keep empty */ }
      const out = await executeTool(call.function.name, args)
      timeline.push({ tool: out.tool, provider: out.provider, summary: out.summary, ms: out.ms })
      messages.push({ role: 'tool', tool_call_id: call.id, name: call.function.name, content: JSON.stringify({ summary: out.summary, data: out.data })?.slice(0, 4000) })
    }
  }

  return {
    workflowId: 'freeform',
    title: 'Titan Intelligence',
    engine: 'hermes',
    toolTimeline: timeline,
    narrative: 'Analysis hit the tool-loop limit — here is what the tools found: ' + timeline.map(t => t.summary).join(' '),
    confidence: 0.5,
    limitations: 'Loop limit reached before final synthesis.',
    cards: [],
    nextActions: ['Ask a narrower question'],
  }
}
