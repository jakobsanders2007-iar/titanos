// Demo data for the operational nervous system: Live Ops Feed, Risk Radar,
// and Business Replay. Times are relative so the feed always feels live.

function todayAt(hour: number, minute = 0): string {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}
function daysAgo(days: number, hour = 9, minute = 0): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

// ---------------------------------------------------------------------------
// LIVE OPS FEED — the company's nervous system, minute by minute
// ---------------------------------------------------------------------------

export type OpsEventKind =
  | 'ai_booking' | 'dispatch' | 'payment' | 'cash' | 'inventory'
  | 'recommendation' | 'call' | 'risk' | 'completion' | 'review'

export interface OpsEvent {
  id: string
  at: string
  kind: OpsEventKind
  actor: string
  title: string
  detail: string
  amount?: number
  needsAction: boolean
  href?: string
}

export const DEMO_OPS_FEED: OpsEvent[] = [
  { id: 'ops-01', at: todayAt(7, 58), kind: 'call', actor: 'Ava (AI)', title: 'Overnight recap posted', detail: 'Ava answered 3 after-hours calls: 2 booked, 1 info-only. Zero missed.', needsAction: false, href: '/ai-receptionist' },
  { id: 'ops-02', at: todayAt(8, 42), kind: 'ai_booking', actor: 'Ava (AI)', title: 'Emergency lockout booked', detail: 'Dana Whitfield, 1420 Elm St — child locked out situation, priority flag set.', amount: 185, needsAction: false, href: '/dispatch' },
  { id: 'ops-03', at: todayAt(8, 51), kind: 'dispatch', actor: 'Marcus Reed', title: 'Marcus en route', detail: 'ETA 14 min to Elm St emergency. Customer texted live tracking link.', needsAction: false, href: '/dispatch' },
  { id: 'ops-04', at: todayAt(9, 7), kind: 'payment', actor: 'System', title: 'Payment link sent', detail: 'Lock replacement job #job-030 — link delivered before arrival, per new policy.', needsAction: false, href: '/payments' },
  { id: 'ops-05', at: todayAt(9, 44), kind: 'completion', actor: 'Marcus Reed', title: 'Job completed — $240 collected in cash', detail: 'Elm St emergency closed. Upsold rekey on two additional doors.', amount: 240, needsAction: false, href: '/jobs' },
  { id: 'ops-06', at: todayAt(9, 46), kind: 'cash', actor: 'Titan', title: 'Cash verification required', detail: '$240 cash from job #job-041 entered the pending queue. Verify before end of day.', amount: 240, needsAction: true, href: '/cash-verification' },
  { id: 'ops-07', at: todayAt(10, 12), kind: 'inventory', actor: 'Elena Cruz', title: 'Elena flagged missing smart lock inventory', detail: 'Note on job: "Only 1 Yale unit left on the van — 3 installs booked this week."', needsAction: true, href: '/ai-shopper' },
  { id: 'ops-08', at: todayAt(10, 30), kind: 'recommendation', actor: 'Titan', title: 'AI recommends raising rekey minimum from $95 to $125', detail: 'Rekey demand up 34% with zero price resistance in last 20 quotes. Est. +$540/mo.', needsAction: true, href: '/action-plan' },
  { id: 'ops-09', at: todayAt(11, 5), kind: 'call', actor: 'Ava (AI)', title: 'Commercial quote request captured', detail: 'Property manager, 12-unit building rekey. Routed to owner for pricing.', needsAction: true, href: '/leads' },
  { id: 'ops-10', at: todayAt(11, 32), kind: 'dispatch', actor: 'Andre Thompson', title: 'Andre running 20 min late', detail: 'Traffic on I-610. Next customer auto-notified with updated ETA.', needsAction: false, href: '/dispatch' },
  { id: 'ops-11', at: todayAt(12, 15), kind: 'payment', actor: 'System', title: 'Payment link paid — $175', detail: 'Broken key extraction job settled 22 minutes after link sent.', amount: 175, needsAction: false, href: '/payments' },
  { id: 'ops-12', at: todayAt(13, 2), kind: 'risk', actor: 'Titan', title: 'Quote aging alert', detail: 'Bayou Brewing quote ($1,400) has been open 6 days with a compliance deadline approaching.', amount: 1400, needsAction: true, href: '/quotes' },
  { id: 'ops-13', at: todayAt(13, 40), kind: 'review', actor: 'System', title: 'New 5-star Google review', detail: '"Marcus was fast and professional — saved our morning." Review request automation working.', needsAction: false, href: '/crm' },
  { id: 'ops-14', at: todayAt(14, 18), kind: 'completion', actor: 'Victor Nguyen', title: 'Smart lock install completed — $385 on card', detail: 'Customer enrolled in app walkthrough. Photos uploaded at closeout.', amount: 385, needsAction: false, href: '/jobs' },
]

// ---------------------------------------------------------------------------
// RISK RADAR — every risk category, one queue
// ---------------------------------------------------------------------------

export type RiskCategory =
  | 'Cash' | 'Payments' | 'Margin' | 'Calls' | 'Follow-ups' | 'Quotes'
  | 'Dispatch' | 'People' | 'Customers' | 'Reputation' | 'Inventory'
  | 'Pricing' | 'Owner' | 'Valuation' | 'Documents' | 'Vendor' | 'Market'

export interface RiskFlag {
  id: string
  category: RiskCategory
  severity: 'critical' | 'high' | 'medium'
  title: string
  detail: string
  exposure?: number
  detectedAt: string
  href: string
}

export const DEMO_RISK_RADAR: RiskFlag[] = [
  { id: 'risk-01', category: 'Cash', severity: 'critical', title: '$1,240 cash unverified across 4 jobs', detail: 'Oldest pending verification is 52 hours old. Every unverified day is leakage exposure.', exposure: 1240, detectedAt: daysAgo(0, 9, 46), href: '/cash-verification' },
  { id: 'risk-02', category: 'Payments', severity: 'high', title: '3 completed jobs unpaid ($540)', detail: 'Two payment links unopened, one job closed without a link ever being sent.', exposure: 540, detectedAt: daysAgo(1, 16), href: '/payments' },
  { id: 'risk-03', category: 'Quotes', severity: 'high', title: '2 commercial quotes aging past 5 days', detail: 'Bayou Brewing ($1,400, compliance deadline) and Vantage Office Park ($1,900).', exposure: 3300, detectedAt: daysAgo(0, 13, 2), href: '/quotes' },
  { id: 'risk-04', category: 'Margin', severity: 'medium', title: '3 smart lock jobs ran under 45% margin', detail: 'Premium hardware bought retail instead of wholesale. Set a 45% hardware markup floor.', exposure: 900, detectedAt: daysAgo(2, 11), href: '/financials' },
  { id: 'risk-05', category: 'Calls', severity: 'medium', title: '2 missed calls not recovered this week', detail: 'Both during Tuesday dispatch crunch. Text-back went unanswered.', detectedAt: daysAgo(2, 15), href: '/ai-receptionist' },
  { id: 'risk-06', category: 'Follow-ups', severity: 'high', title: '14 lapsed repeat customers, zero outreach in 60 days', detail: 'Repeat rate fell 34% → 27%. This is the root cause.', detectedAt: daysAgo(4, 10), href: '/crm' },
  { id: 'risk-07', category: 'People', severity: 'medium', title: 'Andre closeout compliance at 61%', detail: 'Skipping photos and parts logging on 4 of last 10 jobs — breaks profit scoring.', detectedAt: daysAgo(1, 17), href: '/technicians' },
  { id: 'risk-08', category: 'Reputation', severity: 'high', title: 'Negative review unanswered for 3 weeks', detail: '2-star review visible on your GBP profile. Response drafts are ready in Messaging.', detectedAt: daysAgo(21, 12), href: '/messaging' },
  { id: 'risk-09', category: 'Inventory', severity: 'medium', title: 'KW1/SC1 blanks and rekey pins below reorder point', detail: 'Rekey volume up 34%; a stockout mid-week costs ~2 jobs/day.', detectedAt: daysAgo(0, 10, 12), href: '/ai-shopper' },
  { id: 'risk-10', category: 'Pricing', severity: 'medium', title: 'Emergency lockout minimum underpriced vs market', detail: 'Competitors charge $150–$225 after-hours; you charge $125. Zero price resistance observed.', detectedAt: daysAgo(3, 9), href: '/action-plan' },
  { id: 'risk-11', category: 'Owner', severity: 'high', title: 'Owner is single point of failure for commercial quoting', detail: 'Every commercial deal waits on you. This caps growth and cuts your multiple.', detectedAt: daysAgo(30, 9), href: '/valuation' },
  { id: 'risk-12', category: 'Valuation', severity: 'medium', title: 'Customer concentration at 18% of trailing revenue', detail: 'Top-5 concentration crossed the 15% diligence threshold buyers screen for.', detectedAt: daysAgo(3, 8), href: '/valuation' },
  { id: 'risk-13', category: 'Documents', severity: 'medium', title: 'Insurance renewal in 58 days, no competing quotes', detail: 'Last renewal was +9% with zero shopping. Start now or pay it again.', detectedAt: daysAgo(6, 14), href: '/documents' },
  { id: 'risk-14', category: 'Market', severity: 'medium', title: 'New competitor running aggressive lockout ads in your ZIP codes', detail: 'Detected via research scan: undercutting on car lockouts by ~15%.', detectedAt: daysAgo(5, 10), href: '/research' },
]

// ---------------------------------------------------------------------------
// BUSINESS REPLAY — watch any day unfold
// ---------------------------------------------------------------------------

export interface ReplayMoment {
  time: string
  label: string
  kind: OpsEventKind
}

export interface DayReplay {
  id: string
  daysAgo: number
  label: string
  stats: {
    callsIn: number
    jobsBooked: number
    callsMissed: number
    collected: number
    outstanding: number
    cashPending: number
    avgTicket: number
    estProfit: number
  }
  techLines: { name: string; jobs: number; revenue: number }[]
  bottleneck: string
  headline: string
  moments: ReplayMoment[]
}

export const DEMO_REPLAYS: DayReplay[] = [
  {
    id: 'replay-0', daysAgo: 0, label: 'Today (so far)',
    stats: { callsIn: 11, jobsBooked: 8, callsMissed: 0, collected: 2870, outstanding: 240, cashPending: 240, avgTicket: 264, estProfit: 1310 },
    techLines: [
      { name: 'Marcus Reed', jobs: 3, revenue: 1010 },
      { name: 'Victor Nguyen', jobs: 2, revenue: 760 },
      { name: 'Elena Cruz', jobs: 2, revenue: 630 },
      { name: 'Andre Thompson', jobs: 1, revenue: 470 },
    ],
    bottleneck: 'Andre lost 40 minutes to I-610 traffic — cluster his afternoon jobs west side.',
    headline: 'Strong morning: AI booked an emergency at 8:42, every call answered, one cash job awaiting verification.',
    moments: [
      { time: '7:58 AM', label: 'Overnight AI recap: 2 booked, 0 missed', kind: 'call' },
      { time: '8:42 AM', label: 'AI booked emergency lockout — $185 est.', kind: 'ai_booking' },
      { time: '8:51 AM', label: 'Marcus en route, ETA 14 min', kind: 'dispatch' },
      { time: '9:44 AM', label: 'Job completed, $240 collected cash', kind: 'completion' },
      { time: '9:46 AM', label: 'Cash verification triggered', kind: 'cash' },
      { time: '10:30 AM', label: 'AI: raise rekey minimum $95 → $125', kind: 'recommendation' },
      { time: '12:15 PM', label: 'Payment link paid — $175 in 22 min', kind: 'payment' },
      { time: '2:18 PM', label: 'Smart lock install closed — $385 card', kind: 'completion' },
    ],
  },
  {
    id: 'replay-1', daysAgo: 1, label: 'Yesterday',
    stats: { callsIn: 18, jobsBooked: 15, callsMissed: 2, collected: 4920, outstanding: 610, cashPending: 415, avgTicket: 273, estProfit: 2140 },
    techLines: [
      { name: 'Marcus Reed', jobs: 6, revenue: 1720 },
      { name: 'Elena Cruz', jobs: 5, revenue: 1490 },
      { name: 'Victor Nguyen', jobs: 3, revenue: 1080 },
      { name: 'Andre Thompson', jobs: 3, revenue: 630 },
    ],
    bottleneck: 'Afternoon dispatch delays — 3 jobs stacked in the 2–4 PM window with no buffer.',
    headline: 'High-volume day. Two missed calls during the 2 PM crunch were the only leaks — both now in the recovery queue.',
    moments: [
      { time: '8:05 AM', label: '18-call day begins — 4 booked before 9 AM', kind: 'call' },
      { time: '10:40 AM', label: 'Commercial rekey completed — $390 check', kind: 'completion' },
      { time: '2:10 PM', label: 'Missed call #1 — dispatch crunch', kind: 'risk' },
      { time: '2:25 PM', label: 'Missed call #2 — text-back sent', kind: 'risk' },
      { time: '4:50 PM', label: 'Day closes: $4,920 collected', kind: 'payment' },
      { time: '5:15 PM', label: '4 cash jobs entered verification queue', kind: 'cash' },
    ],
  },
  {
    id: 'replay-2', daysAgo: 2, label: '2 days ago',
    stats: { callsIn: 14, jobsBooked: 11, callsMissed: 1, collected: 3610, outstanding: 380, cashPending: 175, avgTicket: 258, estProfit: 1580 },
    techLines: [
      { name: 'Elena Cruz', jobs: 4, revenue: 1130 },
      { name: 'Marcus Reed', jobs: 4, revenue: 1370 },
      { name: 'Victor Nguyen', jobs: 2, revenue: 700 },
      { name: 'Andre Thompson', jobs: 1, revenue: 410 },
    ],
    bottleneck: 'Andre had 2 no-shows back to back — his confirmation texts are going out too late.',
    headline: 'Steady day with a scheduling lesson: both no-shows lacked a morning-of confirmation text.',
    moments: [
      { time: '9:20 AM', label: 'Safe opening completed — $350', kind: 'completion' },
      { time: '11:00 AM', label: 'No-show #1 on Andre’s route', kind: 'risk' },
      { time: '1:30 PM', label: 'No-show #2 — pattern flagged', kind: 'risk' },
      { time: '3:45 PM', label: 'AI: enable morning-of confirmation texts', kind: 'recommendation' },
    ],
  },
]
