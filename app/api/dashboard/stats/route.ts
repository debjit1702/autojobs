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

  const [totalScans, applied, interviewing, avgScoreResult] = await Promise.all([
    db.scan.count({ where: { userId } }),
    db.scan.count({ where: { userId, trackerList: "applied" } }),
    db.scan.count({ where: { userId, trackerList: "interviewing" } }),
    db.scan.aggregate({
      where: { userId, status: "ready", atsScoreGenerated: { not: null } },
      _avg: { atsScoreGenerated: true },
    }),
  ]);

  return NextResponse.json({
    scanned: totalScans,
    applied,
    interviewing,
    avgScore: Math.round(avgScoreResult._avg.atsScoreGenerated ?? 0),
  });
}
