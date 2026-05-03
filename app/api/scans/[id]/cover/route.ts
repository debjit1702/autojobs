import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { generateCoverLetter } from "@/lib/cover-pipeline";

// POST /api/scans/[id]/cover — trigger AI cover letter generation
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
  if (scan.status !== "ready") {
    return NextResponse.json({ error: "Scan not ready" }, { status: 400 });
  }

  // Return cached if available
  if (scan.result?.coverLetterHtml) {
    return NextResponse.json({ coverLetter: scan.result.coverLetterHtml });
  }

  // Get profile
  const profile = await db.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      projects: { orderBy: { displayOrder: "asc" }, take: 3 },
    },
  });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });

  const profileData = {
    name: user?.name,
    techStack: profile?.techStack,
    projects: profile?.projects?.map((p) => ({ name: p.name, stack: p.stack })),
    achievements: profile?.achievements,
    degree: profile?.degree,
    institution: profile?.institution,
  };

  const generated = await generateCoverLetter(
    scan.jdText,
    profileData,
    scan.companyName,
    scan.jobTitle
  );

  const coverBody = typeof generated === "string" ? generated : generated.body;

  // Ensure ScanResult exists
  if (scan.result) {
    await db.scanResult.update({
      where: { scanId: scan.id },
      data: { coverLetterHtml: coverBody },
    });
  } else {
    await db.scanResult.create({
      data: { scanId: scan.id, coverLetterHtml: coverBody },
    });
  }

  return NextResponse.json({ coverLetter: generated });
}

// GET /api/scans/[id]/cover — get cached cover letter
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
    include: { result: { select: { coverLetterHtml: true } } },
  });

  if (!scan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ coverLetter: scan.result?.coverLetterHtml ?? null });
}
