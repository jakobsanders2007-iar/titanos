'use client'

import { Header } from '@/components/layout/header'
import { DEMO_COMPANY, DEMO_TECHNICIANS } from '@/lib/demo-data'
import { Building2, Phone, CreditCard, MessageSquare, BookOpen, Calendar, MapPin, Bot, Users, Wrench, Tag } from 'lucide-react'

function SettingsSection({ title, icon: Icon, children, badge }: {
  title: string; icon: React.ElementType; children: React.ReactNode; badge?: string
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg">
      <div className="px-5 py-3.5 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 text-amber-400" />
          <div className="text-sm font-semibold text-white">{title}</div>
        </div>
        {badge && (
          <span className={`text-xs px-2 py-0.5 rounded border ${
            badge === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            badge === 'Coming Soon' ? 'bg-gray-800 text-gray-500 border-gray-700' :
            'bg-blue-500/10 text-blue-400 border-blue-500/20'
          }`}>{badge}</span>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

function Field({ label, value, type = 'text' }: { label: string; value: string; type?: string }) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        defaultValue={value}
        className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded text-sm text-gray-200 focus:outline-none focus:border-gray-600"
      />
    </div>
  )
}

const SERVICE_TYPES = [
  { name: 'House Lockout', defaultPrice: 95 },
  { name: 'Car Lockout', defaultPrice: 75 },
  { name: 'Rekey', defaultPrice: 120 },
  { name: 'Lock Replacement', defaultPrice: 220 },
  { name: 'Smart Lock Install', defaultPrice: 375 },
  { name: 'Safe Opening', defaultPrice: 300 },
  { name: 'Emergency Locksmith', defaultPrice: 175 },
  { name: 'Commercial Lock Repair', defaultPrice: 295 },
  { name: 'Key Duplication', defaultPrice: 35 },
  { name: 'Ignition Repair', defaultPrice: 200 },
]

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Settings" subtitle="Company configuration and integrations" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Company profile */}
          <SettingsSection title="Company Profile" icon={Building2} badge="Active">
            <Field label="Company Name" value={DEMO_COMPANY.name} />
            <Field label="Phone" value={DEMO_COMPANY.phone} />
            <Field label="Email" value={DEMO_COMPANY.email} type="email" />
            <Field label="Address" value={DEMO_COMPANY.address} />
            <Field label="Timezone" value={DEMO_COMPANY.timezone} />
            <button className="mt-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-semibold rounded transition-colors">
              Save Changes
            </button>
          </SettingsSection>

          {/* Twilio */}
          <SettingsSection title="Twilio — SMS & Calls" icon={Phone} badge="Coming Soon">
            <div className="text-xs text-gray-500 mb-4">Connect Twilio to send payment links via SMS and enable AI call answering.</div>
            <Field label="Account SID" value="" />
            <Field label="Auth Token" value="" type="password" />
            <Field label="Phone Number" value="" />
            <button className="mt-2 px-4 py-2 bg-gray-800 text-gray-500 text-xs font-medium rounded cursor-not-allowed" disabled>
              Connect Twilio
            </button>
          </SettingsSection>

          {/* Stripe */}
          <SettingsSection title="Stripe — Payment Links" icon={CreditCard} badge="Coming Soon">
            <div className="text-xs text-gray-500 mb-4">Connect Stripe to automatically generate and track payment links for each job.</div>
            <Field label="Publishable Key" value="" />
            <Field label="Secret Key" value="" type="password" />
            <Field label="Webhook Secret" value="" type="password" />
            <button className="mt-2 px-4 py-2 bg-gray-800 text-gray-500 text-xs font-medium rounded cursor-not-allowed" disabled>
              Connect Stripe
            </button>
          </SettingsSection>

          {/* QuickBooks */}
          <SettingsSection title="QuickBooks — Accounting Sync" icon={BookOpen} badge="Coming Soon">
            <div className="text-xs text-gray-500 mb-4">Sync completed jobs and payments directly to QuickBooks Online. Zero double-entry.</div>
            <div className="bg-gray-950 border border-gray-800 rounded p-3 mb-4">
              <div className="text-xs text-gray-400">Once connected, Titan will:</div>
              <ul className="text-xs text-gray-500 mt-2 space-y-1 list-disc list-inside">
                <li>Create invoices for each completed job</li>
                <li>Record payments by method</li>
                <li>Sync expense categories</li>
                <li>Enable monthly reconciliation</li>
              </ul>
            </div>
            <button className="px-4 py-2 bg-gray-800 text-gray-500 text-xs font-medium rounded cursor-not-allowed" disabled>
              Connect QuickBooks
            </button>
          </SettingsSection>
        </div>

        {/* Service Types */}
        <SettingsSection title="Service Types & Default Pricing" icon={Tag}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SERVICE_TYPES.map(s => (
              <div key={s.name} className="bg-gray-950 border border-gray-800 rounded p-3">
                <div className="text-xs font-medium text-white mb-1">{s.name}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">$</span>
                  <input
                    type="number"
                    defaultValue={s.defaultPrice}
                    className="w-full px-2 py-1 bg-gray-900 border border-gray-800 rounded text-sm text-gray-200 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-semibold rounded transition-colors">
            Save Pricing
          </button>
        </SettingsSection>

        {/* User Roles */}
        <SettingsSection title="User Roles & Access" icon={Users}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Role', 'Dashboard', 'Jobs', 'Dispatch', 'Financials', 'CEO Packet', 'Verify Cash', 'Settings'].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { role: 'Owner/Admin', perms: [true, true, true, true, true, true, true] },
                  { role: 'Dispatcher', perms: [true, true, true, false, false, false, false] },
                  { role: 'Technician', perms: [false, true, false, false, false, false, false] },
                  { role: 'Accountant/CFO', perms: [true, true, false, true, true, true, false] },
                ].map(r => (
                  <tr key={r.role} className="border-b border-gray-800/50">
                    <td className="px-3 py-2 font-medium text-white">{r.role}</td>
                    {r.perms.map((p, i) => (
                      <td key={i} className="px-3 py-2">
                        <span className={p ? 'text-emerald-400' : 'text-gray-700'}>{p ? '✓' : '—'}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingsSection>

        {/* Future integrations */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Calendar, name: 'Google Calendar', desc: 'Sync job schedule', soon: true },
            { icon: MapPin, name: 'Google Maps', desc: 'Routing & dispatch', soon: true },
            { icon: Bot, name: 'AI Voice Agent', desc: 'Auto-answer calls', soon: true },
            { icon: MessageSquare, name: 'Review Automation', desc: 'Request reviews', soon: true },
          ].map(integration => (
            <div key={integration.name} className="bg-gray-900 border border-gray-800 rounded-lg p-4 opacity-60">
              <integration.icon className="w-5 h-5 text-gray-500 mb-2" />
              <div className="text-xs font-semibold text-gray-400">{integration.name}</div>
              <div className="text-xs text-gray-600 mt-0.5">{integration.desc}</div>
              <div className="text-xs text-gray-700 mt-2">Coming soon</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
