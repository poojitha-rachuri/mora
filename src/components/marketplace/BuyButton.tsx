"use client";

import { Button } from "@/components/ui/button";

export default function BuyButton({ productName }: { productName: string }) {
  return (
    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl">
      <p className="text-xs text-slate-500 mb-2">
        Prices and availability from partner retailers
      </p>
      <Button
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        size="lg"
        onClick={() => window.open(`https://nykaa.com/search?q=${encodeURIComponent(productName)}`, "_blank")}
      >
        Shop on Nykaa →
      </Button>
      <p className="text-xs text-center text-slate-400 mt-2">
        MORA does not sell products — we just surface verified buyer voices
      </p>
    </div>
  );
}
