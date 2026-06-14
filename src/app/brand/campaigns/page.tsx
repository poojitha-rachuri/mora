'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, BarChart2, Phone, Zap, Mic } from 'lucide-react'

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  draft: 'bg-yellow-100 text-yellow-700',
  paused: 'bg-orange-100 text-orange-700',
}

interface Campaign {
  id: string
  name: string
  product_name: string
  brand_name: string
  status: string
  total_contacts: number
  calls_completed: number
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    fetch('/api/campaigns')
      .then(r => r.json())
      .then(d => setCampaigns(d.campaigns || []))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-rose-500">TrueGlow</span>
          <div className="flex gap-3">
            <Link href="/brand/agent"
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Mic size={14} /> Ava Agent
            </Link>
            <Link href="/marketplace/products/minimalist-niacinamide"
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              View Marketplace
            </Link>
            <Link href="/brand/campaigns/new"
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium">
              <Plus size={14} /> New Campaign
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Brand Dashboard</h1>
          <p className="text-gray-500">Voice feedback campaigns and analytics</p>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <Phone className="mx-auto mb-4 text-gray-300" size={48} />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No campaigns yet</h3>
            <p className="text-gray-400 mb-6">Upload a buyer CSV to launch your first voice feedback campaign</p>
            <Link href="/brand/campaigns/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors">
              <Plus size={16} /> Launch First Campaign
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {campaigns.map(c => {
              const completionRate = c.total_contacts > 0 ? Math.round((c.calls_completed / c.total_contacts) * 100) : 0
              return (
                <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-rose-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">{c.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[c.status] || 'bg-gray-100 text-gray-600'}`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{c.product_name} · {c.brand_name}</p>
                      <div className="flex items-center gap-6 mt-3">
                        <div><p className="text-xs text-gray-400">Completion</p><p className="font-semibold text-gray-800">{completionRate}%</p></div>
                        <div><p className="text-xs text-gray-400">Calls</p><p className="font-semibold text-gray-800">{c.calls_completed}/{c.total_contacts}</p></div>
                        <div className="flex-1 max-w-xs">
                          <div className="h-1.5 bg-gray-100 rounded-full">
                            <div className="h-1.5 bg-rose-400 rounded-full" style={{ width: `${completionRate}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link href={`/brand/campaigns/${c.id}/analytics`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <BarChart2 size={14} /> Analytics
                      </Link>
                      <Link href={`/brand/campaigns/${c.id}/calls`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Phone size={14} /> Calls
                      </Link>
                      <Link href={`/brand/campaigns/${c.id}/actions`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Zap size={14} /> Actions
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
