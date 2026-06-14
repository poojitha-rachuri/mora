import Anthropic from '@anthropic-ai/sdk';
import type { CustomAnalysis, ProductIntelligence } from './types';
import {
  upsertCallRecord,
  insertProductIntelligence,
  recordWebhookEvent,
} from './db';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Maps Ringg.ai custom_analysis JSON → product_intelligence row fields
export function extractProductIntelligence(
  campaignId: string,
  callRecordId: string,
  productName: string,
  brandName: string,
  analysis: CustomAnalysis
): Omit<ProductIntelligence, 'id' | 'created_at'> {
  return {
    campaign_id: campaignId,
    call_record_id: callRecordId,
    product_name: productName,
    brand_name: brandName,
    skin_type: analysis.skin_type,
    hair_type: analysis.hair_type,
    overall_sentiment: analysis.overall_sentiment,
    texture_score: analysis.texture_score,
    effectiveness_score: analysis.effectiveness_score,
    fragrance_score: analysis.fragrance_score,
    value_score: analysis.value_score,
    packaging_score: analysis.packaging_score,
    repurchase_intent: analysis.repurchase_intent,
    recommendation_likelihood: analysis.recommendation_likelihood,
    customer_segment: analysis.customer_segment,
    recommended_action: analysis.recommended_action,
    issues_reported: analysis.issues_reported ?? [],
    usage_mistakes: analysis.usage_mistakes ?? [],
    unanswered_questions_json: analysis.unanswered_questions ?? [],
    adverse_reaction_flag: analysis.adverse_reaction_flag ?? false,
    non_usage_reason: analysis.non_usage_reason,
    enriched_context: undefined,
  };
}

// Claude enrichment: surfaces soft signals beyond structured extraction
export async function enrichTranscript(
  transcript: Array<{ role: string; content: string }>,
  productName: string
): Promise<string | null> {
  try {
    const transcriptText = transcript
      .map((t) => `${t.role === 'bot' ? 'Ava' : 'Customer'}: ${t.content}`)
      .join('\n');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `You are analyzing a post-purchase beauty product feedback call for "${productName}".

Extract soft signals and contextual nuances NOT captured in the structured analysis:
- Unprompted product comparisons (e.g., "better than X brand")
- Underlying emotional tone beyond stated satisfaction scores
- Usage context clues (climate, routine, lifestyle)
- Skepticism or hesitation despite positive stated scores
- Signs of brand loyalty or switching intent

Transcript:
${transcriptText}

Respond in 2-3 concise sentences with the most valuable contextual insight. Be specific, not generic.`,
        },
      ],
    });

    const content = message.content[0];
    return content.type === 'text' ? content.text : null;
  } catch (err) {
    console.error('[analysis] Claude enrichment failed:', err);
    return null;
  }
}

// Orchestrates full processing for all_processing_completed events
export async function processCompletedCall(event: {
  call_id: string;
  campaign_id: string;
  product_name: string;
  brand_name: string;
  callee_name?: string;
  phone_hash: string;
  call_duration?: number;
  recording_url?: string;
  transcript?: Array<{ role: string; content: string }>;
  custom_analysis?: CustomAnalysis;
}): Promise<void> {
  try {
    // Step 1: Upsert call record
    const callRecord = await upsertCallRecord({
      campaign_id: event.campaign_id,
      ringg_call_id: event.call_id,
      callee_name: event.callee_name,
      phone_hash: event.phone_hash,
      status: 'completed',
      call_duration: event.call_duration,
      recording_url: event.recording_url,
      transcript_json: event.transcript as unknown as import('./types').TranscriptTurn[],
      custom_analysis: event.custom_analysis,
    });

    if (!event.custom_analysis) {
      console.warn('[analysis] No custom_analysis in event, skipping product_intelligence');
      return;
    }

    // Step 2: Extract structured product intelligence fields
    const piData = extractProductIntelligence(
      event.campaign_id,
      callRecord.id,
      event.product_name,
      event.brand_name,
      event.custom_analysis
    );

    // Step 3: Claude transcript enrichment (graceful degradation)
    if (event.transcript && event.transcript.length > 0) {
      const enriched = await enrichTranscript(event.transcript, event.product_name);
      if (enriched) piData.enriched_context = enriched;
    }

    // Step 4: Insert product_intelligence row
    await insertProductIntelligence(piData);

    // Step 5: Trigger marketplace recomputation (imported lazily to avoid circular deps)
    const { recomputeMarketplaceProduct } = await import('./marketplace-aggregator');
    await recomputeMarketplaceProduct(event.product_name, event.brand_name);
  } catch (err) {
    console.error('[analysis] processCompletedCall failed:', err);
    // Do not rethrow — webhook already responded 200
  }
}
