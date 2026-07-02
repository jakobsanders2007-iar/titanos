'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { StatCard } from '@/components/ui/stat-card'
import { DEMO_SHOPPER_ITEMS, type ShopperItem } from '@/lib/demo-extended'
import { formatCurrency } from '@/lib/utils'
import { ShoppingCart, Sparkles, Trash2, Plus, Minus, PackageCheck } from 'lucide-react'

const URGENCY_STYLES: Record<string, string> = {
  'Restock Now': 'bg-red-500/10 text-red-400 border-red-500/20',
  'This Month': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Plan Ahead': 'bg-gray-800 text-gray-400 border-gray-700',
}

const CATEGORIES = ['All', 'Locksmith Supplies', 'HVAC Supplies', 'Tools', 'Van & Fleet', 'Payments & Office', 'Marketing', 'Safety & PPE']

export default function AIShopperPage() {
  const [items, setItems] = useState<ShopperItem[]>(DEMO_SHOPPER_ITEMS)
  const [category, setCategory] = useState('All')
  const [showCart, setShowCart] = useState(false)

  const cart = items.filter(i => i.in_cart)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const restockNow = items.filter(i => i.urgency === 'Restock Now')

  const vendorTotals: Record<string, number> = {}
  cart.forEach(i => { vendorTotals[i.vendor] = (vendorTotals[i.vendor] || 0) + i.price * i.qty })
  const vendors = Object.entries(vendorTotals).sort((a, b) => b[1] - a[1])

  const visible = items.filter(i => category === 'All' || i.category === category)

  const toggleCart = (id: string) => setItems(prev => prev.map(i => i.id === id ? { ...i, in_cart: !i.in_cart } : i))
  const setQty = (id: string, delta: number) => setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="AI Shopper"
        subtitle="Titan watches your jobs, inventory signals, and growth — then builds one cart across every vendor"
        actions={
          <button
            onClick={() => setShowCart(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-semibold rounded transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Universal Cart · {cart.length} · {formatCurrency(cartTotal)}
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Recommendations" value={items.length} format="number" />
          <StatCard title="Restock Now" value={restockNow.length} format="number" warning={restockNow.length > 0} />
          <StatCard title="Cart Items" value={cart.length} format="number" />
          <StatCard title="Cart Total" value={cartTotal} format="currency" highlight />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-sm text-gray-400 leading-relaxed">
            <span className="text-white font-medium">Why these recommendations: </span>
            Rekey volume is up 34% (restock pins and blanks), smart lock installs are your #2 revenue line (stock units before the 3 booked installs),
            HVAC tune-ups are growing (filters and capacitors), and cash-pending is elevated (card readers reduce cash handling).
            Vendor integrations (Amazon Business, Home Depot, Grainger, ULINE, supply houses) coming — for now this is your approved purchasing worksheet.
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 text-xs rounded border transition-colors ${category === c ? 'bg-gray-800 text-white border-gray-700' : 'text-gray-500 border-gray-800 hover:text-gray-300'}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {visible.map(item => (
            <div key={item.id} className={`bg-gray-900 border rounded-lg p-4 flex flex-col ${item.in_cart ? 'border-amber-500/40' : 'border-gray-800'}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded border ${URGENCY_STYLES[item.urgency]}`}>{item.urgency}</span>
                <span className="text-xs text-gray-600">{item.vendor}</span>
              </div>
              <div className="text-sm font-semibold text-white mb-1">{item.name}</div>
              <div className="text-xs text-gray-500 leading-relaxed flex-1 mb-3">{item.reason}</div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                <div className="text-sm font-semibold text-white tabular-nums">{formatCurrency(item.price)}<span className="text-xs text-gray-600 font-normal"> / {item.unit}</span></div>
                <button
                  onClick={() => toggleCart(item.id)}
                  className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                    item.in_cart
                      ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
                      : 'bg-amber-500 text-gray-950 hover:bg-amber-400 font-semibold'
                  }`}
                >
                  {item.in_cart ? 'In Cart ✓' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Universal Cart drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowCart(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full max-w-md bg-gray-950 border-l border-gray-800 h-full flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-white flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-amber-400" />Universal Cart</div>
                <div className="text-xs text-gray-500 mt-0.5">{cart.length} items across {vendors.length} vendors</div>
              </div>
              <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-white text-sm">Close</button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-800">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-600">
                  <PackageCheck className="w-8 h-8 mb-2" />
                  <div>Cart is empty</div>
                </div>
              ) : cart.map(item => (
                <div key={item.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium truncate">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.vendor}</div>
                    </div>
                    <button onClick={() => toggleCart(item.id)} className="text-gray-600 hover:text-red-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQty(item.id, -1)} className="w-6 h-6 rounded bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                      <span className="text-sm text-white tabular-nums w-6 text-center">{item.qty}</span>
                      <button onClick={() => setQty(item.id, 1)} className="w-6 h-6 rounded bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                    </div>
                    <div className="text-sm font-semibold text-white tabular-nums">{formatCurrency(item.price * item.qty)}</div>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-800 px-5 py-4 space-y-3">
                <div className="space-y-1">
                  {vendors.map(([vendor, total]) => (
                    <div key={vendor} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{vendor}</span>
                      <span className="text-gray-300 tabular-nums">{formatCurrency(total)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                  <span className="text-sm text-gray-400">Total</span>
                  <span className="text-lg font-bold text-white tabular-nums">{formatCurrency(cartTotal)}</span>
                </div>
                <button className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 text-sm font-semibold rounded transition-colors">
                  Approve Purchase Plan
                </button>
                <div className="text-[10px] text-gray-600 text-center">Checkout integrations (Amazon Business, Home Depot, Grainger) coming soon</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
