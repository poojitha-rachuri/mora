import { getAllMarketplaceProducts } from "@/lib/db";
import type { MarketplaceProduct } from "@/lib/types";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const BRAND_META: Record<string, { siteUrl: string }> = {
  Minimalist: { siteUrl: "https://beminimalist.co/" },
  Plum:       { siteUrl: "https://plumgoodness.com/" },
  Foxtale:    { siteUrl: "https://foxtale.in/" },
};

const PRODUCT_IMAGES: Record<string, string> = {
  "10% Niacinamide + Zinc Serum":         "https://beminimalist.co/cdn/shop/products/10-Niacinamide-Serum_3.jpg",
  "2% Salicylic Acid Toner":              "https://beminimalist.co/cdn/shop/files/2-Salicylic-Acid-BHA-Toner-100-ml.jpg",
  "SPF 50 PA++++ Sunscreen":              "https://beminimalist.co/cdn/shop/files/Sunscreen-SPF-50-PA-50ml.jpg",
  "Green Tea Pore Cleansing Face Wash":   "https://plumgoodness.com/cdn/shop/products/plum-green-tea-pore-cleansing-face-wash_540x.jpg",
  "Full Damage Repair Shampoo":           "https://plumgoodness.com/cdn/shop/products/shampoo-for-damaged-hair_540x.jpg",
  "Full Damage Repair Conditioner":       "https://plumgoodness.com/cdn/shop/products/conditioner-for-damaged-hair_540x.jpg",
  "Ceramide & Niacinamide Moisturizer":   "https://foxtale.in/cdn/shop/products/ceramide-niacinamide-moisturizer_540x.jpg",
};

function brandSiteUrl(brandName: string): string {
  return BRAND_META[brandName]?.siteUrl ?? "#";
}
function productImage(productName: string): string | undefined {
  return PRODUCT_IMAGES[productName];
}

export const dynamic = "force-dynamic";

const CATEGORY_COLORS: Record<string, { bg: string; text: string; gradient: string }> = {
  skincare_serum:       { bg: "bg-purple-100", text: "text-purple-700", gradient: "from-purple-400 to-violet-500" },
  skincare_moisturizer: { bg: "bg-blue-100",   text: "text-blue-700",   gradient: "from-blue-400 to-cyan-500" },
  skincare_toner:       { bg: "bg-teal-100",   text: "text-teal-700",   gradient: "from-teal-400 to-emerald-500" },
  skincare_sunscreen:   { bg: "bg-amber-100",  text: "text-amber-700",  gradient: "from-amber-400 to-orange-500" },
  haircare_shampoo:     { bg: "bg-rose-100",   text: "text-rose-700",   gradient: "from-rose-400 to-pink-500" },
  haircare_conditioner: { bg: "bg-pink-100",   text: "text-pink-700",   gradient: "from-pink-400 to-fuchsia-500" },
  default:              { bg: "bg-slate-100",  text: "text-slate-700",  gradient: "from-slate-400 to-gray-500" },
};

function categoryStyle(category?: string) {
  const key = category ?? "default";
  return CATEGORY_COLORS[key] ?? CATEGORY_COLORS.default;
}

function TrustBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-green-100 text-green-700 border-green-200" :
    score >= 60 ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                  "bg-red-100 text-red-700 border-red-200";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      <span>⬆</span> {Math.round(score)} Trust
    </span>
  );
}

function SentimentBar({ dist, total }: { dist: MarketplaceProduct["sentiment_distribution"]; total: number }) {
  const t = Math.max(total, 1);
  const pos = Math.round((dist.positive / t) * 100);
  const neu = Math.round((dist.neutral / t) * 100);
  const neg = 100 - pos - neu;
  return (
    <div className="flex rounded-full overflow-hidden h-1.5 w-full">
      <div className="bg-green-400" style={{ width: `${pos}%` }} />
      <div className="bg-yellow-300" style={{ width: `${neu}%` }} />
      <div className="bg-red-400" style={{ width: `${Math.max(neg, 0)}%` }} />
    </div>
  );
}

export default async function ProductsPage() {
  let products: MarketplaceProduct[] = [];
  try {
    products = await getAllMarketplaceProducts();
  } catch {
    // DB not configured
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Voice-Verified Products</h1>
        <p className="text-slate-500 mt-1">
          Every rating comes from real post-purchase voice conversations — not paid reviews.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <div className="text-6xl mb-4">🛍️</div>
          <p className="font-medium text-lg">No products yet</p>
          <p className="text-sm mt-1">Run voice campaigns to populate the marketplace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => {
            const style = categoryStyle(p.category);
            const sentTotal = Math.max(p.total_verified_conversations, 1);
            const positivePct = Math.round((p.sentiment_distribution.positive / sentTotal) * 100);

            const img = productImage(p.product_name);
            const siteUrl = brandSiteUrl(p.brand_name);

            return (
              <a
                key={p.id}
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
              >
                {/* Product image */}
                <div className={`h-48 relative flex items-end overflow-hidden ${img ? "bg-white" : `bg-gradient-to-br ${style.gradient}`}`}>
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt={p.product_name}
                      className="w-full h-full object-contain p-4"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_white,_transparent)]" />
                      <div className="p-4">
                        <p className="text-white/80 text-xs font-medium uppercase tracking-wide">{p.brand_name}</p>
                        <h2 className="text-white font-bold text-lg leading-tight">{p.product_name}</h2>
                      </div>
                    </>
                  )}
                  <div className="absolute top-3 right-3">
                    <TrustBadge score={p.voice_trust_score} />
                  </div>
                </div>

                {/* Card body */}
                <div className="flex flex-col gap-2 p-4 flex-1">
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{p.brand_name}</p>
                    <h3 className="font-semibold text-slate-900 text-sm leading-snug">{p.product_name}</h3>
                  </div>

                  <Badge variant="outline" className={`w-fit text-xs capitalize ${style.bg} ${style.text} border-0`}>
                    {(p.category ?? "beauty").replace(/_/g, " ")}
                  </Badge>

                  {/* Sentiment bar */}
                  <div className="space-y-1">
                    <SentimentBar dist={p.sentiment_distribution} total={p.total_verified_conversations} />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{positivePct}% positive</span>
                      <span>{p.total_verified_conversations} verified</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {p.avg_effectiveness?.toFixed(1) ?? "—"}/5 effectiveness
                    </span>
                    <span className="text-xs font-semibold text-purple-600 group-hover:underline">
                      Shop brand →
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
