import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { enrichTranscript } from '@/lib/openrouter'
import { recomputeMarketplaceProduct } from '@/lib/aggregator'

export async function POST(req: NextRequest) {
  // Respond immediately — process async
  const body = await req.json().catch(() => ({}))
  const campaignId = req.nextUrl.searchParams.get('campaign_id')

  // Fire and forget
  processWebhook(body, campaignId).catch(err => {
    console.error('Webhook processing error:', err)
  })

  return NextResponse.json({ received: true }, { status: 200 })
}

async function processWebhook(body: Record<string, unknown>, campaignId: string | null) {
  const db = createServerClient()
  const event = body.event as string
  const callData = (body.call || body.data || body) as Record<string, unknown>
  const ringgCallId = (callData.id || callData.call_id) as string

  console.log('Webhook event:', event, 'call:', ringgCallId, 'campaign:', campaignId)

  if (event === 'call_started') {
    if (!ringgCallId || !campaignId) return

    await db.from('call_records').upsert({
      campaign_id: campaignId,
      ringg_call_id: ringgCallId,
      status: 'in_progress',
      raw_ringg_data: callData,
    }, { onConflict: 'ringg_call_id' })
  }

  if (event === 'call_completed' || event === 'all_processing_completed') {
    if (!ringgCallId && !campaignId) return

    // Extract data from Ringg.ai payload
    const customAnalysis = (callData.custom_analysis || callData.analysis || {}) as Record<string, unknown>
    const transcriptRaw = callData.transcript || callData.messages || []
    const transcript = normalizeTranscript(transcriptRaw as unknown[])
    const recordingUrl = (callData.recording_url || callData.audio_url) as string | undefined
    const durationSeconds = (callData.duration || callData.duration_seconds) as number | undefined

    const sentiment = extractSentiment(customAnalysis, callData)
    const satisfactionScore = extractSatisfactionScore(customAnalysis)
    const skinType = extractField(customAnalysis, ['skin_type', 'skinType', 'skin type'])
    const repurchaseIntent = extractBoolean(customAnalysis, ['repurchase_intent', 'would_repurchase', 'repurchase'])
    const issues = extractArray(customAnalysis, ['issues_detected', 'issues', 'problems'])
    const educationGaps = extractArray(customAnalysis, ['education_gaps', 'knowledge_gaps', 'gaps'])
    const outcome = extractField(customAnalysis, ['outcome', 'call_outcome', 'result'])
    const recommendedAction = deriveAction(sentiment, satisfactionScore, issues, repurchaseIntent)
    const npsScore = extractNPS(customAnalysis)

    const updatePayload: Record<string, unknown> = {
      status: 'completed',
      duration_seconds: durationSeconds,
      recording_url: recordingUrl,
      transcript,
      sentiment,
      satisfaction_score: satisfactionScore,
      skin_type: skinType,
      repurchase_intent: repurchaseIntent,
      issues_detected: issues,
      education_gaps: educationGaps,
      outcome,
      recommended_action: recommendedAction,
      raw_ringg_data: callData,
    }

    // Claude enrichment
    if (transcript.length > 0 && campaignId) {
      try {
        const { data: campaign } = await db.from('campaigns').select('product_name, product_category').eq('id', campaignId).single()
        if (campaign) {
          const enrichment = await enrichTranscript(transcript, campaign.product_name, campaign.product_category)
          updatePayload.claude_enrichment = enrichment
        }
      } catch (e) {
        console.error('Claude enrichment error:', e)
      }
    }

    // Upsert call record
    let callRecordId: string | null = null
    if (ringgCallId) {
      const { data: updated } = await db
        .from('call_records')
        .upsert({ ...updatePayload, ringg_call_id: ringgCallId, campaign_id: campaignId }, { onConflict: 'ringg_call_id' })
        .select('id, campaign_id')
        .single()
      callRecordId = updated?.id || null
      if (updated?.campaign_id) campaignId = updated.campaign_id
    }

    // Sync completed count on campaign
    if (campaignId) {
      const { count } = await db
        .from('call_records')
        .select('id', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)
        .eq('status', 'completed')
      await db.from('campaigns').update({ calls_completed: count || 0 }).eq('id', campaignId)
    }

    // Insert product intelligence
    if (campaignId && callRecordId) {
      const { data: campaign } = await db.from('campaigns').select('product_name').eq('id', campaignId).single()
      if (campaign) {
        await db.from('product_intelligence').upsert({
          campaign_id: campaignId,
          call_record_id: callRecordId,
          product_name: campaign.product_name,
          skin_type: skinType,
          satisfaction_overall: satisfactionScore,
          satisfaction_efficacy: extractDimensionScore(customAnalysis, 'efficacy'),
          satisfaction_texture: extractDimensionScore(customAnalysis, 'texture'),
          satisfaction_scent: extractDimensionScore(customAnalysis, 'scent'),
          satisfaction_packaging: extractDimensionScore(customAnalysis, 'packaging'),
          satisfaction_value: extractDimensionScore(customAnalysis, 'value'),
          repurchase_intent: repurchaseIntent,
          nps_score: npsScore,
          noted_benefits: extractArray(customAnalysis, ['benefits', 'positives', 'noted_benefits']),
          noted_issues: issues,
          education_gaps: educationGaps,
          outcome,
          insight_tags: extractArray(customAnalysis, ['tags', 'insight_tags']),
        }, { onConflict: 'call_record_id' })

        // Recompute marketplace aggregates
        if (event === 'all_processing_completed') {
          await recomputeMarketplaceProduct(campaign.product_name).catch(e => console.error('Aggregation error:', e))
        }
      }
    }
  }
}

function normalizeTranscript(raw: unknown[]): Array<{ speaker: string; text: string }> {
  if (!Array.isArray(raw)) return []
  return raw.map((t) => {
    const turn = t as Record<string, unknown>
    return {
      speaker: (turn.role === 'assistant' || turn.speaker === 'agent' || turn.speaker === 'Ava') ? 'agent' : 'customer',
      text: (turn.content || turn.text || turn.message || '') as string,
    }
  }).filter(t => t.text)
}

function extractSentiment(analysis: Record<string, unknown>, callData: Record<string, unknown>): string {
  const raw = (analysis.sentiment || callData.sentiment || '') as string
  if (/positive|happy|satisfied|great/i.test(raw)) return 'positive'
  if (/negative|unhappy|dissatisfied|bad/i.test(raw)) return 'negative'
  if (raw) return 'neutral'
  return 'neutral'
}

function extractSatisfactionScore(analysis: Record<string, unknown>): number {
  const keys = ['satisfaction_score', 'overall_satisfaction', 'overall_score', 'satisfaction', 'rating']
  for (const key of keys) {
    const val = parseFloat(String(analysis[key] || ''))
    if (!isNaN(val)) return Math.min(5, val > 5 ? val / 2 : val)
  }
  return 3.5
}

function extractDimensionScore(analysis: Record<string, unknown>, dimension: string): number | null {
  const keys = [`${dimension}_score`, `${dimension}_rating`, `satisfaction_${dimension}`, dimension]
  for (const key of keys) {
    const val = parseFloat(String(analysis[key] || ''))
    if (!isNaN(val)) return Math.min(5, val > 5 ? val / 2 : val)
  }
  return null
}

function extractField(analysis: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    if (analysis[key]) return String(analysis[key]).toLowerCase()
  }
  return null
}

function extractBoolean(analysis: Record<string, unknown>, keys: string[]): boolean | null {
  for (const key of keys) {
    const val = analysis[key]
    if (val !== undefined && val !== null) {
      if (typeof val === 'boolean') return val
      if (typeof val === 'string') return /yes|true|likely/i.test(val)
    }
  }
  return null
}

function extractArray(analysis: Record<string, unknown>, keys: string[]): string[] {
  for (const key of keys) {
    const val = analysis[key]
    if (Array.isArray(val)) return val.map(String).filter(Boolean)
    if (typeof val === 'string' && val) return val.split(/[,;]/).map(s => s.trim()).filter(Boolean)
  }
  return []
}

function extractNPS(analysis: Record<string, unknown>): number | null {
  const val = parseFloat(String(analysis.nps_score || analysis.nps || analysis.net_promoter_score || ''))
  return isNaN(val) ? null : Math.min(10, Math.max(0, val))
}

function deriveAction(
  sentiment: string,
  score: number,
  issues: string[],
  repurchase: boolean | null
): string {
  if (issues.some(i => /reaction|rash|allergy|burn/i.test(i))) return 'escalate'
  if (sentiment === 'negative' && score < 2.5) return 'churn_intervention'
  if (issues.length > 0 || sentiment === 'negative') return 'send_guide'
  if (sentiment === 'positive' && score >= 4 && repurchase !== false) return 'request_review'
  if (repurchase === true) return 'repurchase_remind'
  if (sentiment === 'positive' && score >= 3.5) return 'cross_sell'
  return 'send_guide'
}
