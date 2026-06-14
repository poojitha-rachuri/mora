interface VoiceTrustScoreProps {
  score: number;
  total_verified_conversations: number;
}

export default function VoiceTrustScore({ score, total_verified_conversations }: VoiceTrustScoreProps) {
  const color =
    score >= 75 ? "text-green-600" :
    score >= 50 ? "text-yellow-600" :
    "text-red-600";

  const ring =
    score >= 75 ? "border-green-400" :
    score >= 50 ? "border-yellow-400" :
    "border-red-400";

  return (
    <div className="flex items-center gap-4">
      <div className={`w-20 h-20 rounded-full border-4 ${ring} flex flex-col items-center justify-center`}>
        <span className={`text-2xl font-bold ${color}`}>{Math.round(score)}</span>
        <span className="text-xs text-slate-500">/100</span>
      </div>
      <div>
        <p className="font-semibold text-slate-800">Voice Trust Score</p>
        <p className="text-sm text-slate-500">{total_verified_conversations} verified buyer conversations</p>
        <p className="text-xs text-slate-400 mt-1">
          {score >= 75 ? "Highly recommended by real buyers" :
           score >= 50 ? "Mixed buyer feedback" :
           "Needs attention — review buyer concerns"}
        </p>
      </div>
    </div>
  );
}
