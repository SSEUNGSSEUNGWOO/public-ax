"""
공공 AI 발주 데이터 분석 (최근 30일 vs 직전 90일 평균)

Hot/Cold 카테고리, 신규 등장, 사라짐, 발주처 이상치, 예산 변화, 큰 사업 등
LLM Writer가 글을 쓸 때 쓰는 통계 데이터를 생성한다.
"""
import statistics
from collections import Counter, defaultdict
from datetime import date, timedelta
from typing import Any


def _is_unit_contract(row: dict) -> bool:
    name = row.get("bid_ntce_nm") or ""
    dmnd = row.get("dmnd_instt_nm") or ""
    if any(s in name for s in ("_제3자단가", "단가계약", "단가입찰")):
        return True
    if dmnd == "각 수요기관":
        return True
    return False


def _get_budget(row: dict) -> int:
    try:
        return int(row.get("assign_bdgt_amt") or row.get("presmpt_prce") or 0)
    except (ValueError, TypeError):
        return 0


def _fetch_rows(client, start: str, end: str) -> list[dict]:
    rows = []
    offset = 0
    while True:
        res = (
            client.table("bids")
            .select(
                "bid_ntce_nm, ai_category, dmnd_instt_nm, ntce_instt_nm, "
                "bid_ntce_date, bid_clse_date, assign_bdgt_amt, presmpt_prce, bsns_div_nm, "
                "bidprc_psbl_indstrty_nm, cntrct_cncls_mthd_nm"
            )
            .gte("bid_ntce_date", start)
            .lte("bid_ntce_date", end)
            .range(offset, offset + 999)
            .execute()
        )
        if not res.data:
            break
        rows.extend(res.data)
        if len(res.data) < 1000:
            break
        offset += 1000
    return [r for r in rows if not _is_unit_contract(r) and r.get("ai_category") not in (None, "무관")]


def analyze(client, today: date | None = None) -> dict[str, Any]:
    today = today or date.today()
    period_end = today
    period_start = today - timedelta(days=30)
    baseline_end = period_start - timedelta(days=1)
    baseline_start = baseline_end - timedelta(days=90) + timedelta(days=1)

    recent = _fetch_rows(client, period_start.isoformat(), period_end.isoformat())
    baseline = _fetch_rows(client, baseline_start.isoformat(), baseline_end.isoformat())

    # 카테고리 카운트
    recent_cat = Counter((r.get("ai_category") or "(미분류)") for r in recent)
    baseline_cat = Counter((r.get("ai_category") or "(미분류)") for r in baseline)
    baseline_monthly = {k: round(v / 3, 1) for k, v in baseline_cat.items()}  # 월평균 환산

    all_cats = set(recent_cat) | set(baseline_cat)
    category_changes = []
    for cat in all_cats:
        recent_n = recent_cat[cat]
        baseline_avg = baseline_monthly.get(cat, 0)
        if baseline_avg == 0:
            change_pct = None  # 신규
        else:
            change_pct = round((recent_n - baseline_avg) / baseline_avg * 100)
        category_changes.append(
            {
                "category": cat,
                "recent": recent_n,
                "baseline_monthly_avg": baseline_avg,
                "change_pct": change_pct,
            }
        )

    hot = [c for c in category_changes if c["change_pct"] is not None and c["change_pct"] >= 30 and c["recent"] >= 10]
    cold = [c for c in category_changes if c["change_pct"] is not None and c["change_pct"] <= -30 and c["recent"] >= 5]
    new_appeared = [c for c in category_changes if c["change_pct"] is None and c["recent"] >= 5]
    disappeared = [
        c for c in category_changes
        if c["change_pct"] is not None and c["recent"] == 0 and c["baseline_monthly_avg"] >= 5
    ]
    hot.sort(key=lambda c: -c["change_pct"])
    cold.sort(key=lambda c: c["change_pct"])

    # 발주처 (수요기관 우선)
    def _agency(r):
        name = (r.get("dmnd_instt_nm") or r.get("ntce_instt_nm") or "").strip()
        return name if name and not name.startswith("조달청") else None

    recent_agency = Counter()
    baseline_agency = Counter()
    for r in recent:
        a = _agency(r)
        if a:
            recent_agency[a] += 1
    for r in baseline:
        a = _agency(r)
        if a:
            baseline_agency[a] += 1
    baseline_agency_monthly = {k: v / 3 for k, v in baseline_agency.items()}

    top_agencies = [
        {
            "name": name,
            "recent": cnt,
            "baseline_monthly_avg": round(baseline_agency_monthly.get(name, 0), 1),
            "change_pct": (
                round((cnt - baseline_agency_monthly[name]) / baseline_agency_monthly[name] * 100)
                if baseline_agency_monthly.get(name, 0) > 0
                else None
            ),
        }
        for name, cnt in recent_agency.most_common(15)
    ]

    # 예산 통계 (카테고리별)
    cat_budgets = defaultdict(list)
    for r in recent:
        b = _get_budget(r)
        cat = r.get("ai_category") or "(미분류)"
        if b > 0:
            cat_budgets[cat].append(b)

    budget_by_category = []
    for cat, vals in cat_budgets.items():
        if not vals:
            continue
        budget_by_category.append(
            {
                "category": cat,
                "count": len(vals),
                "avg": round(statistics.mean(vals)),
                "median": round(statistics.median(vals)),
                "max": max(vals),
                "total": sum(vals),
            }
        )
    budget_by_category.sort(key=lambda x: -x["total"])

    # 큰 사업 Top 10
    big_bids = sorted(recent, key=lambda r: _get_budget(r), reverse=True)[:10]
    large_bids = [
        {
            "title": r.get("bid_ntce_nm"),
            "category": r.get("ai_category"),
            "agency": r.get("dmnd_instt_nm") or r.get("ntce_instt_nm"),
            "budget": _get_budget(r),
            "biz_div": r.get("bsns_div_nm"),
            "ntce_date": r.get("bid_ntce_date"),
        }
        for r in big_bids
        if _get_budget(r) > 0
    ]

    # 사업구분 분포
    biz_recent = Counter((r.get("bsns_div_nm") or "기타") for r in recent)
    biz_baseline_monthly = {k: round(v / 3, 1) for k, v in Counter((r.get("bsns_div_nm") or "기타") for r in baseline).items()}

    # 월별 등록 추이 (최근 6개월)
    monthly_trend = defaultdict(int)
    six_mo_ago = (today - timedelta(days=180)).isoformat()
    res = (
        client.table("bids")
        .select("bid_ntce_date, ai_category")
        .gte("bid_ntce_date", six_mo_ago)
        .range(0, 9999)
        .execute()
    )
    rows_6mo = res.data or []
    for r in rows_6mo:
        d = r.get("bid_ntce_date") or ""
        if len(d) >= 7 and r.get("ai_category") not in (None, "무관"):
            monthly_trend[d[:7]] += 1
    monthly_trend_list = sorted([{"month": k, "count": v} for k, v in monthly_trend.items()], key=lambda x: x["month"])

    return {
        "period": {
            "start": period_start.isoformat(),
            "end": period_end.isoformat(),
            "baseline_start": baseline_start.isoformat(),
            "baseline_end": baseline_end.isoformat(),
        },
        "summary": {
            "recent_total": len(recent),
            "baseline_total": len(baseline),
            "baseline_monthly_avg": round(len(baseline) / 3, 1),
        },
        "hot_categories": hot,
        "cold_categories": cold,
        "new_categories": new_appeared,
        "disappeared_categories": disappeared,
        "category_changes_all": sorted(category_changes, key=lambda c: -c["recent"]),
        "top_agencies": top_agencies,
        "budget_by_category": budget_by_category,
        "large_bids": large_bids,
        "biz_distribution": {
            "recent": dict(biz_recent),
            "baseline_monthly": biz_baseline_monthly,
        },
        "monthly_trend": monthly_trend_list,
    }
