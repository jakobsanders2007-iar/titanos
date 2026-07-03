import 'server-only'
import { isLive } from './env'
import { ok, type ToolResult } from './types'

const KEYS = ['INCREASE_API_KEY']
const P = 'increase'

// SAFETY: Titan never moves money. These wrappers are read-only status and
// placeholder listings. No transaction, transfer, or account mutation is ever
// initiated here. Any future money movement must go through an explicit,
// separately-reviewed approval flow — not this module.

export interface IncreaseConnection { connected: boolean; mode: 'read_only'; note: string }
export interface FinancialAccountPlaceholder { id: string; name: string; type: string; note: string }

export async function checkIncreaseConnection(): Promise<ToolResult<IncreaseConnection>> {
  const connected = isLive(KEYS)
  return ok(P, { connected, mode: 'read_only', note: 'Read-only. Titan does not and will not move money from this integration.' },
    connected ? 'Increase connected (read-only).' : 'Increase not connected — status only.', !connected)
}

export async function listFinancialAccountsPlaceholder(): Promise<ToolResult<FinancialAccountPlaceholder[]>> {
  const accounts: FinancialAccountPlaceholder[] = [
    { id: 'acct-operating', name: 'Operating Account', type: 'checking', note: 'Placeholder — balances shown here in a future read-only release.' },
    { id: 'acct-reserve', name: 'Reserve / Payroll', type: 'checking', note: 'Placeholder — no live data. No money movement enabled.' },
  ]
  return ok(P, accounts, `${accounts.length} placeholder accounts (read-only, no live financial actions).`, true)
}
