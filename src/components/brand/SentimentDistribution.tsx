"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface SentimentDistributionProps {
  data: { positive: number; neutral: number; negative: number };
}

const COLORS = { positive: "#22c55e", neutral: "#f59e0b", negative: "#ef4444" };

export default function SentimentDistribution({ data }: SentimentDistributionProps) {
  const chartData = [
    { name: "Positive", value: data.positive, color: COLORS.positive },
    { name: "Neutral", value: data.neutral, color: COLORS.neutral },
    { name: "Negative", value: data.negative, color: COLORS.negative },
  ].filter((d) => d.value > 0);

  if (chartData.length === 0) {
    return <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${Math.round((percent ?? 0) * 100)}%`} labelLine={false}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
