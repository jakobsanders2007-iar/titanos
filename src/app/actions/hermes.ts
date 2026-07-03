'use server'

// Server actions for Hermes-powered intelligence. The ONLY bridge from client
// UI to the Hermes adapter — secrets never leave the server.

import { runHermesWorkflow, askHermesAgentic } from '@/lib/ai/hermes/executor'
import { engineStatus } from '@/lib/ai/provider'
import { HERMES_WORKFLOWS } from '@/lib/ai/hermes/workflows'
import type { IntelligenceReport } from '@/lib/ai/hermes/types'

export async function runIntelligenceWorkflow(id: string, input?: Record<string, unknown>): Promise<IntelligenceReport> {
  return runHermesWorkflow(id, input ?? {})
}

export async function askTitanIntelligence(question: string): Promise<IntelligenceReport> {
  return askHermesAgentic(question)
}

export async function listIntelligenceWorkflows(): Promise<{ id: string; title: string; question: string }[]> {
  return HERMES_WORKFLOWS.map(w => ({ id: w.id, title: w.title, question: w.question }))
}

export async function getEngineStatus(): Promise<{ engine: string; live: boolean; detail: string }> {
  return engineStatus()
}

/** Best-effort: persist an intelligence report into business_memory. Silent
 *  no-op when Supabase is not configured (demo mode). */
export async function saveReportToMemory(report: IntelligenceReport): Promise<{ saved: boolean; note: string }> {
  const configured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  if (!configured) return { saved: true, note: 'Saved to demo Business Memory (connect Supabase for durable storage).' }
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('business_memory').insert({
      company_id: 'a1b2c3d4-0000-0000-0000-000000000001',
      category: 'kpi_snapshot',
      title: report.title,
      summary: report.narrative.slice(0, 2000),
      source: `hermes:${report.workflowId}`,
      tags: ['hermes', report.workflowId],
    })
    return { saved: true, note: 'Saved to Business Memory.' }
  } catch {
    return { saved: false, note: 'Could not write to Business Memory — check Supabase connection.' }
  }
}
