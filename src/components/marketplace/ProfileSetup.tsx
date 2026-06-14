"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ConsumerProfile } from "@/lib/types";

const SKIN_TYPES = ["oily", "dry", "combination", "sensitive", "normal"];
const HAIR_TYPES = ["straight", "wavy", "curly", "coily", "fine", "thick"];
const CONCERNS = [
  "acne", "dark spots", "dryness", "oiliness", "pores", "wrinkles",
  "sensitivity", "dullness", "uneven tone", "hair fall", "dandruff", "frizz",
];
const BUDGETS = ["under_500", "500_1000", "1000_2000", "above_2000"] as const;
const BUDGET_LABELS: Record<string, string> = {
  under_500: "Under ₹500",
  "500_1000": "₹500–₹1000",
  "1000_2000": "₹1000–₹2000",
  above_2000: "Above ₹2000",
};
const ROUTINES = ["minimal", "moderate", "extensive"] as const;

interface ProfileSetupProps {
  onSubmit: (profile: ConsumerProfile) => void;
  isLoading: boolean;
}

export default function ProfileSetup({ onSubmit, isLoading }: ProfileSetupProps) {
  const [skinType, setSkinType] = useState<string>("");
  const [hairType, setHairType] = useState<string>("");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [budget, setBudget] = useState<string>("500_1000");
  const [routine, setRoutine] = useState<string>("moderate");

  const toggleConcern = (c: string) => {
    setConcerns((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const handleSubmit = () => {
    onSubmit({
      skin_type: skinType || undefined,
      hair_type: hairType || undefined,
      primary_concerns: concerns,
      budget_range: budget,
      routine_complexity: routine,
    });
  };

  return (
    <div className="space-y-6">
      {/* Skin type */}
      <div>
        <label className="text-sm font-semibold text-slate-700 mb-2 block">Skin Type</label>
        <div className="flex flex-wrap gap-2">
          {SKIN_TYPES.map((s) => (
            <button
              key={s}
              onClick={() => setSkinType(s === skinType ? "" : s)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                skinType === s
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-slate-700 border-slate-200 hover:border-purple-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Hair type */}
      <div>
        <label className="text-sm font-semibold text-slate-700 mb-2 block">Hair Type</label>
        <div className="flex flex-wrap gap-2">
          {HAIR_TYPES.map((h) => (
            <button
              key={h}
              onClick={() => setHairType(h === hairType ? "" : h)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                hairType === h
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-slate-700 border-slate-200 hover:border-purple-300"
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Concerns */}
      <div>
        <label className="text-sm font-semibold text-slate-700 mb-2 block">
          Primary Concerns <span className="text-slate-400 font-normal">(select all that apply)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CONCERNS.map((c) => (
            <button
              key={c}
              onClick={() => toggleConcern(c)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                concerns.includes(c)
                  ? "bg-pink-500 text-white border-pink-500"
                  : "bg-white text-slate-700 border-slate-200 hover:border-pink-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="text-sm font-semibold text-slate-700 mb-2 block">Budget per Product</label>
        <div className="flex flex-wrap gap-2">
          {BUDGETS.map((b) => (
            <button
              key={b}
              onClick={() => setBudget(b)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                budget === b
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-slate-700 border-slate-200 hover:border-purple-300"
              }`}
            >
              {BUDGET_LABELS[b]}
            </button>
          ))}
        </div>
      </div>

      {/* Routine complexity */}
      <div>
        <label className="text-sm font-semibold text-slate-700 mb-2 block">Routine Complexity</label>
        <div className="flex gap-2">
          {ROUTINES.map((r) => (
            <button
              key={r}
              onClick={() => setRoutine(r)}
              className={`px-4 py-2 rounded-lg text-sm border capitalize transition-colors ${
                routine === r
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-slate-700 border-slate-200 hover:border-purple-300"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isLoading || (!skinType && !hairType && concerns.length === 0)}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
        size="lg"
      >
        {isLoading ? "Finding matches..." : "Find My Perfect Products ✨"}
      </Button>

      {(!skinType && !hairType && concerns.length === 0) && (
        <p className="text-xs text-center text-slate-400">
          Select at least one skin type, hair type, or concern
        </p>
      )}
    </div>
  );
}
