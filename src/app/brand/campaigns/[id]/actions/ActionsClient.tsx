'use client'

import { useState } from 'react'
import { Download, Users, AlertTriangle, BookOpen, Star, RefreshCw, TrendingUp, UserX } from 'lucide-react'

const ACTION_CONFIG: Record<string, { label: string; desc: string; color: string; icon: React.ReactNode; priority: number }> = {
  escalate: {
    label: 'Escalate to Support',
    desc: 'Customers who reported adverse reactions or serious complaints',
    color: 'border-red-200 bg-red-50',
    icon: <AlertTriangle size={16} className="text-red-500" />,
    priority: 1,
  },
  churn_intervention: {
    label: 'Churn Intervention',
    desc: 'At-risk customers showing dissatisfaction signals',
    color: 'border-orange-200 bg-orange-50',
    icon: <UserX size={16} className="text-orange-500" />,
    priority: 2,
  },
  send_guide: {
    label: 'Send Usage Guide',
    desc: 'Customers with usage confusion or education gaps',
    color: 'border-blue-200 bg-blue-50',
    icon: <BookOpen size={16} className="text-blue-500" />,
    priority: 3,
  },
  request_review: {
    label: 'Request Review',
    desc: 'Happy customers with high satisfaction — ideal for social proof',
    color: 'border-green-200 bg-green-50',
    icon: <Star size={16} className="text-green-500" />,
    priority: 4,
  },
  repurchase_remind: {
    label: 'Repurchase Reminder',
    desc: 'Satisfied customers approaching end of product lifecycle',
    color: 'border-purple-200 bg-purple-50',
    icon: <RefreshCw size={16} className="text-purple-500" />,
    priority: 5,
  },
  cross_sell: {
    label: 'Cross-Sell Opportunity',
    desc: 'Satisfied customers who might benefit from complementary products',
    color: 'border-teal-200 bg-teal-50',
    icon: <TrendingUp size={16} className="text-teal-500" />,
    priority: 6,
  },
}

interface CallRecord {
  id: string
  contact_name?: string
  contact_phone?: string
  recommended_action?: string
  sentiment?: string
  satisfaction_score?: number
  skin_type?: string
  outcome?: string
  issues_detected?: string[]
}

export default function ActionsClient({ calls }: { calls: Record<string, unknown>[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const groups: Record<string, CallRecord[]> = {}
  calls.forEach(c => {
    const action = c.recommended_action as string
    if (!action) return
    if (!groups[action]) groups[action] = []
    groups[action].push(c as unknown as CallRecord)
  })

  const sortedGroups = Object.entries(groups).sort(([a], [b]) => {
    return (ACTION_CONFIG[a]?.priority || 99) - (ACTION_CONFIG[b]?.priority || 99)
  })

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const exportCSV = (groupCalls: CallRecord[]) => {
    const targetCalls = groupCalls.filter(c => selected.size === 0 || selected.has(c.id))
    const csv = [
      'name,phone,sentiment,score,issues',
      ...targetCalls.map(c => [
        c.contact_name || '',
        c.contact_phone || '',
        c.sentiment || '',
        c.satisfaction_score || '',
        (c.issues_detected || []).join('; '),
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `action-export.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (sortedGroups.length === 0) {
    return (
      <div className="text-center py-24 text-gray-400">
        <Users className="mx-auto mb-3" size={40} />
        <p>No action recommendations yet — calls are still being processed</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {sortedGroups.map(([action, groupCalls]) => {
        const config = ACTION_CONFIG[action] || { label: action, desc: '', color: 'border-gray-200 bg-gray-50', icon: <Users size={16} />, priority: 99 }

        return (
          <div key={action} className={`rounded-xl border-2 ${config.color} overflow-hidden`}>
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {config.icon}
                <div>
                  <h3 className="font-semibold text-gray-800">{config.label}</h3>
                  <p className="text-sm text-gray-500">{config.desc}</p>
                </div>
                <span className="ml-2 px-2.5 py-0.5 bg-white rounded-full text-sm font-semibold text-gray-700 border border-gray-200">
                  {groupCalls.length}
                </span>
              </div>
              <button
                onClick={() => exportCSV(groupCalls)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download size={14} />
                Export CSV
              </button>
            </div>

            <div className="bg-white border-t border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="w-10 px-4 py-2">
                      <input
                        type="checkbox"
                        onChange={e => {
                          const next = new Set(selected)
                          groupCalls.forEach(c => e.target.checked ? next.add(c.id) : next.delete(c.id))
                          setSelected(next)
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Customer</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Sentiment</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Score</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Skin Type</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Key Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {groupCalls.map(c => (
                    <tr key={c.id} className={`border-b border-gray-50 last:border-0 ${selected.has(c.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <td className="px-4 py-2.5">
                        <input
                          type="checkbox"
                          checked={selected.has(c.id)}
                          onChange={() => toggleSelect(c.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-gray-800">{c.contact_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{c.contact_phone}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          c.sentiment === 'positive' ? 'bg-green-100 text-green-700'
                          : c.sentiment === 'negative' ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {c.sentiment || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-700">
                        {c.satisfaction_score ? `${c.satisfaction_score.toFixed(1)}/5` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 capitalize">{c.skin_type || '—'}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {(c.issues_detected || []).slice(0, 2).map(issue => (
                            <span key={issue} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {issue}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
