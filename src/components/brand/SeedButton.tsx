"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SeedButtonProps {
  variant?: "default" | "outline";
  label?: string;
}

export default function SeedButton({ variant = "outline", label = "Load Demo Data" }: SeedButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleSeed = async () => {
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMsg(data.error ?? "Seed failed");
      } else {
        setStatus("done");
        setMsg(`✓ Loaded ${data.callRecords} calls across ${data.campaigns} campaigns`);
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (e) {
      setStatus("error");
      setMsg(e instanceof Error ? e.message : "Network error");
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant={variant} onClick={handleSeed} disabled={status === "loading"}>
        {status === "loading" ? "Seeding…" : label}
      </Button>
      {msg && (
        <p className={`text-xs ${status === "error" ? "text-red-500" : "text-green-600"}`}>{msg}</p>
      )}
    </div>
  );
}
