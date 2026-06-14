'use client'

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts'

const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#22c55e',
  neutral: '#f59e0b',
  negative: '#ef4444',
}

const ACTION_LABELS: Record<string, string> = {
  escalate: 'Escalate to Support',
  send_guide: 'Send Usage Guide',
  request_review: 'Request Review',
  repurchase_remind: 'Repurchase Reminder',
  cross_sell: 'Cross-Sell Opportunity',
  churn_intervention: 'Churn Intervention',
}

interface Props {
  campaign: Record<string, unknown>
  calls: Record<string, unknown>[]
  intelligence: Record<string, unknown>[]
}

export default function AnalyticsDashboard({ campaign, calls, intelligence }: Props) {
  const total = campaign.total_contacts as number || 0
  const completed = calls.length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  const positive = calls.filter(c => c.sentiment === 'positive').length
  const negative = calls.filter(c => c.sentiment === 'negative').length
  const neutral = calls.filter(c => c.sentiment === 'neutral').length

  const repurchaseCount = calls.filter(c => c.repurchase_intent).length
  const npsScores = intelligence.map(r => r.nps_score as number).filter(Boolean)
  const npsAvg = npsScores.length ? npsScores.reduce((a, b) => a + b, 0) / npsScores.length : 0

  const issueCount = calls.filter(c => (c.issues_detected as string[] || []).length > 0).length
  const issueRate = completed > 0 ? Math.round((issueCount / completed) * 100) : 0

  // Satisfaction radar
  const avg = (key: string) => {
    const vals = intelligence.map(r => r[key] as number).filter(Boolean)
    return vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 0
  }

  const radarData = [
    { dimension: 'Efficacy', value: avg('satisfaction_efficacy') * 20 },
    { dimension: 'Texture', value: avg('satisfaction_texture') * 20 },
    { dimension: 'Scent', value: avg('satisfaction_scent') * 20 },
    { dimension: 'Packaging', value: avg('satisfaction_packaging') * 20 },
    { dimension: 'Value', value: avg('satisfaction_value') * 20 },
  ]

  // Sentiment distribution
  const sentimentData = [
    { name: 'Positive', value: positive, color: '#22c55e' },
    { name: 'Neutral', value: neutral, color: '#f59e0b' },
    { name: 'Negative', value: negative, color: '#ef4444' },
  ].filter(d => d.value > 0)

  // Segment breakdown (skin type)
  const segmentCounts: Record<string, number> = {}
  calls.forEach(c => {
    const st = c.skin_type as string
    if (st) segmentCounts[st] = (segmentCounts[st] || 0) + 1
  })
  const segmentData = Object.entries(segmentCounts).map(([name, value]) => ({ name, value }))

  // Top issues
  const issueCounts: Record<string, number> = {}
  calls.forEach(c => {
    const issues = c.issues_detected as string[] || []
    issues.forEach(i => { issueCounts[i] = (issueCounts[i] || 0) + 1 })
  })
  const topIssues = Object.entries(issueCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Action distribution
  const actionCounts: Record<string, number> = {}
  calls.forEach(c => {
    const a = c.recommended_action as string
    if (a) actionCounts[a] = (actionCounts[a] || 0) + 1
  })

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Completion Rate', value: `${completionRate}%`, sub: `${completed}/${total} calls` },
          { label: 'NPS Average', value: npsAvg.toFixed(1), sub: `${npsScores.length} responses` },
          { label: 'Issue Detection', value: `${issueRate}%`, sub: `${issueCount} calls flagged` },
          { label: 'Repurchase Intent', value: `${completed > 0 ? Math.round(repurchaseCount / completed * 100) : 0}%`, sub: `${repurchaseCount} confirmed` },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Estimated impact */}
      {issueRate > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-medium text-amber-800">
            Business Impact Estimate: {issueRate}% of buyers reported usage confusion —
            estimated {Math.round(issueRate * 0.4)}–{Math.round(issueRate * 0.55)}% reduction in silent churn
            if addressed via guided outreach.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Radar chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Satisfaction Radar (5 Dimensions)</h3>
          {radarData.every(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="value" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState label="Call data pending" />
          )}
        </div>

        {/* Sentiment pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Sentiment Distribution</h3>
          {sentimentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={sentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {sentimentData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState label="Call data pending" />
          )}
        </div>

        {/* Segment breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Customer Segment Distribution</h3>
          {segmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={segmentData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState label="Call data pending" />
          )}
        </div>

        {/* Top issues */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Issues Detected</h3>
          {topIssues.length > 0 ? (
            <div className="space-y-3">
              {topIssues.map(([issue, count]) => (
                <div key={issue} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{issue}</p>
                    <div className="h-2 bg-gray-100 rounded-full mt-1">
                      <div
                        className="h-2 bg-rose-400 rounded-full"
                        style={{ width: `${Math.round(count / completed * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 w-10 text-right">{Math.round(count / completed * 100)}%</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState label="No issues detected" />
          )}
        </div>
      </div>

      {/* Education gaps */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Education Gaps</h3>
        {calls.some(c => (c.education_gaps as string[] || []).length > 0) ? (
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(calls.flatMap(c => c.education_gaps as string[] || []))).map(gap => (
              <span key={gap} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-100">
                {gap}
              </span>
            ))}
          </div>
        ) : (
          <EmptyState label="No education gaps detected" />
        )}
      </div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
      {label}
    </div>
  )
}
