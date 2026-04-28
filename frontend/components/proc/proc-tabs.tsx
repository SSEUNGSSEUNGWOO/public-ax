"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BidItem } from "@/lib/g2b";
import { ProcList } from "./proc-list";
import { RecommendTab } from "./recommend-tab";
import { DashboardTab } from "./dashboard-tab";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "bids", label: "공고" },
  { id: "recommend", label: "내 회사 추천" },
  { id: "dashboard", label: "대시보드" },
  { id: "analysis", label: "분석" },
] as const;

type TabId = typeof TABS[number]["id"];

interface ProcTabsProps {
  bids: BidItem[];
  stats: {
    active: number;
    thisMonth: number;
    totalBudget: number;
    urgent: number;
  };
}

export function ProcTabs({ bids, stats }: ProcTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = (searchParams.get("tab") as TabId) || "bids";
  const [tab, setTab] = useState<TabId>(TABS.some((t) => t.id === initial) ? initial : "bids");

  const handleChange = (next: TabId) => {
    setTab(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "bids") params.delete("tab");
    else params.set("tab", next);
    router.replace(`/proc${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  };

  return (
    <>
      <div className="flex flex-wrap gap-1 border-b mb-8 -mt-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => handleChange(t.id)}
            className={cn(
              "text-sm font-medium px-4 py-2.5 border-b-2 transition-colors duration-150 -mb-[2px]",
              tab === t.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "bids" && <ProcList bids={bids} stats={stats} />}
      {tab === "recommend" && <RecommendTab />}
      {tab === "dashboard" && <DashboardTab />}
      {tab === "analysis" && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-sm">분석 탭은 곧 출시됩니다.</p>
        </div>
      )}
    </>
  );
}
