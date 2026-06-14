interface IssueSummary {
  issue: string;
  percentage: number;
  severity: "mild" | "moderate" | "severe";
  is_dealbreaker: boolean;
}

export default function IssueTransparency({ issues }: { issues: IssueSummary[] }) {
  if (!issues || issues.length === 0) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <span>✓</span>
        <p className="text-sm font-medium">No significant issues reported by buyers</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {issues.map((issue, i) => (
        <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-800">{issue.issue.replace(/_/g, " ")}</p>
            <span className="text-xs text-slate-500">{issue.percentage}%</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${
              issue.severity === "severe" ? "bg-red-100 text-red-700" :
              issue.severity === "moderate" ? "bg-yellow-100 text-yellow-700" :
              "bg-green-100 text-green-700"
            }`}>
              {issue.severity}
            </span>
            {issue.is_dealbreaker && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700">dealbreaker</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
