import 'server-only'
import * as exa from '@/lib/integrations/exa'
import * as firecrawl from '@/lib/integrations/firecrawl'
import * as smarty from '@/lib/integrations/smarty'
import * as telnyx from '@/lib/integrations/telnyx'
import * as resend from '@/lib/integrations/resend'
import * as azure from '@/lib/integrations/azure'
import * as gladia from '@/lib/integrations/gladia'
import * as vapi from '@/lib/integrations/vapi'
import { logToolRun } from './log'
import type { WorkflowResult, ToolRun } from './types'
import type { ToolResult } from '@/lib/integrations/types'
import { DEMO_WHY } from '@/lib/demo-intelligence'
import { DEMO_SHOPPER_ITEMS } from '@/lib/demo-extended'
import { DEMO_JOBS } from '@/lib/demo-data'

async function track(toolName: string, provider: string, result: ToolResult, status: ToolRun['status'] = 'ok'): Promise<ToolRun> {
  const run: ToolRun = { toolName, provider, status: result.ok ? status : 'error', mock: result.mock, summary: result.summary, output: result.data }
  await logToolRun(run)
  return run
}

// 1 — Research a competitor using Exa + Firecrawl
async function researchCompetitor(): Promise<WorkflowResult> {
  const found = await exa.findCompetitors('locksmith Houston')
  const top = found.data?.[0]
  const crawl = top ? await firecrawl.summarizeWebsite(top.url) : null
  const runs = [await track('findCompetitors', 'exa', found)]
  if (crawl) runs.push(await track('summarizeWebsite', 'firecrawl', crawl))
  return {
    id: 'wf-competitor', title: 'Research a competitor',
    toolsUsed: ['Exa · findCompetitors', 'Firecrawl · summarizeWebsite'],
    answer: `Found ${found.data?.length ?? 0} competitors. Top match: ${top?.title ?? 'n/a'}. Site analysis surfaced ${crawl?.data?.weaknesses.length ?? 0} weaknesses: ${(crawl?.data?.weaknesses ?? []).slice(0, 2).join('; ')}.`,
    nextAction: 'Position your Google ads and site copy against these competitor gaps.',
    detail: { competitors: found.data, analysis: crawl?.data },
  }
}

// 2 — Crawl a business website and summarize weaknesses
async function crawlAndSummarize(url = 'reliablelockhouston.example'): Promise<WorkflowResult> {
  const summary = await firecrawl.summarizeWebsite(url)
  return {
    id: 'wf-crawl', title: 'Crawl a website & summarize weaknesses',
    toolsUsed: ['Firecrawl · summarizeWebsite'],
    answer: `${summary.data?.summary ?? summary.summary} Weaknesses: ${(summary.data?.weaknesses ?? []).join('; ')}.`,
    nextAction: 'Turn each weakness into a differentiator on your own site.',
    detail: summary.data,
  }
}

// 3 — Validate a customer address with Smarty
async function validateCustomerAddress(address = '1204 Oak Lane, Houston, TX 77001'): Promise<WorkflowResult> {
  const v = await smarty.validateAddress(address)
  await track('validateAddress', 'smarty', v)
  return {
    id: 'wf-address', title: 'Validate a customer address',
    toolsUsed: ['Smarty · validateAddress'],
    answer: `${address} → ${v.data?.valid ? 'valid' : 'invalid'}, normalized to "${v.data?.normalized}". ${v.data?.inServiceArea ? 'In service area.' : 'Outside service area.'}`,
    nextAction: v.data?.inServiceArea ? 'Proceed to book the job.' : 'Flag as out-of-area before dispatching.',
    detail: v.data,
  }
}

// 4 — Draft an SMS payment reminder with Telnyx (approval-gated)
async function draftPaymentReminder(): Promise<WorkflowResult> {
  const unpaid = DEMO_JOBS.find(j => j.status === 'Completed' && j.payment_status !== 'Paid')
  const draft = telnyx.sendPaymentReminder('(555) 300-1004', '$95', 'pay.titan.com/xyz')
  await track('sendPaymentReminder', 'telnyx', draft, 'draft')
  return {
    id: 'wf-sms-reminder', title: 'Draft an SMS payment reminder',
    toolsUsed: ['Telnyx · sendPaymentReminder (draft)'],
    answer: `Drafted a payment reminder for job ${unpaid?.id ?? 'job-019'}. Nothing has been sent.`,
    nextAction: 'Review the message, then approve to send via Telnyx.',
    detail: draft.data,
    approval: { tool: 'sendPaymentReminder', channel: 'sms', draft: draft.data, label: 'Approve & send SMS' },
  }
}

// 5 — Draft a CEO packet email with Resend (approval-gated)
async function draftCEOPacketEmail(): Promise<WorkflowResult> {
  const month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const body = `Executive summary for ${month}:\n\n• Revenue: $41,800 (-9%)\n• EBITDA margin: 29%\n• Cash buffer: 11 days\n• Valuation estimate: $612,000 (+$38,000)\n\nTop action: close the two stalled commercial quotes to recover the revenue dip.`
  const draft = resend.sendCEOPacketEmail('owner@titanlocksmith.com', month, body)
  await track('sendCEOPacketEmail', 'resend', draft, 'draft')
  return {
    id: 'wf-ceo-email', title: 'Draft a CEO packet email',
    toolsUsed: ['Resend · sendCEOPacketEmail (draft)'],
    answer: `Drafted the ${month} CEO packet email to the owner. Not sent yet.`,
    nextAction: 'Review and approve to send via Resend.',
    detail: draft.data,
    approval: { tool: 'sendCEOPacketEmail', channel: 'email', draft: draft.data, label: 'Approve & send email' },
  }
}

// 6 — Analyze a pasted document / 10-K text
async function analyzeDocument(text?: string): Promise<WorkflowResult> {
  const sample = text ?? 'FY revenue $501,600, up 12%. EBITDA margin 29%. Top 5 customers represent 18% of revenue (customer concentration). All commercial quoting requires owner approval. Insurance renews in 58 days.'
  const analysis = azure.summarizeDocument(sample)
  await track('summarizeDocument', 'azure', analysis)
  return {
    id: 'wf-doc', title: 'Analyze a document / 10-K',
    toolsUsed: ['Azure OpenAI · summarizeDocument'],
    answer: `${analysis.data?.summary} Risks: ${(analysis.data?.risks ?? []).join('; ')}.`,
    nextAction: (analysis.data?.recommendations ?? [])[0] ?? 'File into Company Memory.',
    detail: analysis.data,
  }
}

// 7 — Summarize a fake call transcript using Gladia-style output
async function summarizeCall(): Promise<WorkflowResult> {
  const t = await gladia.transcribeAudio('inbound-call.mp3')
  const summary = gladia.summarizeCallTranscript(t.data?.text ?? '')
  const runs = [await track('transcribeAudio', 'gladia', t), await track('summarizeCallTranscript', 'gladia', summary)]
  return {
    id: 'wf-transcript', title: 'Summarize a call transcript',
    toolsUsed: ['Gladia · transcribeAudio', 'Gladia · summarizeCallTranscript'],
    answer: `${summary.data?.summary} Sentiment: ${summary.data?.sentiment}.`,
    nextAction: (summary.data?.actionItems ?? [])[0] ?? 'Follow up with the caller.',
    detail: { transcript: t.data?.text, summary: summary.data, runs: runs.length },
  }
}

// 8 — Simulate an AI receptionist booking a job with Vapi-style output
async function simulateReceptionist(): Promise<WorkflowResult> {
  const call = await vapi.simulateReceptionistCall('Hi, I am locked out of my house on Oak Lane and my kids need to get in.')
  await track('simulateReceptionistCall', 'vapi', call)
  return {
    id: 'wf-receptionist', title: 'Simulate AI receptionist booking',
    toolsUsed: ['Vapi · simulateReceptionistCall'],
    answer: `Ava booked a ${call.data?.serviceType} at $${call.data?.quotedPrice} (${call.data?.urgency}). ${call.data?.summary}`,
    nextAction: 'Confirm the booked job appears on the dispatch board and a tech is assigned.',
    detail: call.data,
  }
}

// 9 — Ask why revenue dropped using internal demo data
async function explainRevenueDrop(): Promise<WorkflowResult> {
  const w = DEMO_WHY.find(x => x.id === 'why-revenue-drop')!
  await track('explainRevenue', 'titan-db', { ok: true, provider: 'titan-db', mock: false, summary: w.rootCause, data: w })
  return {
    id: 'wf-why-revenue', title: 'Why did revenue drop?',
    toolsUsed: ['Titan DB · explainRevenue', 'Azure OpenAI · analyzeBusinessData'],
    answer: `${w.headline} ${w.rootCause}`,
    nextAction: w.recommendation,
    detail: { factors: w.factors, recommendation: w.recommendation },
  }
}

// 10 — Recommend supplies using job history + AI Shopper
async function recommendSupplies(): Promise<WorkflowResult> {
  const restock = DEMO_SHOPPER_ITEMS.filter(i => i.urgency === 'Restock Now')
  const total = restock.reduce((s, i) => s + i.price * i.qty, 0)
  await track('recommendSupplies', 'titan-db', { ok: true, provider: 'titan-db', mock: false, summary: `${restock.length} restock items`, data: restock })
  return {
    id: 'wf-supplies', title: 'Recommend supplies to buy',
    toolsUsed: ['Titan DB · job history', 'AI Shopper · recommendSupplies'],
    answer: `${restock.length} items need restocking now (est. $${total.toLocaleString()}): ${restock.slice(0, 3).map(i => i.name).join(', ')}${restock.length > 3 ? '…' : ''}.`,
    nextAction: 'Approve the restock cart in AI Shopper.',
    detail: restock.map(i => ({ name: i.name, vendor: i.vendor, price: i.price, reason: i.reason })),
  }
}

export const WORKFLOWS: { id: string; title: string; run: () => Promise<WorkflowResult> }[] = [
  { id: 'wf-competitor', title: 'Research a competitor (Exa + Firecrawl)', run: researchCompetitor },
  { id: 'wf-crawl', title: 'Crawl a website & summarize weaknesses', run: () => crawlAndSummarize() },
  { id: 'wf-address', title: 'Validate a customer address (Smarty)', run: () => validateCustomerAddress() },
  { id: 'wf-sms-reminder', title: 'Draft an SMS payment reminder (Telnyx)', run: draftPaymentReminder },
  { id: 'wf-ceo-email', title: 'Draft a CEO packet email (Resend)', run: draftCEOPacketEmail },
  { id: 'wf-doc', title: 'Analyze a document / 10-K (Azure)', run: () => analyzeDocument() },
  { id: 'wf-transcript', title: 'Summarize a call transcript (Gladia)', run: summarizeCall },
  { id: 'wf-receptionist', title: 'Simulate AI receptionist booking (Vapi)', run: simulateReceptionist },
  { id: 'wf-why-revenue', title: 'Why did revenue drop? (internal data)', run: explainRevenueDrop },
  { id: 'wf-supplies', title: 'Recommend supplies (job history + AI Shopper)', run: recommendSupplies },
]

export async function runWorkflow(id: string): Promise<WorkflowResult> {
  const wf = WORKFLOWS.find(w => w.id === id)
  if (!wf) throw new Error(`Unknown workflow: ${id}`)
  return wf.run()
}
