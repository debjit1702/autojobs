import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 83); // 84 days back (12 weeks)
  start.setHours(0, 0, 0, 0);

  const scans = await db.scan.findMany({
    where: { userId, createdAt: { gte: start } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by YYYY-MM-DD
  const counts: Record<string, number> = {};
  scans.forEach(({ createdAt }) => {
    const key = createdAt.toISOString().slice(0, 10);
    counts[key] = (counts[key] ?? 0) + 1;
  });

  // Build 84-day array
  const days: { date: string; count: number }[] = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: counts[key] ?? 0 });
  }

  return NextResponse.json(days);
}
