"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/shared/link-button";
import { NumberTicker } from "@/components/ui/number-ticker";

interface ProcWidgetProps {
  totalTenders: number;
  totalBudget: number;
  topAgency: string;
}

export function ProcWidget({
  totalTenders,
  totalBudget,
  topAgency,
}: ProcWidgetProps) {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h2 className="text-2xl font-bold">K-AI PROC</h2>
              <Badge variant="secondary" className="text-xs rounded-full font-normal">
                Beta
              </Badge>
            </div>
            <p className="text-muted-foreground">이번 달 공공 AI 조달 현황</p>
          </div>
          <LinkButton href="/proc" variant="ghost" size="sm">
            자세히 보기 &rarr;
          </LinkButton>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="rounded-2xl border bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold tracking-tight">
                <NumberTicker value={totalTenders} />
                <span className="text-blue-500 ml-0.5">건</span>
              </p>
              <p className="text-sm text-muted-foreground mt-2">AI 조달 공고</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20">
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold tracking-tight">
                <NumberTicker value={totalBudget} />
                <span className="text-emerald-500 ml-0.5">억</span>
              </p>
              <p className="text-sm text-muted-foreground mt-2">총 발주 금액</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20">
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold tracking-tight">{topAgency}</p>
              <p className="text-sm text-muted-foreground mt-2">Top 발주기관</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
