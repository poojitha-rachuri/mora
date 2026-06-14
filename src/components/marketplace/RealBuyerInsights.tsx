export default function RealBuyerInsights({ insights }: { insights: string[] }) {
  if (!insights || insights.length === 0) {
    return <p className="text-sm text-slate-400">No insights yet</p>;
  }
  return (
    <div className="space-y-2">
      {insights.map((text, i) => (
        <div key={i} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
          <span className="text-purple-500 text-sm mt-0.5">🎙</span>
          <p className="text-sm text-slate-700">{text}</p>
        </div>
      ))}
    </div>
  );
}
