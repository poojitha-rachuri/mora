'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import AnalyticsDashboard from './AnalyticsDashboard'

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [data, setData] = useState<{ campaign: Record<string, unknown>; calls: Record<string, unknown>[]; intelligence: Record<string, unknown>[] } | null>(null)

  useEffect(() => {
    fetch(`/api/campaigns/${id}`)
      .then(r => r.json())
      .then(setData)
  }, [id])

  if (!data) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/brand/campaigns" className="text-xl font-bold text-rose-500">TrueGlow</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 truncate max-w-xs">{data.campaign.name as string}</span>
          </div>
          <nav className="flex gap-2">
            {(['analytics', 'calls', 'actions'] as const).map(tab => (
              <Link key={tab} href={`/brand/campaigns/${id}/${tab}`}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'analytics' ? 'bg-rose-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnalyticsDashboard campaign={data.campaign} calls={data.calls} intelligence={data.intelligence} />
      </div>
    </div>
  )
}