'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Play, Pause } from 'lucide-react'

const SENTIMENT_BADGE: Record<string, string> = {
  positive: 'bg-green-100 text-green-700',
  neutral: 'bg-yellow-100 text-yellow-700',
  negative: 'bg-red-100 text-red-700',
}

const STATUS_BADGE: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  in_progress: 'bg-blue-100 text-blue-700',
  failed: 'bg-red-100 text-red-700',
  no_answer: 'bg-gray-100 text-gray-600',
  queued: 'bg-yellow-100 text-yellow-700',
}

const ACTION_LABELS: Record<string, string> = {
  escalate: 'Escalate',
  send_guide: 'Send Guide',
  request_review: 'Request Review',
  repurchase_remind: 'Repurchase Remind',
  cross_sell: 'Cross-Sell',
  churn_intervention: 'Churn Intervention',
}

interface TranscriptTurn {
  speaker: string
  text: string
  timestamp?: number
}

interface CallRecord {
  id: string
  contact_name?: string
  contact_phone?: string
  status: string
  duration_seconds?: number
  sentiment?: string
  satisfaction_score?: number
  recommended_action?: string
  issues_detected?: string[]
  transcript?: TranscriptTurn[]
  recording_url?: string
  skin_type?: string
  outcome?: string
  claude_enrichment?: {
    soft_signals?: string[]
    contextual_notes?: string
    action_rationale?: string
  }
  created_at: string
}

export default function CallsTable({ calls }: { calls: Record<string, unknown>[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [playing, setPlaying] = useState<string | null>(null)

  const filtered = filter === 'all' ? calls : calls.filter(c => c.status === filter)

  const formatDuration = (secs?: number) => {
    if (!secs) return '—'
    return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['all', 'completed', 'in_progress', 'failed', 'no_answer'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-rose-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f === 'all' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="w-8" />
              <th className="px-4 py-3 text-left font-medium text-gray-600">Contact</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Duration</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Sentiment</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Score</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Action</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Skin Type</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((call) => {
              const c = call as unknown as CallRecord
              const isExpanded = expanded === c.id
              return (
                <>
                  <tr
                    key={c.id}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpanded(isExpanded ? null : c.id)}
                  >
                    <td className="pl-4 py-3 text-gray-400">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{c.contact_name || 'Unknown'}</p>
                      <p className="text-gray-400 text-xs">{c.contact_phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[c.status] || 'bg-gray-100 text-gray-600'}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDuration(c.duration_seconds)}</td>
                    <td className="px-4 py-3">
                      {c.sentiment && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SENTIMENT_BADGE[c.sentiment]}`}>
                          {c.sentiment}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.satisfaction_score ? (
                        <span className="font-medium text-gray-800">{c.satisfaction_score.toFixed(1)}/5</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {c.recommended_action ? (
                        <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                          {ACTION_LABELS[c.recommended_action] || c.recommended_action}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{c.skin_type || '—'}</td>
                  </tr>

                  {isExpanded && (
                    <tr key={`${c.id}-expanded`} className="bg-gray-50 border-b border-gray-200">
                      <td colSpan={8} className="px-8 py-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Transcript */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Transcript</h4>
                            {c.transcript && c.transcript.length > 0 ? (
                              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                {c.transcript.map((turn, i) => (
                                  <div key={i} className={`flex gap-2 ${turn.speaker === 'agent' ? '' : 'flex-row-reverse'}`}>
                                    <span className={`text-xs px-1 py-0.5 rounded shrink-0 font-medium ${turn.speaker === 'agent' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'}`}>
                                      {turn.speaker === 'agent' ? 'Ava' : 'Customer'}
                                    </span>
                                    <p className="text-sm text-gray-700 leading-relaxed">{turn.text}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">No transcript available</p>
                            )}

                            {c.recording_url && (
                              <div className="mt-3 flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setPlaying(playing === c.id ? null : c.id) }}
                                  className="p-1.5 bg-rose-500 text-white rounded-full"
                                >
                                  {playing === c.id ? <Pause size={12} /> : <Play size={12} />}
                                </button>
                                <span className="text-xs text-gray-500">Recording available</span>
                                <span className="text-xs text-gray-400 ml-auto">{formatDuration(c.duration_seconds)}</span>
                              </div>
                            )}
                          </div>

                          {/* Extracted fields */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Extracted Data</h4>
                              <dl className="space-y-1 text-sm">
                                {[
                                  ['Outcome', c.outcome],
                                  ['Issues', c.issues_detected?.join(', ')],
                                  ['Repurchase', c.satisfaction_score ? (c.satisfaction_score >= 4 ? 'Likely' : 'Unlikely') : '—'],
                                ].map(([label, val]) => val ? (
                                  <div key={label as string} className="flex gap-2">
                                    <dt className="text-gray-500 w-20 shrink-0">{label}</dt>
                                    <dd className="text-gray-800 capitalize">{val as string}</dd>
                                  </div>
                                ) : null)}
                              </dl>
                            </div>

                            {c.claude_enrichment && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Claude Enrichment</h4>
                                {c.claude_enrichment.contextual_notes && (
                                  <p className="text-sm text-gray-700 mb-2 italic">&quot;{c.claude_enrichment.contextual_notes}&quot;</p>
                                )}
                                {c.claude_enrichment.soft_signals && c.claude_enrichment.soft_signals.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {c.claude_enrichment.soft_signals.map(s => (
                                      <span key={s} className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full border border-purple-100">{s}</span>
                                    ))}
                                  </div>
                                )}
                                {c.claude_enrichment.action_rationale && (
                                  <p className="text-xs text-gray-500 mt-2">Action rationale: {c.claude_enrichment.action_rationale}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            No calls {filter !== 'all' ? `with status "${filter}"` : ''}
          </div>
        )}
      </div>
    </div>
  )
}
