import { NextRequest, NextResponse } from 'next/server';
import { getCallsByCampaign, getProductIntelligenceForCampaign } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') ?? '50');
    const offset = parseInt(url.searchParams.get('offset') ?? '0');

    const [calls, intelligence] = await Promise.all([
      getCallsByCampaign(id, limit, offset),
      getProductIntelligenceForCampaign(id),
    ]);

    // Join call records with product intelligence
    const intelligenceByCallId = new Map(intelligence.map((pi) => [pi.call_record_id, pi]));
    const enrichedCalls = calls.map((c) => ({
      ...c,
      product_intelligence: intelligenceByCallId.get(c.id) ?? null,
    }));

    return NextResponse.json({ calls: enrichedCalls, total: calls.length, limit, offset });
  } catch (err) {
    console.error('[campaigns/[id]/calls] GET failed:', err);
    return NextResponse.json({ error: 'Failed to fetch calls' }, { status: 500 });
  }
}
