import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCampaigns } from "@/lib/db";

export default async function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let firstCampaignId: string | null = null;
  try {
    const campaigns = await getCampaigns();
    if (campaigns.length > 0) firstCampaignId = campaigns[0].id;
  } catch {
    // DB not ready
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-slate-50 p-4 flex flex-col gap-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Brand Dashboard</p>
        <Link href="/brand/campaigns">
          <Button variant="ghost" className="w-full justify-start">Campaigns</Button>
        </Link>
        <Link href="/brand/campaigns/new">
          <Button variant="ghost" className="w-full justify-start">New Campaign</Button>
        </Link>
        {firstCampaignId && (
          <>
            <div className="border-t my-1" />
            <p className="text-xs text-slate-400 px-2">Latest Campaign</p>
            <Link href={`/brand/campaigns/${firstCampaignId}/analytics`}>
              <Button variant="ghost" className="w-full justify-start text-purple-700">Analysis</Button>
            </Link>
            <Link href={`/brand/campaigns/${firstCampaignId}/calls`}>
              <Button variant="ghost" className="w-full justify-start">Calls</Button>
            </Link>
            <Link href={`/brand/campaigns/${firstCampaignId}/actions`}>
              <Button variant="ghost" className="w-full justify-start">Actions</Button>
            </Link>
          </>
        )}
      </aside>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
