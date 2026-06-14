'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Mic, Save, RefreshCw, ChevronDown, ChevronRight,
  CheckCircle, AlertCircle, Loader2, Eye, Edit3, Upload
} from 'lucide-react'
import {
  AVA_PERSONA,
  AVA_INTRODUCTION,
  CATEGORY_QUESTIONS,
  AVA_SATISFACTION_PROBE,
  AVA_ISSUES_PROBE,
  AVA_REPURCHASE_PROBE,
  AVA_NPS,
  AVA_CLOSING,
  AVA_OBJECTION_SCRIPTS,
  AVA_CUSTOM_ANALYSIS_SCHEMA,
  AVA_CONTEXT_MEMORY_INSTRUCTIONS,
  buildAvaPrompt,
  getCategoryKey,
} from '@/lib/agent-config'

const SECTIONS = [
  { key: 'persona', label: 'Persona & Role', content: AVA_PERSONA, editable: true },
  { key: 'context_memory', label: 'Context Memory Rule', content: AVA_CONTEXT_MEMORY_INSTRUCTIONS, editable: false },
  { key: 'introduction', label: 'Introduction Script', content: AVA_INTRODUCTION, editable: true },
  { key: 'satisfaction_probe', label: 'Satisfaction Rating Probe', content: AVA_SATISFACTION_PROBE, editable: true },
  { key: 'issues_probe', label: 'Issues & Adverse Reactions', content: AVA_ISSUES_PROBE, editable: true },
  { key: 'repurchase_probe', label: 'Repurchase Intent', content: AVA_REPURCHASE_PROBE, editable: true },
  { key: 'nps', label: 'NPS Score', content: AVA_NPS, editable: true },
  { key: 'closing', label: 'Closing Script', content: AVA_CLOSING, editable: true },
]

const CATEGORIES = Object.keys(CATEGORY_QUESTIONS)
const VOICES = ['en-IN-female', 'en-IN-male', 'en-US-female', 'en-US-male', 'en-GB-female']

export default function AgentPage() {
  const [selectedCategory, setSelectedCategory] = useState('serum')
  const [expanded, setExpanded] = useState<string | null>('persona')
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [fullPrompt, setFullPrompt] = useState('')
  const [voice, setVoice] = useState('en-IN-female')
  const [maxDuration, setMaxDuration] = useState(300)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [saveError, setSaveError] = useState('')
  const [ringgAgent, setRinggAgent] = useState<Record<string, unknown> | null>(null)
  const [loadingAgent, setLoadingAgent] = useState(true)

  // Load current agent from Ringg.ai
  useEffect(() => {
    fetch('/api/agent')
      .then(r => r.json())
      .then(data => {
        setRinggAgent(data.agent)
        if (data.agent?.voice) setVoice(data.agent.voice)
        if (data.agent?.max_duration_seconds) setMaxDuration(data.agent.max_duration_seconds)
      })
      .catch(() => {})
      .finally(() => setLoadingAgent(false))
  }, [])

  const buildPreview = useCallback(() => {
    const assembled = buildAvaPrompt({ category: selectedCategory })
    // Apply any local edits
    let result = assembled
    Object.entries(edits).forEach(([key, val]) => {
      const section = SECTIONS.find(s => s.key === key)
      if (section) result = result.replace(section.content, val)
    })
    setFullPrompt(result)
  }, [selectedCategory, edits])

  useEffect(() => {
    if (previewMode) buildPreview()
  }, [previewMode, buildPreview])

  const getContent = (key: string, defaultContent: string) => edits[key] ?? defaultContent

  const pushToRingg = async () => {
    setSaving(true)
    setSaveStatus('idle')
    setSaveError('')
    buildPreview()

    try {
      const res = await fetch('/api/agent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_prompt: fullPrompt || buildAvaPrompt({ category: selectedCategory }),
          voice,
          max_duration_seconds: maxDuration,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Push failed')
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (err) {
      setSaveError((err as Error).message)
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/brand/campaigns" className="text-xl font-bold text-rose-500">MORA</Link>
            <span className="text-gray-400">/</span>
            <div className="flex items-center gap-2">
              <Mic size={16} className="text-rose-500" />
              <span className="font-semibold text-gray-800">Ava — Voice Agent</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setPreviewMode(!previewMode); if (!previewMode) buildPreview() }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                previewMode ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Eye size={14} />
              {previewMode ? 'Back to Edit' : 'Preview Full Prompt'}
            </button>

            <button
              onClick={pushToRingg}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 disabled:opacity-60 transition-colors"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {saving ? 'Pushing…' : 'Push to Ringg.ai'}
            </button>

            {saveStatus === 'success' && (
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <CheckCircle size={14} /> Pushed!
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="flex items-center gap-1 text-red-600 text-sm font-medium" title={saveError}>
                <AlertCircle size={14} /> Failed
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Status bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <p className="text-xs text-gray-500">Agent ID</p>
              <p className="text-sm font-mono text-gray-700">{process.env.NEXT_PUBLIC_RINGG_AGENT_ID || '9b203433-...'}</p>
            </div>
            {loadingAgent ? (
              <div className="flex items-center gap-1 text-gray-400 text-sm"><Loader2 size={12} className="animate-spin" /> Loading Ringg.ai state…</div>
            ) : ringgAgent ? (
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <CheckCircle size={14} /> Connected to Ringg.ai
              </div>
            ) : (
              <div className="flex items-center gap-1 text-yellow-600 text-sm font-medium">
                <AlertCircle size={14} /> Using local config (Ringg.ai unreachable)
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Voice</label>
              <select
                value={voice}
                onChange={e => setVoice(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-rose-200"
              >
                {VOICES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Max Duration</label>
              <select
                value={maxDuration}
                onChange={e => setMaxDuration(Number(e.target.value))}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-rose-200"
              >
                <option value={180}>3 min</option>
                <option value={240}>4 min</option>
                <option value={300}>5 min</option>
                <option value={420}>7 min</option>
                <option value={600}>10 min</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category selector */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Preview by Product Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
                  selectedCategory === cat
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-rose-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            The category-specific questions section changes based on product type. All other sections are shared.
          </p>
        </div>

        {previewMode ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Full Assembled Prompt — {selectedCategory}</h2>
              <button
                onClick={() => { navigator.clipboard.writeText(fullPrompt) }}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded hover:bg-gray-50"
              >
                Copy
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed max-h-[70vh] overflow-y-auto">
              {fullPrompt}
            </pre>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Fixed sections */}
            {SECTIONS.map(section => (
              <div key={section.key} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === section.key ? null : section.key)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expanded === section.key ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                    <span className="font-medium text-gray-800">{section.label}</span>
                    {edits[section.key] && (
                      <span className="text-xs text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">edited</span>
                    )}
                  </div>
                  {section.editable && expanded === section.key && (
                    <button
                      onClick={e => { e.stopPropagation(); setEditingKey(editingKey === section.key ? null : section.key) }}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-rose-500 transition-colors px-2 py-1 border border-gray-200 rounded"
                    >
                      <Edit3 size={12} />
                      {editingKey === section.key ? 'Done' : 'Edit'}
                    </button>
                  )}
                </button>

                {expanded === section.key && (
                  <div className="border-t border-gray-100 px-5 py-4">
                    {editingKey === section.key ? (
                      <textarea
                        value={getContent(section.key, section.content)}
                        onChange={e => setEdits(prev => ({ ...prev, [section.key]: e.target.value }))}
                        className="w-full text-sm font-mono text-gray-700 leading-relaxed border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-rose-200 min-h-[200px] resize-y"
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">
                        {getContent(section.key, section.content)}
                      </pre>
                    )}
                    {edits[section.key] && (
                      <button
                        onClick={() => setEdits(prev => { const next = { ...prev }; delete next[section.key]; return next })}
                        className="mt-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
                      >
                        Reset to default
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Category-specific questions */}
            <div className="bg-white rounded-xl border border-rose-200 overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === 'category_questions' ? null : 'category_questions')}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-rose-50/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expanded === 'category_questions' ? <ChevronDown size={16} className="text-rose-400" /> : <ChevronRight size={16} className="text-rose-400" />}
                  <span className="font-medium text-gray-800">
                    Category Questions — <span className="text-rose-500 capitalize">{selectedCategory}</span>
                  </span>
                  <span className="text-xs text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">changes by category</span>
                </div>
                {expanded === 'category_questions' && (
                  <button
                    onClick={e => { e.stopPropagation(); setEditingKey(editingKey === 'category_questions' ? null : 'category_questions') }}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-rose-500 px-2 py-1 border border-gray-200 rounded"
                  >
                    <Edit3 size={12} />
                    {editingKey === 'category_questions' ? 'Done' : 'Edit'}
                  </button>
                )}
              </button>

              {expanded === 'category_questions' && (
                <div className="border-t border-rose-100 px-5 py-4 bg-rose-50/20">
                  {editingKey === 'category_questions' ? (
                    <textarea
                      value={edits[`cat_${selectedCategory}`] ?? CATEGORY_QUESTIONS[getCategoryKey(selectedCategory)] ?? CATEGORY_QUESTIONS.default}
                      onChange={e => setEdits(prev => ({ ...prev, [`cat_${selectedCategory}`]: e.target.value }))}
                      className="w-full text-sm font-mono text-gray-700 leading-relaxed border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-rose-200 min-h-[240px] resize-y"
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">
                      {edits[`cat_${selectedCategory}`] ?? CATEGORY_QUESTIONS[getCategoryKey(selectedCategory)] ?? CATEGORY_QUESTIONS.default}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Objection handling */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === 'objections' ? null : 'objections')}
                className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
              >
                {expanded === 'objections' ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                <span className="font-medium text-gray-800">Objection Handling Scripts</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{Object.keys(AVA_OBJECTION_SCRIPTS).length} scenarios</span>
              </button>

              {expanded === 'objections' && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {Object.entries(AVA_OBJECTION_SCRIPTS).map(([key, script]) => (
                    <div key={key} className="px-5 py-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 capitalize">{key.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-gray-700 leading-relaxed italic">&ldquo;{script}&rdquo;</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom analysis schema */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === 'schema' ? null : 'schema')}
                className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
              >
                {expanded === 'schema' ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                <span className="font-medium text-gray-800">Custom Analysis Schema</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">structured output</span>
              </button>

              {expanded === 'schema' && (
                <div className="border-t border-gray-100 px-5 py-4">
                  <p className="text-xs text-gray-500 mb-3">Ringg.ai extracts these fields from every call. Your webhook receives them as <code className="bg-gray-100 px-1 rounded">custom_analysis</code>.</p>
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed bg-gray-50 rounded-lg p-4 overflow-x-auto">
                    {AVA_CUSTOM_ANALYSIS_SCHEMA}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
