// Demo data for Titan Intelligence OS — the five brains that sit above every
// vertical: Connect, Memory, Why, Goal, and Action. Deterministic and
// internally consistent so the product tells one coherent business story.

function daysAgo(days: number, hour = 9, minute = 0): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}
function daysFromNow(days: number, hour = 9, minute = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

// ---------------------------------------------------------------------------
// 1. CONNECT BRAIN
// ---------------------------------------------------------------------------

export type ConnectorCategory = 'Field Service & CRM' | 'Point of Sale' | 'Accounting & Payments' | 'Calendar & Email' | 'Documents & Filings'
export type ConnectorStatus = 'connected' | 'available' | 'syncing'

export interface Connector {
  id: string
  name: string
  category: ConnectorCategory
  status: ConnectorStatus
  description: string
  lastSynced: string | null
  recordsSynced: number
}

export const DEMO_CONNECTORS: Connector[] = [
  { id: 'con-jobber', name: 'Jobber', category: 'Field Service & CRM', status: 'available', description: 'Import jobs, clients, and quotes from Jobber.', lastSynced: null, recordsSynced: 0 },
  { id: 'con-hcp', name: 'Housecall Pro', category: 'Field Service & CRM', status: 'available', description: 'Sync dispatch, invoices, and customer history.', lastSynced: null, recordsSynced: 0 },
  { id: 'con-servicetitan', name: 'ServiceTitan', category: 'Field Service & CRM', status: 'available', description: 'Enterprise field service data — jobs, techs, pricebook.', lastSynced: null, recordsSynced: 0 },
  { id: 'con-fieldedge', name: 'FieldEdge', category: 'Field Service & CRM', status: 'available', description: 'HVAC-focused field service — work orders, agreements, dispatch.', lastSynced: null, recordsSynced: 0 },
  { id: 'con-titan-native', name: 'Titan Native', category: 'Field Service & CRM', status: 'connected', description: 'Titan\'s hosted operating system — internally just another connector.', lastSynced: daysAgo(0, 7, 0), recordsSynced: 486 },
  { id: 'con-toast', name: 'Toast', category: 'Point of Sale', status: 'available', description: 'Restaurant POS — sales, labor, and menu performance.', lastSynced: null, recordsSynced: 0 },
  { id: 'con-square', name: 'Square', category: 'Point of Sale', status: 'connected', description: 'Point-of-sale transactions and card processing.', lastSynced: daysAgo(0, 6, 15), recordsSynced: 1284 },
  { id: 'con-ncr', name: 'NCR', category: 'Point of Sale', status: 'available', description: 'Enterprise retail and restaurant POS systems.', lastSynced: null, recordsSynced: 0 },
  { id: 'con-quickbooks', name: 'QuickBooks', category: 'Accounting & Payments', status: 'connected', description: 'General ledger, P&L, expenses, and tax categories.', lastSynced: daysAgo(0, 5, 40), recordsSynced: 3902 },
  { id: 'con-stripe', name: 'Stripe', category: 'Accounting & Payments', status: 'connected', description: 'Payment links, card processing, and payout history.', lastSynced: daysAgo(0, 7, 5), recordsSynced: 861 },
  { id: 'con-gmail', name: 'Gmail', category: 'Calendar & Email', status: 'connected', description: 'Reads customer emails, quotes, and vendor correspondence.', lastSynced: daysAgo(0, 6, 50), recordsSynced: 2140 },
  { id: 'con-gcal', name: 'Google Calendar', category: 'Calendar & Email', status: 'connected', description: 'Schedules, appointments, and owner availability.', lastSynced: daysAgo(0, 6, 55), recordsSynced: 412 },
  { id: 'con-gdrive', name: 'Google Drive', category: 'Documents & Filings', status: 'syncing', description: 'Contracts, spreadsheets, and shared business documents.', lastSynced: daysAgo(0, 4, 10), recordsSynced: 76 },
  { id: 'con-excel', name: 'Excel / CSV', category: 'Documents & Filings', status: 'connected', description: 'Drop any spreadsheet — Titan maps columns into the canonical model.', lastSynced: daysAgo(2, 9, 30), recordsSynced: 1150 },
  { id: 'con-pdf', name: 'PDF Uploads', category: 'Documents & Filings', status: 'connected', description: 'Drag-and-drop any document — Titan reads and indexes it.', lastSynced: daysAgo(1, 14, 0), recordsSynced: 14 },
  { id: 'con-secfilings', name: 'SEC / 10-K Document Upload', category: 'Documents & Filings', status: 'available', description: 'Upload public filings for competitor and industry analysis.', lastSynced: null, recordsSynced: 0 },
]

// ---------------------------------------------------------------------------
// 2. MEMORY BRAIN — Company Memory + Business Timeline
// ---------------------------------------------------------------------------

export type MemoryCategory = 'Decision' | 'Document' | 'Goal' | 'KPI Snapshot' | 'People' | 'Risk'

export interface MemoryItem {
  id: string
  category: MemoryCategory
  title: string
  summary: string
  date: string
  source: string
  tags: string[]
}

export const DEMO_MEMORY: MemoryItem[] = [
  { id: 'mem-01', category: 'Decision', title: 'Raised smart lock install price to $375', summary: 'Owner approved a price increase from $325 after margin review showed hardware costs had risen 14%.', date: daysAgo(38), source: 'Pricing decision log', tags: ['pricing', 'smart-lock'] },
  { id: 'mem-02', category: 'Goal', title: 'Set FY revenue goal: $65,000/month', summary: 'Owner set a 6-month revenue target during the Q2 planning session, up from a $46,000/month baseline.', date: daysAgo(52), source: 'Goal Brain', tags: ['goal', 'revenue'] },
  { id: 'mem-03', category: 'KPI Snapshot', title: 'EBITDA margin hit 29% for the first time', summary: 'Trailing 30-day EBITDA margin crossed 29%, the highest recorded since Titan began tracking.', date: daysAgo(21), source: 'Financials', tags: ['ebitda', 'milestone'] },
  { id: 'mem-04', category: 'Document', title: 'Signed Harborview Property Mgmt MSA (40-unit contract)', summary: 'Annual rekey contract for 40 units uploaded and indexed — recurring revenue of ~$6,000/year.', date: daysAgo(12), source: 'Documents', tags: ['contract', 'recurring-revenue'] },
  { id: 'mem-05', category: 'People', title: 'Marcus Reed became top revenue performer', summary: 'Marcus overtook Elena as the highest-revenue technician, driven by a 62% upsell close rate.', date: daysAgo(17), source: 'Technician Performance', tags: ['technician', 'performance'] },
  { id: 'mem-06', category: 'Risk', title: 'Cash verification lag flagged for the first time', summary: 'Titan detected a pattern of cash jobs going 48+ hours without owner verification — first occurrence in 90 days.', date: daysAgo(9), source: 'Cash Verification', tags: ['risk', 'cash'] },
  { id: 'mem-07', category: 'Decision', title: 'Declined a low-margin fleet account (Northside Storage bid)', summary: 'Owner passed on a volume gate-lock contract after Titan flagged it would run at 19% margin, below the 35% floor.', date: daysAgo(6), source: 'Pricing decision log', tags: ['pricing', 'decision'] },
  { id: 'mem-08', category: 'KPI Snapshot', title: 'Repeat customer rate fell to 27%', summary: 'Down from 34% three months ago — the first sustained decline since Titan began tracking retention.', date: daysAgo(4), source: 'CRM', tags: ['retention', 'risk'] },
  { id: 'mem-09', category: 'Goal', title: 'Set owner-freedom goal: 25 hrs/week by year end', summary: 'Owner currently works ~55 hrs/week; goal is to delegate dispatch and cash verification to free up time.', date: daysAgo(30), source: 'Goal Brain', tags: ['goal', 'owner-freedom'] },
  { id: 'mem-10', category: 'Document', title: 'Vehicle insurance renewed at 9% higher premium', summary: 'Annual commercial auto + general liability policy renewed; premium increased from $780 to $850/month.', date: daysAgo(40), source: 'Documents', tags: ['insurance', 'cost'] },
  { id: 'mem-11', category: 'Risk', title: 'Customer concentration ticked above 15% for first time', summary: 'Top 5 customers now represent 18% of trailing revenue, driven by new commercial contracts.', date: daysAgo(3), source: 'Valuation Engine', tags: ['risk', 'valuation'] },
  { id: 'mem-12', category: 'KPI Snapshot', title: 'Valuation estimate crossed $600,000', summary: 'Base-case valuation (3.0× annualized EBITDA) reached $612,000, up from $480,000 six months ago.', date: daysAgo(2), source: 'Valuation Engine', tags: ['valuation', 'milestone'] },
]

// ---------------------------------------------------------------------------
// Business Timeline — chronological events across every brain
// ---------------------------------------------------------------------------

export type TimelineEventType = 'job' | 'payment' | 'goal' | 'document' | 'connector' | 'pricing' | 'hire' | 'review' | 'kpi' | 'risk' | 'decision'

export interface TimelineEvent {
  id: string
  type: TimelineEventType
  title: string
  detail: string
  date: string
  impact: 'positive' | 'negative' | 'neutral'
}

export const DEMO_TIMELINE: TimelineEvent[] = [
  { id: 'tl-01', type: 'goal', title: 'Set FY revenue goal', detail: '$65,000/month target set for end of year, up from $46,000 baseline.', date: daysAgo(52), impact: 'neutral' },
  { id: 'tl-02', type: 'hire', title: 'Hired Victor Nguyen', detail: 'Fourth full-time technician onboarded, expanding weekly capacity by ~20%.', date: daysAgo(46), impact: 'positive' },
  { id: 'tl-03', type: 'pricing', title: 'Raised smart lock install price to $375', detail: 'Margin review showed hardware costs rose 14% — price adjusted to protect margin.', date: daysAgo(38), impact: 'positive' },
  { id: 'tl-04', type: 'connector', title: 'Connected QuickBooks', detail: 'General ledger and expense categories now syncing automatically into Financials.', date: daysAgo(34), impact: 'positive' },
  { id: 'tl-05', type: 'document', title: 'Vehicle insurance renewed', detail: 'Annual policy renewed at a 9% premium increase — flagged for next-cycle renegotiation.', date: daysAgo(40), impact: 'negative' },
  { id: 'tl-06', type: 'review', title: '50th five-star Google review', detail: 'Crossed 50 five-star reviews on Google Business Profile, boosting local search ranking.', date: daysAgo(29), impact: 'positive' },
  { id: 'tl-07', type: 'kpi', title: 'EBITDA margin hit 29%', detail: 'Highest trailing-30-day EBITDA margin recorded since tracking began.', date: daysAgo(21), impact: 'positive' },
  { id: 'tl-08', type: 'job', title: 'Crossed $500,000 lifetime revenue', detail: 'Cumulative platform-tracked revenue passed the half-million mark.', date: daysAgo(19), impact: 'positive' },
  { id: 'tl-09', type: 'kpi', title: 'Marcus Reed became top performer', detail: 'Overtook Elena Cruz in trailing revenue per tech, driven by upsell conversion.', date: daysAgo(17), impact: 'positive' },
  { id: 'tl-10', type: 'document', title: 'Signed Harborview Property Mgmt contract', detail: '40-unit annual rekey contract signed — first scaled recurring-revenue account.', date: daysAgo(12), impact: 'positive' },
  { id: 'tl-11', type: 'risk', title: 'Cash verification lag detected', detail: 'First occurrence in 90 days of cash jobs sitting 48+ hours unverified.', date: daysAgo(9), impact: 'negative' },
  { id: 'tl-12', type: 'decision', title: 'Declined low-margin fleet bid', detail: 'Passed on Northside Storage volume contract after Titan flagged sub-35% margin.', date: daysAgo(6), impact: 'positive' },
  { id: 'tl-13', type: 'review', title: 'Undisputed negative review posted', detail: 'A 2-star review has gone unanswered for 3 weeks — retention and reputation risk.', date: daysAgo(21), impact: 'negative' },
  { id: 'tl-14', type: 'risk', title: 'Customer concentration crossed 15%', detail: 'Top 5 customers now 18% of trailing revenue — a valuation risk factor to manage.', date: daysAgo(3), impact: 'negative' },
  { id: 'tl-15', type: 'kpi', title: 'Repeat customer rate fell to 27%', detail: 'Down from 34% three months ago as follow-up outreach lapsed.', date: daysAgo(4), impact: 'negative' },
  { id: 'tl-16', type: 'payment', title: '2 commercial quotes slipped past month-end', detail: 'Bayou Brewing ($1,400) and Vantage Office Park ($1,900) both pushed to next month.', date: daysAgo(2), impact: 'negative' },
  { id: 'tl-17', type: 'kpi', title: 'Valuation estimate crossed $600,000', detail: 'Base-case estimate reached $612,000 (3.0× annualized EBITDA), up from $480,000 six months ago.', date: daysAgo(2), impact: 'positive' },
  { id: 'tl-18', type: 'connector', title: 'Connected Gmail + Google Calendar', detail: 'Titan now reads customer correspondence and owner scheduling automatically.', date: daysAgo(15), impact: 'positive' },
  { id: 'tl-19', type: 'document', title: 'Uploaded FY Annual P&L export', detail: 'Financial statement processed — confirmed margin compression trend for the quarter.', date: daysAgo(6), impact: 'neutral' },
  { id: 'tl-20', type: 'goal', title: 'Set owner-freedom goal', detail: 'Target: reduce owner hours from 55/week to 25/week by year end via delegation.', date: daysAgo(30), impact: 'neutral' },
]

// ---------------------------------------------------------------------------
// 3. WHY BRAIN
// ---------------------------------------------------------------------------

export type WhyUnit = 'currency' | 'points'

export interface WhyFactor {
  label: string
  impact: number
  direction: 'positive' | 'negative'
}

export interface WhyAnalysis {
  id: string
  question: string
  headline: string
  unit: WhyUnit
  factors: WhyFactor[]
  rootCause: string
  recommendation: string
  actionHref: string
}

export const DEMO_WHY: WhyAnalysis[] = [
  {
    id: 'why-revenue-drop',
    question: 'Why did revenue drop?',
    headline: 'Revenue fell 9% this month ($4,200) versus last month.',
    unit: 'currency',
    factors: [
      { label: 'Emergency call volume down 22% week-over-week', impact: -1850, direction: 'negative' },
      { label: 'Bayou Brewing panic-hardware job slipped to next month', impact: -1400, direction: 'negative' },
      { label: 'Vantage Office Park access-control quote delayed', impact: -1900, direction: 'negative' },
      { label: 'Smart lock installs up 3 jobs this month', impact: 950, direction: 'positive' },
    ],
    rootCause: 'Two large commercial deals slipping to next month pulled $3,300 out of this month, compounded by a slower emergency-call week.',
    recommendation: 'Close Bayou Brewing and Vantage Office Park this week — that alone recovers the shortfall. Lean on the AI receptionist to convert more same-day emergency calls in the meantime.',
    actionHref: '/action-plan',
  },
  {
    id: 'why-margin-compression',
    question: 'Why did margin compress?',
    headline: 'Gross margin dropped from 61% to 54% this month.',
    unit: 'points',
    factors: [
      { label: 'Parts cost up on smart lock jobs (premium hardware)', impact: -3.5, direction: 'negative' },
      { label: 'Overtime pay on 2 after-hours emergency calls', impact: -2.1, direction: 'negative' },
      { label: 'Discounting on 3 commercial quotes to win volume', impact: -1.4, direction: 'negative' },
      { label: 'Rekey jobs (high-margin) share of mix up', impact: 1.0, direction: 'positive' },
    ],
    rootCause: 'Premium hardware costs on smart lock jobs plus two overtime emergency calls ate 5.6 points of margin this month.',
    recommendation: 'Set a 45% minimum markup on smart-lock hardware and cap commercial quote discount authority at 10% without owner approval.',
    actionHref: '/action-plan',
  },
  {
    id: 'why-cash-tight',
    question: 'Why is cash flow tight?',
    headline: 'Cash on hand covers 11 days of operating expenses, down from 24 days last month.',
    unit: 'currency',
    factors: [
      { label: '$1,240 in cash collections sitting unverified outside the bank', impact: -1240, direction: 'negative' },
      { label: 'Annual vehicle insurance renewal paid in full', impact: -2400, direction: 'negative' },
      { label: '3 completed jobs still unpaid ($540 total)', impact: -540, direction: 'negative' },
      { label: 'Payroll ran 4 days earlier than usual this cycle', impact: -1600, direction: 'negative' },
    ],
    rootCause: 'An early payroll run collided with the annual insurance renewal and $1,780 of uncollected or unverified job revenue.',
    recommendation: 'Verify the 4 pending cash jobs today and chase the 3 unpaid invoices — that recovers $1,780 within the week.',
    actionHref: '/cash-verification',
  },
  {
    id: 'why-valuation-change',
    question: 'Why did valuation change?',
    headline: 'Estimated valuation rose to $612,000 (+$38,000) this quarter.',
    unit: 'currency',
    factors: [
      { label: 'Trailing 3-month EBITDA up 9%', impact: 27000, direction: 'positive' },
      { label: 'Cash leakage risk score improved on verification discipline', impact: 9000, direction: 'positive' },
      { label: 'Recurring/contract revenue share up (2 new commercial contracts)', impact: 8000, direction: 'positive' },
      { label: 'Customer concentration ticked up (top 5 = 18% of revenue)', impact: -6000, direction: 'negative' },
    ],
    rootCause: 'Stronger trailing EBITDA and improved cash controls outweighed a slight increase in customer concentration risk.',
    recommendation: 'Land 2 more small commercial contracts to dilute concentration risk — both actions directly raise your multiple.',
    actionHref: '/valuation',
  },
  {
    id: 'why-employee-gap',
    question: 'Why is one employee outperforming another?',
    headline: 'Marcus Reed generates $340 more revenue per job than Andre Thompson on average.',
    unit: 'currency',
    factors: [
      { label: 'Marcus closes upsells on 62% of jobs vs. Andre’s 18%', impact: 210, direction: 'positive' },
      { label: 'Marcus is routed more smart-lock/commercial jobs (higher ticket mix)', impact: 95, direction: 'positive' },
      { label: 'Andre has 40% more no-shows on his schedule (fewer billable jobs)', impact: -35, direction: 'negative' },
    ],
    rootCause: 'The gap is almost entirely upsell conversion, not skill or speed — Marcus asks for the upgrade, Andre usually doesn’t.',
    recommendation: 'Pair Andre with Marcus for two ride-alongs this month and add the upsell prompt directly to Andre’s job checklist.',
    actionHref: '/technicians',
  },
  {
    id: 'why-territory-underperform',
    question: 'Why did the West Houston territory underperform?',
    headline: 'West Houston jobs generated 31% less revenue per tech-hour than Central Houston this month.',
    unit: 'currency',
    factors: [
      { label: 'Average drive time between jobs runs 22 minutes longer', impact: -680, direction: 'negative' },
      { label: 'Lower-ticket job mix — more lockouts, fewer installs', impact: -410, direction: 'negative' },
      { label: 'Fewer repeat/commercial customers in the territory', impact: -290, direction: 'negative' },
    ],
    rootCause: 'Longer drive times and a lower-value job mix are compounding in West Houston, cutting effective billable hours.',
    recommendation: 'Cluster West Houston dispatch windows to cut drive time, and target Google ads there toward smart-lock and commercial leads.',
    actionHref: '/dispatch',
  },
  {
    id: 'why-retention-fell',
    question: 'Why did customer retention fall?',
    headline: 'Repeat-customer rate dropped from 34% to 27% over the last 90 days.',
    unit: 'points',
    factors: [
      { label: 'No follow-up outreach sent in 60+ days', impact: -4, direction: 'negative' },
      { label: 'Review requests skipped on 70% of completed jobs', impact: -2, direction: 'negative' },
      { label: 'One negative review left undisputed for 3 weeks', impact: -1, direction: 'negative' },
    ],
    rootCause: 'Follow-up texts and review requests have quietly stopped going out — this is a process gap, not a service quality gap.',
    recommendation: 'Turn the automatic thank-you/review text back on for every completed job and clear the follow-up backlog this week.',
    actionHref: '/crm',
  },
]

// ---------------------------------------------------------------------------
// 4. GOAL BRAIN
// ---------------------------------------------------------------------------

export type GoalType = 'Revenue' | 'EBITDA' | 'Valuation' | 'Expansion' | 'Cash Flow' | 'Owner Freedom' | 'Hiring'
export type GoalUnit = 'currency' | 'percent' | 'number'

export interface Milestone {
  label: string
  done: boolean
}

export interface Goal {
  id: string
  type: GoalType
  title: string
  current: number
  target: number
  unit: GoalUnit
  suffix?: string
  targetDate: string
  milestones: Milestone[]
  kpis: string[]
  risks: string[]
  weeklyActions: string[]
  latestImpact: string
}

export const DEMO_GOALS: Goal[] = [
  {
    id: 'goal-revenue', type: 'Revenue', title: 'Grow monthly revenue to $65,000',
    current: 41800, target: 65000, unit: 'currency', targetDate: daysFromNow(165),
    milestones: [
      { label: 'Hit $50,000/mo by lifting average ticket', done: true },
      { label: 'Hit $58,000/mo by adding a 2nd smart-lock install day/week', done: false },
      { label: 'Hit $65,000/mo with one new commercial contract', done: false },
    ],
    kpis: ['Monthly revenue', 'Average ticket', 'Jobs completed per week'],
    risks: ['Emergency call volume dips seasonally in summer', 'Tech capacity ceiling at 4 full-time technicians'],
    weeklyActions: ['Send payment link at booking, not after completion', 'Follow up the 2 open commercial quotes', 'Offer a smart lock upsell on every rekey call'],
    latestImpact: 'This month\'s $4,200 dip pushes the milestone timeline back roughly 2 weeks — closing Bayou Brewing and Vantage this week fully recovers it.',
  },
  {
    id: 'goal-ebitda', type: 'EBITDA', title: 'Raise EBITDA margin to 38%',
    current: 29, target: 38, unit: 'percent', targetDate: daysFromNow(120),
    milestones: [
      { label: 'Hold margin above 30% for 3 straight months', done: false },
      { label: 'Cut parts cost to under 12% of revenue', done: false },
      { label: 'Reach 38% margin with pricing discipline in place', done: false },
    ],
    kpis: ['EBITDA margin', 'Parts cost % of revenue', 'Labor cost % of revenue'],
    risks: ['Rising key blank and smart lock hardware costs', 'Overtime creep on after-hours emergency calls'],
    weeklyActions: ['Enforce 45% minimum markup on smart lock hardware', 'Cap commercial discount authority at 10%', 'Review overtime hours weekly'],
    latestImpact: 'Margin compressed 7 points this month on hardware costs and overtime — reversing this is now the single biggest lever on this goal.',
  },
  {
    id: 'goal-valuation', type: 'Valuation', title: 'Reach a $900,000 business valuation',
    current: 612000, target: 900000, unit: 'currency', targetDate: daysFromNow(300),
    milestones: [
      { label: 'Maintain clean cash verification for 90 straight days', done: false },
      { label: 'Land 3 recurring commercial contracts', done: false },
      { label: 'Reduce owner dependency by hiring an office manager', done: false },
    ],
    kpis: ['Trailing annualized EBITDA', 'Recurring revenue %', 'Owner hours per week'],
    risks: ['Customer concentration rising above 15%', 'Owner is still the single point of failure for dispatch and cash'],
    weeklyActions: ['Pursue 1 additional recurring commercial account', 'Keep cash verification current daily', 'Document SOPs for a future office manager hire'],
    latestImpact: 'Valuation rose $38,000 this quarter on stronger EBITDA and cash discipline — concentration risk is now the main headwind.',
  },
  {
    id: 'goal-expansion', type: 'Expansion', title: 'Expand to a second territory',
    current: 1, target: 2, unit: 'number', suffix: ' location(s)', targetDate: daysFromNow(270),
    milestones: [
      { label: 'Hire technician #5', done: false },
      { label: 'Scout NW Houston as the second territory', done: false },
      { label: 'Open a satellite dispatch point', done: false },
    ],
    kpis: ['Technician headcount', 'Territory coverage', 'Drive-time efficiency'],
    risks: ['Hiring pipeline is thin for qualified locksmiths', 'West Houston territory is already underperforming on drive time'],
    weeklyActions: ['Post the technician #5 opening', 'Fix West Houston dispatch clustering before adding territory', 'Model satellite dispatch economics'],
    latestImpact: 'West Houston\'s drive-time problem is a preview of expansion risk — solve it here before opening a second territory.',
  },
  {
    id: 'goal-cashflow', type: 'Cash Flow', title: 'Build 45 days of operating cash buffer',
    current: 11, target: 45, unit: 'number', suffix: ' days', targetDate: daysFromNow(150),
    milestones: [
      { label: 'Clear all pending cash verifications within 24 hours', done: false },
      { label: 'Reach 25 days of buffer', done: false },
      { label: 'Reach 45 days of buffer', done: false },
    ],
    kpis: ['Days of operating cash on hand', 'Unverified cash amount', 'Days sales outstanding'],
    risks: ['Cash verification lag recurring', '3 completed jobs sitting unpaid'],
    weeklyActions: ['Verify all pending cash jobs daily', 'Chase unpaid completed jobs within 48 hours', 'Build a 2-week payroll cash reserve'],
    latestImpact: 'An early payroll run plus the insurance renewal cut the buffer from 24 to 11 days — this is the most urgent goal right now.',
  },
  {
    id: 'goal-freedom', type: 'Owner Freedom', title: 'Reduce owner hours to 25/week',
    current: 55, target: 25, unit: 'number', suffix: ' hrs/week', targetDate: daysFromNow(240),
    milestones: [
      { label: 'Hire a dispatcher to own the board', done: false },
      { label: 'Delegate cash verification to an accountant', done: false },
      { label: 'Automate the CEO Packet review cadence', done: true },
    ],
    kpis: ['Owner hours per week', 'Decisions requiring owner approval', 'Delegated task %'],
    risks: ['Owner is still doing all commercial quoting personally', 'No accountant on staff yet to take over cash verification'],
    weeklyActions: ['Draft the dispatcher job description', 'Interview accounting firms for outsourced verification', 'Block 2 hrs/week for delegation planning'],
    latestImpact: 'CEO Packet automation is done — dispatch and cash verification are now the two biggest remaining time sinks.',
  },
  {
    id: 'goal-hiring', type: 'Hiring', title: 'Grow the team to 6 technicians',
    current: 4, target: 6, unit: 'number', suffix: ' technicians', targetDate: daysFromNow(200),
    milestones: [
      { label: 'Post opening for an HVAC-cross-trained technician', done: false },
      { label: 'Onboard technician #5 within 45 days of offer', done: false },
      { label: 'Build a 2-week ramp training path', done: false },
    ],
    kpis: ['Technician headcount', 'Time-to-productivity for new hires', 'Jobs per technician per week'],
    risks: ['Andre\'s no-show rate suggests scheduling/training gaps for new hires to inherit', 'No formal onboarding curriculum exists yet'],
    weeklyActions: ['Finalize the technician #5 job posting', 'Use Training Academy to build the ramp path', 'Set a hiring budget with the accountant'],
    latestImpact: 'Training Academy now has the onboarding lessons needed to ramp a new hire faster once #5 is hired.',
  },
]

// ---------------------------------------------------------------------------
// 5. ACTION BRAIN
// ---------------------------------------------------------------------------

export type ActionCategory = 'Sales' | 'CRM' | 'Pricing' | 'Cost' | 'Inventory' | 'People' | 'Ops' | 'Docs' | 'Risk'
export type ActionEffort = 'Low' | 'Medium' | 'High'
export type ActionStatus = 'To Do' | 'In Progress' | 'Done'

export interface ActionItem {
  id: string
  category: ActionCategory
  title: string
  rationale: string
  impact: number | null
  effort: ActionEffort
  owner: string
  status: ActionStatus
  dueDate: string
  whyId?: string
}

export const DEMO_ACTIONS: ActionItem[] = [
  { id: 'act-01', category: 'Risk', title: 'Verify the 4 pending cash jobs before month close', rationale: '$1,240 in cash is sitting unverified outside the bank — your top cash-flow risk right now.', impact: 1240, effort: 'Low', owner: 'Owner', status: 'To Do', dueDate: daysFromNow(0), whyId: 'why-cash-tight' },
  { id: 'act-02', category: 'Sales', title: 'Call Bayou Brewing to close the panic-hardware quote', rationale: 'Compliance deadline is end of month — this alone recovers a third of this month\'s revenue dip.', impact: 1400, effort: 'Low', owner: 'Owner', status: 'To Do', dueDate: daysFromNow(2), whyId: 'why-revenue-drop' },
  { id: 'act-03', category: 'Sales', title: 'Close the Vantage Office Park access-control proposal', rationale: 'Security-incident-driven urgency — high willingness to sign, needs a site visit to finalize.', impact: 1900, effort: 'Medium', owner: 'Owner', status: 'To Do', dueDate: daysFromNow(5), whyId: 'why-revenue-drop' },
  { id: 'act-04', category: 'CRM', title: 'Clear the 2 overdue high-value CRM follow-ups', rationale: 'Bayou Brewing and Vantage together represent $3,300 in stalled pipeline.', impact: 3300, effort: 'Low', owner: 'Sales', status: 'In Progress', dueDate: daysFromNow(0) },
  { id: 'act-05', category: 'CRM', title: 'Re-engage 14 lapsed repeat customers with a reminder text', rationale: 'Repeat-customer rate fell from 34% to 27% — outreach has quietly stopped going out.', impact: 2100, effort: 'Low', owner: 'Front Desk', status: 'To Do', dueDate: daysFromNow(3), whyId: 'why-retention-fell' },
  { id: 'act-06', category: 'Pricing', title: 'Set a 45% minimum markup on smart lock hardware', rationale: 'Premium hardware costs are the single biggest driver of this month\'s margin compression.', impact: 900, effort: 'Low', owner: 'Owner', status: 'To Do', dueDate: daysFromNow(1), whyId: 'why-margin-compression' },
  { id: 'act-07', category: 'Pricing', title: 'Cap commercial quote discount authority at 10%', rationale: 'Discounting to win volume cost 1.4 margin points this month.', impact: 650, effort: 'Low', owner: 'Owner', status: 'To Do', dueDate: daysFromNow(1), whyId: 'why-margin-compression' },
  { id: 'act-08', category: 'Cost', title: 'Get 2 competing quotes before next insurance renewal', rationale: 'Premium rose 9% at last renewal with no shopping done.', impact: 300, effort: 'Medium', owner: 'Owner', status: 'To Do', dueDate: daysFromNow(60) },
  { id: 'act-09', category: 'Cost', title: 'Shift marketing spend from Yelp toward Google LSA', rationale: 'GBP/LSA leads are converting at a materially higher rate than Yelp this quarter.', impact: 220, effort: 'Low', owner: 'Owner', status: 'To Do', dueDate: daysFromNow(7) },
  { id: 'act-10', category: 'Inventory', title: 'Restock rekey pin kits and SC1/KW1 key blanks', rationale: 'Rekey job volume is up 34% and van stock is below the reorder point.', impact: null, effort: 'Low', owner: 'Dispatcher', status: 'To Do', dueDate: daysFromNow(2) },
  { id: 'act-11', category: 'Inventory', title: 'Stock 2 additional smart lock units for open quotes', rationale: '3 smart lock installs are booked against only 1 unit on the shelf.', impact: 750, effort: 'Low', owner: 'Dispatcher', status: 'To Do', dueDate: daysFromNow(3) },
  { id: 'act-12', category: 'People', title: 'Pair Andre with Marcus for 2 upsell ride-alongs', rationale: 'The revenue gap between them is almost entirely upsell conversion, not skill.', impact: 1200, effort: 'Medium', owner: 'Owner', status: 'To Do', dueDate: daysFromNow(14), whyId: 'why-employee-gap' },
  { id: 'act-13', category: 'People', title: 'Review Andre\'s scheduling buffer to cut no-shows', rationale: 'Andre has 40% more no-shows than the team average, costing billable hours.', impact: 400, effort: 'Low', owner: 'Dispatcher', status: 'To Do', dueDate: daysFromNow(7), whyId: 'why-employee-gap' },
  { id: 'act-14', category: 'Ops', title: 'Turn the automatic review/thank-you text back on', rationale: 'Review requests were skipped on 70% of completed jobs this quarter — a process gap, not quality.', impact: null, effort: 'Low', owner: 'Owner', status: 'To Do', dueDate: daysFromNow(1), whyId: 'why-retention-fell' },
  { id: 'act-15', category: 'Ops', title: 'Cluster West Houston dispatch windows to cut drive time', rationale: 'Drive time between jobs runs 22 minutes longer there than in Central Houston.', impact: 680, effort: 'Medium', owner: 'Dispatcher', status: 'To Do', dueDate: daysFromNow(14), whyId: 'why-territory-underperform' },
  { id: 'act-16', category: 'Docs', title: 'Read the FY Annual P&L export before Friday\'s bank meeting', rationale: 'Confirms the margin compression trend the bank will likely ask about.', impact: null, effort: 'Low', owner: 'Owner', status: 'To Do', dueDate: daysFromNow(3) },
  { id: 'act-17', category: 'Risk', title: 'Respond to the undisputed 3-week-old negative review', rationale: 'Unanswered negative reviews compound the retention decline and hurt local search ranking.', impact: null, effort: 'Low', owner: 'Owner', status: 'To Do', dueDate: daysFromNow(1), whyId: 'why-retention-fell' },
]

// ---------------------------------------------------------------------------
// DOCUMENTS
// ---------------------------------------------------------------------------

export type DocumentType = 'Contract' | 'Tax Filing' | 'Insurance' | 'Lease' | 'Financial Statement' | 'Legal'
export type DocumentStatus = 'Processed' | 'Processing'

export interface BusinessDocument {
  id: string
  name: string
  type: DocumentType
  uploadedAt: string
  status: DocumentStatus
  insightsCount: number
  summary: string
}

export const DEMO_DOCUMENTS: BusinessDocument[] = [
  { id: 'doc-01', name: '2025 Annual P&L Export.pdf', type: 'Financial Statement', uploadedAt: daysAgo(6), status: 'Processed', insightsCount: 4, summary: 'Confirms EBITDA margin compression in month 3 and flags rising parts cost as the primary driver.' },
  { id: 'doc-02', name: 'Commercial General Liability Policy.pdf', type: 'Insurance', uploadedAt: daysAgo(40), status: 'Processed', insightsCount: 2, summary: 'Renewal due in 58 days; coverage limits unchanged from last year; premium increased 9%.' },
  { id: 'doc-03', name: 'Bayou Brewing Panic Hardware Proposal.pdf', type: 'Contract', uploadedAt: daysAgo(5), status: 'Processing', insightsCount: 0, summary: 'Awaiting signature — sitting in CRM as Follow-up Needed.' },
  { id: 'doc-04', name: '2023 Transit Van #3 Lease.pdf', type: 'Lease', uploadedAt: daysAgo(90), status: 'Processed', insightsCount: 1, summary: 'Lease renewal option opens in 5 months at the current rate.' },
  { id: 'doc-05', name: 'Q1 Sales Tax Filing.pdf', type: 'Tax Filing', uploadedAt: daysAgo(70), status: 'Processed', insightsCount: 2, summary: 'Filed on time; effective tax rate flagged as slightly above the metro average.' },
  { id: 'doc-06', name: 'Harborview Property Mgmt — Master Service Agreement.pdf', type: 'Legal', uploadedAt: daysAgo(12), status: 'Processed', insightsCount: 3, summary: '40-unit annual rekey contract. Titan flagged the per-unit rate as 8% below your standard — worth renegotiating at renewal.' },
]

// ---------------------------------------------------------------------------
// FILINGS — 10-K / Filing Reader
// ---------------------------------------------------------------------------

export type FilingType = '10-K' | '10-Q' | 'Annual Summary'

export interface Filing {
  id: string
  name: string
  type: FilingType
  period: string
  uploadedAt: string
  highlights: string[]
  riskFactors: string[]
  managementNotes: string
}

export const DEMO_FILINGS: Filing[] = [
  {
    id: 'filing-01',
    name: 'Titan Locksmith Demo — Annual Business Summary',
    type: 'Annual Summary',
    period: 'Trailing 12 months',
    uploadedAt: daysAgo(6),
    highlights: [
      'Trailing 12-month revenue: $501,600, up 12% year-over-year',
      'EBITDA margin: 29%, up from 24% a year ago',
      'Recurring/contract revenue: 6% of total, first year with any recurring base',
      'Customer count: 340 unique customers served, 27% repeat rate',
    ],
    riskFactors: [
      'Customer concentration: top 5 customers now 18% of revenue',
      'Owner dependency: all commercial quoting still requires owner approval',
      'Single-location: all technician capacity based out of one dispatch point',
      'Cash handling: intermittent lag in cash verification discipline',
    ],
    managementNotes: 'This trailing-12-month summary is formatted like an acquisition-ready filing so the business can be diligenced the way a buyer or lender would read it. Titan generates this automatically from connected accounting, payments, and job data — no manual compilation required.',
  },
  {
    id: 'filing-02',
    name: 'Sample Public Filing — ABC Home Services Inc. (Demo Upload)',
    type: '10-K',
    period: 'FY2025',
    uploadedAt: daysAgo(14),
    highlights: [
      'Public home-services roll-up, $340M revenue, 22 regional brands',
      'Reports 31% gross margin in residential services segment',
      'Cites technician retention and route density as key margin drivers',
    ],
    riskFactors: [
      'Labor market competition for skilled trades called out as a top risk factor',
      'Seasonality in HVAC segment flagged in Item 1A',
      'Roll-up integration costs weighing on near-term margins',
    ],
    managementNotes: 'Uploaded as a demonstration of Titan\'s ability to ingest a public company\'s 10-K for industry and competitor benchmarking — the same reader that processes your own documents also reads filings from larger players in your space.',
  },
]

// ---------------------------------------------------------------------------
// INDUSTRY BRAIN — benchmarks
// ---------------------------------------------------------------------------

export interface Benchmark {
  metric: string
  yourValue: number
  industryMedian: number
  topQuartile: number
  unit: 'currency' | 'percent' | 'number'
  higherIsBetter: boolean
  note: string
}

export const DEMO_BENCHMARKS: Benchmark[] = [
  { metric: 'Average ticket', yourValue: 185, industryMedian: 150, topQuartile: 210, unit: 'currency', higherIsBetter: true, note: 'Above median — smart lock and commercial mix is lifting your average.' },
  { metric: 'EBITDA margin', yourValue: 29, industryMedian: 18, topQuartile: 32, unit: 'percent', higherIsBetter: true, note: 'Well above median locksmith margins, close to top-quartile operators.' },
  { metric: 'Technician utilization', yourValue: 68, industryMedian: 61, topQuartile: 78, unit: 'percent', higherIsBetter: true, note: 'Room to close a 10-point gap to top-quartile — dispatch clustering would help.' },
  { metric: 'Customer acquisition cost', yourValue: 42, industryMedian: 65, topQuartile: 38, unit: 'currency', higherIsBetter: false, note: 'Lower is better — you\'re beating median thanks to strong organic/GBP lead flow.' },
  { metric: 'Revenue per technician', yourValue: 138000, industryMedian: 110000, topQuartile: 165000, unit: 'currency', higherIsBetter: true, note: 'Above median; closing the gap to top-quartile is mostly a scheduling-density problem.' },
  { metric: 'Operating cash buffer (days)', yourValue: 11, industryMedian: 18, topQuartile: 30, unit: 'number', higherIsBetter: true, note: 'Below median right now — this quarter\'s cash tightness is a real gap versus peers.' },
  { metric: 'Repeat customer rate', yourValue: 27, industryMedian: 31, topQuartile: 45, unit: 'percent', higherIsBetter: true, note: 'Below median after outreach lapsed — this is a fixable process gap, not structural.' },
  { metric: 'Valuation multiple (× EBITDA)', yourValue: 3.0, industryMedian: 2.6, topQuartile: 4.2, unit: 'number', higherIsBetter: true, note: 'Above median. Reducing customer concentration is the fastest path to top-quartile.' },
]

// ---------------------------------------------------------------------------
// EXECUTIVE CHAT — canned Q&A
// ---------------------------------------------------------------------------

export interface ChatExchange {
  id: string
  prompt: string
  response: string
}

export const DEMO_CHAT_EXCHANGES: ChatExchange[] = [
  {
    id: 'chat-01',
    prompt: 'What changed this week?',
    response: 'Revenue dipped 9% ($4,200) as two commercial quotes — Bayou Brewing ($1,400) and Vantage Office Park ($1,900) — slipped past month-end, and emergency call volume ran 22% below normal. On the positive side, EBITDA margin held near 29% and your valuation estimate rose to $612,000 on stronger trailing EBITDA. The single biggest lever right now is closing those two stalled quotes.',
  },
  {
    id: 'chat-02',
    prompt: 'Why is cash tight right now?',
    response: 'Your operating cash buffer fell from 24 days to 11 days. Three things collided: $1,240 in cash collections is still sitting unverified outside the bank, payroll ran 4 days earlier than usual this cycle, and your annual vehicle insurance renewal paid out in full. Verifying the 4 pending cash jobs and collecting on 3 unpaid completed jobs would put $1,780 back in the bank this week.',
  },
  {
    id: 'chat-03',
    prompt: 'What\'s my biggest risk right now?',
    response: 'Two things: first, $1,240 of unverified cash — every day it sits unverified is a day it could walk away. Second, customer concentration just crossed 18% of trailing revenue in your top 5 accounts, which is starting to weigh on your valuation multiple. Fix the cash today; work down concentration over the next two quarters by adding smaller recurring accounts.',
  },
  {
    id: 'chat-04',
    prompt: 'Am I on track for my revenue goal?',
    response: 'Mostly — you\'re at $41,800/month against a $65,000 target six months out. This month\'s dip pushes the timeline back about two weeks, but it\'s recoverable: closing Bayou Brewing and Vantage this week alone gets you back on pace. The bigger structural question is tech capacity — you\'re near the ceiling with 4 full-time technicians, which is why the hiring goal matters just as much as the revenue goal.',
  },
  {
    id: 'chat-05',
    prompt: 'What should I do this week?',
    response: 'Three things, in order: (1) Verify the 4 pending cash jobs — that\'s $1,240 of real risk with zero effort to fix. (2) Call Bayou Brewing and Vantage Office Park to close $3,300 in stalled commercial pipeline. (3) Turn the automatic review/thank-you text back on — it\'s been off long enough to meaningfully hurt your repeat-customer rate.',
  },
  {
    id: 'chat-06',
    prompt: 'How does my business compare to other locksmiths?',
    response: 'You\'re beating the field on the metrics that matter most for valuation: 29% EBITDA margin versus an 18% industry median, and a $185 average ticket versus $150 median. Where you\'re behind median is operating cash buffer (11 days vs. 18) and repeat-customer rate (27% vs. 31%) — both are process fixes, not structural weaknesses, so they\'re very fixable.',
  },
  {
    id: 'chat-07',
    prompt: 'What is my business worth right now?',
    response: 'Base-case estimate is $612,000, using a 3.0× multiple on trailing annualized EBITDA — up $38,000 this quarter. Conservative case is roughly $408,000 (2.0×) and an optimistic case is $816,000 (4.0×) if you clean up customer concentration and keep cash discipline consistent. The fastest path to the top end of that range is landing 2-3 more small recurring commercial contracts.',
  },
  {
    id: 'chat-08',
    prompt: 'Which employee should I promote or invest in?',
    response: 'Marcus Reed. He\'s generating $340 more revenue per job than Andre Thompson, almost entirely because he closes upsells on 62% of jobs versus Andre\'s 18% — not because he\'s more skilled or faster. He\'d be a strong candidate to mentor other technicians, and pairing him with Andre for a couple of ride-alongs is the single highest-leverage coaching move available to you this month.',
  },
]

// Suggested prompt chips shown before any question is asked
export const CHAT_SUGGESTIONS = DEMO_CHAT_EXCHANGES.map(c => c.prompt)

// ---------------------------------------------------------------------------
// COMMAND CENTER — "What changed?" briefing metrics
// ---------------------------------------------------------------------------

export interface ChangeMetric {
  label: string
  value: string
  delta: string
  direction: 'up' | 'down'
  good: boolean
  whyId: string
  goalId?: string
}

export const WHAT_CHANGED: ChangeMetric[] = [
  { label: 'Revenue (monthly)', value: '$41,800', delta: '-9% ($4,200)', direction: 'down', good: false, whyId: 'why-revenue-drop', goalId: 'goal-revenue' },
  { label: 'Gross margin', value: '54%', delta: '-7 pts', direction: 'down', good: false, whyId: 'why-margin-compression', goalId: 'goal-ebitda' },
  { label: 'Cash buffer', value: '11 days', delta: '-13 days', direction: 'down', good: false, whyId: 'why-cash-tight', goalId: 'goal-cashflow' },
  { label: 'Valuation estimate', value: '$612,000', delta: '+$38,000', direction: 'up', good: true, whyId: 'why-valuation-change', goalId: 'goal-valuation' },
  { label: 'Repeat customer rate', value: '27%', delta: '-7 pts', direction: 'down', good: false, whyId: 'why-retention-fell' },
]

export interface MissedRisk {
  title: string
  detail: string
  severity: 'critical' | 'warning'
  href: string
}

export const MISSED_RISKS: MissedRisk[] = [
  { title: 'Customer concentration crossed 18%', detail: 'Top 5 customers now represent 18% of trailing revenue — a valuation risk most owners don\'t track until diligence.', severity: 'warning', href: '/valuation' },
  { title: 'Undisputed negative review, 3 weeks old', detail: 'Unanswered since it was posted — compounding the retention decline and hurting local search ranking.', severity: 'warning', href: '/action-plan' },
  { title: 'Insurance renewal in 58 days, no quotes shopped', detail: 'Last renewal came in 9% higher with zero competing quotes obtained.', severity: 'warning', href: '/documents' },
  { title: '$1,240 cash sitting unverified', detail: 'Every day this sits unverified is a day it could walk away — your single most fixable risk today.', severity: 'critical', href: '/cash-verification' },
]
