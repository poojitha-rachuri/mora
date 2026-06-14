import { NextRequest, NextResponse } from 'next/server';
import { getCampaign, updateCampaign, getCallsByCampaign } from '@/lib/db';
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

    const agentId = (process.env.RINGG_AGENT_ID ?? '').replace(/^﻿/, '').trim() || undefined;
    const fromNumberId = (process.env.RINGG_FROM_NUMBER_ID ?? '').replace(/^﻿/, '').trim() || undefined;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
    const callbackUrl = `${appUrl}/api/webhooks/ringg`;

    // If no ringg_list_id, try creating the campaign in Ringg.ai now
    if (!campaign.ringg_list_id && agentId && fromNumberId) {
      try {
        const calls = await getCallsByCampaign(id);
        const contacts = calls.length > 0
          ? calls.map(c => ({ mobile_number: c.contact_phone ?? '', name: c.contact_name ?? '' }))
          : [{ mobile_number: '9999999999', name: 'Test' }];
        const ringgResult = await ringg.createCampaign({ name: campaign.campaign_name, contacts });
        await updateCampaign(id, {
          ringg_list_id: ringgResult.list_id,
          ringg_campaign_id: ringgResult.campaign_id,
        });
        campaign.ringg_list_id = ringgResult.list_id;
        campaign.ringg_campaign_id = ringgResult.campaign_id;
      } catch (err) {
        console.error('[campaigns/start] Ringg.ai createCampaign failed (continuing):', err);
      }
    }

    // Attempt Ringg.ai campaign start — non-fatal if missing IDs or API fails
    if (campaign.ringg_list_id && agentId && fromNumberId) {
      try {
        await ringg.startCampaign({
          agentId,
          listId: campaign.ringg_list_id,
          fromNumberId,
          callbackUrl,
        });
      } catch (err) {
        console.error('[campaigns/start] Ringg.ai startCampaign failed (continuing):', err);
      }

      try {
        await ringg.setupWebhooks({ agentId, callbackUrl });
      } catch (err) {
        console.warn('[campaigns/start] Webhook setup failed (non-fatal):', err);
      }
    } else {
      console.warn('[campaigns/start] Skipping Ringg.ai — missing list_id, RINGG_AGENT_ID, or RINGG_FROM_NUMBER_ID');
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
