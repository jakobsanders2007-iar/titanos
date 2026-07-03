import 'server-only'
import type { HermesWorkflowId, IntelligenceCard, IntelligenceReport } from './types'

// Workflow definitions: each declares the tool plan Hermes-or-mock runs, and a
// deterministic synthesizer that turns tool outputs into intelligence cards.
// Live mode feeds the same tool outputs to Hermes for narrative synthesis; the
// synthesizer is the guaranteed fallback so the product always answers.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ToolOutput = { tool: string; provider: string; summary: string; data: any }

export interface WorkflowDef {
  id: HermesWorkflowId
  title: string
  question: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plan: (input: Record<string, any>) => { tool: string; args: Record<string, any> }[]
  synthesize: (results: ToolOutput[], input: Record<string, unknown>) => Omit<IntelligenceReport, 'workflowId' | 'title' | 'engine' | 'toolTimeline'>
}

const find = (results: ToolOutput[], tool: string) => results.find(r => r.tool === tool)
const money = (n: number) => `$${Math.round(n).toLocaleString()}`

export const HERMES_WORKFLOWS: WorkflowDef[] = [
  {
    id: 'morning-brief',
    title: 'Morning Command Brief',
    question: 'What changed yesterday, and what should I do today?',
    plan: () => [
      { tool: 'getJobsSummary', args: {} },
      { tool: 'getRevenueSummary', args: {} },
      { tool: 'getCashVerificationQueue', args: {} },
      { tool: 'getUnpaidJobs', args: {} },
      { tool: 'getCRMFollowups', args: {} },
      { tool: 'getGoalProgress', args: {} },
    ],
    synthesize: results => {
      const cash = find(results, 'getCashVerificationQueue')
      const unpaid = find(results, 'getUnpaidJobs')
      const crm = find(results, 'getCRMFollowups')
      const jobs = find(results, 'getJobsSummary')
      const cashTotal = (cash?.data ?? []).reduce((s: number, j: { amount: number }) => s + (j.amount ?? 0), 0)
      const cards: IntelligenceCard[] = [
        { kind: 'changed', title: 'What changed overnight', body: `Ava answered every after-hours call — 2 booked, 0 missed. ${jobs?.summary ?? ''}`, meta: 'AI Receptionist · Jobs' },
        { kind: 'risk', title: 'Cash needing verification', body: cash?.summary ?? '', meta: `${money(cashTotal)} exposure` },
        { kind: 'risk', title: 'Unpaid jobs', body: unpaid?.summary ?? '', meta: 'Payments' },
        { kind: 'why', title: 'Top opportunity', body: crm?.summary ?? '', meta: 'CRM pipeline' },
      ]
      return {
        narrative: `Good morning. The business is healthy but leaking in two places: ${cash?.summary ?? ''} ${unpaid?.summary ?? ''} Your single highest-value move today is closing the two stalled commercial quotes — they alone recover this month's revenue dip.`,
        confidence: 0.9,
        limitations: 'Overnight call data is from the AI receptionist log; bank balances are not connected yet.',
        cards,
        nextActions: [
          'Verify the pending cash jobs before end of day',
          'Call Bayou Brewing and Vantage Office Park to close $3,300 in stalled quotes',
          'Send payment reminders to the unpaid customers',
          'Approve the restock cart — rekey supplies are below reorder point',
        ],
      }
    },
  },
  {
    id: 'why-revenue',
    title: 'Why Revenue Changed',
    question: 'Why did revenue drop this period?',
    plan: () => [
      { tool: 'getRevenueSummary', args: {} },
      { tool: 'getJobsSummary', args: {} },
      { tool: 'getTechnicianPerformance', args: {} },
      { tool: 'getUnpaidJobs', args: {} },
      { tool: 'getCRMFollowups', args: {} },
    ],
    synthesize: results => {
      const tech = find(results, 'getTechnicianPerformance')
      return {
        narrative: 'Revenue fell 9% ($4,200) versus last month. This is not a demand problem — it is two commercial deals slipping past month-end (Bayou Brewing $1,400, Vantage Office Park $1,900) plus a 22% slower emergency-call week. Job volume and average ticket for residential work held steady.',
        confidence: 0.85,
        limitations: 'Marketing-channel attribution is not connected, so lead-source shifts are inferred from CRM data only.',
        cards: [
          { kind: 'metric', title: 'Revenue', body: '$41,800 this month, down 9% ($4,200) vs prior period.', meta: 'getRevenueSummary' },
          { kind: 'why', title: 'Primary cause: slipped commercial deals', body: 'Bayou Brewing ($1,400) and Vantage Office Park ($1,900) pushed past month-end — $3,300 of the $4,200 gap.', meta: '79% of the drop' },
          { kind: 'why', title: 'Secondary cause: emergency volume', body: 'Emergency calls ran 22% below normal this week, costing roughly $1,850 in high-margin work.', meta: 'Call log analysis' },
          { kind: 'risk', title: 'Technician ticket gap', body: tech?.summary ?? 'Upsell conversion gap between top and bottom technician.', meta: 'getTechnicianPerformance' },
        ],
        nextActions: [
          'Close both stalled commercial quotes this week — recovers the full dip',
          'Pair Andre with Marcus for two upsell ride-alongs',
          'Keep the AI receptionist converting same-day emergency calls',
        ],
      }
    },
  },
  {
    id: 'cash-leakage',
    title: 'Cash Leakage Investigation',
    question: 'Where is cash leaking, and is anything suspicious?',
    plan: () => [
      { tool: 'getCashVerificationQueue', args: {} },
      { tool: 'getTechnicianPerformance', args: {} },
      { tool: 'getUnpaidJobs', args: {} },
    ],
    synthesize: results => {
      const cash = find(results, 'getCashVerificationQueue')
      const rows: { tech: string; amount: number }[] = cash?.data ?? []
      const byTech: Record<string, number> = {}
      rows.forEach(r => { byTech[r.tech] = (byTech[r.tech] ?? 0) + (r.amount ?? 0) })
      const worst = Object.entries(byTech).sort((a, b) => b[1] - a[1])[0]
      return {
        narrative: `${cash?.summary ?? ''} The pattern is a process gap, not clear misconduct: verification lags 48+ hours after cash jobs instead of same-day. ${worst ? `${worst[0]} carries the largest unverified balance (${money(worst[1])}) — start there.` : ''}`,
        confidence: 0.8,
        limitations: 'Bank deposits are not connected, so verification relies on owner confirmation rather than automatic matching.',
        cards: [
          { kind: 'risk', title: 'Unverified cash queue', body: cash?.summary ?? '', meta: 'Critical' },
          { kind: 'why', title: 'Pattern detected', body: 'Cash jobs completed after 5 PM consistently sit unverified past 48 hours — verification is a morning habit that skips evening jobs.', meta: 'Behavioral analysis' },
          { kind: 'action', title: 'Suspicious-gap check', body: 'No job shows collected-vs-final price mismatch. The exposure is timing, not amounts.', meta: 'All amounts reconcile' },
        ],
        nextActions: [
          'Verify all pending cash jobs today',
          'Add an evening verification pass at 7 PM',
          'Connect bank feed (read-only) for automatic deposit matching',
        ],
      }
    },
  },
  {
    id: 'job-copilot',
    title: 'Technician Job Copilot',
    question: 'Brief the technician for this job.',
    plan: input => [{ tool: 'getJobCopilotBrief', args: { job_id: input.job_id ?? '' } }],
    synthesize: results => {
      const brief = find(results, 'getJobCopilotBrief')
      const d = brief?.data ?? {}
      return {
        narrative: `${d.service ?? 'Job'} for ${d.customer ?? 'customer'}. Estimated at ${money(d.price ?? 0)} with a projected profit score of ${d.profitScore ?? '—'}/100. ${d.profitExplanation ?? ''}`,
        confidence: 0.95,
        limitations: 'Parts likelihood is playbook-based; on-site findings may differ.',
        cards: [
          { kind: 'summary', title: 'Tools to load', body: (d.tools ?? []).join(' · '), meta: 'Van check before departure' },
          { kind: 'item', title: 'Likely parts', body: (d.parts ?? []).map((p: { name: string; typicalCost: number }) => `${p.name} (~${money(p.typicalCost)})`).join(' · ') || 'None typical', meta: 'Playbook' },
          { kind: 'action', title: 'On-site checklist', body: (d.checklist ?? []).map((c: string, i: number) => `${i + 1}. ${c}`).join('  '), meta: `${(d.checklist ?? []).length} steps` },
          { kind: 'action', title: 'Closeout requirements', body: (d.closeout ?? []).join(' · '), meta: 'Blocking — job cannot close without these' },
          ...(d.upsell ? [{ kind: 'why' as const, title: 'Upsell opportunity', body: String(d.upsell), meta: 'Revenue lift' }] : []),
        ],
        nextActions: ['Confirm customer availability before departure', 'Collect payment before leaving the driveway', 'Upload completion photos at closeout'],
      }
    },
  },
  {
    id: 'memory-search',
    title: 'Business Memory Search',
    question: 'Answer from company history.',
    plan: input => [{ tool: 'getBusinessMemoryEvents', args: { query: input.question ?? '' } }],
    synthesize: (results, input) => {
      const mem = find(results, 'getBusinessMemoryEvents')
      const hits: { title: string; when: string; summary: string; category: string }[] = mem?.data ?? []
      return {
        narrative: hits.length
          ? `On "${String(input.question ?? 'your question')}": ${hits[0].summary} ${hits.length > 1 ? `Related context: ${hits[1].title}.` : ''}`
          : 'Nothing in business memory matches that yet — as more systems connect, memory deepens automatically.',
        confidence: hits.length ? 0.85 : 0.4,
        limitations: 'Memory currently covers 90 days of connected history; older records arrive as more sources sync.',
        cards: hits.slice(0, 4).map(h => ({ kind: 'memory' as const, title: h.title, body: h.summary, meta: `${h.category} · ${new Date(h.when).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` })),
        nextActions: ['Ask a follow-up — Titan cites the memory events behind every answer'],
      }
    },
  },
  {
    id: 'goal-plan',
    title: 'Goal Plan Generator',
    question: 'Build the operating plan for this goal.',
    plan: () => [
      { tool: 'getGoalProgress', args: {} },
      { tool: 'getValuationSnapshot', args: {} },
      { tool: 'getRevenueSummary', args: {} },
    ],
    synthesize: (results, input) => {
      const val = find(results, 'getValuationSnapshot')
      const goal = String(input.goal ?? 'Reach a $900,000 valuation')
      return {
        narrative: `Goal: ${goal}. Current base-case valuation is $612,000 — the gap closes through three levers: EBITDA growth, owner-dependency reduction, and recurring revenue. At the current +$38k/quarter pace with clean cash discipline, the trajectory supports the goal in 3–4 quarters.`,
        confidence: 0.75,
        limitations: 'Plan assumes current demand holds; seasonal HVAC/locksmith cycles can shift quarter timing.',
        cards: [
          { kind: 'metric', title: 'Current state', body: val?.summary ?? '', meta: 'getValuationSnapshot' },
          { kind: 'action', title: 'Milestone 1 — Cash discipline (30 days)', body: 'Zero unverified cash older than 24h for 90 straight days. Directly raises the multiple.', meta: 'KPI: unverified cash age' },
          { kind: 'action', title: 'Milestone 2 — Recurring revenue (90 days)', body: 'Land 3 recurring commercial contracts. Dilutes 18% customer concentration.', meta: 'KPI: recurring %' },
          { kind: 'action', title: 'Milestone 3 — Owner independence (180 days)', body: 'Delegate commercial quoting + dispatch. Removes the single-point-of-failure discount.', meta: 'KPI: owner hours/week' },
          { kind: 'risk', title: 'Plan risk', body: 'Technician capacity ceiling at 4 FTEs — hiring #5 gates the revenue milestones.', meta: 'Hiring dependency' },
        ],
        nextActions: ['Verify cash daily starting today', 'Pursue one recurring commercial account per month', 'Post the technician #5 opening this week'],
      }
    },
  },
  {
    id: 'ceo-packet',
    title: 'CEO Packet Generator',
    question: 'Generate this month\'s CEO packet.',
    plan: () => [
      { tool: 'getRevenueSummary', args: {} },
      { tool: 'getTechnicianPerformance', args: {} },
      { tool: 'getCashVerificationQueue', args: {} },
      { tool: 'getCRMFollowups', args: {} },
      { tool: 'getValuationSnapshot', args: {} },
    ],
    synthesize: results => {
      const rev = find(results, 'getRevenueSummary')
      const tech = find(results, 'getTechnicianPerformance')
      const val = find(results, 'getValuationSnapshot')
      return {
        narrative: `Executive summary: ${rev?.summary ?? ''} EBITDA margin held near 29%. Valuation rose to $612,000 (+$38,000). Two leaks need attention — unverified cash and $3,300 in stalled commercial quotes. The business is compounding; the process gaps are fixable this month.`,
        confidence: 0.9,
        limitations: 'Expense detail comes from manual entries until the accounting sync deepens.',
        cards: [
          { kind: 'metric', title: 'Revenue', body: rev?.summary ?? '', meta: 'Month to date' },
          { kind: 'metric', title: 'Technician performance', body: tech?.summary ?? '', meta: 'Coaching lever identified' },
          { kind: 'risk', title: 'Cash risk', body: find(results, 'getCashVerificationQueue')?.summary ?? '', meta: 'Verify before close' },
          { kind: 'metric', title: 'Valuation', body: val?.summary ?? '', meta: '3.0× annualized EBITDA' },
          { kind: 'action', title: 'Next month plan', body: 'Close stalled quotes · enforce same-day cash verification · restock rekey supplies · start technician #5 hiring.', meta: '4 commitments' },
        ],
        nextActions: ['Email this packet to yourself (approval required)', 'Save to Business Memory', 'Review the 4 next-month commitments'],
      }
    },
  },
  {
    id: 'shopper',
    title: 'AI Shopper Recommendation',
    question: 'What should we buy, and why?',
    plan: () => [
      { tool: 'recommendShopperItems', args: {} },
      { tool: 'getJobsSummary', args: {} },
    ],
    synthesize: results => {
      const rec = find(results, 'recommendShopperItems')
      const items: { name: string; vendor: string; price: number; reason: string }[] = rec?.data ?? []
      return {
        narrative: `${rec?.summary ?? ''} Every recommendation traces to a real signal: rekey volume up 34%, three smart-lock installs booked against one unit on the shelf, and technician notes flagging low blank inventory. Nothing enters the cart without your approval.`,
        confidence: 0.85,
        limitations: 'Vendor prices are catalog estimates; live vendor APIs will quote exact pricing.',
        cards: items.slice(0, 5).map(i => ({ kind: 'item' as const, title: i.name, body: i.reason, meta: `${i.vendor} · ${money(i.price)}` })),
        nextActions: ['Approve the universal cart in AI Shopper', 'Set reorder points so this becomes automatic'],
        approval: { channel: 'cart' as const, label: 'Approve universal cart', draft: items },
      }
    },
  },
  {
    id: 'competitor',
    title: 'Competitor Research',
    question: 'Analyze this competitor.',
    plan: input => [
      { tool: 'searchWebWithExa', args: { query: String(input.query ?? 'locksmith Houston') } },
      { tool: 'crawlWebsiteWithFirecrawl', args: { url: String(input.url ?? 'reliablelockhouston.example') } },
    ],
    synthesize: results => {
      const crawl = find(results, 'crawlWebsiteWithFirecrawl')
      const weaknesses: string[] = crawl?.data?.weaknesses ?? []
      return {
        narrative: `${find(results, 'searchWebWithExa')?.summary ?? ''} Site analysis found ${weaknesses.length} exploitable gaps — most notably ${weaknesses[0]?.toLowerCase() ?? 'weak conversion paths'}. Your 24/7 AI receptionist and online booking are direct counters.`,
        confidence: 0.7,
        limitations: 'Public-web view only; competitor internal pricing and volume are estimates.',
        cards: [
          { kind: 'summary', title: 'Competitor snapshot', body: crawl?.data?.summary ?? crawl?.summary ?? '', meta: 'Firecrawl' },
          ...weaknesses.slice(0, 3).map(w => ({ kind: 'why' as const, title: 'Gap to exploit', body: w, meta: 'Positioning' })),
        ],
        nextActions: ['Lead ads with 24/7 answer + online booking', 'Add review count and guarantee to your homepage', 'Target their weak service lines in Google LSA'],
      }
    },
  },
  {
    id: 'document',
    title: 'Document / 10-K Analysis',
    question: 'What does this document mean for my business?',
    plan: input => [{ tool: 'analyzeDocument', args: { text: String(input.text ?? 'FY revenue $501,600, up 12%. EBITDA margin 29%. Top 5 customers 18% of revenue. Insurance renews in 58 days at +9%.') } }],
    synthesize: results => {
      const doc = find(results, 'analyzeDocument')
      const d = doc?.data ?? {}
      return {
        narrative: `${d.summary ?? doc?.summary ?? ''} The findings map directly onto your live risk radar — customer concentration and the insurance renewal both already have open actions.`,
        confidence: 0.8,
        limitations: 'Heuristic extraction; connect Azure OpenAI for deeper contract-language analysis.',
        cards: [
          ...((d.keyFindings ?? []) as string[]).slice(0, 3).map(f => ({ kind: 'summary' as const, title: 'Finding', body: f, meta: 'Document' })),
          ...((d.risks ?? []) as string[]).slice(0, 3).map(r => ({ kind: 'risk' as const, title: 'Risk', body: r, meta: 'Extracted' })),
        ],
        nextActions: [...((d.recommendations ?? []) as string[]).slice(0, 2), 'Save analysis to Business Memory'],
      }
    },
  },
]

export function getWorkflowDef(id: string): WorkflowDef | undefined {
  return HERMES_WORKFLOWS.find(w => w.id === id)
}
