import 'server-only'
import type { ToolRun } from './types'

// Best-effort logging of agent tool runs. When Supabase is configured, runs are
// written to agent_tool_runs and activity_log. When it is not (demo mode), this
// is a silent no-op — logging must never crash the agent or leak errors to the
// user.

const DEMO_COMPANY_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

/** Best-effort: persist a question/answer exchange into agent_sessions +
 *  agent_messages. Silent no-op in demo mode — never blocks the answer. */
export async function logAgentExchange(question: string, answer: string, toolCalls?: unknown): Promise<void> {
  const configured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  if (!configured) return
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: session } = await (supabase as any)
      .from('agent_sessions')
      .insert({ company_id: DEMO_COMPANY_ID, title: question.slice(0, 120), status: 'complete' })
      .select('id')
      .single()
    if (!session?.id) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('agent_messages').insert([
      { session_id: session.id, company_id: DEMO_COMPANY_ID, role: 'user', content: question },
      { session_id: session.id, company_id: DEMO_COMPANY_ID, role: 'assistant', content: answer.slice(0, 8000), tool_calls: toolCalls ?? null },
    ])
  } catch {
    // best-effort only
  }
}

export async function logToolRun(run: ToolRun, meta?: { input?: unknown; userId?: string }): Promise<void> {
  const configured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  if (!configured) return
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('agent_tool_runs').insert({
      company_id: DEMO_COMPANY_ID,
      user_id: meta?.userId ?? null,
      tool_name: run.toolName,
      input: meta?.input ?? null,
      output: run.output ?? null,
      status: run.status,
      error_message: run.status === 'error' ? run.summary : null,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('activity_log').insert({
      company_id: DEMO_COMPANY_ID,
      user_id: meta?.userId ?? null,
      action: `agent_tool:${run.toolName}`,
      entity_type: 'agent_tool_run',
      entity_id: null,
      metadata: { provider: run.provider, mock: run.mock, status: run.status },
    })
  } catch {
    // Swallow — logging is best-effort only.
  }
}
