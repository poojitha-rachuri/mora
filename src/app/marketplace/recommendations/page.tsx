'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Sparkles, ArrowRight } from 'lucide-react'

const SKIN_TYPES = ['oily', 'dry', 'combination', 'sensitive', 'normal']
const HAIR_TYPES = ['straight', 'wavy', 'curly', 'coily', 'fine', 'thick']
const CONCERNS = ['acne', 'dullness', 'dark spots', 'dryness', 'oiliness', 'anti-aging', 'pores', 'sensitivity', 'dandruff', 'hair fall']
const BUDGETS = ['Under ₹300', '₹300–600', '₹600–1000', 'Above ₹1000']
const ROUTINES = ['minimal (2-3 steps)', 'moderate (4-6 steps)', 'extensive (7+ steps)']

interface Recommendation {
  product_name: string
  brand_name: string
  match_score: number
  why_this_fits: string
  caveat?: string
  product_id?: string
  voice_trust_score?: number
  verified_call_count?: number
}

export default function RecommendationsPage() {
  const [profile, setProfile] = useState({
    skin_type: '',
    hair_type: '',
    concerns: [] as string[],
    budget: '',
    routine_complexity: '',
  })
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const toggleConcern = (c: string) => {
    setProfile(p => ({
      ...p,
      concerns: p.concerns.includes(c) ? p.concerns.filter(x => x !== c) : [...p.concerns, c],
    }))
  }

  const getRecommendations = async () => {
    if (!profile.skin_type) { setError('Please select your skin type'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      if (!res.ok) throw new Error('Failed to get recommendations')
      const data = await res.json()
      setRecommendations(data.recommendations || [])
      setDone(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-rose-500">TrueGlow</Link>
          <p className="text-sm text-gray-500 hidden md:block">Powered by voice data from real buyers</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {!done ? (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Find Your Perfect Match</h1>
              <p className="text-gray-500 mt-1">We&apos;ll match you with products that real buyers with your profile loved — backed by voice conversations, not star ratings.</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
            )}

            {/* Skin type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Skin Type *</label>
              <div className="flex flex-wrap gap-2">
                {SKIN_TYPES.map(s => (
                  <button
                    key={s}
                    onClick={() => setProfile(p => ({ ...p, skin_type: s }))}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-colors capitalize ${
                      profile.skin_type === s ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-gray-200 bg-white text-gray-600 hover:border-rose-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Hair type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Hair Type</label>
              <div className="flex flex-wrap gap-2">
                {HAIR_TYPES.map(h => (
                  <button
                    key={h}
                    onClick={() => setProfile(p => ({ ...p, hair_type: p.hair_type === h ? '' : h }))}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-colors capitalize ${
                      profile.hair_type === h ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-gray-200 bg-white text-gray-600 hover:border-rose-200'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Concerns */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Skin/Hair Concerns (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {CONCERNS.map(c => (
                  <button
                    key={c}
                    onClick={() => toggleConcern(c)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-colors capitalize ${
                      profile.concerns.includes(c) ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-gray-200 bg-white text-gray-600 hover:border-rose-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Budget</label>
              <div className="flex flex-wrap gap-2">
                {BUDGETS.map(b => (
                  <button
                    key={b}
                    onClick={() => setProfile(p => ({ ...p, budget: p.budget === b ? '' : b }))}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-colors ${
                      profile.budget === b ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-gray-200 bg-white text-gray-600 hover:border-rose-200'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Routine complexity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Routine Complexity</label>
              <div className="flex flex-wrap gap-2">
                {ROUTINES.map(r => (
                  <button
                    key={r}
                    onClick={() => setProfile(p => ({ ...p, routine_complexity: p.routine_complexity === r ? '' : r }))}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-colors capitalize ${
                      profile.routine_complexity === r ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-gray-200 bg-white text-gray-600 hover:border-rose-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={getRecommendations}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? 'Finding matches…' : 'Get My Recommendations'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Personalized Matches</h1>
                <p className="text-gray-500">Based on voice data from real buyers with {profile.skin_type} skin</p>
              </div>
              <button onClick={() => setDone(false)} className="text-sm text-rose-500 hover:underline">
                Update profile
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {recommendations.map((rec, i) => (
                <div key={i} className={`bg-white rounded-2xl border-2 p-6 ${i === 0 ? 'border-rose-300' : 'border-gray-200'}`}>
                  {i === 0 && (
                    <div className="flex items-center gap-1 text-rose-500 text-sm font-medium mb-3">
                      <Sparkles size={14} />
                      Best Match
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{rec.product_name}</h3>
                      <div className="flex items-center gap-3 mt-1 mb-3">
                        <span className="text-sm font-bold text-rose-500">{rec.match_score}% match</span>
                        {rec.voice_trust_score && (
                          <span className="text-xs text-gray-500">
                            Voice Trust: <strong>{rec.voice_trust_score}</strong>/100 ({rec.verified_call_count} calls)
                          </span>
                        )}
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full mb-4 max-w-xs">
                        <div className="h-1.5 bg-rose-400 rounded-full" style={{ width: `${rec.match_score}%` }} />
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm mb-3">
                        <span className="font-medium">Why this fits you: </span>{rec.why_this_fits}
                      </p>
                      {rec.caveat && (
                        <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                          Note: {rec.caveat}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link
                      href={`/marketplace/products/${rec.product_name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || rec.product_id}`}
                      className="flex items-center gap-1 text-sm text-rose-500 font-medium hover:underline"
                    >
                      View full voice intelligence <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}

              {recommendations.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  No products with sufficient voice data for your profile yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
