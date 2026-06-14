import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const db = createServerClient()

  const [{ data: campaign }, { data: calls }, { data: intelligence }] = await Promise.all([
    db.from('campaigns').select('*').eq('id', id).single(),
    db.from('call_records').select('*').eq('campaign_id', id).order('created_at', { ascending: false }),
    db.from('product_intelligence').select('*').eq('campaign_id', id),
  ])

  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ campaign, calls: calls || [], intelligence: intelligence || [] })
}
