import type { ToolResult } from '@/lib/integrations/types'

// The Titan Agent tool contract. Every tool the agent can invoke — whether it
// wraps an external API or an internal database query — implements this shape.

export interface ToolSchemaField {
  name: string
  type: 'string' | 'number' | 'boolean'
  required: boolean
  description: string
}

export interface AgentTool {
  name: string
  description: string
  provider: string
  category: string
  /** Irreversible / outbound tools set this. The executor returns a draft for
   *  review instead of executing. */
  requiresApproval?: boolean
  inputSchema: ToolSchemaField[]
  outputSchema: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (input: Record<string, any>) => Promise<ToolResult>
}

export interface ToolRun {
  toolName: string
  provider: string
  status: 'ok' | 'error' | 'draft'
  mock: boolean
  summary: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  output: any
}

export interface AgentRunResult {
  answer: string
  toolRuns: ToolRun[]
  nextAction: string
  /** Present when a tool produced an outbound draft that needs confirmation. */
  approval?: {
    tool: string
    channel: 'sms' | 'email' | 'browser' | 'call' | 'financial'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    draft: any
    label: string
  }
}

export interface WorkflowResult {
  id: string
  title: string
  toolsUsed: string[]
  answer: string
  nextAction: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  detail?: any
  approval?: AgentRunResult['approval']
}
