"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { detectCategory, getCategoryLabel } from "@/lib/category-detector";
import { getTimingRule } from "@/lib/timing-rules";

interface CampaignConfiguratorProps {
  productName: string;
  onChange: (config: {
    campaign_name: string;
    brand_name: string;
    category: string;
  }) => void;
}

export default function CampaignConfigurator({
  productName,
  onChange,
}: CampaignConfiguratorProps) {
  const [campaignName, setCampaignName] = useState("");
  const [brandName, setBrandName] = useState("Minimalist");

  const category = detectCategory(productName);
  const timingRule = getTimingRule(category);
  const categoryLabel = getCategoryLabel(category);

  useEffect(() => {
    if (productName && !campaignName) {
      setCampaignName(`${productName} Feedback — ${new Date().toLocaleDateString("en-IN")}`);
    }
  }, [productName, campaignName]);

  useEffect(() => {
    onChange({ campaign_name: campaignName, brand_name: brandName, category });
  }, [campaignName, brandName, category, onChange]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Campaign Name</label>
          <Input
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="e.g. Niacinamide Feedback Q2"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Brand Name</label>
          <Input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="e.g. Minimalist"
          />
        </div>
      </div>

      {productName && (
        <Card className="border-purple-100 bg-purple-50">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Detected category:</span>
              <Badge variant="secondary">{categoryLabel}</Badge>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs text-slate-500 shrink-0">Optimal call timing:</span>
              <div>
                <span className="text-xs font-semibold text-purple-700">{timingRule.label}</span>
                <p className="text-xs text-slate-500 mt-0.5">{timingRule.reason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
