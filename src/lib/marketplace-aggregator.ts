import OpenAI from 'openai';
import type { ProductIntelligence, MarketplaceProduct } from './types';
import { getProductIntelligenceForProduct, upsertMarketplaceProduct } from './db';

function getOpenRouter() {
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'MORA',
    },
  });
}

const MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-sonnet-4-5';

function avg(vals: (number | undefined | null)[]): number {
  const valid = vals.filter((v): v is number => v != null);
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
}

function countBy<T>(arr: T[], fn: (v: T) => string): Record<string, number> {
  return arr.reduce((acc, v) => {
    const key = fn(v);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export async function recomputeMarketplaceProduct(
  productName: string,
  brandName: string
): Promise<MarketplaceProduct> {
  const rows = await getProductIntelligenceForProduct(productName, brandName);

  if (rows.length === 0) {
    return upsertMarketplaceProduct({
      product_name: productName,
      brand_name: brandName,
      total_verified_conversations: 0,
      voice_trust_score: 0,
    });
  }

  // ── Numeric aggregates ────────────────────────────────────────────────
  const total = rows.length;
  const positiveCount = rows.filter((r) => r.overall_sentiment === 'positive').length;
  const repurchaseYesCount = rows.filter(
    (r) => r.repurchase_intent === 'definitely_yes' || r.repurchase_intent === 'probably_yes'
  ).length;
  const severeIssueCount = rows.filter((r) =>
    ((r.issues_reported ?? []) as Array<{ issue: string; severity: string }>).some(
      (i) => i.severity === 'severe'
    )
  ).length;
  const avgReco = avg(rows.map((r) => r.recommendation_likelihood));

  const positiveRate = positiveCount / total;
  const repurchaseYesRate = repurchaseYesCount / total;
  const severeIssueRate = severeIssueCount / total;

  // Voice Trust Score formula
  const voiceTrustScore = Math.min(
    100,
    Math.max(
      0,
      positiveRate * 30 +
        repurchaseYesRate * 25 +
        (avgReco / 10) * 25 +
        (1 - severeIssueRate) * 20
    )
  );

  const sentimentDist = countBy(rows, (r) => r.overall_sentiment ?? 'neutral');
  const repurchaseDist = countBy(rows, (r) => r.repurchase_intent ?? 'unsure');

  // ── Works best for / Not ideal for ───────────────────────────────────
  const bySkinType: Record<string, ProductIntelligence[]> = {};
  for (const r of rows) {
    if (r.skin_type) (bySkinType[r.skin_type] ??= []).push(r);
  }

  const worksBestFor: MarketplaceProduct['works_best_for'] = [];
  const notIdealFor: MarketplaceProduct['not_ideal_for'] = [];

  for (const [skinType, group] of Object.entries(bySkinType)) {
    const avgEff = avg(group.map((r) => r.effectiveness_score));
    if (avgEff >= 3.8) {
      worksBestFor.push({
        profile: `${skinType.replace('_', ' ')} skin`,
        satisfaction: Number(avgEff.toFixed(1)),
        note: `${Math.round((group.filter((r) => r.overall_sentiment === 'positive').length / group.length) * 100)}% reported positive results`,
      });
    } else if (avgEff < 3.0 && group.length >= 3) {
      notIdealFor.push({
        profile: `${skinType.replace('_', ' ')} skin`,
        reason: `Average effectiveness ${avgEff.toFixed(1)}/5 across ${group.length} voice-verified calls`,
      });
    }
  }

  // ── Issue summary ─────────────────────────────────────────────────────
  const allIssues = rows.flatMap(
    (r) => (r.issues_reported ?? []) as Array<{ issue: string; severity: 'mild' | 'moderate' | 'severe' }>
  );
  const issueMap: Record<string, { count: number; severity: string }> = {};
  for (const { issue, severity } of allIssues) {
    issueMap[issue] = {
      count: (issueMap[issue]?.count ?? 0) + 1,
      severity: ['severe', 'moderate', 'mild'].includes(severity) ? severity : 'mild',
    };
  }
  const issueSummary = Object.entries(issueMap)
    .map(([issue, { count, severity }]) => ({
      issue,
      percentage: Math.round((count / total) * 100),
      severity: severity as 'mild' | 'moderate' | 'severe',
      is_dealbreaker: severity === 'severe' && count / total > 0.1,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 8);

  // ── OpenRouter narrative generation ───────────────────────────────────
  let topInsights: string[] = [];
  let commonQuestions: Array<{ question: string; answer: string }> = [];
  let educationGaps: Array<{ mistake: string; percentage: number; tip: string }> = [];

  try {
    const allQuestions = rows.flatMap((r) => (r.unanswered_questions_json ?? []) as string[]);
    const allMistakes = rows.flatMap((r) => (r.usage_mistakes ?? []) as string[]);
    const mistakeFreq = countBy(allMistakes, (m) => m);

    const prompt = `You are analyzing ${total} post-purchase voice feedback calls for "${productName}" by ${brandName}.

Aggregate data:
- Overall positive rate: ${Math.round(positiveRate * 100)}%
- Repurchase rate: ${Math.round(repurchaseYesRate * 100)}%
- Avg recommendation score: ${avgReco.toFixed(1)}/10
- Avg scores: texture=${avg(rows.map((r) => r.texture_score)).toFixed(1)}, effectiveness=${avg(rows.map((r) => r.effectiveness_score)).toFixed(1)}, fragrance=${avg(rows.map((r) => r.fragrance_score)).toFixed(1)}, value=${avg(rows.map((r) => r.value_score)).toFixed(1)}, packaging=${avg(rows.map((r) => r.packaging_score)).toFixed(1)}
- Skin types: ${JSON.stringify(countBy(rows, (r) => r.skin_type ?? 'unknown'))}
- Top issues: ${JSON.stringify(issueSummary.slice(0, 3))}
- Common usage mistakes: ${JSON.stringify(Object.entries(mistakeFreq).sort((a, b) => b[1] - a[1]).slice(0, 5))}
- Sample unanswered questions: ${JSON.stringify(allQuestions.slice(0, 8))}
- Customer segments: ${JSON.stringify(countBy(rows, (r) => r.customer_segment ?? 'unknown'))}

Generate a JSON response with exactly this structure:
{
  "top_insights": ["insight1", "insight2", "insight3"],
  "common_questions": [{"question": "...", "answer": "..."}, ...],
  "education_gaps": [{"mistake": "...", "percentage": 0, "tip": "..."}]
}

Rules:
- top_insights: 3-5 evidence-backed statements like "78% of oily-skin users reported reduced shine within 2 weeks". Include specific percentages and skin types.
- common_questions: 3-5 real questions buyers asked with concise answers based on the aggregate data.
- education_gaps: 2-4 common usage mistakes with percentage affected and a practical tip.
Only return valid JSON, no other text.`;

    const response = await getOpenRouter().chat.completions.create({
      model: MODEL,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.choices[0].message.content ?? '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      topInsights = parsed.top_insights ?? [];
      commonQuestions = parsed.common_questions ?? [];
      educationGaps = parsed.education_gaps ?? [];
    }
  } catch (err) {
    console.error('[aggregator] OpenRouter narrative generation failed:', err);
    // Graceful degradation — numeric fields still upserted
  }

  return upsertMarketplaceProduct({
    product_name: productName,
    brand_name: brandName,
    total_verified_conversations: total,
    voice_trust_score: Number(voiceTrustScore.toFixed(2)),
    avg_texture: Number(avg(rows.map((r) => r.texture_score)).toFixed(1)),
    avg_effectiveness: Number(avg(rows.map((r) => r.effectiveness_score)).toFixed(1)),
    avg_fragrance: Number(avg(rows.map((r) => r.fragrance_score)).toFixed(1)),
    avg_value: Number(avg(rows.map((r) => r.value_score)).toFixed(1)),
    avg_packaging: Number(avg(rows.map((r) => r.packaging_score)).toFixed(1)),
    sentiment_distribution: {
      positive: sentimentDist.positive ?? 0,
      neutral: sentimentDist.neutral ?? 0,
      negative: sentimentDist.negative ?? 0,
    },
    repurchase_distribution: {
      definitely_yes: repurchaseDist.definitely_yes ?? 0,
      probably_yes: repurchaseDist.probably_yes ?? 0,
      unsure: repurchaseDist.unsure ?? 0,
      probably_no: repurchaseDist.probably_no ?? 0,
      definitely_no: repurchaseDist.definitely_no ?? 0,
    },
    works_best_for: worksBestFor,
    not_ideal_for: notIdealFor,
    top_insights: topInsights,
    common_questions: commonQuestions,
    education_gaps: educationGaps,
    issue_summary: issueSummary,
  });
}
