import { NextRequest, NextResponse } from 'next/server';
import { getCampaign, updateCampaign } from '@/lib/db';
import { ringg } from '@/lib/ringg';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await getCampaign(id);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (!campaign.ringg_list_id) {
      return NextResponse.json(
        { error: 'Campaign has no Ringg.ai list ID — create the campaign first' },
        { status: 400 }
      );
    }

    const agentId = process.env.RINGG_AGENT_ID;
    const fromNumberId = process.env.RINGG_FROM_NUMBER_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
    const callbackUrl = `${appUrl}/api/webhooks/ringg`;

    if (!agentId || !fromNumberId) {
      return NextResponse.json(
        { error: 'RINGG_AGENT_ID and RINGG_FROM_NUMBER_ID env vars required' },
        { status: 503 }
      );
    }

    // Start the campaign
    try {
      await ringg.startCampaign({
        agentId,
        listId: campaign.ringg_list_id,
        fromNumberId,
        callbackUrl,
      });
    } catch (err) {
      console.error('[campaigns/start] Ringg.ai startCampaign failed:', err);
      return NextResponse.json(
        { error: 'Failed to start campaign in Ringg.ai', details: String(err) },
        { status: 502 }
      );
    }

    // Register webhooks
    try {
      await ringg.setupWebhooks({
        agentId,
        callbackUrl,
        secret: process.env.RINGG_WEBHOOK_SECRET,
      });
    } catch (err) {
      console.warn('[campaigns/start] Webhook setup failed (non-fatal):', err);
    }

    const updated = await updateCampaign(id, {
      status: 'ongoing',
      start_time: new Date().toISOString(),
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[campaigns/[id]/start] POST failed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
