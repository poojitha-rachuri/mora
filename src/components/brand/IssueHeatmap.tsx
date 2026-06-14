interface Issue {
  issue: string;
  count: number;
  severity: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  mild: "bg-yellow-100 text-yellow-700",
  moderate: "bg-orange-100 text-orange-700",
  severe: "bg-red-100 text-red-700",
};

export default function IssueHeatmap({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) {
    return <p className="text-sm text-slate-400 py-4">No issues reported</p>;
  }
  return (
    <div className="space-y-1">
      {issues.map((issue, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
          <span className="text-sm text-slate-700 flex-1">{issue.issue.replace(/_/g, " ")}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium mx-3 ${SEVERITY_COLORS[issue.severity] ?? "bg-slate-100 text-slate-600"}`}>
            {issue.severity}
          </span>
          <span className="text-sm font-medium text-slate-900 w-8 text-right">{issue.count}</span>
        </div>
      ))}
    </div>
  );
}
