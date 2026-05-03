import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trackers = await db.jobTracker.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { scans: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(trackers);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  const tracker = await db.jobTracker.create({
    data: { userId: session.user.id, name: name.trim() },
  });
  return NextResponse.json(tracker, { status: 201 });
}
