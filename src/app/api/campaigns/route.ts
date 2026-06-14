import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { createCampaign, getCampaigns } from '@/lib/db';
import { ringg } from '@/lib/ringg';
import { detectCategory } from '@/lib/category-detector';

export async function GET() {
  try {
    const campaigns = await getCampaigns();
    return NextResponse.json(campaigns);
  } catch (err) {
    console.error('[campaigns] GET failed:', err);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const campaignName = formData.get('campaign_name') as string;
    const productName = formData.get('product_name') as string;
    const brandName = formData.get('brand_name') as string | null ?? 'Demo Brand';

    if (!file || !campaignName || !productName) {
      return NextResponse.json(
        { error: 'Missing required fields: file, campaign_name, product_name' },
        { status: 400 }
      );
    }

    // Parse CSV
    const csvText = await file.text();
    const { data: rows, errors } = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length > 0 && rows.length === 0) {
      return NextResponse.json({ error: 'Invalid CSV file', details: errors }, { status: 400 });
    }

    // Validate required column
    if (rows.length === 0 || !('mobile_number' in rows[0])) {
      return NextResponse.json(
        { error: "Required column 'mobile_number' not found in CSV" },
        { status: 400 }
      );
    }

    const category = detectCategory(productName);

    // Fix Excel scientific-notation phone numbers (e.g. "9.1966E+11" → "919660000000")
    function normalizePhone(val: string): string {
      if (/^[\d.]+[Ee][+\-]?\d+$/.test((val ?? '').trim())) {
        return String(Math.round(Number(val)));
      }
      return (val ?? '').replace(/\D/g, '') ? val : val;
    }

    const normalizedContacts = rows.map((r) => ({
      ...r,
      mobile_number: normalizePhone(r.mobile_number ?? r.phone ?? ''),
      name: r.name ?? r.customer_name ?? '',
      product_name: r.product_name || productName,
      brand_name: r.brand_name || brandName,
    }));

    // Create Ringg.ai campaign list (non-blocking — continue even on failure)
    let ringgListId: string | undefined;
    let ringgCampaignId: string | undefined;

    try {
      const ringgResult = await ringg.createCampaign({
        name: campaignName,
        contacts: normalizedContacts,
      });
      ringgListId = ringgResult.list_id;
      ringgCampaignId = ringgResult.campaign_id;
    } catch (err) {
      console.error('[campaigns] Ringg.ai createCampaign failed (continuing):', err);
      // Continue — save campaign to DB without Ringg.ai IDs
    }

    const campaign = await createCampaign({
      brand_name: brandName,
      campaign_name: campaignName,
      product_name: productName,
      category,
      ringg_campaign_id: ringgCampaignId,
      ringg_list_id: ringgListId,
    });

    // Update total_contacts count
    const { updateCampaign } = await import('@/lib/db');
    await updateCampaign(campaign.id, { total_contacts: rows.length }).catch(() => {});

    return NextResponse.json({ ...campaign, total_contacts: rows.length }, { status: 201 });
  } catch (err) {
    console.error('[campaigns] POST failed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
