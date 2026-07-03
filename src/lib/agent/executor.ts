import 'server-only'
import { route } from './router'
import { getTool } from './tools'
import { logToolRun } from './log'
import type { AgentRunResult, ToolRun } from './types'

// The core agent loop: message in → intent → tool → normalized answer out.
// Approval-gated tools (SMS, email, browser, calls, money) never execute here;
// they return a draft the UI must confirm before a separate send action runs.

function channelFor(provider: string): NonNullable<AgentRunResult['approval']>['channel'] {
  if (provider === 'telnyx') return 'sms'
  if (provider === 'resend') return 'email'
  if (provider === 'browserbase') return 'browser'
  if (provider === 'vapi') return 'call'
  if (provider === 'increase') return 'financial'
  return 'email'
}

function summarizeAnswer(toolName: string, run: ToolRun): { answer: string; nextAction: string } {
  const out = run.output
  switch (toolName) {
    case 'getUnpaidJobs':
      return { answer: run.summary, nextAction: 'Send payment reminders to the unpaid customers (draft ready on approval).' }
    case 'getFollowUpCustomers':
      return { answer: run.summary, nextAction: 'Draft a re-engagement text to these customers.' }
    case 'explainRevenue':
      return { answer: `${out?.headline ?? ''} ${out?.rootCause ?? run.summary}`.trim(), nextAction: out?.recommendation ?? 'Review the Why Analysis for the full breakdown.' }
    case 'recommendSupplies':
      return { answer: run.summary, nextAction: 'Approve the restock cart in AI Shopper.' }
    case 'summarizeWebsite':
      return { answer: `${out?.summary ?? run.summary} Weaknesses: ${(out?.weaknesses ?? []).join('; ')}`, nextAction: 'Use these gaps to position against the competitor.' }
    case 'findCompetitors':
      return { answer: `${run.summary} ${(out ?? []).map((r: { title: string }) => r.title).join(', ')}.`, nextAction: 'Crawl a competitor site to analyze their positioning.' }
    case 'validateAddress':
      return { answer: `${run.summary} Normalized: ${out?.normalized ?? ''}.`, nextAction: out?.inServiceArea ? 'Address is serviceable — proceed to book.' : 'Outside service area — flag before dispatch.' }
    case 'simulateReceptionistCall':
      return { answer: run.summary, nextAction: 'Confirm the booked job appears on the dispatch board.' }
    default:
      return { answer: run.summary, nextAction: 'Review the result and take the recommended next step.' }
  }
}

export async function runTitanAgent(message: string): Promise<AgentRunResult> {
  const intent = route(message)
  const tool = getTool(intent.tool)

  if (!tool) {
    return { answer: `I couldn't map "${message}" to a tool yet.`, toolRuns: [], nextAction: 'Try one of the suggested prompts.' }
  }

  // Approval-gated tools: produce a draft, do not execute.
  if (tool.requiresApproval) {
    const result = await tool.handler(intent.input)
    const run: ToolRun = { toolName: tool.name, provider: tool.provider, status: 'draft', mock: result.mock, summary: result.summary, output: result.data }
    await logToolRun(run, { input: intent.input })
    return {
      answer: `I've prepared this for your review — nothing has been sent yet. ${result.summary}`,
      toolRuns: [run],
      nextAction: 'Review the draft below, then approve to send.',
      approval: { tool: tool.name, channel: channelFor(tool.provider), draft: result.data, label: `Approve & send via ${tool.provider}` },
    }
  }

  try {
    const result = await tool.handler(intent.input)
    const run: ToolRun = { toolName: tool.name, provider: tool.provider, status: result.ok ? 'ok' : 'error', mock: result.mock, summary: result.summary, output: result.data }
    await logToolRun(run, { input: intent.input })
    const { answer, nextAction } = summarizeAnswer(tool.name, run)
    return { answer, toolRuns: [run], nextAction }
  } catch (e) {
    const run: ToolRun = { toolName: tool.name, provider: tool.provider, status: 'error', mock: false, summary: e instanceof Error ? e.message : 'tool failed', output: null }
    await logToolRun(run, { input: intent.input })
    return { answer: `That tool hit an error: ${run.summary}`, toolRuns: [run], nextAction: 'Try rephrasing or check the connector status.' }
  }
}
