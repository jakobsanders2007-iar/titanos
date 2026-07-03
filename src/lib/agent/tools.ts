import 'server-only'
import type { AgentTool } from './types'
import { ok, type ToolResult } from '@/lib/integrations/types'
import * as exa from '@/lib/integrations/exa'
import * as firecrawl from '@/lib/integrations/firecrawl'
import * as browserbase from '@/lib/integrations/browserbase'
import * as gladia from '@/lib/integrations/gladia'
import * as vapi from '@/lib/integrations/vapi'
import * as telnyx from '@/lib/integrations/telnyx'
import * as smarty from '@/lib/integrations/smarty'
import * as resend from '@/lib/integrations/resend'
import * as abstract from '@/lib/integrations/abstract'
import * as increase from '@/lib/integrations/increase'
import * as azure from '@/lib/integrations/azure'
import * as grok from '@/lib/integrations/grok'
import { DEMO_JOBS, DEMO_CUSTOMERS } from '@/lib/demo-data'
import { DEMO_WHY } from '@/lib/demo-intelligence'
import { DEMO_SHOPPER_ITEMS } from '@/lib/demo-extended'

const s = (name: string, required: boolean, description: string) => ({ name, type: 'string' as const, required, description })

// --- Internal (database / demo-data) tools ---------------------------------

async function unpaidJobs(): Promise<ToolResult> {
  const unpaid = DEMO_JOBS.filter(j => j.status === 'Completed' && j.payment_status !== 'Paid')
  const total = unpaid.reduce((sum, j) => sum + (j.final_price ?? j.estimated_price ?? 0) - (j.amount_collected ?? 0), 0)
  return ok('titan-db', unpaid.map(j => ({ id: j.id, customer: DEMO_CUSTOMERS.find(c => c.id === j.customer_id)?.name, owed: (j.final_price ?? j.estimated_price ?? 0) - (j.amount_collected ?? 0) })),
    `${unpaid.length} completed jobs are unpaid, totaling $${total.toLocaleString()}.`, false)
}

async function followUpCustomers(): Promise<ToolResult> {
  // Customers with a completed job but no repeat in 14+ days (demo heuristic).
  const names = DEMO_CUSTOMERS.slice(0, 5).map(c => c.name)
  return ok('titan-db', names, `${names.length} customers are due for follow-up outreach.`, false)
}

async function whyRevenue(): Promise<ToolResult> {
  const w = DEMO_WHY.find(x => x.id === 'why-revenue-drop')!
  return ok('titan-db', w, w.rootCause, false)
}

async function recommendSupplies(): Promise<ToolResult> {
  const restock = DEMO_SHOPPER_ITEMS.filter(i => i.urgency === 'Restock Now')
  return ok('titan-db', restock.map(i => ({ name: i.name, vendor: i.vendor, reason: i.reason })),
    `${restock.length} items need restocking now based on recent job volume.`, false)
}

// --- Tool registry ----------------------------------------------------------

export const TOOLS: AgentTool[] = [
  // Research & web
  { name: 'searchWeb', description: 'Search the web for information.', provider: 'exa', category: 'Research & Web', inputSchema: [s('query', true, 'What to search for')], outputSchema: 'WebResult[]', handler: i => exa.searchWeb(String(i.query ?? '')) },
  { name: 'findCompetitors', description: 'Find competing businesses in an area.', provider: 'exa', category: 'Research & Web', inputSchema: [s('query', true, 'Business type + location')], outputSchema: 'WebResult[]', handler: i => exa.findCompetitors(String(i.query ?? 'locksmith Houston')) },
  { name: 'findVendors', description: 'Discover suppliers and vendors.', provider: 'exa', category: 'Research & Web', inputSchema: [s('query', true, 'What to source')], outputSchema: 'WebResult[]', handler: i => exa.findVendors(String(i.query ?? 'locksmith supplies')) },
  { name: 'researchIndustry', description: 'Research industry benchmarks and trends.', provider: 'exa', category: 'Research & Web', inputSchema: [s('query', true, 'Industry topic')], outputSchema: 'WebResult[]', handler: i => exa.researchIndustry(String(i.query ?? 'locksmith industry')) },
  { name: 'crawlWebsite', description: 'Crawl a website and extract its content.', provider: 'firecrawl', category: 'Research & Web', inputSchema: [s('url', true, 'Website URL')], outputSchema: 'CrawledPage', handler: i => firecrawl.crawlWebsite(String(i.url ?? '')) },
  { name: 'summarizeWebsite', description: 'Summarize a website and identify weaknesses.', provider: 'firecrawl', category: 'Research & Web', inputSchema: [s('url', true, 'Website URL')], outputSchema: 'WebsiteSummary', handler: i => firecrawl.summarizeWebsite(String(i.url ?? '')) },

  // Browser (approval-gated)
  { name: 'inspectPage', description: 'Inspect a public web page structure.', provider: 'browserbase', category: 'Browser Automation', inputSchema: [s('url', true, 'Page URL')], outputSchema: 'PageInspection', handler: i => browserbase.inspectPage(String(i.url ?? '')) },
  { name: 'assistedBrowserTask', description: 'Prepare an authorized browser automation task.', provider: 'browserbase', category: 'Browser Automation', requiresApproval: true, inputSchema: [s('description', true, 'What the browser should do')], outputSchema: 'plan', handler: i => browserbase.assistedBrowserTask(String(i.description ?? '')) },

  // Voice & calls
  { name: 'transcribeAudio', description: 'Transcribe an audio file or call recording.', provider: 'gladia', category: 'Voice & Calls', inputSchema: [s('source', true, 'Audio source/URL')], outputSchema: 'Transcript', handler: i => gladia.transcribeAudio(String(i.source ?? 'recording.mp3')) },
  { name: 'summarizeCallTranscript', description: 'Summarize a call transcript with action items.', provider: 'gladia', category: 'Voice & Calls', inputSchema: [s('transcript', true, 'Transcript text')], outputSchema: 'CallSummary', handler: async i => gladia.summarizeCallTranscript(String(i.transcript ?? '')) },
  { name: 'listCalls', description: 'List recent AI receptionist calls.', provider: 'vapi', category: 'Voice & Calls', inputSchema: [], outputSchema: 'VapiCall[]', handler: () => vapi.listCalls() },
  { name: 'simulateReceptionistCall', description: 'Simulate the AI receptionist booking a job.', provider: 'vapi', category: 'Voice & Calls', inputSchema: [s('scenario', true, 'Caller scenario')], outputSchema: 'ReceptionistResult', handler: i => vapi.simulateReceptionistCall(String(i.scenario ?? 'I am locked out of my house.')) },

  // Messaging (approval-gated)
  { name: 'sendSMS', description: 'Send an SMS (requires approval).', provider: 'telnyx', category: 'Messaging', requiresApproval: true, inputSchema: [s('to', true, 'Recipient phone'), s('body', true, 'Message body')], outputSchema: 'SmsDraft', handler: async i => telnyx.draftSMS(String(i.to ?? ''), String(i.body ?? '')) },
  { name: 'sendPaymentReminder', description: 'Draft an SMS payment reminder (requires approval).', provider: 'telnyx', category: 'Messaging', requiresApproval: true, inputSchema: [s('to', true, 'Recipient phone'), s('amount', true, 'Amount owed'), s('link', false, 'Payment link')], outputSchema: 'SmsDraft', handler: async i => telnyx.sendPaymentReminder(String(i.to ?? ''), String(i.amount ?? ''), String(i.link ?? 'pay.titan.com/xyz')) },
  { name: 'sendReviewRequest', description: 'Draft an SMS review request (requires approval).', provider: 'telnyx', category: 'Messaging', requiresApproval: true, inputSchema: [s('to', true, 'Recipient phone')], outputSchema: 'SmsDraft', handler: async i => telnyx.sendReviewRequest(String(i.to ?? '')) },
  { name: 'sendEmail', description: 'Draft an email (requires approval).', provider: 'resend', category: 'Messaging', requiresApproval: true, inputSchema: [s('to', true, 'Recipient email'), s('subject', true, 'Subject'), s('body', true, 'Body')], outputSchema: 'EmailDraft', handler: async i => resend.draftEmail(String(i.to ?? ''), String(i.subject ?? ''), String(i.body ?? '')) },
  { name: 'sendCEOPacketEmail', description: 'Draft a CEO packet email (requires approval).', provider: 'resend', category: 'Messaging', requiresApproval: true, inputSchema: [s('to', true, 'Recipient email'), s('month', false, 'Month'), s('body', false, 'Body')], outputSchema: 'EmailDraft', handler: async i => resend.sendCEOPacketEmail(String(i.to ?? ''), String(i.month ?? new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })), String(i.body ?? '')) },

  // Data validation
  { name: 'validateAddress', description: 'Validate and normalize a street address.', provider: 'smarty', category: 'Data Validation', inputSchema: [s('address', true, 'Street address')], outputSchema: 'AddressValidation', handler: i => smarty.validateAddress(String(i.address ?? '')) },
  { name: 'checkServiceArea', description: 'Check if an address is in the service area.', provider: 'smarty', category: 'Data Validation', inputSchema: [s('address', true, 'Street address')], outputSchema: 'serviceArea', handler: i => smarty.checkServiceArea(String(i.address ?? '')) },
  { name: 'validateEmail', description: 'Validate an email address.', provider: 'abstract', category: 'Data Validation', inputSchema: [s('email', true, 'Email address')], outputSchema: 'EmailCheck', handler: i => abstract.validateEmail(String(i.email ?? '')) },
  { name: 'validatePhone', description: 'Validate a phone number.', provider: 'abstract', category: 'Data Validation', inputSchema: [s('phone', true, 'Phone number')], outputSchema: 'PhoneCheck', handler: i => abstract.validatePhone(String(i.phone ?? '')) },

  // Documents & AI
  { name: 'summarizeDocument', description: 'Analyze a document: summary, findings, risks, recommendations.', provider: 'azure', category: 'Documents & AI', inputSchema: [s('text', true, 'Document text')], outputSchema: 'DocAnalysis', handler: async i => azure.summarizeDocument(String(i.text ?? '')) },
  { name: 'analyzeBusinessData', description: 'Reason over business data to answer a question.', provider: 'azure', category: 'Documents & AI', inputSchema: [s('question', true, 'Question'), s('context', false, 'Context')], outputSchema: 'ModelAnswer', handler: i => azure.analyzeBusinessData(String(i.question ?? ''), String(i.context ?? '')) },
  { name: 'askGrokModel', description: 'Ask the Grok model a question.', provider: 'grok', category: 'Documents & AI', inputSchema: [s('prompt', true, 'Prompt')], outputSchema: 'ModelAnswer', handler: i => grok.askGrokModel(String(i.prompt ?? '')) },

  // Banking (read-only)
  { name: 'checkIncreaseConnection', description: 'Check banking connection (read-only, never moves money).', provider: 'increase', category: 'Banking', inputSchema: [], outputSchema: 'IncreaseConnection', handler: () => increase.checkIncreaseConnection() },

  // Internal Titan data tools
  { name: 'getUnpaidJobs', description: 'List completed jobs that are unpaid.', provider: 'titan-db', category: 'Documents & AI', inputSchema: [], outputSchema: 'job[]', handler: () => unpaidJobs() },
  { name: 'getFollowUpCustomers', description: 'List customers due for follow-up.', provider: 'titan-db', category: 'Documents & AI', inputSchema: [], outputSchema: 'string[]', handler: () => followUpCustomers() },
  { name: 'explainRevenue', description: 'Explain why revenue changed using internal data.', provider: 'titan-db', category: 'Documents & AI', inputSchema: [], outputSchema: 'WhyAnalysis', handler: () => whyRevenue() },
  { name: 'recommendSupplies', description: 'Recommend supplies to buy from job history.', provider: 'titan-db', category: 'Documents & AI', inputSchema: [], outputSchema: 'item[]', handler: () => recommendSupplies() },
]

export function getTool(name: string): AgentTool | undefined {
  return TOOLS.find(t => t.name === name)
}
