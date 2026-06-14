import { getCallsByCampaign, getProductIntelligenceForCampaign } from "@/lib/db";
import CallStatusTable from "@/components/brand/CallStatusTable";

export const dynamic = "force-dynamic";

export default async function CallsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let calls: Awaited<ReturnType<typeof getCallsByCampaign>> = [];
  let intelligence: Awaited<ReturnType<typeof getProductIntelligenceForCampaign>> = [];

  try {
    [calls, intelligence] = await Promise.all([
      getCallsByCampaign(id, 100, 0),
      getProductIntelligenceForCampaign(id),
    ]);
  } catch {
    return (
      <div className="text-center py-16 text-slate-400">
        <p>Unable to load call records. Ensure Supabase is configured.</p>
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
        <h1 className="text-2xl font-bold">Call Records</h1>
        <p className="text-sm text-slate-500 mt-1">{calls.length} calls · click to expand transcript</p>
      </div>
      <CallStatusTable calls={enrichedCalls} />
    </div>
  );
}
