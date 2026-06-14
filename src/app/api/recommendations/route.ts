import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateRecommendationReasoning } from '@/lib/openrouter'

export async function POST(req: NextRequest) {
  try {
    const profile = await req.json()
    const { skin_type, hair_type, concerns, budget, routine_complexity } = profile

    const db = createServerClient()

    // Fetch all marketplace products with voice data
    const { data: products, error } = await db
      .from('marketplace_products')
      .select('*')
      .gte('verified_call_count', 1)
      .order('voice_trust_score', { ascending: false })

    if (error) throw new Error(error.message)
    if (!products || products.length === 0) {
      return NextResponse.json({ recommendations: [] })
    }

    // Pre-filter by skin type fit
    const scoredProducts = products.map(p => {
      const worksBest = (p.works_best_for || []) as Array<{ profile: string; match_pct: number }>
      const mayNotSuit = (p.may_not_suit || []) as Array<{ profile: string }>

      const skinMatch = worksBest.find(w => w.profile.toLowerCase().includes(skin_type?.toLowerCase()))
      const skinMismatch = mayNotSuit.find(m => m.profile.toLowerCase().includes(skin_type?.toLowerCase()))

      let baseScore = p.voice_trust_score || 50
      if (skinMatch) baseScore += skinMatch.match_pct * 0.3
      if (skinMismatch) baseScore -= 20

      return { ...p, _score: baseScore }
    })
    .sort((a, b) => b._score - a._score)
    .slice(0, 4)

    // Get Claude reasoning
    const productSummaries = scoredProducts.map(p => ({
      name: p.product_name,
      data: {
        voice_trust_score: p.voice_trust_score,
        verified_calls: p.verified_call_count,
        avg_satisfaction: p.avg_satisfaction_overall,
        repurchase_rate: p.repurchase_rate ? `${Math.round(p.repurchase_rate * 100)}%` : 'N/A',
        works_best_for: p.works_best_for,
        may_not_suit: p.may_not_suit,
        top_benefits: (p.insight_statements || []).slice(0, 3).map((s: Record<string, string>) => s.text),
        top_issues: (p.top_issues || []).slice(0, 3).map((i: Record<string, string>) => i.issue),
      },
    }))

    const recommendations = await generateRecommendationReasoning(
      { skin_type, hair_type, concerns, budget, routine_complexity },
      productSummaries
    )

    // Merge with product metadata
    const enriched = recommendations.map((rec: Record<string, unknown>) => {
      const product = scoredProducts.find(p => p.product_name === rec.product_name)
      return {
        ...rec,
        product_id: product?.id,
        brand_name: product?.brand_name,
        voice_trust_score: product?.voice_trust_score,
        verified_call_count: product?.verified_call_count,
        price_inr: product?.price_inr,
      }
    })

    return NextResponse.json({ recommendations: enriched })
  } catch (err) {
    console.error('Recommendations error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
