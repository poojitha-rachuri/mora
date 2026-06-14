'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import ActionsClient from './ActionsClient'

export default function ActionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [data, setData] = useState<{ campaign: Record<string, unknown>; calls: Record<string, unknown>[] } | null>(null)

  useEffect(() => {
    fetch(`/api/campaigns/${id}`)
      .then(r => r.json())
      .then(d => setData({ ...d, calls: (d.calls || []).filter((c: Record<string, unknown>) => c.recommended_action) }))
  }, [id])

  if (!data) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/brand/campaigns" className="text-xl font-bold text-rose-500">TrueGlow</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{data.campaign.name as string}</span>
          </div>
          <nav className="flex gap-2">
            {(['analytics', 'calls', 'actions'] as const).map(tab => (
              <Link key={tab} href={`/brand/campaigns/${id}/${tab}`}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'actions' ? 'bg-rose-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Action Engine</h1>
          <p className="text-gray-500">Customers grouped by recommended post-call action</p>
        </div>
        <ActionsClient calls={data.calls} />
      </div>
    </div>
  )
}