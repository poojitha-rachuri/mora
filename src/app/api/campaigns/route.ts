import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createCampaign, startCampaign, registerWebhook } from '@/lib/ringg'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, product_name, product_category, brand_name, contacts } = body

    if (!name || !product_name || !contacts?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const db = createServerClient()

    // 1. Create campaign in DB first
    const { data: campaign, error: dbErr } = await db
      .from('campaigns')
      .insert({
        name,
        product_name,
        product_category: product_category || 'serum',
        brand_name: brand_name || 'Unknown',
        total_contacts: contacts.length,
        status: 'draft',
      })
      .select()
      .single()

    if (dbErr || !campaign) {
      return NextResponse.json({ error: dbErr?.message || 'DB error' }, { status: 500 })
    }

    // 2. Insert queued call records
    const callRecords = contacts.map((c: Record<string, string>) => ({
      campaign_id: campaign.id,
      contact_phone: c.phone,
      contact_name: c.name || null,
      status: 'queued',
    }))
    await db.from('call_records').insert(callRecords)

    // 3. Create Ringg.ai campaign
    let ringgCampaignId: string | null = null
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    try {
      const ringgCampaign = await createCampaign(name, contacts)
      ringgCampaignId = ringgCampaign.id || ringgCampaign.campaign_id

      if (ringgCampaignId) {
        // 4. Start campaign
        await startCampaign(ringgCampaignId)

        // 5. Register webhook
        const webhookUrl = `${appUrl}/api/webhook/ringg?campaign_id=${campaign.id}`
        await registerWebhook(ringgCampaignId, webhookUrl)

        // 6. Update DB with Ringg campaign ID
        await db
          .from('campaigns')
          .update({ ringg_campaign_id: ringgCampaignId, status: 'active', webhook_registered: true })
          .eq('id', campaign.id)
      }
    } catch (ringgErr) {
      console.error('Ringg.ai error (campaign still created in DB):', ringgErr)
      // Don't fail — campaign is in DB, mark as active for demo
      await db.from('campaigns').update({ status: 'active' }).eq('id', campaign.id)
    }

    return NextResponse.json({ campaign: { ...campaign, ringg_campaign_id: ringgCampaignId } })
  } catch (err) {
    console.error('Campaign creation error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function GET() {
  const db = createServerClient()
  const { data, error } = await db.from('campaigns').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ campaigns: data })
}
