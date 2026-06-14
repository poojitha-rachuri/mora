'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import ProductRadar from './ProductRadar'

interface MarketplaceProduct {
  id: string
  product_name: string
  brand_name: string
  product_category: string
  description?: string
  price_inr?: number
  voice_trust_score: number
  verified_call_count: number
  avg_satisfaction_efficacy?: number
  avg_satisfaction_texture?: number
  avg_satisfaction_scent?: number
  avg_satisfaction_packaging?: number
  avg_satisfaction_value?: number
  repurchase_rate?: number
  nps_average?: number
  works_best_for: Array<{ profile: string; reason: string; match_pct: number }>
  may_not_suit: Array<{ profile: string; reason: string }>
  insight_statements: Array<{ text: string; stat: string; category: string }>
  common_qa: Array<{ question: string; answer: string; frequency: number }>
  top_issues: Array<{ issue: string; frequency: number; severity: string }>
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<MarketplaceProduct | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/marketplace/products/${id}`)
      .then(r => r.json())
      .then(d => setProduct(d.product))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>
  if (!product) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Product not found. <Link href="/brand/campaigns/new" className="ml-2 text-rose-500 hover:underline">Seed data first →</Link></div>

  const trustColor = product.voice_trust_score >= 80 ? 'text-green-600' : product.voice_trust_score >= 60 ? 'text-yellow-600' : 'text-red-500'
  const trustBg = product.voice_trust_score >= 80 ? 'bg-green-50 border-green-200' : product.voice_trust_score >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'

  const radarData = [
    { dim: 'Efficacy', value: (product.avg_satisfaction_efficacy || 0) * 20 },
    { dim: 'Texture', value: (product.avg_satisfaction_texture || 0) * 20 },
    { dim: 'Scent', value: (product.avg_satisfaction_scent || 0) * 20 },
    { dim: 'Packaging', value: (product.avg_satisfaction_packaging || 0) * 20 },
    { dim: 'Value', value: (product.avg_satisfaction_value || 0) * 20 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-rose-500">TrueGlow</Link>
          <Link href="/marketplace/recommendations" className="text-sm text-gray-500 hover:text-rose-500 transition-colors">
            Get Recommendations →
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Product header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center shrink-0">
              <span className="text-4xl">✨</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-rose-500 font-medium mb-1">{product.brand_name}</p>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.product_name}</h1>
              <p className="text-gray-500 mb-4">{product.description || `${product.product_category} by ${product.brand_name}`}</p>
              <div className="flex flex-wrap items-center gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${trustBg}`}>
                  <span className={`text-2xl font-bold ${trustColor}`}>{product.voice_trust_score}</span>
                  <div>
                    <p className={`text-sm font-semibold ${trustColor}`}>Voice Trust Score™</p>
                    <p className="text-xs text-gray-500">{product.verified_call_count} verified conversations</p>
                  </div>
                </div>
                {product.price_inr && <p className="text-xl font-semibold text-gray-800">₹{product.price_inr}</p>}
                {product.repurchase_rate && (
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-800">{Math.round(product.repurchase_rate * 100)}%</p>
                    <p className="text-xs text-gray-500">Would repurchase</p>
                  </div>
                )}
                {product.nps_average && (
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-800">{product.nps_average.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">NPS avg</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">5-Dimension Satisfaction</h2>
            <ProductRadar data={radarData} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Works Best For</h2>
            {product.works_best_for?.length > 0 ? (
              <div className="space-y-3">
                {product.works_best_for.map(item => (
                  <div key={item.profile} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <span className="text-green-700 font-bold text-sm">{item.match_pct}%</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 capitalize">{item.profile}</p>
                      <p className="text-xs text-gray-500">{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400 text-sm">Data being aggregated…</p>}
            {product.may_not_suit?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-600 mb-2">May Not Be Ideal For</h3>
                {product.may_not_suit.map(item => (
                  <div key={item.profile} className="flex items-center gap-2 text-sm">
                    <span className="text-red-400">✗</span>
                    <span className="text-gray-600 capitalize">{item.profile}</span>
                    <span className="text-gray-400 text-xs">— {item.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {product.insight_statements?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4">What Real Buyers Said</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {product.insight_statements.map((s, i) => (
                <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl font-bold text-rose-500 shrink-0">{s.stat}</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {product.common_qa?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Questions Answered by Real Buyers</h2>
              <div className="space-y-4">
                {product.common_qa.map((qa, i) => (
                  <div key={i}>
                    <p className="text-sm font-medium text-gray-800 mb-1">Q: {qa.question}</p>
                    <p className="text-sm text-gray-600 pl-3 border-l-2 border-rose-200">{qa.answer}</p>
                    <p className="text-xs text-gray-400 mt-1">{qa.frequency}% of buyers asked this</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.top_issues?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-1">Issue Transparency</h2>
              <p className="text-xs text-gray-400 mb-4">Reported by voice-verified buyers. Brands cannot edit this.</p>
              <div className="space-y-3">
                {product.top_issues.map((issue, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${issue.severity === 'high' ? 'bg-red-400' : issue.severity === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm text-gray-700">{issue.issue}</p>
                        <span className="text-xs text-gray-400">{issue.frequency}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full">
                        <div className={`h-1.5 rounded-full ${issue.severity === 'high' ? 'bg-red-400' : issue.severity === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}`}
                          style={{ width: `${issue.frequency}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {product.repurchase_rate && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4">Repurchase Signal</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Would repurchase</span>
                  <span className="font-semibold">{Math.round(product.repurchase_rate * 100)}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full">
                  <div className="h-3 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full" style={{ width: `${Math.round(product.repurchase_rate * 100)}%` }} />
                </div>
              </div>
              <div className="text-center px-4">
                <p className="text-3xl font-bold text-rose-500">{Math.round(product.repurchase_rate * 100)}%</p>
                <p className="text-xs text-gray-500">voice-verified</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <Link href="/marketplace/recommendations"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors">
            Get personalized recommendations for your skin type →
          </Link>
        </div>
      </div>
    </div>
  )
}