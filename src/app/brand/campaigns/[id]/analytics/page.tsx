import { getCampaignAnalyticsSummary, getCampaign } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SatisfactionChart from "@/components/brand/SatisfactionChart";
import SentimentDistribution from "@/components/brand/SentimentDistribution";
import RepurchaseGauge from "@/components/brand/RepurchaseGauge";
import IssueHeatmap from "@/components/brand/IssueHeatmap";
import SegmentBreakdown from "@/components/brand/SegmentBreakdown";
import EducationGapReport from "@/components/brand/EducationGapReport";

export const dynamic = "force-dynamic";

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let analytics = null;
  let campaign = null;

  try {
    [analytics, campaign] = await Promise.all([
      getCampaignAnalyticsSummary(id),
      getCampaign(id),
    ]);
  } catch {
    return (
      <div className="text-center py-16 text-slate-400">
        <p>Unable to load analytics. Ensure Supabase is configured.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          label="Completion Rate"
          value={`${Math.round(analytics.completion_rate * 100)}%`}
          sub={`${analytics.completed_calls}/${analytics.total_calls} calls`}
        />
        <StatCard
          label="Avg Call Duration"
          value={`${Math.floor(analytics.avg_call_duration / 60)}:${(analytics.avg_call_duration % 60).toString().padStart(2, "0")}`}
          sub="minutes:seconds"
        />
        <StatCard
          label="NPS Score"
          value={analytics.nps.toString()}
          sub="out of 100"
        />
        <StatCard
          label="Issue Detection"
          value={`${Math.round(analytics.issue_detection_rate * 100)}%`}
          sub="calls with issues"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Satisfaction by Dimension</CardTitle></CardHeader>
          <CardContent>
            <SatisfactionChart data={analytics.avg_satisfaction} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Sentiment Distribution</CardTitle></CardHeader>
          <CardContent>
            <SentimentDistribution data={analytics.sentiment_distribution} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Repurchase Intent</CardTitle></CardHeader>
        <CardContent>
          <RepurchaseGauge data={analytics.repurchase_distribution} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Top Issues</CardTitle></CardHeader>
          <CardContent>
            <IssueHeatmap issues={analytics.top_issues} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Customer Segments</CardTitle></CardHeader>
          <CardContent>
            <SegmentBreakdown data={analytics.customer_segments} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Education Gaps</CardTitle></CardHeader>
        <CardContent>
          <EducationGapReport gaps={analytics.education_gaps} />
        </CardContent>
      </Card>
    </div>
  );
}
