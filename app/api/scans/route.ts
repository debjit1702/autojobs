import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { runATSGapAnalysis } from "@/lib/ats-pipeline";

// POST /api/scans — create a new scan
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { companyName, jobTitle, jdText, resumeText, trackerId } = body;

  if (!companyName || !jobTitle || !jdText || !resumeText) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Find the user's first tracker if none specified
  let resolvedTrackerId = trackerId;
  if (!resolvedTrackerId) {
    const tracker = await db.jobTracker.findFirst({
      where: { userId: session.user.id },
    });
    resolvedTrackerId = tracker?.id;
  }

  // Create the scan in processing state
  const scan = await db.scan.create({
    data: {
      userId: session.user.id,
      companyName,
      jobTitle,
      jdText,
      originalResumeText: resumeText,
      status: "processing",
      trackerId: resolvedTrackerId,
    },
  });

  // Run ATS analysis asynchronously (don't await — return scan immediately)
  runATSGapAnalysis(jdText, resumeText)
    .then(async (result) => {
      await db.scanResult.create({
        data: {
          scanId: scan.id,
          missingKeywords: result.missing_keywords as any,
          matchedKeywords: result.matched_keywords as any,
          strategy: result.strategy,
          verdict: result.verdict,
        },
      });
      await db.scan.update({
        where: { id: scan.id },
        data: {
          status: "ready",
          atsScoreOriginal: result.ats_score,
          atsScoreGenerated: result.ats_score,
        },
      });
    })
    .catch(async (err) => {
      console.error("ATS pipeline error:", err);
      await db.scan.update({
        where: { id: scan.id },
        data: { status: "failed" },
      });
    });

  return NextResponse.json(scan, { status: 201 });
}

// GET /api/scans — list scans for current user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scans = await db.scan.findMany({
    where: { userId: session.user.id },
    include: { result: { select: { matchedKeywords: true, missingKeywords: true, verdict: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(scans);
}
