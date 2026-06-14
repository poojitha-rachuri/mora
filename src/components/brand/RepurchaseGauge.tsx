"use client";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

interface RepurchaseGaugeProps {
  data: {
    definitely_yes: number;
    probably_yes: number;
    unsure: number;
    probably_no: number;
    definitely_no: number;
  };
}

const COLORS = ["#16a34a", "#86efac", "#fbbf24", "#f87171", "#dc2626"];

export default function RepurchaseGauge({ data }: RepurchaseGaugeProps) {
  const chartData = [
    { name: "Definitely Yes", value: data.definitely_yes },
    { name: "Probably Yes", value: data.probably_yes },
    { name: "Unsure", value: data.unsure },
    { name: "Probably No", value: data.probably_no },
    { name: "Definitely No", value: data.definitely_no },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
        <Tooltip />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
