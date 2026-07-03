import 'server-only'
import { isLive, requireEnv } from './env'
import { ok, fail, type ToolResult } from './types'

const KEYS = ['EXA_API_KEY']
const P = 'exa'

export interface WebResult { title: string; url: string; snippet: string; publishedDate?: string }

async function exaSearch(query: string, numResults = 5): Promise<WebResult[]> {
  const key = requireEnv('EXA_API_KEY')
  const res = await fetch('https://api.exa.ai/search', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key },
    body: JSON.stringify({ query, numResults, contents: { text: { maxCharacters: 500 } } }),
  })
  if (!res.ok) throw new Error(`Exa responded ${res.status}`)
  const json = await res.json()
  return (json.results ?? []).map((r: Record<string, unknown>) => ({
    title: String(r.title ?? 'Untitled'),
    url: String(r.url ?? ''),
    snippet: String((r.text as string) ?? '').slice(0, 300),
    publishedDate: r.publishedDate as string | undefined,
  }))
}

function mockResults(query: string, kind: 'search' | 'competitors' | 'vendors' | 'industry'): WebResult[] {
  const base: Record<typeof kind, WebResult[]> = {
    search: [
      { title: `Top results for "${query}"`, url: 'https://example.com/result-1', snippet: `Overview and background relevant to ${query}, drawn from public web sources.` },
      { title: `${query} — industry guide`, url: 'https://example.com/result-2', snippet: `A practical guide covering pricing, demand, and operational benchmarks for ${query}.` },
    ],
    competitors: [
      { title: 'Reliable Lock & Key — Houston', url: 'https://reliablelockhouston.example', snippet: '24/7 residential & commercial locksmith. Emphasizes emergency response and upfront pricing. 4.6★ (312 reviews).' },
      { title: 'Bayou City Locksmith', url: 'https://bayoucitylock.example', snippet: 'Automotive-focused locksmith with mobile key programming. Aggressive Google Ads presence. 4.3★ (188 reviews).' },
      { title: 'SecureHouston Pro', url: 'https://securehoustonpro.example', snippet: 'Commercial access-control and master-key systems. Targets property managers. 4.8★ (97 reviews).' },
    ],
    vendors: [
      { title: 'Locksmith Distributor Co.', url: 'https://locksmithdist.example', snippet: 'Wholesale pins, blanks, and rekey kits. Same-day shipping in TX. Net-30 available.' },
      { title: 'SmartLock Supply', url: 'https://smartlocksupply.example', snippet: 'Bulk pricing on Yale, Schlage, and August smart locks for professional installers.' },
    ],
    industry: [
      { title: 'Locksmith Industry Benchmarks 2025', url: 'https://industry.example/locksmith-2025', snippet: 'Median EBITDA margin 18%, average ticket $150, technician utilization 61%.' },
      { title: 'Field Service Pricing Trends', url: 'https://industry.example/pricing', snippet: 'Smart-lock installs are the fastest-growing revenue line for residential locksmiths.' },
    ],
  }
  return base[kind]
}

async function run(kind: 'search' | 'competitors' | 'vendors' | 'industry', query: string): Promise<ToolResult<WebResult[]>> {
  const label = { search: 'Web search', competitors: 'Competitor scan', vendors: 'Vendor discovery', industry: 'Industry research' }[kind]
  if (!isLive(KEYS)) {
    return ok(P, mockResults(query, kind), `${label} (mock): ${mockResults(query, kind).length} results for "${query}".`, true)
  }
  try {
    const results = await exaSearch(query)
    return ok(P, results, `${label}: ${results.length} live results for "${query}".`, false)
  } catch (e) {
    return fail(P, e instanceof Error ? e.message : 'search failed')
  }
}

export const searchWeb = (query: string) => run('search', query)
export const findCompetitors = (query: string) => run('competitors', query)
export const findVendors = (query: string) => run('vendors', query)
export const researchIndustry = (query: string) => run('industry', query)
