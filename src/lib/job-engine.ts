import { getPlaybook, type Playbook } from './job-playbooks'

// Loose job shape compatible with demo-data + DB rows.
export interface EngineJob {
  id: string
  customer_id: string
  technician_id: string | null
  service_type: string
  source: string
  status: string
  address: string
  scheduled_start: string
  estimated_price: number
  final_price: number | null
  amount_collected: number
  payment_method: string | null
  payment_status: string
  cash_verification_status: string | null
  payment_link_sent: boolean
  parts_cost: number
  technician_notes: string
  notes: string
  updated_at: string
}

export const LIFECYCLE_STAGES = [
  'Call & Intake',
  'Diagnosis',
  'Dispatch',
  'Tools & Parts',
  'On-Site Work',
  'Payment',
  'Closeout',
  'Profit',
  'Follow-up',
] as const

export type StageName = typeof LIFECYCLE_STAGES[number]
export type StageState = 'done' | 'current' | 'upcoming' | 'blocked'
export type RiskLevel = 'critical' | 'warning' | 'info'

export interface Risk {
  level: RiskLevel
  message: string
  amount?: number
}

export interface CollectItem {
  label: string
  done: boolean
  critical: boolean
}

export interface JobFlow {
  stageIndex: number
  stages: { name: StageName; state: StageState }[]
  nextAction: { label: string; detail: string; urgency: RiskLevel }
  risks: Risk[]
  mustCollect: CollectItem[]
  playbook: Playbook
  profit: {
    revenue: number
    partsCost: number
    laborCost: number
    grossProfit: number
    margin: number
  }
  valuation: {
    valueContribution: number
    positive: boolean
    note: string
  }
  followUp: { dueInDays: number; action: string } | null
  isLive: boolean // actively happening right now
}

const LABOR_LOADED_RATE = 55 // $/hr fully-loaded technician cost proxy

function statusToStageIndex(job: EngineJob): number {
  switch (job.status) {
    case 'New Lead':
      return 1 // needs diagnosis / estimate
    case 'Scheduled':
      return job.technician_id ? 3 : 2 // assigned tech → tools; else dispatch
    case 'Assigned':
      return 3
    case 'En Route':
    case 'Arrived':
      return 4
    case 'In Progress':
      return 4
    case 'Completed': {
      const paid = job.payment_status === 'Paid'
      const cashPending = job.cash_verification_status === 'pending'
      if (!paid && job.amount_collected === 0) return 5 // payment
      if (cashPending) return 6 // closeout — verify cash
      if (paid) return 8 // follow-up
      return 6
    }
    case 'Cancelled':
    case 'No Show':
      return 2
    default:
      return 0
  }
}

function buildNextAction(job: EngineJob): { label: string; detail: string; urgency: RiskLevel } {
  const soon = new Date(job.scheduled_start).getTime() - Date.now()
  const hoursOut = soon / 36e5

  switch (job.status) {
    case 'New Lead':
      return { label: 'Qualify & send estimate', detail: `Confirm scope and quote ${job.service_type}. Convert this lead before it goes cold.`, urgency: 'warning' }
    case 'Scheduled':
      if (!job.technician_id) return { label: 'Assign a technician', detail: `No tech assigned. ${hoursOut < 4 ? 'Starts soon — assign now.' : 'Route the closest available tech.'}`, urgency: hoursOut < 4 ? 'critical' : 'warning' }
      return { label: 'Confirm & prep for dispatch', detail: 'Send confirmation text and verify the tech has the right tools loaded.', urgency: 'info' }
    case 'Assigned':
      return { label: 'Send tech en route', detail: 'Tech assigned — dispatch now and share live ETA with the customer.', urgency: 'info' }
    case 'En Route':
      return { label: 'Track arrival', detail: 'Tech is on the way. Confirm access and payment method before arrival.', urgency: 'info' }
    case 'Arrived':
      return { label: 'Verify ID, then start work', detail: 'Confirm authorization and photograph condition before starting.', urgency: 'info' }
    case 'In Progress':
      return { label: 'Complete work & collect payment', detail: 'Run the on-site checklist. Do not leave without collecting payment.', urgency: 'warning' }
    case 'Completed': {
      if (job.payment_status !== 'Paid' && job.amount_collected === 0)
        return { label: 'Collect payment', detail: job.payment_link_sent ? 'Link sent but unpaid — call the customer to close it out.' : 'No payment collected. Send a payment link now.', urgency: 'critical' }
      if (job.cash_verification_status === 'pending')
        return { label: 'Verify cash collected', detail: `Tech reported ${job.amount_collected ? '$' + job.amount_collected : 'cash'} — verify it hit the deposit before closing.`, urgency: 'critical' }
      return { label: 'Request review & schedule follow-up', detail: 'Paid and closed. Ask for a review and set the follow-up touch.', urgency: 'info' }
    }
    case 'No Show':
      return { label: 'Recover the no-show', detail: 'Call the customer and reschedule — recover the revenue.', urgency: 'warning' }
    case 'Cancelled':
      return { label: 'Win it back', detail: 'Follow up to reschedule or capture why it cancelled.', urgency: 'info' }
    default:
      return { label: 'Review job', detail: 'Open the job to continue.', urgency: 'info' }
  }
}

function buildRisks(job: EngineJob, profit: JobFlow['profit']): Risk[] {
  const risks: Risk[] = []
  const hoursOut = (new Date(job.scheduled_start).getTime() - Date.now()) / 36e5

  if (job.cash_verification_status === 'pending')
    risks.push({ level: 'critical', message: 'Cash collected but not verified — leakage risk', amount: job.amount_collected })

  if (job.status === 'Completed' && job.payment_status !== 'Paid' && job.amount_collected === 0)
    risks.push({ level: 'critical', message: 'Job completed but payment not collected', amount: job.final_price ?? job.estimated_price })

  if (job.payment_status === 'Payment Link Sent' && job.amount_collected === 0)
    risks.push({ level: 'warning', message: 'Payment link sent but not paid', amount: job.final_price ?? job.estimated_price })

  if ((job.status === 'Scheduled' || job.status === 'Assigned') && !job.technician_id && hoursOut < 6)
    risks.push({ level: hoursOut < 2 ? 'critical' : 'warning', message: 'Unassigned job starting soon' })

  if (job.status === 'No Show')
    risks.push({ level: 'warning', message: 'No-show — revenue at risk', amount: job.estimated_price })

  if (profit.revenue > 0 && profit.margin < 40 && ['Completed', 'In Progress'].includes(job.status))
    risks.push({ level: 'warning', message: `Low margin (${profit.margin.toFixed(0)}%) — review pricing/parts` })

  return risks
}

function buildMustCollect(job: EngineJob): CollectItem[] {
  const done = job.status === 'Completed'
  const paid = job.payment_status === 'Paid' || (job.amount_collected > 0 && job.cash_verification_status !== 'pending')
  const hasNotes = job.technician_notes.trim().length > 0
  return [
    { label: 'Payment collected in full', done: paid, critical: true },
    { label: 'Cash verified (if cash)', done: job.payment_method === 'Cash' ? job.cash_verification_status === 'verified' : true, critical: true },
    { label: 'Before/after photos captured', done: done && hasNotes, critical: false },
    { label: 'Customer approval / signature', done: done, critical: true },
    { label: 'Work notes logged', done: hasNotes, critical: false },
    { label: 'Google review requested', done: paid && done, critical: false },
  ]
}

export function computeJobFlow(job: EngineJob): JobFlow {
  const playbook = getPlaybook(job.service_type)
  const stageIndex = statusToStageIndex(job)

  const stages = LIFECYCLE_STAGES.map((name, i): { name: StageName; state: StageState } => {
    if (job.status === 'No Show' || job.status === 'Cancelled') {
      return { name, state: i < stageIndex ? 'done' : i === stageIndex ? 'blocked' : 'upcoming' }
    }
    return { name, state: i < stageIndex ? 'done' : i === stageIndex ? 'current' : 'upcoming' }
  })

  const revenue = job.final_price ?? job.estimated_price
  const laborCost = Math.round((playbook.laborMinutes / 60) * LABOR_LOADED_RATE)
  const partsCost = job.parts_cost || 0
  const grossProfit = revenue - partsCost - laborCost
  const margin = revenue > 0 ? (grossProfit / revenue) * 100 : 0
  const profit = { revenue, partsCost, laborCost, grossProfit, margin }

  const risks = buildRisks(job, profit)
  const nextAction = buildNextAction(job)
  const mustCollect = buildMustCollect(job)

  // Valuation: a clean, repeatable, verified job's monthly EBITDA contribution
  // capitalized at a 3× multiple — "every job like this is worth this much."
  const monthlyContribution = grossProfit
  const cleanJob = job.payment_status === 'Paid' && job.cash_verification_status !== 'pending'
  const valueContribution = Math.max(0, Math.round(monthlyContribution * 3))
  const valuation = {
    valueContribution,
    positive: cleanJob,
    note: cleanJob
      ? `A verified, paid, documented job like this adds ~${formatUSD(valueContribution)} in enterprise value at a 3× multiple.`
      : `Until this job is paid and cash-verified, it does not count as clean revenue a buyer will pay for.`,
  }

  const isLive = ['En Route', 'Arrived', 'In Progress'].includes(job.status)

  const followUp = job.status === 'Completed'
    ? { dueInDays: playbook.followUpDays, action: playbook.followUpAction }
    : null

  return { stageIndex, stages, nextAction, risks, mustCollect, playbook, profit, valuation, followUp, isLive }
}

function formatUSD(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

// Priority score for ranking the command center queue — higher = more urgent.
export function jobPriority(job: EngineJob, flow: JobFlow): number {
  let score = 0
  if (flow.isLive) score += 100
  for (const r of flow.risks) score += r.level === 'critical' ? 60 : r.level === 'warning' ? 25 : 5
  if (job.status === 'In Progress') score += 20
  if (job.status === 'En Route') score += 15
  // sooner jobs rank higher
  const hoursOut = (new Date(job.scheduled_start).getTime() - Date.now()) / 36e5
  if (hoursOut > 0 && hoursOut < 12) score += (12 - hoursOut)
  return score
}
