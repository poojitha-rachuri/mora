interface Profile {
  profile: string;
  satisfaction: number;
  note: string;
}

export default function WorksBestFor({ profiles }: { profiles: Profile[] }) {
  if (!profiles || profiles.length === 0) {
    return <p className="text-sm text-slate-400">Insufficient data</p>;
  }
  return (
    <div className="space-y-2">
      {profiles.map((p, i) => (
        <div key={i} className="flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
          <span className="text-green-500 text-lg">✓</span>
          <div>
            <p className="font-medium text-sm text-slate-800 capitalize">{p.profile.replace(/_/g, " ")}</p>
            <p className="text-xs text-green-700">{Math.round(p.satisfaction * 20)}% satisfaction rate</p>
            {p.note && <p className="text-xs text-slate-500 mt-0.5">{p.note}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
