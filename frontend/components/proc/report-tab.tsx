import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getLatestReport } from "@/lib/reports";
import { ReportChart } from "./report-charts";

const CHART_PLACEHOLDER = /\{chart:([a-zA-Z]+):([a-zA-Z_]+)\}/g;

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export async function ReportTab() {
  const report = await getLatestReport();

  if (!report) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-base font-medium text-foreground mb-2">월간 분석 리포트</p>
        <p className="text-sm">발행된 리포트가 아직 없습니다.</p>
      </div>
    );
  }

  // 본문을 chart placeholder로 분할
  const segments: { type: "md" | "chart"; content: string; chartType?: string; dataKey?: string }[] = [];
  let lastIdx = 0;
  for (const match of report.body.matchAll(CHART_PLACEHOLDER)) {
    const idx = match.index ?? 0;
    if (idx > lastIdx) {
      segments.push({ type: "md", content: report.body.slice(lastIdx, idx) });
    }
    segments.push({ type: "chart", content: "", chartType: match[1], dataKey: match[2] });
    lastIdx = idx + match[0].length;
  }
  if (lastIdx < report.body.length) {
    segments.push({ type: "md", content: report.body.slice(lastIdx) });
  }

  return (
    <article className="max-w-3xl mx-auto px-1 py-6">
      <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>발행 {fmtDate(report.created_at)}</span>
        <span>·</span>
        <span>분석 기간 {fmtDate(report.period_start)} – {fmtDate(report.period_end)}</span>
        <span>·</span>
        <span>비교 {fmtDate(report.baseline_start)} – {fmtDate(report.baseline_end)} 월평균</span>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-h1:text-2xl prose-h1:mb-4 prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3 prose-p:leading-relaxed prose-li:my-0">
        {segments.map((seg, i) =>
          seg.type === "md" ? (
            <ReactMarkdown key={i} remarkPlugins={[[remarkGfm, { singleTilde: false }]]}>
              {seg.content}
            </ReactMarkdown>
          ) : (
            <div key={i} className="not-prose">
              <ReportChart type={seg.chartType!} dataKey={seg.dataKey!} data={report.data} />
            </div>
          )
        )}
      </div>
    </article>
  );
}
