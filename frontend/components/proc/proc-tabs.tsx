"use client";

import { ReactNode, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BidItem } from "@/lib/g2b";
import { ProcList } from "./proc-list";
import { RecommendTab } from "./recommend-tab";
import { DashboardTab } from "./dashboard-tab";
import { AnalysisTab } from "./analysis-tab";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "dashboard", label: "대시보드" },
  { id: "bids", label: "공고" },
  { id: "analysis", label: "데이터 통계" },
  { id: "report", label: "분석" },
  { id: "recommend", label: "맞춤 공고" },
] as const;

type TabId = typeof TABS[number]["id"];

interface ProcTabsProps {
  bids: BidItem[];
  reportSlot: ReactNode;
}

export function ProcTabs({ bids, reportSlot }: ProcTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = (searchParams.get("tab") as TabId) || "dashboard";
  const [tab, setTab] = useState<TabId>(TABS.some((t) => t.id === initial) ? initial : "dashboard");

  const handleChange = (next: TabId) => {
    setTab(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "dashboard") params.delete("tab");
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

      {tab === "bids" && <ProcList bids={bids} />}
      {tab === "recommend" && <RecommendTab />}
      {tab === "dashboard" && <DashboardTab />}
      {tab === "analysis" && <AnalysisTab />}
      <div className={tab === "report" ? "block" : "hidden"}>{reportSlot}</div>
    </>
  );
}
