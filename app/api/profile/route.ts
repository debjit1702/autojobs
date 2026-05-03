import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await db.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: { experiences: { orderBy: { displayOrder: "asc" } }, projects: { orderBy: { displayOrder: "asc" } } },
  });

  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { experiences, projects, setupCompleted, ...profileData } = body;

  const profile = await db.candidateProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...profileData },
    update: profileData,
  });

  // Upsert experiences if provided
  if (experiences) {
    await db.experience.deleteMany({ where: { profileId: profile.id } });
    if (experiences.length > 0) {
      await db.experience.createMany({
        data: experiences.map((e: any, i: number) => ({
          ...e,
          profileId: profile.id,
          displayOrder: i,
        })),
      });
    }
  }

  // Upsert projects if provided
  if (projects) {
    await db.project.deleteMany({ where: { profileId: profile.id } });
    if (projects.length > 0) {
      await db.project.createMany({
        data: projects.map((p: any, i: number) => ({
          ...p,
          profileId: profile.id,
          displayOrder: i,
        })),
      });
    }
  }

  // Mark setup as complete if flagged
  if (setupCompleted) {
    await db.user.update({
      where: { id: session.user.id },
      data: { setupCompleted: true },
    });
  }

  return NextResponse.json(profile);
}
