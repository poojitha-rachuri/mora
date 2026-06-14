"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import TranscriptViewer from "./TranscriptViewer";
import AudioPlayer from "./AudioPlayer";
import type { CallRecord, ProductIntelligence, TranscriptTurn } from "@/lib/types";

interface EnrichedCall extends CallRecord {
  product_intelligence: ProductIntelligence | null;
}

const STATUS_COLORS: Record<string, string> = {
  completed: "outline",
  no_answer: "secondary",
  failed: "destructive",
  pending: "secondary",
};

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "text-green-600",
  neutral: "text-yellow-600",
  negative: "text-red-600",
};

function formatDuration(seconds?: number): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CallStatusTable({ calls }: { calls: EnrichedCall[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (calls.length === 0) {
    return <p className="text-slate-400 text-sm py-8 text-center">No calls yet</p>;
  }

  return (
    <div className="space-y-1">
      {calls.map((call) => {
        const pi = call.product_intelligence;
        const isExpanded = expandedId === call.id;

        return (
          <div key={call.id} className="border rounded-lg overflow-hidden">
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : call.id)}
            >
              <span className="text-sm font-medium w-32 truncate">{call.callee_name ?? "Unknown"}</span>
              <Badge variant={STATUS_COLORS[call.status] as "default" | "outline" | "secondary" | "destructive"} className="text-xs">
                {call.status}
              </Badge>
              <span className="text-xs text-slate-500">{formatDuration(call.call_duration)}</span>
              {pi?.overall_sentiment && (
                <span className={`text-xs font-medium ${SENTIMENT_COLORS[pi.overall_sentiment]}`}>
                  {pi.overall_sentiment}
                </span>
              )}
              {pi?.customer_segment && (
                <span className="text-xs text-slate-400 truncate">{pi.customer_segment.replace(/_/g, " ")}</span>
              )}
              <span className="ml-auto text-slate-400 text-xs">{isExpanded ? "▲" : "▼"}</span>
            </div>

            {isExpanded && (
              <div className="px-4 pb-4 border-t bg-slate-50 space-y-4">
                <div className="grid grid-cols-3 gap-4 pt-3 text-xs">
                  <div>
                    <p className="text-slate-500 mb-1">Effectiveness</p>
                    <p className="font-semibold">{pi?.effectiveness_score?.toFixed(1) ?? "—"}/5</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Repurchase</p>
                    <p className="font-semibold">{pi?.repurchase_intent?.replace(/_/g, " ") ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Recommend</p>
                    <p className="font-semibold">{pi?.recommendation_likelihood ?? "—"}/10</p>
                  </div>
                </div>
                {call.transcript_json && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">Transcript</p>
                    <TranscriptViewer turns={call.transcript_json as TranscriptTurn[]} />
                  </div>
                )}
                {call.recording_url && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Recording</p>
                    <AudioPlayer url={call.recording_url} />
                  </div>
                )}
                {pi?.enriched_context && (
                  <div className="bg-purple-50 border border-purple-100 rounded p-2">
                    <p className="text-xs font-semibold text-purple-700 mb-1">Claude Insight</p>
                    <p className="text-xs text-purple-900">{pi.enriched_context}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
