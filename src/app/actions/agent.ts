'use server'

// Server actions are the ONLY bridge between client UI and the integration
// layer. Secrets are read exclusively inside these server-only modules and
// never reach the browser.

import { runTitanAgent } from '@/lib/agent/executor'
import { runWorkflow, WORKFLOWS } from '@/lib/agent/workflows'
import { allStatuses } from '@/lib/integrations/env'
import { logToolRun } from '@/lib/agent/log'
import * as telnyx from '@/lib/integrations/telnyx'
import * as resend from '@/lib/integrations/resend'
import { summarizeDocument, type DocAnalysis } from '@/lib/integrations/azure'
import type { AgentRunResult, WorkflowResult } from '@/lib/agent/types'
import type { ProviderStatus } from '@/lib/integrations/types'

export async function askTitan(message: string): Promise<AgentRunResult> {
  return runTitanAgent(message)
}

export async function executeWorkflow(id: string): Promise<WorkflowResult> {
  return runWorkflow(id)
}

export async function listWorkflows(): Promise<{ id: string; title: string }[]> {
  return WORKFLOWS.map(w => ({ id: w.id, title: w.title }))
}

export async function getIntegrationStatuses(): Promise<ProviderStatus[]> {
  return allStatuses()
}

export async function analyzeDocumentText(text: string): Promise<{ summary: string; findings: string[]; risks: string[]; recommendations: string[]; mock: boolean }> {
  const result = summarizeDocument(text)
  await logToolRun({ toolName: 'summarizeDocument', provider: 'azure', status: result.ok ? 'ok' : 'error', mock: result.mock, summary: result.summary, output: result.data })
  const data = (result.data ?? { summary: '', keyFindings: [], risks: [], recommendations: [] }) as DocAnalysis
  return { summary: data.summary, findings: data.keyFindings, risks: data.risks, recommendations: data.recommendations, mock: result.mock }
}

/** Test a single provider's connection status. In mock mode this reports the
 *  provider is reachable in demo mode; live mode reflects real key presence. */
export async function testConnection(provider: string): Promise<ProviderStatus | null> {
  const statuses = allStatuses()
  return statuses.find(s => s.provider === provider) ?? null
}

/** Confirmed send — only runs after the user approved an SMS/email draft in the
 *  UI. In mock mode nothing is actually delivered. */
export async function confirmSend(input: {
  channel: 'sms' | 'email'
  to: string
  subject?: string
  body: string
}): Promise<{ ok: boolean; summary: string; mock: boolean }> {
  const result =
    input.channel === 'sms'
      ? await telnyx.sendSMS(input.to, input.body)
      : await resend.sendEmail(input.to, input.subject ?? 'From Titan', input.body)
  await logToolRun({ toolName: `confirmSend:${input.channel}`, provider: result.provider, status: result.ok ? 'ok' : 'error', mock: result.mock, summary: result.summary, output: result.data })
  return { ok: result.ok, summary: result.summary, mock: result.mock }
}
