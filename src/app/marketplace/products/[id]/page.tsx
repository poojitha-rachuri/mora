import { getMarketplaceProduct } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import VoiceTrustScore from "@/components/marketplace/VoiceTrustScore";
import SatisfactionBreakdown from "@/components/marketplace/SatisfactionBreakdown";
import WorksBestFor from "@/components/marketplace/WorksBestFor";
import NotIdealFor from "@/components/marketplace/NotIdealFor";
import RealBuyerInsights from "@/components/marketplace/RealBuyerInsights";
import CommonQuestions from "@/components/marketplace/CommonQuestions";
import IssueTransparency from "@/components/marketplace/IssueTransparency";
import RepurchaseSignal from "@/components/marketplace/RepurchaseSignal";
import BuyButton from "@/components/marketplace/BuyButton";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product = null;
  try {
    product = await getMarketplaceProduct(id);
  } catch {
    // DB not configured
  }

  if (!product) notFound();

  const sentiment = product.sentiment_distribution ?? { positive: 0, neutral: 0, negative: 0 };
  const total = Math.max(product.total_verified_conversations, 1);
  const sentimentPct = {
    positive: Math.round((sentiment.positive / total) * 100),
    neutral: Math.round((sentiment.neutral / total) * 100),
    negative: Math.round((sentiment.negative / total) * 100),
  };

  // Compute repurchase rate from distribution
  const rd = product.repurchase_distribution ?? {
    definitely_yes: 0,
    probably_yes: 0,
    unsure: 0,
    probably_no: 0,
    definitely_no: 0,
  };
  const rdTotal =
    rd.definitely_yes + rd.probably_yes + rd.unsure + rd.probably_no + rd.definitely_no;
  const repurchaseRate =
    rdTotal > 0 ? (rd.definitely_yes + rd.probably_yes) / rdTotal : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Back */}
      <Link href="/marketplace/products" className="text-sm text-slate-500 hover:text-slate-700">
        ← Back to Products
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-start gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{product.product_name}</h1>
            <p className="text-slate-500">{product.brand_name}</p>
          </div>
          <Badge variant="outline" className="ml-auto shrink-0 capitalize">
            {product.category?.replace(/_/g, " ")}
          </Badge>
        </div>

        <div className="mt-4">
          <VoiceTrustScore
            score={product.voice_trust_score}
            total_verified_conversations={product.total_verified_conversations}
          />
        </div>

        <div className="flex gap-3 mt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            {sentimentPct.positive}% positive
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            {sentimentPct.neutral}% neutral
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            {sentimentPct.negative}% negative
          </span>
        </div>
      </div>

      {/* Buy CTA */}
      <BuyButton productName={product.product_name} />

      {/* Satisfaction radar */}
      <Card>
        <CardHeader><CardTitle className="text-base">Satisfaction Breakdown</CardTitle></CardHeader>
        <CardContent>
          <SatisfactionBreakdown
            data={{
              texture: product.avg_texture,
              effectiveness: product.avg_effectiveness,
              fragrance: product.avg_fragrance,
              value: product.avg_value,
              packaging: product.avg_packaging,
            }}
          />
        </CardContent>
      </Card>

      {/* Repurchase */}
      <Card>
        <CardHeader><CardTitle className="text-base">Buyer Loyalty Signals</CardTitle></CardHeader>
        <CardContent>
          <RepurchaseSignal
            repurchase_rate={repurchaseRate}
            avg_effectiveness={product.avg_effectiveness ?? 0}
          />
        </CardContent>
      </Card>

      {/* Works best for / Not ideal for */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm text-green-700">Works Best For</CardTitle></CardHeader>
          <CardContent>
            <WorksBestFor profiles={product.works_best_for ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-amber-700">May Not Be Ideal For</CardTitle></CardHeader>
          <CardContent>
            <NotIdealFor profiles={product.not_ideal_for ?? []} />
          </CardContent>
        </Card>
      </div>

      {/* Real buyer insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">What Real Buyers Say</CardTitle>
          <p className="text-xs text-slate-400">From {product.total_verified_conversations} verified voice conversations</p>
        </CardHeader>
        <CardContent>
          <RealBuyerInsights insights={product.top_insights ?? []} />
        </CardContent>
      </Card>

      {/* Common questions */}
      <Card>
        <CardHeader><CardTitle className="text-base">Common Questions</CardTitle></CardHeader>
        <CardContent>
          <CommonQuestions questions={product.common_questions ?? []} />
        </CardContent>
      </Card>

      {/* Issue transparency */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Issue Transparency</CardTitle>
          <p className="text-xs text-slate-400">MORA surfaces all buyer concerns — good and bad</p>
        </CardHeader>
        <CardContent>
          <IssueTransparency issues={product.issue_summary ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
