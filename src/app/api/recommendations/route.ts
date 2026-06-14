import { NextRequest, NextResponse } from 'next/server';
import { getAllMarketplaceProducts } from '@/lib/db';
import { getRecommendations } from '@/lib/recommendations';
import type { ConsumerProfile } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const profile: ConsumerProfile = await request.json();

    if (!profile.primary_concerns) {
      profile.primary_concerns = [];
    }

    const products = await getAllMarketplaceProducts();

    if (products.length === 0) {
      return NextResponse.json([]);
    }

    const recommendations = await getRecommendations(profile, products);

    return NextResponse.json(recommendations);
  } catch (err) {
    console.error('[recommendations] POST failed:', err);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}
