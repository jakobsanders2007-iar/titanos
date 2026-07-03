import 'server-only'
import { isLive, requireEnv } from './env'
import { ok, fail, type ToolResult } from './types'

const KEYS = ['FIRECRAWL_API_KEY']
const P = 'firecrawl'

export interface CrawledPage { url: string; title: string; markdown: string; wordCount: number }
export interface WebsiteSummary { url: string; summary: string; weaknesses: string[]; strengths: string[] }

async function scrape(url: string): Promise<CrawledPage> {
  const key = requireEnv('FIRECRAWL_API_KEY')
  const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({ url, formats: ['markdown'] }),
  })
  if (!res.ok) throw new Error(`Firecrawl responded ${res.status}`)
  const json = await res.json()
  const md = String(json?.data?.markdown ?? '')
  return { url, title: String(json?.data?.metadata?.title ?? url), markdown: md, wordCount: md.split(/\s+/).filter(Boolean).length }
}

function mockPage(url: string): CrawledPage {
  const md = `# ${new URL(url.startsWith('http') ? url : 'https://' + url).hostname}\n\nWe are a family-owned locksmith serving the greater Houston area. Call us for lockouts, rekeys, and lock replacement.\n\nServices: House Lockout, Car Lockout, Rekey, Lock Replacement.\n\nCall (555) 000-0000. Open Mon-Fri 9-5.`
  return { url, title: 'Home — Local Locksmith', markdown: md, wordCount: md.split(/\s+/).length }
}

export async function crawlWebsite(url: string): Promise<ToolResult<CrawledPage>> {
  if (!isLive(KEYS)) return ok(P, mockPage(url), `Crawled ${url} (mock) — ${mockPage(url).wordCount} words extracted.`, true)
  try {
    const page = await scrape(url)
    return ok(P, page, `Crawled ${url} — ${page.wordCount} words extracted.`, false)
  } catch (e) {
    return fail(P, e instanceof Error ? e.message : 'crawl failed')
  }
}

export async function extractWebsiteContent(url: string): Promise<ToolResult<string>> {
  const page = await crawlWebsite(url)
  if (!page.ok || !page.data) return fail(P, page.error ?? 'no content')
  return ok(P, page.data.markdown, `Extracted ${page.data.wordCount} words of content from ${url}.`, page.mock)
}

export async function summarizeWebsite(url: string): Promise<ToolResult<WebsiteSummary>> {
  const page = await crawlWebsite(url)
  if (!page.ok || !page.data) return fail(P, page.error ?? 'no content')
  // Deterministic heuristic "analysis" so this works without an LLM key.
  const md = page.data.markdown.toLowerCase()
  const weaknesses: string[] = []
  if (!md.includes('review')) weaknesses.push('No customer reviews or social proof shown on the page.')
  if (!md.includes('24/7') && !md.includes('emergency')) weaknesses.push('No 24/7 / emergency availability messaging — a common conversion driver.')
  if (!md.includes('book') && !md.includes('schedule') && !md.includes('online')) weaknesses.push('No online booking or instant-quote path — relies on phone calls only.')
  if (!md.includes('smart')) weaknesses.push('No smart-lock / high-ticket services promoted — leaving premium revenue on the table.')
  if (!md.includes('guarantee') && !md.includes('warranty')) weaknesses.push('No guarantee or warranty stated to reduce buyer risk.')
  const strengths: string[] = []
  if (md.includes('family')) strengths.push('Family-owned positioning builds local trust.')
  if (md.includes('call')) strengths.push('Clear phone call-to-action present.')
  const summary = `${page.data.title}: a locksmith site focused on core services. ${weaknesses.length} conversion weaknesses identified.`
  return ok(P, { url, summary, weaknesses, strengths }, `Summarized ${url}: ${weaknesses.length} weaknesses, ${strengths.length} strengths.`, page.mock)
}
