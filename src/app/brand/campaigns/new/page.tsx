"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CSVUploader from "@/components/brand/CSVUploader";
import CampaignConfigurator from "@/components/brand/CampaignConfigurator";

export default function NewCampaignPage() {
  const router = useRouter();
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [productName, setProductName] = useState("");
  const [config, setConfig] = useState({
    campaign_name: "",
    brand_name: "Minimalist",
    category: "",
  });
  const [error, setError] = useState("");
  const [isLaunching, setIsLaunching] = useState(false);
  const [launched, setLaunched] = useState<{ id: string } | null>(null);

  const handleCSVParsed = useCallback(
    (rows: Record<string, string>[], file: File) => {
      setCsvRows(rows);
      setCsvFile(file);
      setError("");
      // Auto-detect product name from CSV if present
      if (rows[0]?.product_name && !productName) {
        setProductName(rows[0].product_name);
      }
    },
    [productName]
  );

  const handleLaunch = async () => {
    if (!csvFile) { setError("Please upload a CSV file first"); return; }
    if (!productName) { setError("Please enter the product name"); return; }
    if (!config.campaign_name) { setError("Please enter a campaign name"); return; }

    setIsLaunching(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", csvFile);
      formData.append("campaign_name", config.campaign_name);
      formData.append("product_name", productName);
      formData.append("brand_name", config.brand_name);

      const createRes = await fetch("/api/campaigns", {
        method: "POST",
        body: formData,
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err.error ?? "Failed to create campaign");
      }

      const campaign = await createRes.json();

      // Start the campaign (non-fatal — redirect even if Ringg.ai is unavailable)
      await fetch(`/api/campaigns/${campaign.id}/start`, { method: "POST" }).catch(() => {});

      setLaunched({ id: campaign.id });
      setTimeout(() => router.push(`/brand/campaigns/${campaign.id}/analytics`), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Launch failed");
    } finally {
      setIsLaunching(false);
    }
  };

  if (launched) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-5xl mb-3">🚀</div>
        <h2 className="text-xl font-bold">Campaign Launched!</h2>
        <p className="text-slate-500 mt-2">
          Ava is now calling your buyers. Redirecting to analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">New Voice Feedback Campaign</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1. Upload Buyer CSV</CardTitle>
          </CardHeader>
          <CardContent>
            <CSVUploader onParsed={handleCSVParsed} onError={setError} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">2. Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Product Name
              </label>
              <Input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. 10% Niacinamide Serum"
              />
            </div>
            {productName && (
              <CampaignConfigurator
                productName={productName}
                onChange={setConfig}
              />
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button
          onClick={handleLaunch}
          disabled={isLaunching || !csvFile || !productName}
          className="w-full"
          size="lg"
        >
          {isLaunching ? "Launching..." : `🎙 Launch Campaign (${csvRows.length} contacts)`}
        </Button>

        <p className="text-xs text-slate-400 text-center">
          Ava (Ringg.ai voice agent) will call each contact after launch.
          Requires RINGG_API_KEY to be configured.
        </p>
      </div>
    </div>
  );
}
