'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { DEMO_JOBS, DEMO_EXPENSES } from '@/lib/demo-data'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Info } from 'lucide-react'

const completedJobs = DEMO_JOBS.filter(j => j.status === 'Completed' && j.final_price)
const grossRevenue = completedJobs.reduce((s, j) => s + (j.final_price || 0), 0)
const totalExpenses = DEMO_EXPENSES.reduce((s, e) => s + e.amount, 0)
const totalParts = completedJobs.reduce((s, j) => s + (j.parts_cost || 0), 0)
const ebitda = grossRevenue - totalExpenses - totalParts
const annualRevenue = grossRevenue * 12
const annualEBITDA = ebitda * 12

function Slider({ label, value, onChange, min, max, step = 1, format = 'number' }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; format?: 'number' | 'percent'
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <label className="text-xs text-gray-400">{label}</label>
        <span className="text-xs font-semibold text-white">{format === 'percent' ? `${value}%` : value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-800 rounded appearance-none cursor-pointer accent-amber-500"
      />
      <div className="flex justify-between mt-0.5">
        <span className="text-xs text-gray-600">{format === 'percent' ? `${min}%` : min}</span>
        <span className="text-xs text-gray-600">{format === 'percent' ? `${max}%` : max}</span>
      </div>
    </div>
  )
}

export default function ValuationPage() {
  const [growthRate, setGrowthRate] = useState(15)
  const [recurringPct, setRecurringPct] = useState(20)
  const [ownerInvolvement, setOwnerInvolvement] = useState(60)
  const [cleanBooksScore, setCleanBooksScore] = useState(70)
  const [cashLeakageRisk, setCashLeakageRisk] = useState(30)
  const [techDependency, setTechDependency] = useState(40)

  // Quality multiplier based on inputs
  const qualityScore = (
    (cleanBooksScore / 100) * 0.25 +
    (recurringPct / 100) * 0.15 +
    ((100 - ownerInvolvement) / 100) * 0.20 +
    ((100 - cashLeakageRisk) / 100) * 0.20 +
    ((100 - techDependency) / 100) * 0.15 +
    (growthRate / 50) * 0.05
  )

  const baseMultiple = 1.5 + qualityScore * 3
  const lowMultiple = Math.max(1.0, baseMultiple - 0.75)
  const highMultiple = Math.min(6.0, baseMultiple + 0.75)

  const valuationLow = annualEBITDA * lowMultiple
  const valuationBase = annualEBITDA * baseMultiple
  const valuationHigh = annualEBITDA * highMultiple

  const revenueMultipleLow = annualRevenue * 0.5
  const revenueMultipleBase = annualRevenue * 0.75
  const revenueMultipleHigh = annualRevenue * 1.0

  const getQualityLabel = () => {
    if (qualityScore > 0.7) return { label: 'High Quality', color: 'text-emerald-400' }
    if (qualityScore > 0.45) return { label: 'Above Average', color: 'text-amber-400' }
    return { label: 'Improvement Needed', color: 'text-red-400' }
  }
  const quality = getQualityLabel()

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Business Valuation" subtitle="Estimated company value based on current financials" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Valuation cards */}
        <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-lg p-5">
          <div className="text-xs text-amber-400 uppercase tracking-wide mb-3">Estimated Business Value (EBITDA Method)</div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Conservative', value: valuationLow, mult: `${lowMultiple.toFixed(1)}×`, color: 'text-gray-300' },
              { label: 'Base Case', value: valuationBase, mult: `${baseMultiple.toFixed(1)}×`, color: 'text-amber-400' },
              { label: 'Optimistic', value: valuationHigh, mult: `${highMultiple.toFixed(1)}×`, color: 'text-emerald-400' },
            ].map(v => (
              <div key={v.label} className="bg-gray-950/60 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500 mb-2">{v.label}</div>
                <div className={`text-2xl font-bold ${v.color} tabular-nums`}>{formatCurrency(v.value)}</div>
                <div className="text-xs text-gray-600 mt-1">{v.mult} EBITDA</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-400">Business Quality Score: <span className={`font-semibold ${quality.color}`}>{quality.label}</span></div>
            <div className="text-gray-500">Annualized EBITDA: <span className="text-white font-semibold">{formatCurrency(annualEBITDA)}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Adjustors */}
          <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-sm font-medium text-white mb-4">Valuation Inputs</div>
            <Slider label="Growth Rate (YoY %)" value={growthRate} onChange={setGrowthRate} min={0} max={50} format="percent" />
            <Slider label="Recurring Revenue %" value={recurringPct} onChange={setRecurringPct} min={0} max={100} format="percent" />
            <Slider label="Owner Involvement %" value={ownerInvolvement} onChange={setOwnerInvolvement} min={0} max={100} format="percent" />
            <Slider label="Clean Books Score" value={cleanBooksScore} onChange={setCleanBooksScore} min={0} max={100} format="percent" />
            <Slider label="Cash Leakage Risk %" value={cashLeakageRisk} onChange={setCashLeakageRisk} min={0} max={100} format="percent" />
            <Slider label="Technician Dependency %" value={techDependency} onChange={setTechDependency} min={0} max={100} format="percent" />
          </div>

          {/* Methods comparison */}
          <div className="lg:col-span-2 space-y-4">
            {/* Financials summary */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-sm font-medium text-white mb-3">Financial Foundation</div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Monthly Revenue', value: grossRevenue },
                  { label: 'Monthly EBITDA', value: ebitda },
                  { label: 'Annualized Revenue', value: annualRevenue },
                  { label: 'Annualized EBITDA', value: annualEBITDA },
                  { label: 'EBITDA Margin', value: null, text: `${((ebitda / grossRevenue) * 100).toFixed(1)}%` },
                  { label: 'Completed Jobs', value: null, text: completedJobs.length.toString() },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-950/50 rounded p-2.5">
                    <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                    <div className="text-sm font-semibold text-white">{item.text || formatCurrency(item.value!)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue multiple method */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-sm font-medium text-white mb-3">Revenue Multiple Method</div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Conservative (0.5×)', value: revenueMultipleLow, color: 'text-gray-300' },
                  { label: 'Base (0.75×)', value: revenueMultipleBase, color: 'text-amber-400' },
                  { label: 'Optimistic (1.0×)', value: revenueMultipleHigh, color: 'text-emerald-400' },
                ].map(v => (
                  <div key={v.label} className="bg-gray-950/50 rounded p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">{v.label}</div>
                    <div className={`text-lg font-bold ${v.color}`}>{formatCurrency(v.value)}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2">Revenue multiples for small service businesses typically range 0.5×–1.0× annual revenue. EBITDA method is more accurate.</p>
            </div>

            {/* Quality factors */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-sm font-medium text-white mb-3">How Titan Improves Your Valuation</div>
              <div className="space-y-2">
                {[
                  { factor: 'Clean, verified cash collections', impact: '+0.3×', active: cashLeakageRisk < 30 },
                  { factor: 'Documented job history & financials', impact: '+0.4×', active: true },
                  { factor: 'Payment link usage (reduces cash risk)', impact: '+0.25×', active: true },
                  { factor: 'CEO Packet — ready to show buyers', impact: '+0.2×', active: true },
                  { factor: 'Low owner dependency (systemized)', impact: '+0.5×', active: ownerInvolvement < 40 },
                  { factor: 'Recurring revenue / service contracts', impact: '+0.5×', active: recurringPct > 30 },
                ].map((f, i) => (
                  <div key={i} className={`flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0 ${!f.active ? 'opacity-40' : ''}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${f.active ? 'bg-emerald-400' : 'bg-gray-700'}`} />
                      <span className="text-xs text-gray-400">{f.factor}</span>
                    </div>
                    <span className={`text-xs font-semibold ${f.active ? 'text-emerald-400' : 'text-gray-600'}`}>{f.impact}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
