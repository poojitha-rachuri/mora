import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-slate-50 p-4 flex flex-col gap-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Brand Dashboard</p>
        <Link href="/brand/campaigns">
          <Button variant="ghost" className="w-full justify-start">Campaigns</Button>
        </Link>
        <Link href="/brand/campaigns/new">
          <Button variant="ghost" className="w-full justify-start">New Campaign</Button>
        </Link>
      </aside>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
