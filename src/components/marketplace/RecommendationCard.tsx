import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MarketplaceProduct } from "@/lib/types";

interface ProductRecommendation {
  product: MarketplaceProduct;
  reasoning: string;
  relevance_score: number;
}

function repurchaseRate(dist: MarketplaceProduct["repurchase_distribution"]): number {
  const total =
    dist.definitely_yes +
    dist.probably_yes +
    dist.unsure +
    dist.probably_no +
    dist.definitely_no;
  if (total === 0) return 0;
  return (dist.definitely_yes + dist.probably_yes) / total;
}

export default function RecommendationCard({
  rec,
  rank,
}: {
  rec: ProductRecommendation;
  rank: number;
}) {
  const p = rec.product;
  const score = Math.round(p.voice_trust_score);
  const scoreColor =
    score >= 75
      ? "text-green-600 bg-green-50 border-green-200"
      : score >= 50
      ? "text-yellow-600 bg-yellow-50 border-yellow-200"
      : "text-red-600 bg-red-50 border-red-200";

  const matchPct = Math.round(rec.relevance_score);
  const repurchasePct = Math.round(repurchaseRate(p.repurchase_distribution) * 100);

  return (
    <Card className="overflow-hidden border-2 hover:border-purple-200 transition-colors">
      <CardContent className="p-0">
        {/* Header stripe */}
        <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b">
          <div className="w-8 h-8 rounded-full bg-white border-2 border-purple-200 flex items-center justify-center text-sm font-bold text-purple-600">
            {rank}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 truncate">{p.product_name}</p>
            <p className="text-xs text-slate-500">{p.brand_name}</p>
          </div>
          <div
            className={`text-center px-3 py-1 rounded-full border text-xs font-bold ${scoreColor}`}
          >
            {score} VTS
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Match score */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                style={{ width: `${matchPct}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-600 shrink-0">
              {matchPct}% match
            </span>
          </div>

          {/* Claude reasoning */}
          <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
            <p className="text-xs font-semibold text-purple-700 mb-1">🤖 Why this fits you</p>
            <p className="text-sm text-purple-900 leading-relaxed">{rec.reasoning}</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="text-center">
              <p className="text-base font-bold text-slate-800">
                {p.avg_effectiveness != null ? p.avg_effectiveness.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-slate-400">Effectiveness</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-slate-800">{repurchasePct}%</p>
              <p className="text-xs text-slate-400">Repurchase</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-slate-800">
                {p.total_verified_conversations}
              </p>
              <p className="text-xs text-slate-400">Conversations</p>
            </div>
          </div>

          {/* Top insight */}
          {p.top_insights && p.top_insights.length > 0 && (
            <div className="text-xs text-slate-500 italic border-t pt-3">
              🎙 &ldquo;{p.top_insights[0]}&rdquo;
            </div>
          )}

          {/* Works best for badges */}
          {p.works_best_for && p.works_best_for.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {p.works_best_for.slice(0, 3).map((w, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {w.profile}
                </Badge>
              ))}
            </div>
          )}

          {/* View product button */}
          <Link
            href={`/marketplace/products/${p.id}`}
            className="block w-full text-center py-2 px-4 bg-white border border-purple-200 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-50 transition-colors"
          >
            View Full Product Intelligence →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
