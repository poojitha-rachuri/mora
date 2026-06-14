import { NextRequest, NextResponse } from 'next/server';
import { getAllMarketplaceProducts } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    let products = await getAllMarketplaceProducts();

    if (category) {
      products = products.filter((p) => p.category === category);
    }

    // Return summary fields only for list view
    const summaries = products.map((p) => ({
      id: p.id,
      product_name: p.product_name,
      brand_name: p.brand_name,
      category: p.category,
      voice_trust_score: p.voice_trust_score,
      total_verified_conversations: p.total_verified_conversations,
      sentiment_distribution: p.sentiment_distribution,
      avg_effectiveness: p.avg_effectiveness,
      top_insights: p.top_insights.slice(0, 1),
    }));

    return NextResponse.json(summaries);
  } catch (err) {
    console.error('[products] GET failed:', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
