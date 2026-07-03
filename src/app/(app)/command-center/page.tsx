'use client'

import { useState, useRef, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { askTitan, executeWorkflow, listWorkflows, confirmSend } from '@/app/actions/agent'
import { SUGGESTED_PROMPTS } from '@/lib/agent/prompts'
import type { AgentRunResult, ToolRun, WorkflowResult } from '@/lib/agent/types'
import {
  Sparkles, Send, User, Wrench, ShieldAlert, CheckCircle2, Loader2,
  ArrowRight, Zap, X, Play,
} from 'lucide-react'

interface ChatTurn {
  id: number
  role: 'user' | 'titan'
  text?: string
  result?: AgentRunResult | WorkflowResult
}

type PendingApproval = NonNullable<AgentRunResult['approval']> & { turnId: number }

function isAgentResult(r: AgentRunResult | WorkflowResult): r is AgentRunResult {
  return (r as AgentRunResult).toolRuns !== undefined
}

export default function CommandCenterAgentPage() {
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [workflows, setWorkflows] = useState<{ id: string; title: string }[]>([])
  const [approval, setApproval] = useState<PendingApproval | null>(null)
  const [sentNote, setSentNote] = useState<string | null>(null)
  const idRef = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => { listWorkflows().then(setWorkflows).catch(() => {}) }, [])
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }) }, [turns, busy])

  const push = (turn: Omit<ChatTurn, 'id'>) => {
    const id = idRef.current++
    setTurns(prev => [...prev, { ...turn, id }])
    return id
  }

  const ask = async (message: string) => {
    if (!message.trim() || busy) return
    setInput('')
    push({ role: 'user', text: message })
    setBusy(true)
    try {
      const result = await askTitan(message)
      const turnId = push({ role: 'titan', result })
      if (result.approval) setApproval({ ...result.approval, turnId })
    } catch {
      push({ role: 'titan', text: 'Something went wrong running that. Try again.' })
    } finally {
      setBusy(false)
    }
  }

  const launch = async (id: string, title: string) => {
    if (busy) return
    push({ role: 'user', text: `Run workflow: ${title}` })
    setBusy(true)
    try {
      const result = await executeWorkflow(id)
      const turnId = push({ role: 'titan', result })
      if (result.approval) setApproval({ ...result.approval, turnId })
    } catch {
      push({ role: 'titan', text: 'Workflow failed to run.' })
    } finally {
      setBusy(false)
    }
  }

  const approve = async () => {
    if (!approval) return
    const draft = approval.draft as { to?: string; subject?: string; body?: string }
    setBusy(true)
    try {
      const res = await confirmSend({
        channel: approval.channel === 'email' ? 'email' : 'sms',
        to: draft.to ?? '',
        subject: draft.subject,
        body: draft.body ?? '',
      })
      setSentNote(res.summary)
      setApproval(null)
    } catch {
      setSentNote('Send failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Titan Agent"
        subtitle="Ask anything. Titan picks the right tool, runs it, and tells you the next move."
      />
      <div className="flex-1 overflow-hidden flex">
        {/* Chat column */}
        <div className="flex-1 flex flex-col min-w-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {turns.length === 0 && (
              <div className="max-w-2xl">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-sm text-gray-300 leading-relaxed">
                    I connect your systems, read your documents, and explain the why behind every number — then turn it into an action. Ask me something, or run a guided workflow from the right.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_PROMPTS.map(p => (
                    <button key={p} onClick={() => ask(p)} className="text-xs px-3 py-1.5 rounded-full border border-gray-800 bg-gray-900 text-gray-400 hover:text-white hover:border-gray-700 transition-colors">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {turns.map(turn => (
              <div key={turn.id}>
                {turn.role === 'user' ? (
                  <div className="flex gap-3 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-gray-400" /></div>
                    <div className="max-w-[80%] rounded-lg px-4 py-2.5 text-sm bg-amber-500 text-gray-950 font-medium">{turn.text}</div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0"><Sparkles className="w-4 h-4 text-amber-400" /></div>
                    <div className="max-w-[85%] min-w-0 space-y-2">
                      {turn.text && <div className="rounded-lg px-4 py-3 text-sm bg-gray-900 border border-gray-800 text-gray-300">{turn.text}</div>}
                      {turn.result && <TitanAnswer result={turn.result} />}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {busy && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0"><Sparkles className="w-4 h-4 text-amber-400" /></div>
                <div className="rounded-lg px-4 py-3 bg-gray-900 border border-gray-800 flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" />Titan is working…</div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-800 flex-shrink-0">
            <form onSubmit={e => { e.preventDefault(); ask(input) }} className="flex items-center gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask Titan anything about your business…"
                className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-600"
              />
              <button type="submit" disabled={busy} className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 rounded-lg transition-colors flex-shrink-0"><Send className="w-4 h-4" /></button>
            </form>
          </div>
        </div>

        {/* Workflow launcher */}
        <div className="w-72 border-l border-gray-800 overflow-y-auto flex-shrink-0 hidden lg:block">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-sm font-semibold text-white">Guided Workflows</span>
          </div>
          <div className="p-2 space-y-1">
            {workflows.map((w, i) => (
              <button key={w.id} onClick={() => launch(w.id, w.title)} disabled={busy}
                className="w-full text-left px-3 py-2 rounded hover:bg-gray-900 transition-colors flex items-start gap-2 disabled:opacity-50">
                <span className="w-5 h-5 rounded-full bg-gray-800 text-[10px] text-gray-500 flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-xs text-gray-300 leading-snug">{w.title}</span>
                <Play className="w-3 h-3 text-gray-600 flex-shrink-0 mt-0.5 ml-auto" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Approval modal */}
      {approval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setApproval(null)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-gray-950 border border-amber-500/30 rounded-lg max-w-md w-full p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <div className="text-sm font-semibold text-white">Review before sending</div>
              </div>
              <button onClick={() => setApproval(null)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="text-xs text-gray-500 mb-3">Titan never sends {approval.channel === 'email' ? 'emails' : 'messages'} without your approval. Review the draft, then send.</div>
            <div className="bg-gray-900 border border-gray-800 rounded p-3 text-sm text-gray-300 space-y-1 mb-4">
              {(approval.draft as { to?: string }).to && <div><span className="text-gray-500">To:</span> {(approval.draft as { to?: string }).to}</div>}
              {(approval.draft as { subject?: string }).subject && <div><span className="text-gray-500">Subject:</span> {(approval.draft as { subject?: string }).subject}</div>}
              <div className="whitespace-pre-wrap pt-1 border-t border-gray-800 mt-1">{(approval.draft as { body?: string }).body}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setApproval(null)} className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded border border-gray-700 transition-colors">Cancel</button>
              <button onClick={approve} disabled={busy} className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 text-sm font-semibold rounded transition-colors">{approval.label}</button>
            </div>
          </div>
        </div>
      )}

      {sentNote && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 border border-emerald-500/30 rounded-lg px-4 py-3 flex items-center gap-2 shadow-lg" onClick={() => setSentNote(null)}>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-gray-300">{sentNote}</span>
        </div>
      )}
    </div>
  )
}

function TitanAnswer({ result }: { result: AgentRunResult | WorkflowResult }) {
  const answer = result.answer
  const nextAction = result.nextAction
  const toolRuns: ToolRun[] = isAgentResult(result)
    ? result.toolRuns
    : (result as WorkflowResult).toolsUsed.map(t => ({ toolName: t, provider: t.split('·')[0]?.trim() ?? '', status: 'ok' as const, mock: true, summary: '', output: null }))

  return (
    <div className="space-y-2">
      <div className="rounded-lg px-4 py-3 text-sm bg-gray-900 border border-gray-800 text-gray-300 leading-relaxed">{answer}</div>

      {toolRuns.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {toolRuns.map((r, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border border-gray-800 bg-gray-950 text-gray-400">
              <Wrench className="w-2.5 h-2.5 text-amber-400" />
              {isAgentResult(result) ? `${r.provider} · ${r.toolName}` : r.toolName}
              {r.status === 'draft' && <span className="text-amber-400">draft</span>}
              {r.mock && <span className="text-gray-600">mock</span>}
            </span>
          ))}
        </div>
      )}

      {nextAction && (
        <div className="flex items-start gap-1.5 text-xs text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded px-3 py-2">
          <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>Next: {nextAction}</span>
        </div>
      )}
    </div>
  )
}
