import { getCampaigns } from "@/lib/db";
import CampaignProgressCard from "@/components/brand/CampaignProgressCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  let campaigns: Awaited<ReturnType<typeof getCampaigns>> = [];
  try {
    campaigns = await getCampaigns();
  } catch {
    // DB not yet configured — show empty state
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-sm text-slate-500 mt-1">
            {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/brand/campaigns/new">
          <Button>+ New Campaign</Button>
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-3">📢</div>
          <p className="font-medium">No campaigns yet</p>
          <p className="text-sm mt-1">Upload a buyer CSV to launch your first voice feedback campaign</p>
          <Link href="/brand/campaigns/new">
            <Button className="mt-4">Launch First Campaign</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {campaigns.map((c) => (
            <CampaignProgressCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}
