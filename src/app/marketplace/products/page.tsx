import { getAllMarketplaceProducts } from "@/lib/db";
import type { MarketplaceProduct } from "@/lib/types";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  let products: MarketplaceProduct[] = [];
  try {
    products = await getAllMarketplaceProducts();
  } catch {
    // DB not configured
  }

  if (products.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="text-5xl mb-3">🛍️</div>
        <p className="font-medium">No products yet</p>
        <p className="text-sm mt-1">Seed data or run voice campaigns to populate the marketplace.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Marketplace Products</h1>
      <div className="space-y-4">
        {products.map((p) => (
          <Link key={p.id} href={`/marketplace/products/${p.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{p.product_name}</p>
                    <p className="text-sm text-slate-500">{p.brand_name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{Math.round(p.voice_trust_score)}</div>
                    <p className="text-xs text-slate-400">Trust Score</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {p.category?.replace(/_/g, " ")}
                  </Badge>
                  <span className="text-xs text-slate-400">{p.total_verified_conversations} conversations</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
