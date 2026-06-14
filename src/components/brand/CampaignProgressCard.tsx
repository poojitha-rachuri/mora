import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Campaign } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  draft: "secondary",
  ongoing: "default",
  completed: "outline",
  failed: "destructive",
};

interface CampaignProgressCardProps {
  campaign: Campaign;
}

export default function CampaignProgressCard({ campaign }: CampaignProgressCardProps) {
  const progress =
    campaign.total_contacts > 0
      ? Math.round((campaign.completed_calls / campaign.total_contacts) * 100)
      : 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{campaign.campaign_name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{campaign.product_name} · {campaign.brand_name}</p>
          </div>
          <Badge variant={STATUS_COLORS[campaign.status] as "default" | "secondary" | "outline" | "destructive"}>
            {campaign.status}
          </Badge>
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Calls completed</span>
            <span>{campaign.completed_calls} / {campaign.total_contacts}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        <div className="flex gap-2 mt-3">
          <Link
            href={`/brand/campaigns/${campaign.id}/analytics`}
            className="text-xs text-purple-600 hover:underline"
          >
            Analytics →
          </Link>
          <Link
            href={`/brand/campaigns/${campaign.id}/calls`}
            className="text-xs text-slate-500 hover:underline"
          >
            Calls →
          </Link>
          <Link
            href={`/brand/campaigns/${campaign.id}/actions`}
            className="text-xs text-slate-500 hover:underline"
          >
            Actions →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
