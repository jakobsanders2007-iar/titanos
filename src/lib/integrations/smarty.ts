import 'server-only'
import { isLive, requireEnv } from './env'
import { ok, fail, type ToolResult } from './types'

const KEYS = ['SMARTY_AUTH_ID', 'SMARTY_AUTH_TOKEN']
const P = 'smarty'

export interface AddressValidation {
  input: string
  normalized: string
  valid: boolean
  components: { city: string; state: string; zip: string }
  inServiceArea: boolean
}

const SERVICE_AREA_ZIPS = new Set(['77001', '77002', '77006', '77007', '77019', '77057', '77063', '77098', '77401'])

function parseMock(input: string): AddressValidation {
  const zipMatch = input.match(/\b(\d{5})\b/)
  const zip = zipMatch?.[1] ?? '77002'
  const stateMatch = input.match(/\b([A-Z]{2})\b/)
  const state = stateMatch?.[1] ?? 'TX'
  const cityMatch = input.match(/,\s*([A-Za-z\s]+),/)
  const city = cityMatch?.[1]?.trim() ?? 'Houston'
  const normalized = input.replace(/\s+/g, ' ').trim()
  return { input, normalized, valid: true, components: { city, state, zip }, inServiceArea: SERVICE_AREA_ZIPS.has(zip) }
}

export async function validateAddress(address: string): Promise<ToolResult<AddressValidation>> {
  if (!isLive(KEYS)) {
    const v = parseMock(address)
    return ok(P, v, `Validated address (mock): ${v.valid ? 'valid' : 'invalid'}, ${v.inServiceArea ? 'in' : 'outside'} service area.`, true)
  }
  try {
    const id = requireEnv('SMARTY_AUTH_ID')
    const token = requireEnv('SMARTY_AUTH_TOKEN')
    const url = `https://us-street.api.smarty.com/street-address?auth-id=${encodeURIComponent(id)}&auth-token=${encodeURIComponent(token)}&street=${encodeURIComponent(address)}&candidates=1`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Smarty responded ${res.status}`)
    const arr = await res.json()
    if (!Array.isArray(arr) || arr.length === 0) {
      const v: AddressValidation = { input: address, normalized: address, valid: false, components: { city: '', state: '', zip: '' }, inServiceArea: false }
      return ok(P, v, 'Address could not be validated — no candidates returned.', false)
    }
    const c = arr[0]
    const zip = String(c?.components?.zipcode ?? '')
    const v: AddressValidation = {
      input: address,
      normalized: `${c.delivery_line_1}, ${c.last_line}`,
      valid: true,
      components: { city: String(c?.components?.city_name ?? ''), state: String(c?.components?.state_abbreviation ?? ''), zip },
      inServiceArea: SERVICE_AREA_ZIPS.has(zip),
    }
    return ok(P, v, `Validated address: valid, ${v.inServiceArea ? 'in' : 'outside'} service area.`, false)
  } catch (e) {
    return fail(P, e instanceof Error ? e.message : 'validation failed')
  }
}

export async function normalizeAddress(address: string): Promise<ToolResult<string>> {
  const v = await validateAddress(address)
  if (!v.ok || !v.data) return fail(P, v.error ?? 'normalize failed')
  return ok(P, v.data.normalized, `Normalized to: ${v.data.normalized}`, v.mock)
}

export async function checkServiceArea(address: string): Promise<ToolResult<{ inServiceArea: boolean; zip: string }>> {
  const v = await validateAddress(address)
  if (!v.ok || !v.data) return fail(P, v.error ?? 'check failed')
  return ok(P, { inServiceArea: v.data.inServiceArea, zip: v.data.components.zip },
    v.data.inServiceArea ? `In service area (ZIP ${v.data.components.zip}).` : `Outside current service area (ZIP ${v.data.components.zip}).`, v.mock)
}
