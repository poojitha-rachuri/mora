"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface SegmentBreakdownProps {
  data: Record<string, number>;
}

const SEGMENT_COLORS = [
  "#7c3aed", "#a78bfa", "#c4b5fd", "#e879f9", "#f0abfc",
  "#38bdf8", "#7dd3fc", "#6ee7b7", "#fcd34d", "#fca5a5",
];

export default function SegmentBreakdown({ data }: SegmentBreakdownProps) {
  const chartData = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name: name.replace(/_/g, " "), value }))
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) {
    return <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No segment data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={35}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: "11px" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
