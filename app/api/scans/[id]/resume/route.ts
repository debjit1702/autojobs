import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { generateATSResume } from "@/lib/resume-pipeline";

// POST /api/scans/[id]/resume — trigger AI resume generation
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scan = await db.scan.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { result: true },
  });

  if (!scan) return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  if (scan.status !== "ready" || !scan.result) {
    return NextResponse.json({ error: "Scan not ready" }, { status: 400 });
  }

  // Return cached if already generated
  if (scan.result.generatedResumeJson) {
    return NextResponse.json({ resume: scan.result.generatedResumeJson });
  }

  // Get candidate profile
  const profile = await db.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      experiences: { orderBy: { displayOrder: "asc" } },
      projects: { orderBy: { displayOrder: "asc" } },
    },
  });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  const atsAnalysis = {
    ats_score: scan.atsScoreGenerated ?? 0,
    verdict: scan.result.verdict ?? "",
    missing_keywords: (scan.result.missingKeywords as any[]) ?? [],
    matched_keywords: (scan.result.matchedKeywords as string[]) ?? [],
    strategy: scan.result.strategy ?? "",
  };

  const profileData = {
    name: user?.name,
    email: user?.email,
    phone: profile?.phone,
    location: profile?.location,
    linkedin: profile?.linkedinUrl,
    github: profile?.githubUrl,
    degree: profile?.degree,
    institution: profile?.institution,
    cgpa: profile?.cgpa,
    year: profile?.graduationYear?.toString(),
    techStack: profile?.techStack,
    projects: profile?.projects,
    certifications: profile?.certifications,
    achievements: profile?.achievements,
  };

  // Generate resume via Gemini
  const generated = await generateATSResume(
    scan.jdText,
    scan.originalResumeText ?? "",
    profileData,
    atsAnalysis
  );

  // Cache in ScanResult
  await db.scanResult.update({
    where: { scanId: scan.id },
    data: { generatedResumeJson: generated as any },
  });

  return NextResponse.json({ resume: generated });
}

// GET /api/scans/[id]/resume — get cached resume
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scan = await db.scan.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { result: { select: { generatedResumeJson: true } } },
  });

  if (!scan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ resume: scan.result?.generatedResumeJson ?? null });
}
