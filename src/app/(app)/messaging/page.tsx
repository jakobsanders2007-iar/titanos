'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { confirmSend } from '@/app/actions/agent'
import {
  MessageSquare, Mail, Send, ShieldAlert, CheckCircle2, FileText,
} from 'lucide-react'

type Channel = 'sms' | 'email'

interface Template { id: string; label: string; channel: Channel; to: string; subject?: string; body: string }

const TEMPLATES: Template[] = [
  { id: 'job-confirm', label: 'Job Confirmation', channel: 'sms', to: '(555) 300-1001', body: 'Titan Locksmith: your House Lockout is confirmed for today at 2:00 PM. Your technician will text when en route. Reply STOP to opt out.' },
  { id: 'pay-remind', label: 'Payment Reminder', channel: 'sms', to: '(555) 300-1004', body: 'Titan Locksmith: a friendly reminder your balance of $95 is due. Pay securely here: pay.titan.com/xyz. Thank you!' },
  { id: 'review', label: 'Review Request', channel: 'sms', to: '(555) 300-1001', body: 'Thanks for choosing Titan Locksmith! If we did a great job, a quick Google review would mean a lot: g.page/titan-review' },
  { id: 'quote-follow', label: 'Quote Follow-up', channel: 'email', to: 'customer@email.com', subject: 'Following up on your Rekey quote', body: 'Hi there,\n\nJust following up on your Rekey quote of $140. We\'d love to get you on the schedule this week — reply here or call us and we\'ll lock in a time.\n\n— Titan Locksmith' },
  { id: 'ceo', label: 'CEO Packet', channel: 'email', to: 'owner@titanlocksmith.com', subject: 'Your monthly CEO Packet — Titan', body: 'Executive summary:\n\n• Revenue: $41,800 (-9%)\n• EBITDA margin: 29%\n• Cash buffer: 11 days\n• Valuation: $612,000 (+$38,000)\n\nTop action: close the two stalled commercial quotes.' },
  { id: 'onboard', label: 'Onboarding', channel: 'email', to: 'newcustomer@email.com', subject: 'Welcome to Titan Locksmith', body: 'Hi,\n\nWelcome! We\'re glad to have you. Save this number for 24/7 service, and we\'ll always text a confirmation and an en-route alert.\n\n— The Titan Team' },
]

export default function MessagingPage() {
  const [channel, setChannel] = useState<Channel>('sms')
  const [to, setTo] = useState('(555) 300-1001')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  const applyTemplate = (t: Template) => {
    setChannel(t.channel); setTo(t.to); setSubject(t.subject ?? ''); setBody(t.body); setNote(null)
  }

  const send = async () => {
    setBusy(true)
    try {
      const res = await confirmSend({ channel, to, subject: subject || undefined, body })
      setNote(res.summary)
      setConfirming(false)
    } finally { setBusy(false) }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Messaging"
        subtitle="Draft SMS & email with Telnyx and Resend — nothing sends without your approval"
      />
      <div className="flex-1 overflow-hidden flex">
        {/* Templates */}
        <div className="w-64 border-r border-gray-800 overflow-y-auto flex-shrink-0">
          <div className="px-4 py-3 border-b border-gray-800 text-sm font-semibold text-white flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-amber-400" />Templates</div>
          <div className="p-2 space-y-1">
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => applyTemplate(t)} className="w-full text-left px-3 py-2 rounded hover:bg-gray-900 transition-colors flex items-center gap-2">
                {t.channel === 'sms' ? <MessageSquare className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" /> : <Mail className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
                <span className="text-xs text-gray-300">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Composer */}
        <div className="flex-1 overflow-y-auto p-6 max-w-2xl">
          <div className="flex rounded overflow-hidden border border-gray-800 mb-4 w-fit">
            {(['sms', 'email'] as Channel[]).map(c => (
              <button key={c} onClick={() => setChannel(c)} className={`flex items-center gap-1.5 px-4 py-1.5 text-xs transition-colors ${channel === c ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                {c === 'sms' ? <MessageSquare className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}{c.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{channel === 'sms' ? 'To (phone)' : 'To (email)'}</label>
              <input value={to} onChange={e => setTo(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded text-sm text-gray-200 focus:outline-none focus:border-gray-600" />
            </div>
            {channel === 'email' && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Subject</label>
                <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded text-sm text-gray-200 focus:outline-none focus:border-gray-600" />
              </div>
            )}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Message</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={channel === 'email' ? 8 : 4} className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded text-sm text-gray-200 focus:outline-none focus:border-gray-600 resize-none" />
              {channel === 'sms' && <div className="text-[10px] text-gray-600 mt-1">{body.length} characters</div>}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button onClick={() => setConfirming(true)} disabled={!to || !body} className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 text-sm font-semibold rounded transition-colors">
                <Send className="w-3.5 h-3.5" />Review & Send
              </button>
              <span className="text-xs text-gray-600 flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-amber-400" />Approval required before anything sends</span>
            </div>

            {note && (
              <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 rounded px-3 py-2">
                <CheckCircle2 className="w-4 h-4" />{note}
              </div>
            )}
          </div>
        </div>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setConfirming(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-gray-950 border border-amber-500/30 rounded-lg max-w-md w-full p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3"><ShieldAlert className="w-4 h-4 text-amber-400" /><div className="text-sm font-semibold text-white">Review before sending</div></div>
            <div className="bg-gray-900 border border-gray-800 rounded p-3 text-sm text-gray-300 mb-4 space-y-1">
              <div><span className="text-gray-500">Via:</span> {channel === 'sms' ? 'Telnyx (SMS)' : 'Resend (Email)'}</div>
              <div><span className="text-gray-500">To:</span> {to}</div>
              {channel === 'email' && subject && <div><span className="text-gray-500">Subject:</span> {subject}</div>}
              <div className="whitespace-pre-wrap pt-1 border-t border-gray-800 mt-1">{body}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConfirming(false)} className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded border border-gray-700 transition-colors">Cancel</button>
              <button onClick={send} disabled={busy} className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 text-sm font-semibold rounded transition-colors">{busy ? 'Sending…' : 'Confirm & Send'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
