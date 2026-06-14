import { NextRequest, NextResponse } from 'next/server';
import { recordWebhookEvent, updateCampaign, upsertCallRecord } from '@/lib/db';
import { processCompletedCall } from '@/lib/analysis';
import crypto from 'crypto';

function hashPhone(phone: string): string {
  return crypto.createHash('sha256').update(phone).digest('hex');
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Step 1: Auth verification
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.RINGG_WEBHOOK_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const callId = (body.call_id ?? body.id ?? '') as string;
  const eventType = (body.event_type ?? body.type ?? '') as string;

  if (!callId || !eventType) {
    return NextResponse.json({ error: 'Missing call_id or event_type' }, { status: 400 });
  }

  // Step 2: Deduplication — insert into webhook_events; if duplicate, skip
  let isNew: boolean;
  try {
    isNew = await recordWebhookEvent(callId, eventType);
  } catch (err) {
    console.error('[webhook] dedup check failed:', err);
    // Fail open — process anyway rather than blocking
    isNew = true;
  }

  if (!isNew) {
    return NextResponse.json({ status: 'duplicate', skipped: true });
  }

  // Step 3: Return 200 IMMEDIATELY, then process async
  const responsePromise = processWebhookAsync(body, callId, eventType);

  // Use waitUntil if available (Vercel Edge), else fire-and-forget
  if (typeof (globalThis as unknown as { waitUntil?: (p: Promise<unknown>) => void }).waitUntil === 'function') {
    (globalThis as unknown as { waitUntil: (p: Promise<unknown>) => void }).waitUntil(responsePromise);
  } else {
    responsePromise.catch((err) => console.error('[webhook] async processing error:', err));
  }

  return NextResponse.json({ status: 'accepted' });
}

async function processWebhookAsync(
  body: Record<string, unknown>,
  callId: string,
  eventType: string
): Promise<void> {
  const campaignId = (body.campaign_id ?? body.bulk_list_id ?? '') as string;

  try {
    switch (eventType) {
      case 'call_started': {
        if (campaignId) {
          await updateCampaign(campaignId, {}).catch(() => {/* ignore */});
        }
        break;
      }

      case 'call_completed': {
        const phone = ((body.phone ?? body.mobile_number ?? '') as string);
        if (phone && campaignId) {
          await upsertCallRecord({
            campaign_id: campaignId,
            ringg_call_id: callId,
            phone_hash: hashPhone(phone),
            status: 'completed',
            call_duration: body.duration as number | undefined,
          });
        }
        break;
      }

      case 'all_processing_completed': {
        const phone = ((body.phone ?? body.mobile_number ?? '') as string);
        const customAnalysis = body.custom_analysis as import('@/lib/types').CustomAnalysis | undefined;
        const transcript = body.transcript as Array<{ role: string; content: string }> | undefined;

        await processCompletedCall({
          call_id: callId,
          campaign_id: campaignId,
          product_name: (body.product_name ?? 'Unknown Product') as string,
          brand_name: (body.brand_name ?? 'Unknown Brand') as string,
          callee_name: body.callee_name as string | undefined,
          phone_hash: phone ? hashPhone(phone) : (body.phone_hash as string) ?? 'unknown',
          call_duration: body.duration as number | undefined,
          recording_url: body.recording_url as string | undefined,
          transcript,
          custom_analysis: customAnalysis,
        });
        break;
      }

      default:
        console.log(`[webhook] Unhandled event type: ${eventType}`);
    }
  } catch (err) {
    console.error(`[webhook] processWebhookAsync failed for ${eventType}:`, err);
  }
}
