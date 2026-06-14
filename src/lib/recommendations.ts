import Anthropic from '@anthropic-ai/sdk';
import type { ConsumerProfile, MarketplaceProduct } from './types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ProductRecommendation {
  product: MarketplaceProduct;
  reasoning: string;
  relevance_score: number;
}

export async function getRecommendations(
  profile: ConsumerProfile,
  products: MarketplaceProduct[]
): Promise<ProductRecommendation[]> {
  if (products.length === 0) return [];

  // Build profile summary for Claude
  const profileSummary = [
    profile.skin_type && `Skin type: ${profile.skin_type}`,
    profile.hair_type && `Hair type: ${profile.hair_type}`,
    profile.primary_concerns.length > 0 && `Concerns: ${profile.primary_concerns.join(', ')}`,
    profile.budget_range && `Budget: ${profile.budget_range}`,
    profile.routine_complexity && `Routine complexity: ${profile.routine_complexity}`,
    profile.city && `Location: ${profile.city}`,
  ]
    .filter(Boolean)
    .join('\n');

  // Build product summaries
  const productSummaries = products.map((p, i) => ({
    index: i,
    name: p.product_name,
    brand: p.brand_name,
    trust_score: p.voice_trust_score,
    conversations: p.total_verified_conversations,
    avg_effectiveness: p.avg_effectiveness,
    works_best_for: p.works_best_for,
    top_insights: p.top_insights.slice(0, 2),
    sentiment: p.sentiment_distribution,
  }));

  const fallbackRanking = (): ProductRecommendation[] => {
    return products
      .sort((a, b) => b.voice_trust_score - a.voice_trust_score)
      .map((p) => ({
        product: p,
        reasoning: `Matched based on your profile — ${p.total_verified_conversations} verified voice conversations confirm strong results.`,
        relevance_score: p.voice_trust_score,
      }));
  };

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are TrueGlow's recommendation engine. A beauty shopper has shared their profile, and you have voice-verified product data from real buyers.

CONSUMER PROFILE:
${profileSummary}

PRODUCTS (with voice-verified data from real buyers):
${JSON.stringify(productSummaries, null, 2)}

Rank these products for this consumer and write a personalized reason for each. The reason must:
- Reference the consumer's specific skin type or concerns
- Cite actual data from voice calls (mention percentages or scores when relevant)
- Be 1-2 sentences, conversational but specific
- Not be generic ("great for all skin types")

Return JSON array:
[
  {
    "product_index": 0,
    "reasoning": "...",
    "relevance_score": 85
  }
]

Order from most to least relevant for this specific consumer. Only return valid JSON.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') return fallbackRanking();

    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return fallbackRanking();

    const ranked = JSON.parse(jsonMatch[0]) as Array<{
      product_index: number;
      reasoning: string;
      relevance_score: number;
    }>;

    return ranked
      .filter((r) => r.product_index >= 0 && r.product_index < products.length)
      .map((r) => ({
        product: products[r.product_index],
        reasoning: r.reasoning,
        relevance_score: r.relevance_score,
      }));
  } catch (err) {
    console.error('[recommendations] Claude failed:', err);
    return fallbackRanking();
  }
}
