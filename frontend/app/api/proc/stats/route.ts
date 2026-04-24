import { NextResponse } from "next/server";
import { fetchMonthlyStats } from "@/lib/g2b";

export async function GET() {
  try {
    const stats = await fetchMonthlyStats(3);
    return NextResponse.json(stats);
  } catch (e) {
    console.error("[proc/stats]", e);
    return NextResponse.json([]);
  }
}
