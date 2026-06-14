interface RepurchaseSignalProps {
  repurchase_rate: number;
  avg_effectiveness: number;
}

export default function RepurchaseSignal({ repurchase_rate, avg_effectiveness }: RepurchaseSignalProps) {
  const pct = Math.round(repurchase_rate * 100);
  const color = pct >= 60 ? "text-green-600" : pct >= 40 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-4 bg-slate-50 rounded-xl">
        <p className={`text-3xl font-bold ${color}`}>{pct}%</p>
        <p className="text-xs text-slate-500 mt-1">Would repurchase</p>
      </div>
      <div className="text-center p-4 bg-slate-50 rounded-xl">
        <p className="text-3xl font-bold text-purple-600">{avg_effectiveness.toFixed(1)}</p>
        <p className="text-xs text-slate-500 mt-1">Effectiveness /5</p>
      </div>
    </div>
  );
}
