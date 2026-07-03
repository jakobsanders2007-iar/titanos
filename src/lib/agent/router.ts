import 'server-only'

// Rule-based intent router. Maps a natural-language request to a tool name and
// extracted arguments. Simple and deterministic for MVP — good enough to make
// the agent genuinely useful without an LLM key.

export interface RoutedIntent {
  tool: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input: Record<string, any>
  rationale: string
}

const URL_RE = /(https?:\/\/[^\s]+|\b[\w-]+\.(?:com|net|org|io|co|us|biz)[^\s]*)/i
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/
const PHONE_RE = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
const ADDRESS_RE = /\d{1,6}\s+[\w.\s]+(?:st|street|ave|avenue|rd|road|blvd|lane|ln|dr|drive|way|ct|court)\b/i

export function route(message: string): RoutedIntent {
  const m = message.toLowerCase()
  const url = message.match(URL_RE)?.[0]
  const email = message.match(EMAIL_RE)?.[0]
  const phone = message.match(PHONE_RE)?.[0]
  const address = message.match(ADDRESS_RE)?.[0]

  // Order matters: most specific first.
  if (m.includes('competitor')) return { tool: 'findCompetitors', input: { query: message }, rationale: 'Mentioned competitors → competitor research.' }
  if (m.includes('vendor') || m.includes('supplier')) return { tool: 'findVendors', input: { query: message }, rationale: 'Mentioned vendors/suppliers → vendor discovery.' }
  if ((m.includes('summarize') || m.includes('weakness')) && url) return { tool: 'summarizeWebsite', input: { url }, rationale: 'Asked to summarize a website → crawl + analyze.' }
  if ((m.includes('crawl') || m.includes('website') || m.includes('site')) && url) return { tool: 'crawlWebsite', input: { url }, rationale: 'Website + URL → crawl.' }
  if (m.includes('search') || m.includes('find ') || m.includes('look up')) return { tool: 'searchWeb', input: { query: message }, rationale: 'Search intent → web search.' }
  if (m.includes('industry') || m.includes('benchmark')) return { tool: 'researchIndustry', input: { query: message }, rationale: 'Industry/benchmark → industry research.' }

  if (m.includes('address') || address) return { tool: 'validateAddress', input: { address: address ?? message }, rationale: 'Address present → validation.' }
  if (m.includes('service area')) return { tool: 'checkServiceArea', input: { address: address ?? message }, rationale: 'Service-area question.' }
  if (m.includes('email') && m.includes('valid')) return { tool: 'validateEmail', input: { email: email ?? '' }, rationale: 'Email validation.' }

  if (m.includes('payment reminder') || (m.includes('remind') && m.includes('pay'))) return { tool: 'sendPaymentReminder', input: { to: phone ?? '(555) 300-1004', amount: '$95', link: 'pay.titan.com/xyz' }, rationale: 'Payment reminder → drafted SMS (needs approval).' }
  if (m.includes('review request') || (m.includes('review') && m.includes('ask'))) return { tool: 'sendReviewRequest', input: { to: phone ?? '(555) 300-1001' }, rationale: 'Review request → drafted SMS (needs approval).' }
  if (m.includes('sms') || m.includes('text ')) return { tool: 'sendSMS', input: { to: phone ?? '(555) 300-1001', body: message }, rationale: 'SMS intent → drafted message (needs approval).' }
  if (m.includes('ceo packet') && m.includes('email')) return { tool: 'sendCEOPacketEmail', input: { to: email ?? 'owner@titanlocksmith.com' }, rationale: 'CEO packet email → drafted (needs approval).' }
  if (m.includes('email') || m.includes('draft') && m.includes('mail')) return { tool: 'sendEmail', input: { to: email ?? 'owner@titanlocksmith.com', subject: 'From Titan', body: message }, rationale: 'Email intent → drafted (needs approval).' }

  if (m.includes('receptionist') || (m.includes('call') && m.includes('book'))) return { tool: 'simulateReceptionistCall', input: { scenario: message }, rationale: 'Receptionist/booking call → simulate.' }
  if (m.includes('missed call') || m.includes('calls')) return { tool: 'listCalls', input: {}, rationale: 'Call log question → list calls.' }
  if (m.includes('transcri') || m.includes('voice memo')) return { tool: 'transcribeAudio', input: { source: 'recording.mp3' }, rationale: 'Transcription intent.' }

  if (m.includes('unpaid') || (m.includes('jobs') && m.includes('pay'))) return { tool: 'getUnpaidJobs', input: {}, rationale: 'Unpaid jobs → internal query.' }
  if (m.includes('follow') && (m.includes('customer') || m.includes('up'))) return { tool: 'getFollowUpCustomers', input: {}, rationale: 'Follow-up → internal query.' }
  if (m.includes('supplies') || m.includes('buy') || m.includes('inventory') || m.includes('order')) return { tool: 'recommendSupplies', input: {}, rationale: 'Purchasing → supply recommendations.' }
  if (m.includes('revenue') || m.includes('sales')) return { tool: 'explainRevenue', input: {}, rationale: 'Revenue question → internal why analysis.' }
  if (m.includes('document') || m.includes('10-k') || m.includes('10k') || m.includes('filing')) return { tool: 'summarizeDocument', input: { text: message }, rationale: 'Document analysis.' }

  // Fallback: reason over business data.
  return { tool: 'analyzeBusinessData', input: { question: message, context: 'Titan Locksmith Demo — trailing revenue $41,800/mo, EBITDA margin 29%, cash buffer 11 days.' }, rationale: 'General question → business reasoning.' }
}
