"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const pathname = usePathname();
  const isBrand = pathname.startsWith("/brand");
  const isMarketplace = pathname.startsWith("/marketplace");

  return (
    <header className="border-b bg-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent">
          MORA
        </span>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
          Demo
        </span>
      </div>
      <nav className="flex items-center gap-1">
        <Link
          href="/brand/campaigns"
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            isBrand
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          )}
        >
          Brand Dashboard
        </Link>
        <Link
          href="/marketplace/recommendations"
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            isMarketplace
              ? "bg-purple-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          )}
        >
          Marketplace
        </Link>
      </nav>
    </header>
  );
}
