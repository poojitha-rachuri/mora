import { NextRequest, NextResponse } from 'next/server';
import { getCampaignAnalyticsSummary } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const analytics = await getCampaignAnalyticsSummary(id);
    return NextResponse.json(analytics);
  } catch (err) {
    console.error('[campaigns/[id]/analytics] GET failed:', err);
    return NextResponse.json({ error: 'Failed to compute analytics' }, { status: 500 });
  }
}
