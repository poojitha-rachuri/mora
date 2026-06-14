interface EducationGap {
  mistake: string;
  percentage: number;
}

export default function EducationGapReport({ gaps }: { gaps: EducationGap[] }) {
  if (gaps.length === 0) {
    return <p className="text-sm text-slate-400">No usage gaps detected</p>;
  }
  return (
    <div className="space-y-2">
      {gaps.map((gap, i) => (
        <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <span className="text-amber-500 text-lg">&#9888;&#65039;</span>
          <div>
            <p className="text-sm font-medium text-slate-800">{gap.mistake.replace(/_/g, " ")}</p>
            <p className="text-xs text-amber-700 mt-0.5">{gap.percentage}% of buyers affected</p>
          </div>
        </div>
      ))}
    </div>
  );
}
