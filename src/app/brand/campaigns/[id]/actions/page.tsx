import { getCallsByCampaign, getProductIntelligenceForCampaign } from "@/lib/db";
import ActionTable from "@/components/brand/ActionTable";

export const dynamic = "force-dynamic";

export default async function ActionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let calls: Awaited<ReturnType<typeof getCallsByCampaign>> = [];
  let intelligence: Awaited<ReturnType<typeof getProductIntelligenceForCampaign>> = [];

  try {
    [calls, intelligence] = await Promise.all([
      getCallsByCampaign(id, 200, 0),
      getProductIntelligenceForCampaign(id),
    ]);
  } catch {
    return (
      <div className="text-center py-16 text-slate-400">
        <p>Unable to load action data. Ensure Supabase is configured.</p>
      </div>
    );
  }

  const piByCallId = new Map(intelligence.map((pi) => [pi.call_record_id, pi]));
  const enrichedCalls = calls.map((c) => ({
    ...c,
    product_intelligence: piByCallId.get(c.id) ?? null,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Action Engine</h1>
        <p className="text-sm text-slate-500 mt-1">Customers grouped by recommended action</p>
      </div>
      <ActionTable calls={enrichedCalls} />
    </div>
  );
}
