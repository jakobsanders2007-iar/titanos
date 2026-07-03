import 'server-only'
import type { TitanHermesTool } from './types'
import { DEMO_JOBS, DEMO_CUSTOMERS, DEMO_TECHNICIANS } from '@/lib/demo-data'
import { DEMO_GOALS, DEMO_MEMORY, DEMO_WHY } from '@/lib/demo-intelligence'
import { DEMO_LEADS, DEMO_SHOPPER_ITEMS } from '@/lib/demo-extended'
import { computeJobFlow, type EngineJob } from '@/lib/job-engine'
import * as exa from '@/lib/integrations/exa'
import * as firecrawl from '@/lib/integrations/firecrawl'
import * as smarty from '@/lib/integrations/smarty'
import * as resend from '@/lib/integrations/resend'
import * as telnyx from '@/lib/integrations/telnyx'
import * as gladia from '@/lib/integrations/gladia'
import * as azure from '@/lib/integrations/azure'

function schema(name: string, description: string, props: Record<string, string> = {}, required: string[] = []): TitanHermesTool['schema'] {
  return {
    type: 'function',
    function: {
      name,
      description,
      parameters: {
        type: 'object',
        properties: Object.fromEntries(Object.entries(props).map(([k, d]) => [k, { type: 'string', description: d }])),
        required,
      },
    },
  }
}

const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`
const custName = (id: string) => DEMO_CUSTOMERS.find(c => c.id === id)?.name ?? 'Unknown'
const techName = (id: string | null) => DEMO_TECHNICIANS.find(t => t.id === id)?.name ?? 'Unassigned'

// ---------------------------------------------------------------------------
// Internal business-data tools
// ---------------------------------------------------------------------------

const internalTools: TitanHermesTool[] = [
  {
    schema: schema('getRevenueSummary', 'Revenue, average ticket, and completed-job counts for the trailing period.'),
    provider: 'titan-db',
    execute: async () => {
      const done = DEMO_JOBS.filter(j => j.status === 'Completed' && j.final_price)
      const revenue = done.reduce((s, j) => s + (j.final_price ?? 0), 0)
      const avg = done.length ? revenue / done.length : 0
      return {
        summary: `${done.length} completed jobs, ${fmt(revenue)} revenue, ${fmt(avg)} average ticket.`,
        data: { completedJobs: done.length, revenue, averageTicket: Math.round(avg) },
      }
    },
  },
  {
    schema: schema('getJobsSummary', 'Open, scheduled, in-progress, and problem jobs right now.'),
    provider: 'titan-db',
    execute: async () => {
      const open = DEMO_JOBS.filter(j => !['Completed', 'Cancelled', 'No Show'].includes(j.status))
      const live = DEMO_JOBS.filter(j => ['En Route', 'Arrived', 'In Progress'].includes(j.status))
      const noShows = DEMO_JOBS.filter(j => j.status === 'No Show').length
      return {
        summary: `${open.length} open jobs, ${live.length} live right now, ${noShows} recent no-shows.`,
        data: { open: open.length, live: live.length, noShows },
      }
    },
  },
  {
    schema: schema('getCashVerificationQueue', 'Cash collections still awaiting owner verification.'),
    provider: 'titan-db',
    execute: async () => {
      const pending = DEMO_JOBS.filter(j => j.cash_verification_status === 'pending')
      const total = pending.reduce((s, j) => s + (j.amount_collected ?? 0), 0)
      return {
        summary: `${pending.length} cash jobs unverified totaling ${fmt(total)}.`,
        data: pending.map(j => ({ job: j.id, customer: custName(j.customer_id), tech: techName(j.technician_id), amount: j.amount_collected })),
      }
    },
  },
  {
    schema: schema('getTechnicianPerformance', 'Revenue, job count, and average ticket per technician.'),
    provider: 'titan-db',
    execute: async () => {
      const rows = DEMO_TECHNICIANS.map(t => {
        const jobs = DEMO_JOBS.filter(j => j.technician_id === t.id && j.status === 'Completed' && j.final_price)
        const rev = jobs.reduce((s, j) => s + (j.final_price ?? 0), 0)
        return { name: t.name, jobs: jobs.length, revenue: rev, avgTicket: jobs.length ? Math.round(rev / jobs.length) : 0 }
      }).sort((a, b) => b.revenue - a.revenue)
      return {
        summary: `Top: ${rows[0]?.name} at ${fmt(rows[0]?.revenue ?? 0)}. Gap to lowest avg ticket: ${fmt((rows[0]?.avgTicket ?? 0) - (rows[rows.length - 1]?.avgTicket ?? 0))}.`,
        data: rows,
      }
    },
  },
  {
    schema: schema('getUnpaidJobs', 'Completed jobs with money still uncollected.'),
    provider: 'titan-db',
    execute: async () => {
      const unpaid = DEMO_JOBS.filter(j => j.status === 'Completed' && j.payment_status !== 'Paid' && j.cash_verification_status !== 'pending')
      const owed = unpaid.reduce((s, j) => s + ((j.final_price ?? j.estimated_price ?? 0) - (j.amount_collected ?? 0)), 0)
      return {
        summary: `${unpaid.length} completed jobs unpaid, ${fmt(owed)} outstanding.`,
        data: unpaid.map(j => ({ job: j.id, customer: custName(j.customer_id), owed: (j.final_price ?? j.estimated_price ?? 0) - (j.amount_collected ?? 0) })),
      }
    },
  },
  {
    schema: schema('getCRMFollowups', 'Leads and quotes with overdue or due follow-ups.'),
    provider: 'titan-db',
    execute: async () => {
      const now = Date.now()
      const overdue = DEMO_LEADS.filter(l => l.next_followup && new Date(l.next_followup).getTime() <= now && !['Won', 'Lost'].includes(l.stage))
      const value = overdue.reduce((s, l) => s + l.estimated_value, 0)
      return {
        summary: `${overdue.length} follow-ups due now worth ${fmt(value)} (${overdue.slice(0, 3).map(l => l.name).join(', ')}).`,
        data: overdue.map(l => ({ name: l.name, value: l.estimated_value, need: l.service_need })),
      }
    },
  },
  {
    schema: schema('getGoalProgress', 'Progress on every active business goal.'),
    provider: 'titan-db',
    execute: async () => ({
      summary: DEMO_GOALS.map(g => `${g.type}: ${Math.round((g.current / g.target) * 100)}%`).join(' · '),
      data: DEMO_GOALS.map(g => ({ goal: g.title, type: g.type, pct: Math.round((g.current / g.target) * 100), latest: g.latestImpact })),
    }),
  },
  {
    schema: schema('getValuationSnapshot', 'Current business valuation estimate and drivers.'),
    provider: 'titan-db',
    execute: async () => ({
      summary: 'Base-case valuation $612,000 (3.0× annualized EBITDA), +$38,000 this quarter. Headwind: 18% customer concentration.',
      data: { base: 612000, low: 408000, high: 816000, delta: 38000, headwind: 'customer concentration 18%' },
    }),
  },
  {
    schema: schema('getBusinessMemoryEvents', 'Search business memory for past decisions, documents, and KPI events.', { query: 'What to search for' }),
    provider: 'titan-db',
    execute: async args => {
      const q = String(args.query ?? '').toLowerCase()
      const hits = DEMO_MEMORY.filter(m => !q || m.title.toLowerCase().includes(q) || m.summary.toLowerCase().includes(q) || m.tags.some(t => q.includes(t) || t.includes(q)))
      return {
        summary: `${hits.length} memory events matched${q ? ` "${args.query}"` : ''}.`,
        data: hits.slice(0, 6).map(m => ({ title: m.title, when: m.date, summary: m.summary, category: m.category })),
      }
    },
  },
  {
    schema: schema('getJobCopilotBrief', 'Full playbook brief for one job: tools, parts, checklist, pricing, upsell, closeout.', { job_id: 'The job id' }),
    provider: 'titan-db',
    execute: async args => {
      const job = DEMO_JOBS.find(j => j.id === String(args.job_id)) ?? DEMO_JOBS.find(j => ['Assigned', 'Scheduled', 'En Route', 'In Progress'].includes(j.status)) ?? DEMO_JOBS[0]
      const flow = computeJobFlow(job as unknown as EngineJob)
      return {
        summary: `${job.service_type} for ${custName(job.customer_id)} — ${flow.playbook.tools.length} tools, ${flow.playbook.checklist.length} checklist steps, profit score ${flow.profit.score}.`,
        data: {
          job: job.id, service: job.service_type, customer: custName(job.customer_id),
          tools: flow.playbook.tools, parts: flow.playbook.parts, checklist: flow.playbook.checklist,
          closeout: flow.playbook.closeout, upsell: flow.playbook.upsell, price: job.estimated_price,
          profitScore: flow.profit.score, profitExplanation: flow.profit.explanation,
        },
      }
    },
  },
]

// ---------------------------------------------------------------------------
// External tools (existing integration wrappers; drafts never send)
// ---------------------------------------------------------------------------

const externalTools: TitanHermesTool[] = [
  {
    schema: schema('searchWebWithExa', 'Search the public web (competitors, vendors, market).', { query: 'Search query' }, ['query']),
    provider: 'exa',
    execute: async args => {
      const r = await exa.findCompetitors(String(args.query ?? 'locksmith Houston'))
      return { summary: r.summary, data: r.data }
    },
  },
  {
    schema: schema('crawlWebsiteWithFirecrawl', 'Crawl a website and summarize strengths/weaknesses.', { url: 'Website URL' }, ['url']),
    provider: 'firecrawl',
    execute: async args => {
      const r = await firecrawl.summarizeWebsite(String(args.url ?? ''))
      return { summary: r.summary, data: r.data }
    },
  },
  {
    schema: schema('validateAddressWithSmarty', 'Validate and normalize a customer address.', { address: 'Street address' }, ['address']),
    provider: 'smarty',
    execute: async args => {
      const r = await smarty.validateAddress(String(args.address ?? ''))
      return { summary: r.summary, data: r.data }
    },
  },
  {
    schema: schema('draftEmailWithResend', 'DRAFT an email for owner approval — never sends.', { to: 'Recipient', subject: 'Subject', body: 'Body' }, ['to', 'subject', 'body']),
    provider: 'resend',
    requiresApproval: true,
    execute: async args => {
      const r = resend.draftEmail(String(args.to ?? ''), String(args.subject ?? ''), String(args.body ?? ''))
      return { summary: r.summary, data: r.data }
    },
  },
  {
    schema: schema('draftSMSWithTelnyx', 'DRAFT an SMS for owner approval — never sends.', { to: 'Phone number', body: 'Message' }, ['to', 'body']),
    provider: 'telnyx',
    requiresApproval: true,
    execute: async args => {
      const r = telnyx.draftSMS(String(args.to ?? ''), String(args.body ?? ''))
      return { summary: r.summary, data: r.data }
    },
  },
  {
    schema: schema('summarizeCallWithGladia', 'Summarize a call transcript with sentiment and action items.', { transcript: 'Transcript text' }, ['transcript']),
    provider: 'gladia',
    execute: async args => {
      const r = gladia.summarizeCallTranscript(String(args.transcript ?? ''))
      return { summary: r.summary, data: r.data }
    },
  },
  {
    schema: schema('analyzeDocument', 'Analyze document/10-K text: summary, findings, risks, recommendations.', { text: 'Document text' }, ['text']),
    provider: 'azure',
    execute: async args => {
      const r = azure.summarizeDocument(String(args.text ?? ''))
      return { summary: r.summary, data: r.data }
    },
  },
  {
    schema: schema('recommendShopperItems', 'Supplies/tools to buy based on job history and technician notes.'),
    provider: 'titan-db',
    execute: async () => {
      const restock = DEMO_SHOPPER_ITEMS.filter(i => i.urgency === 'Restock Now')
      return {
        summary: `${restock.length} restock-now items, est. ${fmt(restock.reduce((s, i) => s + i.price * i.qty, 0))}.`,
        data: restock.map(i => ({ name: i.name, vendor: i.vendor, price: i.price, reason: i.reason })),
      }
    },
  },
]

export const HERMES_TOOLS: TitanHermesTool[] = [...internalTools, ...externalTools]

export function getHermesTool(name: string): TitanHermesTool | undefined {
  return HERMES_TOOLS.find(t => t.schema.function.name === name)
}

export function hermesToolSchemas() {
  return HERMES_TOOLS.map(t => t.schema)
}

// Re-export a couple of pieces the workflows reuse for deterministic synthesis.
export { DEMO_WHY }
