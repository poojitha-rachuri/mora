import { NextRequest, NextResponse } from 'next/server';
import { getMarketplaceProduct } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getMarketplaceProduct(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (err) {
    console.error('[products/[id]] GET failed:', err);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
