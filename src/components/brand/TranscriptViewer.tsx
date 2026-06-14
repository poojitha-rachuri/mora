interface TranscriptTurn {
  role: "bot" | "user";
  content: string;
}

export default function TranscriptViewer({ turns }: { turns: TranscriptTurn[] }) {
  if (!turns || turns.length === 0) {
    return <p className="text-sm text-slate-400 italic">No transcript available</p>;
  }
  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
      {turns.map((turn, i) => (
        <div key={i} className={`flex gap-2 ${turn.role === "bot" ? "" : "flex-row-reverse"}`}>
          <div className={`text-xs px-3 py-2 rounded-lg max-w-xs ${
            turn.role === "bot"
              ? "bg-purple-50 text-purple-900 border border-purple-100"
              : "bg-slate-100 text-slate-800"
          }`}>
            <p className="font-semibold text-[10px] mb-1 opacity-60">
              {turn.role === "bot" ? "Ava" : "Customer"}
            </p>
            <p>{turn.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
