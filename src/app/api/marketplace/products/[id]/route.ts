import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

const SLUG_TO_NAME: Record<string, string> = {
  'minimalist-niacinamide': 'Minimalist 10% Niacinamide Serum',
  'plum-green-tea': 'Plum Green Tea Anti-Acne Face Wash',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const db = createServerClient()

  const productName = SLUG_TO_NAME[id]

  const query = productName
    ? db.from('marketplace_products').select('*').eq('product_name', productName).single()
    : db.from('marketplace_products').select('*').eq('id', id).single()

  const { data: product, error } = await query

  if (error || !product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ product })
}
