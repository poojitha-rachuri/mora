"use client";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface SatisfactionChartProps {
  data: {
    texture: number;
    effectiveness: number;
    fragrance: number;
    value: number;
    packaging: number;
  };
}

export default function SatisfactionChart({ data }: SatisfactionChartProps) {
  const chartData = [
    { axis: "Texture", value: data.texture },
    { axis: "Effectiveness", value: data.effectiveness },
    { axis: "Fragrance", value: data.fragrance },
    { axis: "Value", value: data.value },
    { axis: "Packaging", value: data.packaging },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadarChart data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12 }} />
        <Radar
          dataKey="value"
          stroke="#7c3aed"
          fill="#7c3aed"
          fillOpacity={0.3}
          dot={{ r: 4 }}
        />
        <Tooltip formatter={(v) => [`${Number(v).toFixed(1)}/5`, "Score"]} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
