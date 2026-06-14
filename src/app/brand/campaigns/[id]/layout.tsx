import Link from "next/link";
import { getCampaign } from "@/lib/db";
import CampaignTabs from "@/components/brand/CampaignTabs";

export default async function CampaignLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let campaignName = "Campaign";
  let productName = "";
  try {
    const campaign = await getCampaign(id);
    if (campaign) {
      campaignName = campaign.campaign_name;
      productName = campaign.product_name;
    }
  } catch {
    // ignore
  }

  const tabs = [
    { label: "Analysis", href: `/brand/campaigns/${id}/analytics` },
    { label: "Calls", href: `/brand/campaigns/${id}/calls` },
    { label: "Actions", href: `/brand/campaigns/${id}/actions` },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Link href="/brand/campaigns" className="text-xs text-slate-400 hover:text-slate-600">
          ← All Campaigns
        </Link>
        <h2 className="text-xl font-bold mt-1">{campaignName}</h2>
        {productName && <p className="text-sm text-slate-500">{productName}</p>}
      </div>

      <CampaignTabs tabs={tabs} />

      <div>{children}</div>
    </div>
  );
}
