import { getAllMarketplaceProducts } from "@/lib/db";
import type { MarketplaceProduct } from "@/lib/types";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

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

            return (
              <Link
                key={p.id}
                href={`/marketplace/products/${p.id}`}
                className="group flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
              >
                {/* Product image area */}
                <div className={`h-36 bg-gradient-to-br ${style.gradient} relative flex items-end p-4`}>
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_white,_transparent)]" />
                  <div>
                    <p className="text-white/80 text-xs font-medium uppercase tracking-wide">{p.brand_name}</p>
                    <h2 className="text-white font-bold text-lg leading-tight">{p.product_name}</h2>
                  </div>
                  <TrustBadge score={p.voice_trust_score} />
                </div>

                {/* Card body */}
                <div className="flex flex-col gap-3 p-4 flex-1">
                  {/* Category */}
                  <Badge variant="outline" className={`w-fit text-xs capitalize ${style.bg} ${style.text} border-0`}>
                    {(p.category ?? "beauty").replace(/_/g, " ")}
                  </Badge>

                  {/* Sentiment bar */}
                  <div className="space-y-1">
                    <SentimentBar dist={p.sentiment_distribution} total={p.total_verified_conversations} />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{positivePct}% positive</span>
                      <span>{p.total_verified_conversations} verified voice{p.total_verified_conversations !== 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  {/* Top insight */}
                  {p.top_insights?.[0] && (
                    <p className="text-xs text-slate-500 italic line-clamp-2">
                      &ldquo;{p.top_insights[0]}&rdquo;
                    </p>
                  )}

                  {/* CTA */}
                  <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Avg effectiveness: {p.avg_effectiveness?.toFixed(1) ?? "—"}/5
                    </span>
                    <span className="text-xs font-semibold text-purple-600 group-hover:underline">
                      View details →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
