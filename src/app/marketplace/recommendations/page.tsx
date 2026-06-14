"use client";
import { useState } from "react";
import ProfileSetup from "@/components/marketplace/ProfileSetup";
import RecommendationCard from "@/components/marketplace/RecommendationCard";
import type { ConsumerProfile, MarketplaceProduct } from "@/lib/types";

interface ProductRecommendation {
  product: MarketplaceProduct;
  reasoning: string;
  relevance_score: number;
}

export default function RecommendationsPage() {
  const [recs, setRecs] = useState<ProductRecommendation[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<ConsumerProfile | null>(null);

  const handleProfileSubmit = async (p: ConsumerProfile) => {
    setIsLoading(true);
    setError("");
    setProfile(p);

    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });

      if (!res.ok) throw new Error("Failed to get recommendations");

      const data = await res.json();
      setRecs(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load recommendations"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setRecs(null);
    setProfile(null);
    setError("");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Find Your Perfect Match
        </h1>
        <p className="text-slate-500 mt-2">
          Recommendations powered by real buyer voice conversations, not paid reviews
        </p>
      </div>

      {/* Profile Setup */}
      {!recs && !isLoading && (
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Tell us about yourself</h2>
          <ProfileSetup onSubmit={handleProfileSubmit} isLoading={isLoading} />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎙</div>
          <p className="font-medium text-slate-700">
            Analyzing voice data for your profile...
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Claude is reviewing buyer conversations to find your best matches
          </p>
          <div className="flex justify-center mt-4 gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
          <button onClick={handleReset} className="ml-3 underline">
            Try again
          </button>
        </div>
      )}

      {/* Results */}
      {recs && !isLoading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Your Recommendations</h2>
              <p className="text-sm text-slate-500">
                {recs.length} product{recs.length !== 1 ? "s" : ""} matched to
                your profile
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-sm text-purple-600 hover:underline"
            >
              Change Profile
            </button>
          </div>

          {/* Profile summary */}
          {profile && (
            <div className="flex flex-wrap gap-2 text-xs">
              {profile.skin_type && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                  {profile.skin_type} skin
                </span>
              )}
              {profile.hair_type && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                  {profile.hair_type} hair
                </span>
              )}
              {profile.primary_concerns?.map((c) => (
                <span
                  key={c}
                  className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          {recs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-3">🔍</div>
              <p>No products found yet. Try seeding the database first.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recs.map((rec, i) => (
                <RecommendationCard key={rec.product.id} rec={rec} rank={i + 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
