import { Progress } from "@/components/ui/progress";

interface SatisfactionBreakdownProps {
  data: {
    texture?: number;
    effectiveness?: number;
    fragrance?: number;
    value?: number;
    packaging?: number;
  };
}

const DIMENSIONS = [
  { key: "effectiveness", label: "Effectiveness" },
  { key: "texture", label: "Texture" },
  { key: "value", label: "Value for Money" },
  { key: "fragrance", label: "Fragrance/Scent" },
  { key: "packaging", label: "Packaging" },
];

export default function SatisfactionBreakdown({ data }: SatisfactionBreakdownProps) {
  return (
    <div className="space-y-3">
      {DIMENSIONS.map((d) => {
        const score = data[d.key as keyof typeof data];
        if (score == null) return null;
        const pct = (score / 5) * 100;
        return (
          <div key={d.key}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">{d.label}</span>
              <span className="font-medium">{score.toFixed(1)}/5</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
        );
      })}
    </div>
  );
}
