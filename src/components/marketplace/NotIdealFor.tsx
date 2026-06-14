interface Profile {
  profile: string;
  reason: string;
}

export default function NotIdealFor({ profiles }: { profiles: Profile[] }) {
  if (!profiles || profiles.length === 0) {
    return <p className="text-sm text-slate-400">No specific limitations noted</p>;
  }
  return (
    <div className="space-y-2">
      {profiles.map((p, i) => (
        <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <span className="text-amber-500 text-lg">⚠</span>
          <div>
            <p className="font-medium text-sm text-slate-800 capitalize">{p.profile.replace(/_/g, " ")}</p>
            <p className="text-xs text-amber-700">{p.reason}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
