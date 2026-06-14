"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CallRecord, ProductIntelligence } from "@/lib/types";

interface EnrichedCall extends CallRecord {
  product_intelligence: ProductIntelligence | null;
}

const ACTION_COLORS: Record<string, string> = {
  escalate_to_support: "destructive",
  send_usage_guide: "secondary",
  request_review: "outline",
  repurchase_reminder: "default",
  cross_sell: "secondary",
  churn_intervention: "destructive",
};

export default function ActionTable({ calls }: { calls: EnrichedCall[] }) {
  const grouped: Record<string, EnrichedCall[]> = {};
  for (const call of calls) {
    const action = call.product_intelligence?.recommended_action ?? "no_action";
    (grouped[action] ??= []).push(call);
  }

  const handleExport = (action: string, group: EnrichedCall[]) => {
    const headers = "name,phone_hash,segment,action,repurchase_intent\n";
    const rows = group.map((c) =>
      [
        c.callee_name ?? "",
        c.phone_hash,
        c.product_intelligence?.customer_segment ?? "",
        action,
        c.product_intelligence?.repurchase_intent ?? "",
      ].join(",")
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${action}_customers.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([action, group]) => (
        <div key={action}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant={ACTION_COLORS[action] as "default" | "secondary" | "outline" | "destructive"}>
                {action.replace(/_/g, " ")}
              </Badge>
              <span className="text-sm text-slate-500">{group.length} customers</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => handleExport(action, group)}>
              Export CSV
            </Button>
          </div>
          <div className="space-y-1">
            {group.map((call) => (
              <div key={call.id} className="flex items-center gap-3 py-2 px-3 bg-slate-50 rounded text-sm">
                <span className="font-medium w-32 truncate">{call.callee_name ?? "Unknown"}</span>
                <span className="text-slate-500 text-xs">{call.product_intelligence?.customer_segment?.replace(/_/g, " ") ?? "—"}</span>
                <span className="text-slate-500 text-xs ml-auto">{call.product_intelligence?.repurchase_intent?.replace(/_/g, " ") ?? "—"}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
