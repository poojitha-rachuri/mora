import { NextRequest, NextResponse } from 'next/server';
import { getCampaign } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await getCampaign(id);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    return NextResponse.json(campaign);
  } catch (err) {
    console.error('[campaigns/[id]] GET failed:', err);
    return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 });
  }
}
