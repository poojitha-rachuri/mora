"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function StartCampaignButton({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      await fetch(`/api/campaigns/${campaignId}/start`, { method: "POST" });
      setDone(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium mt-1">
        Started
      </span>
    );
  }

  return (
    <Button
      onClick={handleStart}
      disabled={loading}
      size="sm"
      className="bg-purple-600 hover:bg-purple-700 text-white mt-1"
    >
      {loading ? "Starting..." : "Start Campaign"}
    </Button>
  );
}
